import {
  bootstrapDatabase,
  createTenant,
  isKnownTenant,
  listAllTenants,
  listTenants,
  readTenantConfig,
  updateTenant,
  writeTenantConfig,
} from './db/tenantRepository.js';

export {
  getSubscriptionPlan,
  getTenantSubscription,
  isTenantSubscriptionActive,
  listSubscriptionPlans,
  listTenantsWithSubscriptions,
  updateTenantSubscription,
} from './db/subscriptionRepository.js';

export async function bootstrapTenantStore() {
  return bootstrapDatabase();
}

export {
  createTenant,
  listAllTenants,
  listTenants,
  readTenantConfig,
  updateTenant,
  writeTenantConfig,
  isKnownTenant,
};
