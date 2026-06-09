import { DEFAULT_TENANT_ID } from '../data/storeConfigKeys';
import { getThemeStorageKey } from './tenantStorageKeys';
import { normalizeUserEmail } from './userDataStorage';

export function getStoredTheme(email, tenantId = DEFAULT_TENANT_ID) {
  if (!email) return 'light';

  try {
    return localStorage.getItem(getThemeStorageKey(tenantId, email)) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function applyTheme(theme) {
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.dataset.theme = theme;
  root.style.colorScheme = theme === 'dark' ? 'dark' : 'light';
}

export function setStoredTheme(email, theme, tenantId = DEFAULT_TENANT_ID) {
  if (!email) return;

  try {
    localStorage.setItem(getThemeStorageKey(tenantId, email), theme);
  } catch {
    // ignore
  }
}

export function toggleStoredTheme(email, tenantId = DEFAULT_TENANT_ID) {
  if (!email) return 'light';

  const nextTheme = getStoredTheme(email, tenantId) === 'dark' ? 'light' : 'dark';
  setStoredTheme(email, nextTheme, tenantId);
  applyTheme(nextTheme);
  return nextTheme;
}
