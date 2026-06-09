#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnvFile } from './load-env.mjs';

loadEnvFile();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.join(__dirname, '..', 'server', 'db', 'schema.postgres.sql');
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('Defina DATABASE_URL (Supabase/Postgres) antes de migrar.');
  process.exit(1);
}

const schemaSql = fs.readFileSync(schemaPath, 'utf8');

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

try {
  await pool.query(schemaSql);
  console.log('Schema Postgres aplicado com sucesso.');
} catch (error) {
  console.error('Falha ao aplicar schema Postgres:', error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
