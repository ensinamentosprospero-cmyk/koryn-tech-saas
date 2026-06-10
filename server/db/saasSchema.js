import { isPostgres, queryAll, queryOne, execute } from './dbClient.js';

async function sqliteColumnExists(table, column) {
  const rows = await queryAll(`PRAGMA table_info(${table})`);
  return rows.some((row) => row.name === column);
}

async function ensureSqliteColumn(table, column, definition) {
  const exists = await sqliteColumnExists(table, column);
  if (exists) return;
  await execute(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
}

export async function ensureSaasSchema() {
  if (isPostgres()) {
    await execute(`
      CREATE TABLE IF NOT EXISTS site_templates (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        config_json JSONB NOT NULL,
        active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await execute(`ALTER TABLE tenants ADD COLUMN IF NOT EXISTS template_id TEXT`);
    await execute(`ALTER TABLE tenants ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active'`);
    await execute(`ALTER TABLE tenants ADD COLUMN IF NOT EXISTS client_name TEXT`);
    await execute(`ALTER TABLE tenants ADD COLUMN IF NOT EXISTS client_email TEXT`);
    return;
  }

  await execute(`
    CREATE TABLE IF NOT EXISTS site_templates (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      config_json TEXT NOT NULL,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  await ensureSqliteColumn('tenants', 'template_id', 'TEXT');
  await ensureSqliteColumn('tenants', 'status', "TEXT NOT NULL DEFAULT 'active'");
  await ensureSqliteColumn('tenants', 'client_name', 'TEXT');
  await ensureSqliteColumn('tenants', 'client_email', 'TEXT');
}
