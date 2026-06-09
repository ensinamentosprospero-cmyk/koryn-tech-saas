import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getDatabase } from './database.js';
import { getDatabaseDriver } from '../config/env.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let pool = null;
let schemaReady = false;

export function isPostgres() {
  return getDatabaseDriver() === 'postgres';
}

function convertPlaceholders(sql) {
  let index = 0;
  return sql.replace(/\?/g, () => `$${++index}`);
}

async function getPool() {
  if (pool) return pool;

  const pg = await import('pg');
  pool = new pg.default.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false },
  });

  return pool;
}

export async function ensurePostgresSchema() {
  if (!isPostgres() || schemaReady) return;

  const schemaSql = readFileSync(path.join(__dirname, 'schema.postgres.sql'), 'utf8');
  const client = await getPool();
  await client.query(schemaSql);
  schemaReady = true;
}

export async function queryAll(sql, params = []) {
  if (isPostgres()) {
    const client = await getPool();
    const result = await client.query(convertPlaceholders(sql), params);
    return result.rows;
  }

  return getDatabase().prepare(sql).all(...params);
}

export async function queryOne(sql, params = []) {
  if (isPostgres()) {
    const client = await getPool();
    const result = await client.query(convertPlaceholders(sql), params);
    return result.rows[0] ?? null;
  }

  return getDatabase().prepare(sql).get(...params) ?? null;
}

export async function execute(sql, params = []) {
  if (isPostgres()) {
    const client = await getPool();
    const result = await client.query(convertPlaceholders(sql), params);
    const insertedId = result.rows[0]?.id;
    return {
      changes: result.rowCount ?? 0,
      lastInsertId: insertedId !== undefined ? Number(insertedId) : null,
    };
  }

  const info = getDatabase().prepare(sql).run(...params);
  return {
    changes: info.changes,
    lastInsertId: Number(info.lastInsertRowid),
  };
}

export function sqlNow() {
  return isPostgres() ? 'NOW()' : "datetime('now')";
}

export function toActiveValue(active) {
  const value = active !== false;
  return isPostgres() ? value : value ? 1 : 0;
}

export function fromActiveValue(value) {
  return value === true || value === 1;
}

export function fromPlanActiveValue(value) {
  return value === true || value === 1;
}

export function parseJsonColumn(value, fallback = null) {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'object') return value;

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export async function closeDbClient() {
  if (pool) {
    await pool.end();
    pool = null;
  }

  schemaReady = false;
}
