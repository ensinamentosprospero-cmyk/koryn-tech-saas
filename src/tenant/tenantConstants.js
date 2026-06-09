export const DEFAULT_TENANT_ID = 'default';
export const ACTIVE_TENANT_SESSION_KEY = 'koryn-tech-active-tenant';

export const RESERVED_TENANT_SUBDOMAINS = ['www', 'platform', 'api', 'admin', 'app'];

export function normalizeTenantSlug(value) {
  const slug = String(value || '')
    .trim()
    .toLowerCase();

  if (!slug) return DEFAULT_TENANT_ID;

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return DEFAULT_TENANT_ID;
  }

  return slug;
}
