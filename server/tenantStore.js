import {
  bootstrapDatabase,
  createTenant,
  getTenantRecord,
  isKnownTenant,
  isTenantSiteAccessible,
  listAllTenants,
  listTenants,
  readTenantConfig,
  updateTenant,
  writeTenantConfig,
} from './db/tenantRepository.js';
import { listSiteTemplates } from './db/templateRepository.js';

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
  getTenantRecord,
  isKnownTenant,
  isTenantSiteAccessible,
  listAllTenants,
  listSiteTemplates,
  listTenants,
  readTenantConfig,
  updateTenant,
  writeTenantConfig,
};
