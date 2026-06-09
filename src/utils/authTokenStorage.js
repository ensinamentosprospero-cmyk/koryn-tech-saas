import { DEFAULT_TENANT_ID } from '../data/storeConfigKeys';
import {
  getAuthTokenKey,
  PLATFORM_AUTH_TOKEN_KEY,
} from './tenantStorageKeys';

function readStorage(key, storage = localStorage) {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key, value, storage = localStorage) {
  try {
    if (value == null) storage.removeItem(key);
    else storage.setItem(key, value);
  } catch {
    // ignore
  }
}

export function readAuthToken(tenantId = DEFAULT_TENANT_ID) {
  return readStorage(getAuthTokenKey(tenantId));
}

export function writeAuthToken(tenantId, token) {
  writeStorage(getAuthTokenKey(tenantId), token || null);
}

export function clearAuthToken(tenantId = DEFAULT_TENANT_ID) {
  writeAuthToken(tenantId, null);
}

export function readPlatformAuthToken() {
  return readStorage(PLATFORM_AUTH_TOKEN_KEY, sessionStorage);
}

export function writePlatformAuthToken(token) {
  writeStorage(PLATFORM_AUTH_TOKEN_KEY, token || null, sessionStorage);
}

export function clearPlatformAuthToken() {
  writePlatformAuthToken(null);
}

export function buildAuthHeaders(tenantId = DEFAULT_TENANT_ID) {
  const token = readAuthToken(tenantId);
  if (!token) return {};

  return {
    Authorization: `Bearer ${token}`,
  };
}

export function buildPlatformAuthHeaders() {
  const token = readPlatformAuthToken();
  if (!token) return {};

  return {
    Authorization: `Bearer ${token}`,
  };
}
