import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ensurePostgresSchema,
  execute,
  fromActiveValue,
  isPostgres,
  parseJsonColumn,
  queryAll,
  queryOne,
  sqlNow,
  toActiveValue,
} from './dbClient.js';
import { DEFAULT_TENANTS, createBootstrapConfig } from './tenantDefaults.js';
import { createUser, ROLES, syncUsersFromTenantConfigs } from './userRepository.js';
import {
  ensureTenantSubscription,
  getTenantSubscription,
  isTenantSubscriptionActive,
  seedSubscriptionPlans,
  seedSubscriptionsForExistingTenants,
} from './subscriptionRepository.js';
import { generateOwnerPassword } from '../utils/generatePassword.js';
import { DEFAULT_TEMPLATE_ID, SITE_STATUSES, normalizeSiteStatus } from './saasConstants.js';
import { ensureSaasSchema } from './saasSchema.js';
import { cloneTemplateConfig, getSiteTemplate, seedSiteTemplates } from './templateRepository.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LEGACY_DATA_DIR = path.join(__dirname, '..', 'data', 'tenants');
const LEGACY_REGISTRY_PATH = path.join(LEGACY_DATA_DIR, 'registry.json');

async function upsertTenant(tenant) {
  await execute(
    `INSERT INTO tenants (
       id, name, active, template_id, status, client_name, client_email, updated_at
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ${sqlNow()})
     ON CONFLICT(id) DO UPDATE SET
       name = excluded.name,
       active = excluded.active,
       template_id = COALESCE(excluded.template_id, tenants.template_id),
       status = COALESCE(excluded.status, tenants.status),
       client_name = COALESCE(excluded.client_name, tenants.client_name),
       client_email = COALESCE(excluded.client_email, tenants.client_email),
       updated_at = ${sqlNow()}`,
    [
      tenant.id,
      tenant.name,
      toActiveValue(tenant.active !== false),
      tenant.templateId || DEFAULT_TEMPLATE_ID,
      normalizeSiteStatus(tenant.status || SITE_STATUSES.ACTIVE),
      tenant.clientName || null,
      tenant.clientEmail || null,
    ]
  );
}

async function upsertTenantConfig(tenantId, config) {
  const configJson = JSON.stringify(config);
  const jsonCast = isPostgres() ? '?::jsonb' : '?';

  await execute(
    `INSERT INTO tenant_configs (tenant_id, config_json, updated_at)
     VALUES (?, ${jsonCast}, ${sqlNow()})
     ON CONFLICT(tenant_id) DO UPDATE SET
       config_json = excluded.config_json,
       updated_at = ${sqlNow()}`,
    [tenantId, configJson]
  );
}

export async function seedDefaultTenants() {
  for (const tenant of DEFAULT_TENANTS) {
    await upsertTenant(tenant);

    const existing = await queryOne('SELECT tenant_id FROM tenant_configs WHERE tenant_id = ?', [
      tenant.id,
    ]);

    if (!existing) {
      await upsertTenantConfig(tenant.id, createBootstrapConfig(tenant.id));
    }
  }
}

export async function migrateLegacyJsonStore() {
  if (!existsSync(LEGACY_REGISTRY_PATH)) {
    await seedDefaultTenants();
    return { migrated: false, reason: 'no-legacy-json' };
  }

  const tenantCountRow = await queryOne('SELECT COUNT(*) AS total FROM tenants');
  const tenantCount = Number(tenantCountRow?.total || 0);

  if (tenantCount > 0) {
    return { migrated: false, reason: 'database-already-populated' };
  }

  const registryRaw = await readFile(LEGACY_REGISTRY_PATH, 'utf8');
  const registry = JSON.parse(registryRaw);
  const tenants = Array.isArray(registry.tenants) ? registry.tenants : DEFAULT_TENANTS;

  for (const tenant of tenants) {
    await upsertTenant(tenant);

    const legacyConfigPath = path.join(LEGACY_DATA_DIR, `${tenant.id}.json`);
    let config = createBootstrapConfig(tenant.id);

    if (existsSync(legacyConfigPath)) {
      const legacyRaw = await readFile(legacyConfigPath, 'utf8');
      config = JSON.parse(legacyRaw);
    }

    await upsertTenantConfig(tenant.id, config);
  }

  return { migrated: true, tenants: tenants.length };
}

function mapTenantRow(row) {
  return {
    id: row.id,
    name: row.name,
    active: fromActiveValue(row.active),
    templateId: row.template_id || DEFAULT_TEMPLATE_ID,
    status: normalizeSiteStatus(row.status || SITE_STATUSES.ACTIVE),
    clientName: row.client_name || null,
    clientEmail: row.client_email || null,
    ownerEmail: row.owner_email || row.client_email || null,
    createdAt: row.created_at || null,
    updatedAt: row.updated_at || null,
  };
}

const TENANT_SELECT =
  'SELECT t.id, t.name, t.active, t.template_id, t.status, t.client_name, t.client_email, t.created_at, t.updated_at';

export async function getTenantRecord(tenantId) {
  const row = await queryOne(`${TENANT_SELECT} FROM tenants t WHERE t.id = ?`, [tenantId]);
  return row ? mapTenantRow(row) : null;
}

export async function isTenantSiteAccessible(tenantId) {
  const tenant = await getTenantRecord(tenantId);
  if (!tenant || !tenant.active) return false;
  if (tenant.status === SITE_STATUSES.SUSPENDED) return false;
  return isTenantSubscriptionActive(tenantId);
}

export async function listTenants() {
  const rows = await queryAll(
    `${TENANT_SELECT}
     FROM tenants t
     WHERE t.active = ? AND t.status = ?
     ORDER BY t.id ASC`,
    [toActiveValue(true), SITE_STATUSES.ACTIVE]
  );

  const tenants = [];
  for (const row of rows) {
    const tenant = mapTenantRow(row);
    if (await isTenantSubscriptionActive(tenant.id)) {
      tenants.push(tenant);
    }
  }

  return tenants;
}

export async function listAllTenants() {
  const rows = await queryAll(
    `${TENANT_SELECT}, u.email AS owner_email
     FROM tenants t
     LEFT JOIN users u ON u.tenant_id = t.id AND u.role = 'tenant_owner'
     ORDER BY t.created_at DESC, t.id ASC`
  );
  return rows.map(mapTenantRow);
}

const TENANT_ID_PATTERN = /^[a-z0-9][a-z0-9-]{1,30}[a-z0-9]$/;
const OWNER_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function createTenant({
  id,
  name,
  ownerEmail,
  ownerPassword,
  templateId = DEFAULT_TEMPLATE_ID,
  status = SITE_STATUSES.DRAFT,
  clientName,
}) {
  const tenantId = String(id || '')
    .trim()
    .toLowerCase();
  const tenantName = String(name || '').trim();
  const email = String(ownerEmail || '')
    .trim()
    .toLowerCase();

  if (!TENANT_ID_PATTERN.test(tenantId)) {
    return { error: 'ID inválido. Use 3–32 caracteres: letras minúsculas, números e hífen.' };
  }

  if (!tenantName) {
    return { error: 'Nome da loja é obrigatório.' };
  }

  if (!OWNER_EMAIL_PATTERN.test(email)) {
    return { error: 'E-mail do dono da loja é obrigatório e deve ser válido.' };
  }

  const existing = await queryOne('SELECT id FROM tenants WHERE id = ?', [tenantId]);
  if (existing) {
    return { error: 'Já existe uma loja com este ID.' };
  }

  const template = await getSiteTemplate(templateId);
  if (!template) {
    return { error: 'Modelo de site não encontrado.' };
  }

  const generatedPassword = !String(ownerPassword || '').trim();
  const password = generatedPassword ? generateOwnerPassword() : String(ownerPassword).trim();

  const config = (await cloneTemplateConfig(templateId)) || createBootstrapConfig(tenantId, tenantName);
  config.store = {
    ...config.store,
    name: tenantName,
  };
  config.auth = {
    adminEmail: email,
    adminPassword: password,
    userEmail: 'cliente@koryntech.com',
    userPassword: 'cliente123',
    registeredUsers: [],
  };
  config.analytics = {
    pageViews: 0,
    whatsAppClicks: 0,
    lastVisit: null,
  };

  await upsertTenant({
    id: tenantId,
    name: tenantName,
    active: true,
    templateId,
    status,
    clientName: clientName || tenantName,
    clientEmail: email,
  });
  await upsertTenantConfig(tenantId, config);
  await ensureTenantSubscription(tenantId);

  const userResult = await createUser({
    email,
    password,
    role: ROLES.TENANT_OWNER,
    tenantId,
  });

  if (userResult.error) {
    return { error: userResult.error };
  }

  const row = await queryOne(`${TENANT_SELECT} FROM tenants t WHERE t.id = ?`, [tenantId]);
  const subscription = await getTenantSubscription(tenantId);

  return {
    tenant: mapTenantRow(row),
    onboarding: {
      ownerEmail: email,
      ownerPassword: password,
      passwordGenerated: generatedPassword,
      trialEndsAt: subscription?.trialEndsAt || null,
      planId: subscription?.planId || 'starter',
      planName: subscription?.planName || 'Starter',
      templateId,
      status: normalizeSiteStatus(status),
    },
  };
}

export async function updateTenant(tenantId, patch) {
  const row = await queryOne(`${TENANT_SELECT} FROM tenants t WHERE t.id = ?`, [tenantId]);
  if (!row) {
    return { error: 'Tenant não encontrado.' };
  }

  const nextName = patch.name !== undefined ? String(patch.name).trim() : row.name;
  const nextActive =
    patch.active !== undefined ? toActiveValue(patch.active) : toActiveValue(fromActiveValue(row.active));
  const nextStatus =
    patch.status !== undefined ? normalizeSiteStatus(patch.status) : normalizeSiteStatus(row.status);
  const nextTemplateId =
    patch.templateId !== undefined ? String(patch.templateId).trim() : row.template_id || DEFAULT_TEMPLATE_ID;
  const nextClientName =
    patch.clientName !== undefined ? String(patch.clientName).trim() || null : row.client_name;
  const nextClientEmail =
    patch.clientEmail !== undefined ? String(patch.clientEmail).trim().toLowerCase() || null : row.client_email;

  if (!nextName) {
    return { error: 'Nome da loja é obrigatório.' };
  }

  if (patch.templateId !== undefined) {
    const template = await getSiteTemplate(nextTemplateId);
    if (!template) {
      return { error: 'Modelo de site não encontrado.' };
    }
  }

  await execute(
    `UPDATE tenants
     SET name = ?, active = ?, status = ?, template_id = ?, client_name = ?, client_email = ?, updated_at = ${sqlNow()}
     WHERE id = ?`,
    [nextName, nextActive, nextStatus, nextTemplateId, nextClientName, nextClientEmail, tenantId]
  );

  const updated = await queryOne(`${TENANT_SELECT} FROM tenants t WHERE t.id = ?`, [tenantId]);
  return { tenant: mapTenantRow(updated) };
}

export async function readTenantConfig(tenantId) {
  const row = await queryOne('SELECT config_json FROM tenant_configs WHERE tenant_id = ?', [
    tenantId,
  ]);

  if (!row) return null;

  return parseJsonColumn(row.config_json);
}

export async function writeTenantConfig(tenantId, config) {
  const tenant = await queryOne('SELECT id FROM tenants WHERE id = ?', [tenantId]);
  if (!tenant) return null;

  await upsertTenantConfig(tenantId, config);
  return config;
}

export async function isKnownTenant(tenantId, registry) {
  const tenant = await getTenantRecord(tenantId);
  if (!tenant || !tenant.active) return false;
  if (tenant.status === SITE_STATUSES.SUSPENDED) return false;
  if (!(await isTenantSubscriptionActive(tenantId))) return false;

  if (Array.isArray(registry) && registry.length > 0) {
    return registry.some((item) => item.id === tenantId);
  }

  return true;
}

export async function bootstrapDatabase() {
  await ensurePostgresSchema();
  await ensureSaasSchema();

  const migration = await migrateLegacyJsonStore();

  if (!migration.migrated && migration.reason === 'no-legacy-json') {
    await seedDefaultTenants();
  }

  await seedSiteTemplates();

  await execute(
    `UPDATE tenants
     SET template_id = ?, status = COALESCE(status, ?)
     WHERE template_id IS NULL OR template_id = ''`,
    [DEFAULT_TEMPLATE_ID, SITE_STATUSES.ACTIVE]
  );

  await syncUsersFromTenantConfigs();
  await seedSubscriptionPlans();
  await seedSubscriptionsForExistingTenants();

  return migration;
}
