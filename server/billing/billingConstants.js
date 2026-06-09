export const BILLING_PROVIDER = process.env.BILLING_PROVIDER || 'manual';

export const SUBSCRIPTION_EXEMPT_TENANT_IDS = ['default'];

export const SUBSCRIPTION_STATUSES = {
  TRIALING: 'trialing',
  ACTIVE: 'active',
  PAST_DUE: 'past_due',
  CANCELED: 'canceled',
  UNPAID: 'unpaid',
};

export const ACTIVE_SUBSCRIPTION_STATUSES = [
  SUBSCRIPTION_STATUSES.TRIALING,
  SUBSCRIPTION_STATUSES.ACTIVE,
];

export const DEFAULT_TRIAL_DAYS = 14;
