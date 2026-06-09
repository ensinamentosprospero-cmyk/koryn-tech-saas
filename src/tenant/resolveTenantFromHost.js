import {
  DEFAULT_TENANT_ID,
  normalizeTenantSlug,
  RESERVED_TENANT_SUBDOMAINS,
} from './tenantConstants.js';

export function parseTenantBaseDomains(value) {
  const raw = value || 'localhost';

  return raw
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
}

export function isReservedTenantSubdomain(subdomain) {
  const normalized = normalizeTenantSlug(subdomain);
  return RESERVED_TENANT_SUBDOMAINS.includes(normalized);
}

export function extractSubdomain(hostname, baseDomain) {
  const host = String(hostname || '')
    .trim()
    .toLowerCase()
    .replace(/\.$/, '');
  const base = String(baseDomain || '')
    .trim()
    .toLowerCase();

  if (!host || !base || host === base) return null;

  const suffix = `.${base}`;
  if (!host.endsWith(suffix)) return null;

  const subdomain = host.slice(0, -suffix.length);
  if (!subdomain || subdomain.includes('.')) return null;

  return subdomain;
}

export function resolveTenantIdFromHostname(hostname, baseDomains = ['localhost']) {
  const host = String(hostname || '')
    .trim()
    .toLowerCase()
    .replace(/\.$/, '');

  if (!host || host === 'localhost' || /^\d{1,3}(?:\.\d{1,3}){3}$/.test(host)) {
    return null;
  }

  for (const baseDomain of baseDomains) {
    const subdomain = extractSubdomain(host, baseDomain);
    if (!subdomain) continue;
    if (isReservedTenantSubdomain(subdomain)) return null;

    const tenantId = normalizeTenantSlug(subdomain);
    return tenantId === DEFAULT_TENANT_ID ? null : tenantId;
  }

  return null;
}

export function isPlatformHostname(hostname, baseDomains = ['localhost']) {
  const host = String(hostname || '')
    .trim()
    .toLowerCase()
    .replace(/\.$/, '');

  for (const baseDomain of baseDomains) {
    if (host === `platform.${baseDomain}`) return true;
  }

  return false;
}

export function buildTenantStoreUrl(tenantId, { protocol, hostname, port, baseDomains } = {}) {
  const resolvedProtocol = protocol || 'http:';
  const resolvedPort = port ? `:${port}` : '';
  const domains = baseDomains?.length ? baseDomains : ['localhost'];
  const baseDomain = domains[0];

  if (!tenantId || tenantId === DEFAULT_TENANT_ID) {
    return `${resolvedProtocol}//${baseDomain}${resolvedPort}/`;
  }

  return `${resolvedProtocol}//${tenantId}.${baseDomain}${resolvedPort}/`;
}
