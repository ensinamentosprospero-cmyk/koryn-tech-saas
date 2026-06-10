export const SITE_STATUSES = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
};

export const DEFAULT_TEMPLATE_ID = 'koryn-electronics-v1';

export const PUBLIC_SITE_STATUSES = [SITE_STATUSES.ACTIVE];

export function isPublicSiteStatus(status) {
  return PUBLIC_SITE_STATUSES.includes(status);
}

export function normalizeSiteStatus(status) {
  const value = String(status || '').trim().toLowerCase();
  if (Object.values(SITE_STATUSES).includes(value)) return value;
  return SITE_STATUSES.ACTIVE;
}
