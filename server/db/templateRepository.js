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
import { DEFAULT_TEMPLATE_ID } from './saasConstants.js';
import { readTenantConfig } from './tenantRepository.js';

function mapTemplateRow(row) {
  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    description: row.description,
    active: fromActiveValue(row.active),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listSiteTemplates(includeInactive = false) {
  const rows = await queryAll(
    includeInactive
      ? `SELECT id, name, description, active, created_at, updated_at
         FROM site_templates
         ORDER BY name ASC`
      : `SELECT id, name, description, active, created_at, updated_at
         FROM site_templates
         WHERE active = ?
         ORDER BY name ASC`,
    includeInactive ? [] : [toActiveValue(true)]
  );

  return rows.map(mapTemplateRow);
}

export async function getSiteTemplate(templateId) {
  const row = await queryOne(
    `SELECT id, name, description, active, created_at, updated_at
     FROM site_templates
     WHERE id = ?`,
    [templateId]
  );

  return mapTemplateRow(row);
}

export async function getSiteTemplateConfig(templateId = DEFAULT_TEMPLATE_ID) {
  const row = await queryOne('SELECT config_json FROM site_templates WHERE id = ?', [templateId]);
  if (!row) return null;
  return parseJsonColumn(row.config_json);
}

export async function cloneTemplateConfig(templateId = DEFAULT_TEMPLATE_ID) {
  const config = await getSiteTemplateConfig(templateId);
  if (!config) return null;
  return structuredClone(config);
}

export async function seedSiteTemplates() {
  await ensurePostgresSchema();

  const existing = await queryOne('SELECT id FROM site_templates WHERE id = ?', [
    DEFAULT_TEMPLATE_ID,
  ]);
  if (existing) return { seeded: false, reason: 'already-exists' };

  const defaultConfig = await readTenantConfig('default');
  if (!defaultConfig) {
    return { seeded: false, reason: 'missing-default-config' };
  }

  const configJson = JSON.stringify(defaultConfig);
  const jsonCast = isPostgres() ? '?::jsonb' : '?';

  await execute(
    `INSERT INTO site_templates (id, name, description, config_json, active, updated_at)
     VALUES (?, ?, ?, ${jsonCast}, ?, ${sqlNow()})`,
    [
      DEFAULT_TEMPLATE_ID,
      'Koryn Eletrônicos',
      'Modelo vitrine para lojas de celulares e acessórios — layout atual do site.',
      configJson,
      toActiveValue(true),
    ]
  );

  return { seeded: true, templateId: DEFAULT_TEMPLATE_ID };
}
