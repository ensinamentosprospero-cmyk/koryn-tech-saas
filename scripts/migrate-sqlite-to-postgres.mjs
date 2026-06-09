#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const databaseUrl = process.env.DATABASE_URL;
const sqlitePath =
  process.env.STORE_DB_PATH || path.join(__dirname, '..', 'server', 'data', 'store.db');

if (!databaseUrl) {
  console.error('Defina DATABASE_URL (Supabase/Postgres) antes de migrar.');
  process.exit(1);
}

if (!fs.existsSync(sqlitePath)) {
  console.error(`SQLite não encontrado: ${sqlitePath}`);
  process.exit(1);
}

const sqlite = new DatabaseSync(sqlitePath);

let pg;
try {
  pg = await import('pg');
} catch {
  console.error('Pacote `pg` não instalado. Execute: npm install');
  process.exit(1);
}

const pool = new pg.default.Pool({
  connectionString: databaseUrl,
  ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false },
});

const schemaSql = fs.readFileSync(
  path.join(__dirname, '..', 'server', 'db', 'schema.postgres.sql'),
  'utf8'
);

function readAll(sql) {
  return sqlite.prepare(sql).all();
}

async function upsertTenant(client, tenant) {
  await client.query(
    `INSERT INTO tenants (id, name, active, created_at, updated_at)
     VALUES ($1, $2, $3, COALESCE($4::timestamptz, NOW()), COALESCE($5::timestamptz, NOW()))
     ON CONFLICT(id) DO UPDATE SET
       name = excluded.name,
       active = excluded.active,
       updated_at = excluded.updated_at`,
    [tenant.id, tenant.name, tenant.active === 1, tenant.created_at, tenant.updated_at]
  );
}

async function upsertTenantConfig(client, row) {
  await client.query(
    `INSERT INTO tenant_configs (tenant_id, config_json, updated_at)
     VALUES ($1, $2::jsonb, COALESCE($3::timestamptz, NOW()))
     ON CONFLICT(tenant_id) DO UPDATE SET
       config_json = excluded.config_json,
       updated_at = excluded.updated_at`,
    [row.tenant_id, row.config_json, row.updated_at]
  );
}

async function upsertUser(client, row) {
  await client.query(
    `INSERT INTO users (id, email, password_hash, role, tenant_id, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, COALESCE($6::timestamptz, NOW()), COALESCE($7::timestamptz, NOW()))
     ON CONFLICT(email, tenant_id, role) DO UPDATE SET
       password_hash = excluded.password_hash,
       updated_at = excluded.updated_at`,
    [
      row.id,
      row.email,
      row.password_hash,
      row.role,
      row.tenant_id,
      row.created_at,
      row.updated_at,
    ]
  );
}

async function upsertPlan(client, row) {
  await client.query(
    `INSERT INTO subscription_plans (
       id, name, price_cents, currency, interval, stripe_price_id, active, created_at
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8::timestamptz, NOW()))
     ON CONFLICT(id) DO UPDATE SET
       name = excluded.name,
       price_cents = excluded.price_cents,
       currency = excluded.currency,
       interval = excluded.interval,
       stripe_price_id = excluded.stripe_price_id,
       active = excluded.active`,
    [
      row.id,
      row.name,
      row.price_cents,
      row.currency,
      row.interval,
      row.stripe_price_id,
      row.active === 1,
      row.created_at,
    ]
  );
}

async function upsertSubscription(client, row) {
  await client.query(
    `INSERT INTO tenant_subscriptions (
       tenant_id, plan_id, status, provider, provider_subscription_id,
       current_period_end, trial_ends_at, created_at, updated_at
     ) VALUES ($1, $2, $3, $4, $5, $6::timestamptz, $7::timestamptz, COALESCE($8::timestamptz, NOW()), COALESCE($9::timestamptz, NOW()))
     ON CONFLICT(tenant_id) DO UPDATE SET
       plan_id = excluded.plan_id,
       status = excluded.status,
       provider = excluded.provider,
       provider_subscription_id = excluded.provider_subscription_id,
       current_period_end = excluded.current_period_end,
       trial_ends_at = excluded.trial_ends_at,
       updated_at = excluded.updated_at`,
    [
      row.tenant_id,
      row.plan_id,
      row.status,
      row.provider,
      row.provider_subscription_id,
      row.current_period_end,
      row.trial_ends_at,
      row.created_at,
      row.updated_at,
    ]
  );
}

async function upsertUserData(client, row) {
  await client.query(
    `INSERT INTO user_data (tenant_id, email, data_json, updated_at)
     VALUES ($1, $2, $3::jsonb, COALESCE($4::timestamptz, NOW()))
     ON CONFLICT(tenant_id, email) DO UPDATE SET
       data_json = excluded.data_json,
       updated_at = excluded.updated_at`,
    [row.tenant_id, row.email, row.data_json, row.updated_at]
  );
}

try {
  await pool.query(schemaSql);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const tenants = readAll('SELECT * FROM tenants');
    for (const tenant of tenants) await upsertTenant(client, tenant);

    const configs = readAll('SELECT * FROM tenant_configs');
    for (const row of configs) await upsertTenantConfig(client, row);

    const users = readAll('SELECT * FROM users');
    for (const row of users) await upsertUser(client, row);

    const plans = readAll('SELECT * FROM subscription_plans');
    for (const row of plans) await upsertPlan(client, row);

    const subscriptions = readAll('SELECT * FROM tenant_subscriptions');
    for (const row of subscriptions) await upsertSubscription(client, row);

    const userData = readAll('SELECT * FROM user_data');
    for (const row of userData) await upsertUserData(client, row);

    await client.query(
      `SELECT setval(
         pg_get_serial_sequence('users', 'id'),
         COALESCE((SELECT MAX(id) FROM users), 1)
       )`
    );

    await client.query('COMMIT');

    console.log('Migração SQLite -> Postgres concluída.');
    console.log(`Tenants: ${tenants.length}`);
    console.log(`Users: ${users.length}`);
    console.log(`User data: ${userData.length}`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
} catch (error) {
  console.error('Falha na migração:', error.message);
  process.exitCode = 1;
} finally {
  sqlite.close();
  await pool.end();
}
