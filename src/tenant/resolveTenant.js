import { ACTIVE_TENANT_SESSION_KEY, DEFAULT_TENANT_ID, normalizeTenantSlug } from './tenantConstants';
import {
  buildTenantStoreUrl,
  isPlatformHostname,
  parseTenantBaseDomains,
  resolveTenantIdFromHostname,
  supportsTenantSubdomains,
} from './resolveTenantFromHost';

const TENANT_BASE_DOMAINS = parseTenantBaseDomains(import.meta.env.VITE_TENANT_BASE_DOMAINS);

export function getTenantBaseDomains() {
  return TENANT_BASE_DOMAINS;
}

export function readStoredTenantId() {
  try {
    const stored = sessionStorage.getItem(ACTIVE_TENANT_SESSION_KEY);
    if (stored) return normalizeTenantSlug(stored);
  } catch {
    // ignore
  }

  return DEFAULT_TENANT_ID;
}

export function storeTenantId(tenantId) {
  try {
    sessionStorage.setItem(ACTIVE_TENANT_SESSION_KEY, normalizeTenantSlug(tenantId));
  } catch {
    // ignore
  }
}

export function resolveTenantIdFromUrl() {
  try {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get('loja') || params.get('tenant');

    if (!fromUrl) return null;

    const normalized = normalizeTenantSlug(fromUrl);
    storeTenantId(normalized);
    return normalized;
  } catch {
    return null;
  }
}

export function resolveTenantIdFromHost() {
  try {
    const tenantId = resolveTenantIdFromHostname(window.location.hostname, TENANT_BASE_DOMAINS);
    if (!tenantId) return null;

    storeTenantId(tenantId);
    return tenantId;
  } catch {
    return null;
  }
}

export function resolveTenantIdFromPathname(pathname) {
  try {
    const match = String(pathname || '').match(/^\/loja\/([^/]+)\/?$/i);
    if (!match) return null;

    const normalized = normalizeTenantSlug(decodeURIComponent(match[1]));
    storeTenantId(normalized);
    return normalized;
  } catch {
    return null;
  }
}

export function resolveTenantId() {
  return (
    resolveTenantIdFromUrl() ||
    resolveTenantIdFromPathname(window.location.pathname) ||
    resolveTenantIdFromHost() ||
    readStoredTenantId()
  );
}

export function shouldRenderPlatformApp(pathname = window.location.pathname) {
  if (pathname.startsWith('/platform')) return true;
  return isPlatformHostname(window.location.hostname, TENANT_BASE_DOMAINS);
}

export {
  buildTenantStoreUrl,
  isPlatformHostname,
  parseTenantBaseDomains,
  resolveTenantIdFromHostname,
  supportsTenantSubdomains,
};
