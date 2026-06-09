export const DEFAULT_TENANT_ID = 'default';
export const LEGACY_STORE_CONFIG_KEY = 'koryn-tech-site-config';

export function getStoreConfigStorageKey(tenantId = DEFAULT_TENANT_ID) {
  if (tenantId === DEFAULT_TENANT_ID) {
    return LEGACY_STORE_CONFIG_KEY;
  }

  return `koryn-tech-site-config-${tenantId}`;
}
