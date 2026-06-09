#!/usr/bin/env node
/**
 * Conecta o Koryn Tech ao Supabase (API keys + senha do banco).
 */
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnvFile } from './load-env.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');
const envPath = path.join(rootDir, '.env');

loadEnvFile();

function readEnvValue(key) {
  if (!existsSync(envPath)) return '';
  const match = readFileSync(envPath, 'utf8').match(new RegExp(`^${key}=(.+)$`, 'm'));
  return match?.[1]?.trim() || '';
}

function projectRefFromUrl(url) {
  const match = String(url || '').match(/https:\/\/([^.]+)\.supabase\.co/i);
  return match?.[1] || '';
}

function resolveDatabaseUrl(ref, region = 'sa-east-1') {
  const password = process.env.SUPABASE_DB_PASSWORD?.trim();
  let url = process.env.DATABASE_URL?.trim();

  if (url?.includes('[YOUR-PASSWORD]')) {
    if (!password) {
      throw new Error('Substitua [YOUR-PASSWORD] ou defina SUPABASE_DB_PASSWORD no .env');
    }
    url = url.replace('[YOUR-PASSWORD]', encodeURIComponent(password));
  }

  if (!url && ref && password) {
    url = `postgres://postgres.${ref}:${encodeURIComponent(password)}@aws-1-${region}.pooler.supabase.com:6543/postgres`;
  }

  if (!url) {
    throw new Error('Defina SUPABASE_DB_PASSWORD ou DATABASE_URL completa no .env');
  }

  url = url.replace(/^postgresql:\/\//, 'postgres://');

  const direct = url.match(
    /^postgres:\/\/postgres:([^@]+)@db\.([^.]+)\.supabase\.co:5432\/postgres/
  );
  if (direct) {
    url = `postgres://postgres.${direct[2]}:${direct[1]}@aws-1-${region}.pooler.supabase.com:6543/postgres`;
  }

  return url.replace('?sslmode=require', '').replace('&sslmode=require', '');
}

function run(label, command, args = []) {
  console.log(`\n=== ${label} ===`);
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: process.env,
  });
  if (result.status !== 0) {
    console.error(`Falha: ${label}`);
    process.exit(result.status || 1);
  }
}

const supabaseUrl = process.env.SUPABASE_URL?.trim();
const ref =
  process.env.SUPABASE_PROJECT_REF?.trim() ||
  projectRefFromUrl(supabaseUrl);
const apiKey =
  process.env.SUPABASE_PUBLISHABLE_KEY?.trim() ||
  process.env.SUPABASE_ANON_KEY?.trim();
const secretKey = process.env.SUPABASE_SECRET_KEY?.trim();
const region = process.env.SUPABASE_REGION || 'sa-east-1';

if (!supabaseUrl || !ref) {
  console.error('Defina SUPABASE_URL no .env');
  process.exit(1);
}

let databaseUrl;
try {
  databaseUrl = resolveDatabaseUrl(ref, region);
} catch (error) {
  console.error(error.message);
  console.error('');
  console.error('No Supabase: Settings → Database → use a senha que voce definiu ao criar o projeto.');
  console.error('Ou: Reset database password → copie a nova senha.');
  process.exit(1);
}

const previousUrl = readEnvValue('DATABASE_URL');
const sourceUrl =
  readEnvValue('SOURCE_DATABASE_URL') ||
  (previousUrl && !previousUrl.includes(ref) ? previousUrl : '') ||
  'postgres://postgres.iisvuhfkekzyqnrzvqxb:uWzLw8MroOj9YM5L@aws-1-sa-east-1.pooler.supabase.com:6543/postgres';

const envLines = [
  `# Supabase Koryn Tech — ${new Date().toISOString()}`,
  `SUPABASE_URL=${supabaseUrl}`,
  `SUPABASE_PROJECT_REF=${ref}`,
  `SUPABASE_PUBLISHABLE_KEY=${apiKey || ''}`,
  `SUPABASE_SECRET_KEY=${secretKey || ''}`,
  `DATABASE_URL=${databaseUrl}`,
  'DATABASE_SSL=false',
];

if (sourceUrl && !sourceUrl.includes(ref)) {
  envLines.push(`SOURCE_DATABASE_URL=${sourceUrl}`);
}

envLines.push(
  'NODE_ENV=development',
  'JWT_SECRET=koryn-tech-dev-jwt-secret-change-in-production',
  'SERVE_STATIC=false',
  ''
);

writeFileSync(envPath, envLines.join('\n'), 'utf8');
process.env.DATABASE_URL = databaseUrl;
process.env.DATABASE_SSL = 'false';
if (sourceUrl && !sourceUrl.includes(ref)) {
  process.env.SOURCE_DATABASE_URL = sourceUrl;
}

console.log('Projeto:', ref);
console.log('DATABASE_URL configurada (pooler 6543).');

run('Aplicar schema', 'node', ['scripts/migrate-postgres.mjs']);

if (process.env.SOURCE_DATABASE_URL) {
  run('Copiar dados do banco antigo', 'node', ['scripts/migrate-postgres-to-postgres.mjs']);
} else if (existsSync(path.join(rootDir, 'server', 'data', 'store.db'))) {
  run('Migrar SQLite', 'node', ['scripts/migrate-sqlite-to-postgres.mjs']);
}

const railway = spawnSync('railway', ['whoami'], { shell: true, encoding: 'utf8' });
if (railway.status === 0) {
  run('Railway DATABASE_URL', 'railway', [
    'variable',
    'set',
    `DATABASE_URL=${databaseUrl}`,
    '--service',
    'web',
  ]);
  run('Railway DATABASE_SSL', 'railway', [
    'variable',
    'set',
    'DATABASE_SSL=false',
    '--service',
    'web',
  ]);
}

console.log('\nPronto: https://web-production-b5f0a.up.railway.app/api/health');
