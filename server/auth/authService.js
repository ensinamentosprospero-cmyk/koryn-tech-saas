import { createAccessToken, verifyAccessToken } from './jwt.js';
import {
  PLATFORM_TENANT_ID,
  ROLES,
  authenticateUser,
  findUserById,
  registerVisitor,
} from '../db/userRepository.js';

export async function loginUser({ email, password, tenantId, scope }) {
  const resolvedTenantId = scope === 'platform' ? PLATFORM_TENANT_ID : tenantId;

  if (!resolvedTenantId) {
    return { error: 'Tenant é obrigatório.' };
  }

  const user = await authenticateUser(email, password, resolvedTenantId);
  if (!user) {
    return { error: 'E-mail ou senha incorretos.' };
  }

  const token = createAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role,
    tenantId: user.tenantId,
  });

  return { token, user };
}

export async function registerUser({ email, password, tenantId }) {
  if (!tenantId || tenantId === PLATFORM_TENANT_ID) {
    return { error: 'Registro disponível apenas para lojas.' };
  }

  const result = await registerVisitor(email, password, tenantId);
  if (result.error) return result;

  const token = createAccessToken({
    sub: result.user.id,
    email: result.user.email,
    role: result.user.role,
    tenantId: result.user.tenantId,
  });

  return { token, user: result.user };
}

export async function getUserFromRequest(request) {
  const authorization = request.headers.authorization || request.headers.Authorization;
  if (!authorization || !authorization.startsWith('Bearer ')) return null;

  const token = authorization.slice('Bearer '.length).trim();
  const payload = verifyAccessToken(token);
  if (!payload?.sub) return null;

  const user = await findUserById(payload.sub);
  if (!user) return null;

  return user;
}

export function hasRole(user, roles) {
  return Boolean(user && roles.includes(user.role));
}

export function canManageTenant(user, tenantId) {
  if (!user) return false;
  if (user.role === ROLES.PLATFORM_ADMIN) return true;
  return user.role === ROLES.TENANT_OWNER && user.tenantId === tenantId;
}

export function canAccessUserData(user, tenantId) {
  if (!user) return false;
  if (user.role === ROLES.PLATFORM_ADMIN) return true;
  if (user.tenantId !== tenantId) return false;
  return user.role === ROLES.VISITOR || user.role === ROLES.TENANT_OWNER;
}

export { ROLES, PLATFORM_TENANT_ID };
