import { DEFAULT_TENANT_ID } from '../data/storeConfigKeys';

function normalizeSuffix(value) {
  return String(value || '')
    .trim()
    .toLowerCase();
}

export function buildTenantStorageKey(baseKey, tenantId = DEFAULT_TENANT_ID, suffix = '') {
  if (tenantId === DEFAULT_TENANT_ID) {
    return suffix ? `${baseKey}-${suffix}` : baseKey;
  }

  return suffix ? `${baseKey}-${tenantId}-${suffix}` : `${baseKey}-${tenantId}`;
}

export function getAdminSessionKey(tenantId = DEFAULT_TENANT_ID) {
  return buildTenantStorageKey('koryn-tech-admin-session', tenantId);
}

export function getUserSessionKey(tenantId = DEFAULT_TENANT_ID) {
  return buildTenantStorageKey('koryn-tech-user-session', tenantId);
}

export function getSavedLoginKey(tenantId = DEFAULT_TENANT_ID) {
  return buildTenantStorageKey('koryn-tech-saved-login', tenantId);
}

export function getAuthTokenKey(tenantId = DEFAULT_TENANT_ID) {
  return buildTenantStorageKey('koryn-tech-auth-token', tenantId);
}

export const PLATFORM_AUTH_TOKEN_KEY = 'koryn-tech-platform-auth-token';

export function getUserDataStorageKey(tenantId, email) {
  return buildTenantStorageKey('koryn-tech-user-data', tenantId, normalizeSuffix(email));
}

export function getThemeStorageKey(tenantId, email) {
  return buildTenantStorageKey('koryn-tech-theme', tenantId, normalizeSuffix(email));
}
