import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getDatabase } from './database.js';
import { DEFAULT_TENANTS, createBootstrapConfig } from './tenantDefaults.js';
import { syncUsersFromTenantConfigs } from './userRepository.js';
import {
  ensureTenantSubscription,
  isTenantSubscriptionActive,
  seedSubscriptionPlans,
  seedSubscriptionsForExistingTenants,
} from './subscriptionRepository.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LEGACY_DATA_DIR = path.join(__dirname, '..', 'data', 'tenants');
const LEGACY_REGISTRY_PATH = path.join(LEGACY_DATA_DIR, 'registry.json');

function upsertTenant(db, tenant) {
  db.prepare(
    `INSERT INTO tenants (id, name, active, updated_at)
     VALUES (?, ?, ?, datetime('now'))
     ON CONFLICT(id) DO UPDATE SET
       name = excluded.name,
       active = excluded.active,
       updated_at = datetime('now')`
  ).run(tenant.id, tenant.name, tenant.active === false ? 0 : 1);
}

function upsertTenantConfig(db, tenantId, config) {
  db.prepare(
    `INSERT INTO tenant_configs (tenant_id, config_json, updated_at)
     VALUES (?, ?, datetime('now'))
     ON CONFLICT(tenant_id) DO UPDATE SET
       config_json = excluded.config_json,
       updated_at = datetime('now')`
  ).run(tenantId, JSON.stringify(config));
}

export function seedDefaultTenants(db = getDatabase()) {
  for (const tenant of DEFAULT_TENANTS) {
    upsertTenant(db, tenant);

    const existing = db
      .prepare('SELECT tenant_id FROM tenant_configs WHERE tenant_id = ?')
      .get(tenant.id);

    if (!existing) {
      upsertTenantConfig(db, tenant.id, createBootstrapConfig(tenant.id));
    }
  }
}

export async function migrateLegacyJsonStore(db = getDatabase()) {
  if (!existsSync(LEGACY_REGISTRY_PATH)) {
    seedDefaultTenants(db);
    return { migrated: false, reason: 'no-legacy-json' };
  }

  const tenantCount = db.prepare('SELECT COUNT(*) AS total FROM tenants').get().total;
  if (tenantCount > 0) {
    return { migrated: false, reason: 'database-already-populated' };
  }

  const registryRaw = await readFile(LEGACY_REGISTRY_PATH, 'utf8');
  const registry = JSON.parse(registryRaw);
  const tenants = Array.isArray(registry.tenants) ? registry.tenants : DEFAULT_TENANTS;

  for (const tenant of tenants) {
    upsertTenant(db, tenant);

    const legacyConfigPath = path.join(LEGACY_DATA_DIR, `${tenant.id}.json`);
    let config = createBootstrapConfig(tenant.id);

    if (existsSync(legacyConfigPath)) {
      const legacyRaw = await readFile(legacyConfigPath, 'utf8');
      config = JSON.parse(legacyRaw);
    }

    upsertTenantConfig(db, tenant.id, config);
  }

  return { migrated: true, tenants: tenants.length };
}

function mapTenantRow(row) {
  return {
    id: row.id,
    name: row.name,
    active: row.active === 1,
  };
}

export function listTenants(db = getDatabase()) {
  return db
    .prepare('SELECT id, name, active FROM tenants WHERE active = 1 ORDER BY id ASC')
    .all()
    .map(mapTenantRow)
    .filter((tenant) => isTenantSubscriptionActive(tenant.id, db));
}

export function listAllTenants(db = getDatabase()) {
  return db
    .prepare('SELECT id, name, active FROM tenants ORDER BY id ASC')
    .all()
    .map(mapTenantRow);
}

const TENANT_ID_PATTERN = /^[a-z0-9][a-z0-9-]{1,30}[a-z0-9]$/;

export function createTenant({ id, name }, db = getDatabase()) {
  const tenantId = String(id || '')
    .trim()
    .toLowerCase();
  const tenantName = String(name || '').trim();

  if (!TENANT_ID_PATTERN.test(tenantId)) {
    return { error: 'ID inválido. Use 3–32 caracteres: letras minúsculas, números e hífen.' };
  }

  if (!tenantName) {
    return { error: 'Nome da loja é obrigatório.' };
  }

  const existing = db.prepare('SELECT id FROM tenants WHERE id = ?').get(tenantId);
  if (existing) {
    return { error: 'Já existe uma loja com este ID.' };
  }

  upsertTenant(db, { id: tenantId, name: tenantName, active: true });
  upsertTenantConfig(db, tenantId, createBootstrapConfig(tenantId, tenantName));
  ensureTenantSubscription(tenantId, db);

  return { tenant: mapTenantRow(db.prepare('SELECT id, name, active FROM tenants WHERE id = ?').get(tenantId)) };
}

export function updateTenant(tenantId, patch, db = getDatabase()) {
  const row = db.prepare('SELECT id, name, active FROM tenants WHERE id = ?').get(tenantId);
  if (!row) {
    return { error: 'Tenant não encontrado.' };
  }

  const nextName = patch.name !== undefined ? String(patch.name).trim() : row.name;
  const nextActive = patch.active !== undefined ? (patch.active ? 1 : 0) : row.active;

  if (!nextName) {
    return { error: 'Nome da loja é obrigatório.' };
  }

  db.prepare(
    `UPDATE tenants
     SET name = ?, active = ?, updated_at = datetime('now')
     WHERE id = ?`
  ).run(nextName, nextActive, tenantId);

  return {
    tenant: mapTenantRow(
      db.prepare('SELECT id, name, active FROM tenants WHERE id = ?').get(tenantId)
    ),
  };
}

export function readTenantConfig(tenantId, db = getDatabase()) {
  const row = db
    .prepare('SELECT config_json FROM tenant_configs WHERE tenant_id = ?')
    .get(tenantId);

  if (!row) return null;

  return JSON.parse(row.config_json);
}

export function writeTenantConfig(tenantId, config, db = getDatabase()) {
  const tenant = db.prepare('SELECT id FROM tenants WHERE id = ?').get(tenantId);
  if (!tenant) return null;

  upsertTenantConfig(db, tenantId, config);
  return config;
}

export function isKnownTenant(tenantId, registry, db = getDatabase()) {
  if (!isTenantSubscriptionActive(tenantId, db)) {
    return false;
  }

  if (Array.isArray(registry) && registry.length > 0) {
    return registry.some((tenant) => tenant.id === tenantId);
  }

  const row = db
    .prepare('SELECT id FROM tenants WHERE id = ? AND active = 1')
    .get(tenantId);

  return Boolean(row);
}

export async function bootstrapDatabase() {
  const db = getDatabase();
  const migration = await migrateLegacyJsonStore(db);

  if (!migration.migrated && migration.reason === 'no-legacy-json') {
    seedDefaultTenants(db);
  }

  await syncUsersFromTenantConfigs(db);
  seedSubscriptionPlans(db);
  seedSubscriptionsForExistingTenants(db);

  return migration;
}
