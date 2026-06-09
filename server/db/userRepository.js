import { getDatabase } from './database.js';
import { hashPassword, verifyPassword } from '../auth/password.js';
import { listAllTenants, readTenantConfig } from './tenantRepository.js';

export const ROLES = {
  PLATFORM_ADMIN: 'platform_admin',
  TENANT_OWNER: 'tenant_owner',
  VISITOR: 'visitor',
};

export const PLATFORM_TENANT_ID = 'platform';

function normalizeEmail(email) {
  return String(email || '')
    .trim()
    .toLowerCase();
}

function mapUserRow(row) {
  if (!row) return null;

  return {
    id: row.id,
    email: row.email,
    role: row.role,
    tenantId: row.tenant_id,
  };
}

export function findUser(email, tenantId, role, db = getDatabase()) {
  const row = db
    .prepare(
      `SELECT id, email, password_hash, role, tenant_id
       FROM users
       WHERE email = ? AND tenant_id = ? AND role = ?`
    )
    .get(normalizeEmail(email), tenantId, role);

  return row ? { ...mapUserRow(row), passwordHash: row.password_hash } : null;
}

export function findUserById(userId, db = getDatabase()) {
  const row = db
    .prepare('SELECT id, email, role, tenant_id FROM users WHERE id = ?')
    .get(userId);

  return mapUserRow(row);
}

export function createUser({ email, password, role, tenantId }, db = getDatabase()) {
  const normalizedEmail = normalizeEmail(email);
  const trimmedPassword = String(password || '').trim();

  if (!normalizedEmail || !trimmedPassword) {
    return { error: 'E-mail e senha são obrigatórios.' };
  }

  const existing = findUser(normalizedEmail, tenantId, role, db);
  if (existing) {
    return { error: 'Já existe uma conta com este e-mail.' };
  }

  const result = db
    .prepare(
      `INSERT INTO users (email, password_hash, role, tenant_id, updated_at)
       VALUES (?, ?, ?, ?, datetime('now'))`
    )
    .run(normalizedEmail, hashPassword(trimmedPassword), role, tenantId);

  return {
    user: findUserById(Number(result.lastInsertRowid), db),
  };
}

export function ensureUser({ email, password, role, tenantId }, db = getDatabase()) {
  const existing = findUser(email, tenantId, role, db);
  if (existing) return existing;

  const created = createUser({ email, password, role, tenantId }, db);
  if (created.error) return null;

  return findUser(email, tenantId, role, db);
}

export function authenticateUser(email, password, tenantId, db = getDatabase()) {
  const normalizedEmail = normalizeEmail(email);
  const trimmedPassword = String(password || '').trim();

  const rolesToTry =
    tenantId === PLATFORM_TENANT_ID
      ? [ROLES.PLATFORM_ADMIN]
      : [ROLES.TENANT_OWNER, ROLES.VISITOR];

  for (const role of rolesToTry) {
    const user = findUser(normalizedEmail, tenantId, role, db);
    if (user && verifyPassword(trimmedPassword, user.passwordHash)) {
      const { passwordHash, ...safeUser } = user;
      return safeUser;
    }
  }

  return null;
}

export function registerVisitor(email, password, tenantId, db = getDatabase()) {
  const normalizedEmail = normalizeEmail(email);
  const trimmedPassword = String(password || '').trim();

  if (!normalizedEmail || !trimmedPassword) {
    return { error: 'E-mail e senha são obrigatórios.' };
  }

  const owner = findUser(normalizedEmail, tenantId, ROLES.TENANT_OWNER, db);
  if (owner) {
    return { error: 'Este e-mail já está em uso.' };
  }

  return createUser(
    {
      email: normalizedEmail,
      password: trimmedPassword,
      role: ROLES.VISITOR,
      tenantId,
    },
    db
  );
}

export async function syncUsersFromTenantConfigs(db = getDatabase()) {
  ensureUser(
    {
      email: 'admin@koryntech.com',
      password: 'korynadmin',
      role: ROLES.PLATFORM_ADMIN,
      tenantId: PLATFORM_TENANT_ID,
    },
    db
  );

  const tenants = listAllTenants(db);

  for (const tenant of tenants) {
    const config = readTenantConfig(tenant.id, db);
    const auth = config?.auth;
    if (!auth) continue;

    if (auth.adminEmail && auth.adminPassword) {
      ensureUser(
        {
          email: auth.adminEmail,
          password: auth.adminPassword,
          role: ROLES.TENANT_OWNER,
          tenantId: tenant.id,
        },
        db
      );
    }

    if (auth.userEmail && auth.userPassword) {
      ensureUser(
        {
          email: auth.userEmail,
          password: auth.userPassword,
          role: ROLES.VISITOR,
          tenantId: tenant.id,
        },
        db
      );
    }

    if (Array.isArray(auth.registeredUsers)) {
      for (const registeredUser of auth.registeredUsers) {
        if (!registeredUser?.email || !registeredUser?.password) continue;

        ensureUser(
          {
            email: registeredUser.email,
            password: registeredUser.password,
            role: ROLES.VISITOR,
            tenantId: tenant.id,
          },
          db
        );
      }
    }
  }
}
