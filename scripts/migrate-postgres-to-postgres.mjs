#!/usr/bin/env node
/**
 * Copia dados do Postgres atual para um novo projeto Supabase.
 * Uso:
 *   set SOURCE_DATABASE_URL=postgres://...
 *   set DATABASE_URL=postgres://...novo-projeto...
 *   node scripts/migrate-postgres-to-postgres.mjs
 */
import { loadEnvFile } from './load-env.mjs';

loadEnvFile();

const sourceUrl = process.env.SOURCE_DATABASE_URL || process.env.OLD_DATABASE_URL;
const targetUrl = process.env.DATABASE_URL;

if (!sourceUrl || !targetUrl) {
  console.error('Defina SOURCE_DATABASE_URL (origem) e DATABASE_URL (destino).');
  process.exit(1);
}

let pg;
try {
  pg = await import('pg');
} catch {
  console.error('Pacote pg não instalado.');
  process.exit(1);
}

function pool(url) {
  return new pg.default.Pool({
    connectionString: url,
    ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false },
  });
}

const source = pool(sourceUrl);
const target = pool(targetUrl);

const schemaSql = await import('node:fs').then((fs) =>
  fs.readFileSync(new URL('../server/db/schema.postgres.sql', import.meta.url), 'utf8')
);

async function copyTable(table, columns, conflict) {
  const rows = (await source.query(`SELECT ${columns} FROM ${table}`)).rows;
  for (const row of rows) {
    const values = Object.values(row);
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
    const cols = columns;
    await target.query(
      `INSERT INTO ${table} (${cols}) VALUES (${placeholders}) ${conflict}`,
      values
    );
  }
  return rows.length;
}

try {
  await target.query(schemaSql);

  const counts = {
    tenants: await copyTable(
      'tenants',
      'id, name, active, created_at, updated_at',
      'ON CONFLICT(id) DO UPDATE SET name=excluded.name, active=excluded.active, updated_at=excluded.updated_at'
    ),
    tenant_configs: await (async () => {
      const rows = (await source.query('SELECT tenant_id, config_json, updated_at FROM tenant_configs')).rows;
      for (const row of rows) {
        await target.query(
          `INSERT INTO tenant_configs (tenant_id, config_json, updated_at)
           VALUES ($1, $2::jsonb, $3)
           ON CONFLICT(tenant_id) DO UPDATE SET config_json=excluded.config_json, updated_at=excluded.updated_at`,
          [row.tenant_id, row.config_json, row.updated_at]
        );
      }
      return rows.length;
    })(),
    users: await copyTable(
      'users',
      'id, email, password_hash, role, tenant_id, created_at, updated_at',
      'ON CONFLICT(email, tenant_id, role) DO UPDATE SET password_hash=excluded.password_hash, updated_at=excluded.updated_at'
    ),
    subscription_plans: await copyTable(
      'subscription_plans',
      'id, name, price_cents, currency, interval, stripe_price_id, active, created_at',
      'ON CONFLICT(id) DO NOTHING'
    ),
    tenant_subscriptions: await copyTable(
      'tenant_subscriptions',
      'tenant_id, plan_id, status, provider, provider_subscription_id, current_period_end, trial_ends_at, created_at, updated_at',
      'ON CONFLICT(tenant_id) DO UPDATE SET plan_id=excluded.plan_id, status=excluded.status, provider=excluded.provider, provider_subscription_id=excluded.provider_subscription_id, current_period_end=excluded.current_period_end, trial_ends_at=excluded.trial_ends_at, updated_at=excluded.updated_at'
    ),
    user_data: await (async () => {
      const rows = (await source.query('SELECT tenant_id, email, data_json, updated_at FROM user_data')).rows;
      for (const row of rows) {
        await target.query(
          `INSERT INTO user_data (tenant_id, email, data_json, updated_at)
           VALUES ($1, $2, $3::jsonb, $4)
           ON CONFLICT(tenant_id, email) DO UPDATE SET data_json=excluded.data_json, updated_at=excluded.updated_at`,
          [row.tenant_id, row.email, row.data_json, row.updated_at]
        );
      }
      return rows.length;
    })(),
  };

  await target.query(
    `SELECT setval(pg_get_serial_sequence('users', 'id'), COALESCE((SELECT MAX(id) FROM users), 1))`
  );

  console.log('Migração Postgres → Postgres concluída:', counts);
} catch (error) {
  console.error('Falha:', error.message);
  process.exitCode = 1;
} finally {
  await source.end();
  await target.end();
}
