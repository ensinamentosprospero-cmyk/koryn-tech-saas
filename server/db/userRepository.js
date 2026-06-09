import { execute, fromActiveValue, queryAll, queryOne, sqlNow } from './dbClient.js';
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

export async function findUser(email, tenantId, role) {
  const row = await queryOne(
    `SELECT id, email, password_hash, role, tenant_id
     FROM users
     WHERE email = ? AND tenant_id = ? AND role = ?`,
    [normalizeEmail(email), tenantId, role]
  );

  return row ? { ...mapUserRow(row), passwordHash: row.password_hash } : null;
}

export async function findUserById(userId) {
  const row = await queryOne('SELECT id, email, role, tenant_id FROM users WHERE id = ?', [
    userId,
  ]);

  return mapUserRow(row);
}

export async function createUser({ email, password, role, tenantId }) {
  const normalizedEmail = normalizeEmail(email);
  const trimmedPassword = String(password || '').trim();

  if (!normalizedEmail || !trimmedPassword) {
    return { error: 'E-mail e senha são obrigatórios.' };
  }

  const existing = await findUser(normalizedEmail, tenantId, role);
  if (existing) {
    return { error: 'Já existe uma conta com este e-mail.' };
  }

  const result = await execute(
    `INSERT INTO users (email, password_hash, role, tenant_id, updated_at)
     VALUES (?, ?, ?, ?, ${sqlNow()})`,
    [normalizedEmail, hashPassword(trimmedPassword), role, tenantId]
  );

  return {
    user: await findUserById(result.lastInsertId),
  };
}

export async function ensureUser({ email, password, role, tenantId }) {
  const existing = await findUser(email, tenantId, role);
  if (existing) return existing;

  const created = await createUser({ email, password, role, tenantId });
  if (created.error) return null;

  return findUser(email, tenantId, role);
}

export async function authenticateUser(email, password, tenantId) {
  const normalizedEmail = normalizeEmail(email);
  const trimmedPassword = String(password || '').trim();

  const rolesToTry =
    tenantId === PLATFORM_TENANT_ID
      ? [ROLES.PLATFORM_ADMIN]
      : [ROLES.TENANT_OWNER, ROLES.VISITOR];

  for (const role of rolesToTry) {
    const user = await findUser(normalizedEmail, tenantId, role);
    if (user && verifyPassword(trimmedPassword, user.passwordHash)) {
      const { passwordHash, ...safeUser } = user;
      return safeUser;
    }
  }

  return null;
}

export async function registerVisitor(email, password, tenantId) {
  const normalizedEmail = normalizeEmail(email);
  const trimmedPassword = String(password || '').trim();

  if (!normalizedEmail || !trimmedPassword) {
    return { error: 'E-mail e senha são obrigatórios.' };
  }

  const owner = await findUser(normalizedEmail, tenantId, ROLES.TENANT_OWNER);
  if (owner) {
    return { error: 'Este e-mail já está em uso.' };
  }

  return createUser({
    email: normalizedEmail,
    password: trimmedPassword,
    role: ROLES.VISITOR,
    tenantId,
  });
}

export async function syncUsersFromTenantConfigs() {
  await ensureUser({
    email: 'admin@koryntech.com',
    password: 'korynadmin',
    role: ROLES.PLATFORM_ADMIN,
    tenantId: PLATFORM_TENANT_ID,
  });

  const tenants = await listAllTenants();

  for (const tenant of tenants) {
    const config = await readTenantConfig(tenant.id);
    const auth = config?.auth;
    if (!auth) continue;

    if (auth.adminEmail && auth.adminPassword) {
      await ensureUser({
        email: auth.adminEmail,
        password: auth.adminPassword,
        role: ROLES.TENANT_OWNER,
        tenantId: tenant.id,
      });
    }

    if (auth.userEmail && auth.userPassword) {
      await ensureUser({
        email: auth.userEmail,
        password: auth.userPassword,
        role: ROLES.VISITOR,
        tenantId: tenant.id,
      });
    }

    if (Array.isArray(auth.registeredUsers)) {
      for (const registeredUser of auth.registeredUsers) {
        if (!registeredUser?.email || !registeredUser?.password) continue;

        await ensureUser({
          email: registeredUser.email,
          password: registeredUser.password,
          role: ROLES.VISITOR,
          tenantId: tenant.id,
        });
      }
    }
  }
}
