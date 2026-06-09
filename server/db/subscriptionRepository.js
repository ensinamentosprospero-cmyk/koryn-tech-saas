import { getDatabase } from './database.js';
import {
  ACTIVE_SUBSCRIPTION_STATUSES,
  DEFAULT_TRIAL_DAYS,
  SUBSCRIPTION_EXEMPT_TENANT_IDS,
  SUBSCRIPTION_STATUSES,
} from '../billing/billingConstants.js';

const DEFAULT_PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price_cents: 4990,
    currency: 'BRL',
    interval: 'month',
    stripe_price_id: process.env.STRIPE_PRICE_STARTER || null,
  },
  {
    id: 'pro',
    name: 'Pro',
    price_cents: 9990,
    currency: 'BRL',
    interval: 'month',
    stripe_price_id: process.env.STRIPE_PRICE_PRO || null,
  },
];

function mapPlanRow(row) {
  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    priceCents: row.price_cents,
    currency: row.currency,
    interval: row.interval,
    stripePriceId: row.stripe_price_id,
    active: row.active === 1,
  };
}

function mapSubscriptionRow(row, planRow) {
  if (!row) return null;

  return {
    tenantId: row.tenant_id,
    planId: row.plan_id,
    planName: planRow?.name || row.plan_id,
    status: row.status,
    provider: row.provider,
    providerSubscriptionId: row.provider_subscription_id,
    currentPeriodEnd: row.current_period_end,
    trialEndsAt: row.trial_ends_at,
    updatedAt: row.updated_at,
  };
}

function addDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

function addMonths(months) {
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  return date.toISOString();
}

function isPeriodValid(isoDate) {
  if (!isoDate) return true;
  return new Date(isoDate).getTime() > Date.now();
}

export function seedSubscriptionPlans(db = getDatabase()) {
  for (const plan of DEFAULT_PLANS) {
    db.prepare(
      `INSERT INTO subscription_plans (id, name, price_cents, currency, interval, stripe_price_id, active)
       VALUES (?, ?, ?, ?, ?, ?, 1)
       ON CONFLICT(id) DO UPDATE SET
         name = excluded.name,
         price_cents = excluded.price_cents,
         currency = excluded.currency,
         interval = excluded.interval,
         stripe_price_id = COALESCE(excluded.stripe_price_id, subscription_plans.stripe_price_id),
         active = 1`
    ).run(plan.id, plan.name, plan.price_cents, plan.currency, plan.interval, plan.stripe_price_id);
  }
}

export function listSubscriptionPlans(db = getDatabase()) {
  return db
    .prepare(
      `SELECT id, name, price_cents, currency, interval, stripe_price_id, active
       FROM subscription_plans
       WHERE active = 1
       ORDER BY price_cents ASC`
    )
    .all()
    .map(mapPlanRow);
}

export function getSubscriptionPlan(planId, db = getDatabase()) {
  const row = db
    .prepare(
      `SELECT id, name, price_cents, currency, interval, stripe_price_id, active
       FROM subscription_plans
       WHERE id = ? AND active = 1`
    )
    .get(planId);

  return mapPlanRow(row);
}

export function getTenantSubscription(tenantId, db = getDatabase()) {
  const row = db
    .prepare(
      `SELECT tenant_id, plan_id, status, provider, provider_subscription_id,
              current_period_end, trial_ends_at, updated_at
       FROM tenant_subscriptions
       WHERE tenant_id = ?`
    )
    .get(tenantId);

  if (!row) return null;

  const planRow = db.prepare('SELECT id, name FROM subscription_plans WHERE id = ?').get(row.plan_id);
  return mapSubscriptionRow(row, planRow);
}

export function isTenantSubscriptionActive(tenantId, db = getDatabase()) {
  if (SUBSCRIPTION_EXEMPT_TENANT_IDS.includes(tenantId)) return true;

  const tenant = db.prepare('SELECT active FROM tenants WHERE id = ?').get(tenantId);
  if (!tenant || tenant.active !== 1) return false;

  const subscription = getTenantSubscription(tenantId, db);
  if (!subscription) return false;

  if (!ACTIVE_SUBSCRIPTION_STATUSES.includes(subscription.status)) {
    return false;
  }

  if (subscription.status === SUBSCRIPTION_STATUSES.TRIALING) {
    return isPeriodValid(subscription.trialEndsAt);
  }

  return isPeriodValid(subscription.currentPeriodEnd);
}

export function ensureTenantSubscription(tenantId, db = getDatabase()) {
  if (SUBSCRIPTION_EXEMPT_TENANT_IDS.includes(tenantId)) return null;

  const existing = getTenantSubscription(tenantId, db);
  if (existing) return existing;

  return createTrialSubscription(tenantId, 'starter', db);
}

export function createTrialSubscription(tenantId, planId = 'starter', db = getDatabase()) {
  const plan = getSubscriptionPlan(planId, db);
  if (!plan) return { error: 'Plano não encontrado.' };

  db.prepare(
    `INSERT INTO tenant_subscriptions (
       tenant_id, plan_id, status, provider, trial_ends_at, updated_at
     ) VALUES (?, ?, ?, 'manual', ?, datetime('now'))`
  ).run(tenantId, planId, SUBSCRIPTION_STATUSES.TRIALING, addDays(DEFAULT_TRIAL_DAYS));

  return { subscription: getTenantSubscription(tenantId, db) };
}

export function activateSubscription(tenantId, patch, db = getDatabase()) {
  const planId = patch.planId || 'starter';
  const plan = getSubscriptionPlan(planId, db);
  if (!plan) return { error: 'Plano não encontrado.' };

  const status = patch.status || SUBSCRIPTION_STATUSES.ACTIVE;
  const provider = patch.provider || 'manual';
  const currentPeriodEnd = patch.currentPeriodEnd || addMonths(1);

  db.prepare(
    `INSERT INTO tenant_subscriptions (
       tenant_id, plan_id, status, provider, provider_subscription_id,
       current_period_end, trial_ends_at, updated_at
     ) VALUES (?, ?, ?, ?, ?, ?, NULL, datetime('now'))
     ON CONFLICT(tenant_id) DO UPDATE SET
       plan_id = excluded.plan_id,
       status = excluded.status,
       provider = excluded.provider,
       provider_subscription_id = excluded.provider_subscription_id,
       current_period_end = excluded.current_period_end,
       trial_ends_at = NULL,
       updated_at = datetime('now')`
  ).run(
    tenantId,
    planId,
    status,
    provider,
    patch.providerSubscriptionId || null,
    currentPeriodEnd
  );

  return { subscription: getTenantSubscription(tenantId, db) };
}

export function updateTenantSubscription(tenantId, patch, db = getDatabase()) {
  const existing = getTenantSubscription(tenantId, db);
  if (!existing) {
    return createTrialSubscription(tenantId, patch.planId || 'starter', db);
  }

  const planId = patch.planId || existing.planId;
  const plan = getSubscriptionPlan(planId, db);
  if (!plan) return { error: 'Plano não encontrado.' };

  const status = patch.status || existing.status;
  let trialEndsAt = existing.trialEndsAt;
  let currentPeriodEnd = existing.currentPeriodEnd;

  if (status === SUBSCRIPTION_STATUSES.TRIALING) {
    trialEndsAt = patch.trialEndsAt || addDays(DEFAULT_TRIAL_DAYS);
    currentPeriodEnd = null;
  } else if (status === SUBSCRIPTION_STATUSES.ACTIVE) {
    trialEndsAt = null;
    currentPeriodEnd = patch.currentPeriodEnd || addMonths(1);
  } else {
    trialEndsAt = null;
  }

  db.prepare(
    `UPDATE tenant_subscriptions
     SET plan_id = ?, status = ?, provider = ?, current_period_end = ?,
         trial_ends_at = ?, updated_at = datetime('now')
     WHERE tenant_id = ?`
  ).run(planId, status, patch.provider || existing.provider, currentPeriodEnd, trialEndsAt, tenantId);

  return { subscription: getTenantSubscription(tenantId, db) };
}

export function seedSubscriptionsForExistingTenants(db = getDatabase()) {
  const tenants = db.prepare('SELECT id FROM tenants').all();

  for (const tenant of tenants) {
    if (SUBSCRIPTION_EXEMPT_TENANT_IDS.includes(tenant.id)) continue;
    ensureTenantSubscription(tenant.id, db);
  }
}

export function listTenantsWithSubscriptions(db = getDatabase()) {
  const tenants = db
    .prepare('SELECT id, name, active FROM tenants ORDER BY id ASC')
    .all();

  return tenants.map((tenant) => ({
    id: tenant.id,
    name: tenant.name,
    active: tenant.active === 1,
    subscription: getTenantSubscription(tenant.id, db),
    subscriptionActive: isTenantSubscriptionActive(tenant.id, db),
  }));
}
