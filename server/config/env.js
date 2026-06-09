import fs from 'node:fs';
import path from 'node:path';

const DEFAULT_JWT_SECRET = 'koryn-tech-dev-jwt-secret-change-in-production';

function loadDotEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return;

  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, '');

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

loadDotEnv();

function readBool(value, fallback = false) {
  if (value === undefined || value === null || value === '') return fallback;
  return value === 'true' || value === '1';
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || process.env.API_PORT || 3001),
  serveStatic:
    readBool(process.env.SERVE_STATIC) || process.env.NODE_ENV === 'production',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  jwtSecret: process.env.JWT_SECRET || DEFAULT_JWT_SECRET,
  databaseUrl: process.env.DATABASE_URL || '',
  storeDbPath: process.env.STORE_DB_PATH || 'server/data/store.db',
  appBaseUrl: process.env.APP_BASE_URL || 'http://localhost:5173',
  billingProvider: process.env.BILLING_PROVIDER || 'manual',
  tenantBaseDomains: process.env.VITE_TENANT_BASE_DOMAINS || 'localhost',
};

export function getDatabaseDriver() {
  return env.databaseUrl ? 'postgres' : 'sqlite';
}

export function validateProductionEnv() {
  if (env.nodeEnv !== 'production') return;

  if (!process.env.JWT_SECRET || env.jwtSecret === DEFAULT_JWT_SECRET) {
    console.warn(
      '[produção] Defina JWT_SECRET com valor forte e único antes de expor publicamente.'
    );
  }

  if (env.databaseUrl) {
    console.log(
      '[produção] DATABASE_URL detectada. Execute `npm run db:migrate:postgres` para criar tabelas no Supabase/Postgres.'
    );
    console.log(
      '[produção] Runtime da API continua no SQLite local até migração completa dos repositórios.'
    );
  }
}

export function getPublicConfig() {
  return {
    nodeEnv: env.nodeEnv,
    databaseDriver: getDatabaseDriver(),
    serveStatic: env.serveStatic,
    billingProvider: env.billingProvider,
  };
}
