import { DEFAULT_TENANT_ID } from '../data/storeConfigKeys';
import {
  getAdminSessionKey,
  getSavedLoginKey,
  getUserSessionKey,
} from './tenantStorageKeys';

function readStorage(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key, value) {
  try {
    if (value == null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

export function readAuthSession(sessionKey) {
  return readStorage(sessionKey) === '1';
}

export function writeAuthSession(sessionKey, active) {
  writeStorage(sessionKey, active ? '1' : null);
}

export function loadSavedLogin(tenantId = DEFAULT_TENANT_ID) {
  try {
    const raw = readStorage(getSavedLoginKey(tenantId));
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed?.email) return null;

    return {
      email: String(parsed.email),
      password: String(parsed.password || ''),
      remember: parsed.remember !== false,
    };
  } catch {
    return null;
  }
}

export function saveSavedLogin(email, password, remember, tenantId = DEFAULT_TENANT_ID) {
  const savedLoginKey = getSavedLoginKey(tenantId);

  if (!remember) {
    writeStorage(savedLoginKey, null);
    return;
  }

  writeStorage(
    savedLoginKey,
    JSON.stringify({
      email: email.trim(),
      password,
      remember: true,
    })
  );
}

export { getAdminSessionKey, getUserSessionKey };
