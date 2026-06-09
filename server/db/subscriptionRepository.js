import { execute, fromActiveValue, fromPlanActiveValue, queryAll, queryOne, sqlNow, toActiveValue } from './dbClient.js';
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
    active: fromPlanActiveValue(row.active),
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

export async function seedSubscriptionPlans() {
  for (const plan of DEFAULT_PLANS) {
    await execute(
      `INSERT INTO subscription_plans (id, name, price_cents, currency, interval, stripe_price_id, active)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         name = excluded.name,
         price_cents = excluded.price_cents,
         currency = excluded.currency,
         interval = excluded.interval,
         stripe_price_id = COALESCE(excluded.stripe_price_id, subscription_plans.stripe_price_id),
         active = ?`,
      [
        plan.id,
        plan.name,
        plan.price_cents,
        plan.currency,
        plan.interval,
        plan.stripe_price_id,
        toActiveValue(true),
        toActiveValue(true),
      ]
    );
  }
}

export async function listSubscriptionPlans() {
  const rows = await queryAll(
    `SELECT id, name, price_cents, currency, interval, stripe_price_id, active
     FROM subscription_plans
     WHERE active = ?
     ORDER BY price_cents ASC`,
    [toActiveValue(true)]
  );

  return rows.map(mapPlanRow);
}

export async function getSubscriptionPlan(planId) {
  const row = await queryOne(
    `SELECT id, name, price_cents, currency, interval, stripe_price_id, active
     FROM subscription_plans
     WHERE id = ? AND active = ?`,
    [planId, toActiveValue(true)]
  );

  return mapPlanRow(row);
}

export async function getTenantSubscription(tenantId) {
  const row = await queryOne(
    `SELECT tenant_id, plan_id, status, provider, provider_subscription_id,
            current_period_end, trial_ends_at, updated_at
     FROM tenant_subscriptions
     WHERE tenant_id = ?`,
    [tenantId]
  );

  if (!row) return null;

  const planRow = await queryOne('SELECT id, name FROM subscription_plans WHERE id = ?', [
    row.plan_id,
  ]);

  return mapSubscriptionRow(row, planRow);
}

export async function isTenantSubscriptionActive(tenantId) {
  if (SUBSCRIPTION_EXEMPT_TENANT_IDS.includes(tenantId)) return true;

  const tenant = await queryOne('SELECT active FROM tenants WHERE id = ?', [tenantId]);
  if (!tenant || !fromActiveValue(tenant.active)) return false;

  const subscription = await getTenantSubscription(tenantId);
  if (!subscription) return false;

  if (!ACTIVE_SUBSCRIPTION_STATUSES.includes(subscription.status)) {
    return false;
  }

  if (subscription.status === SUBSCRIPTION_STATUSES.TRIALING) {
    return isPeriodValid(subscription.trialEndsAt);
  }

  return isPeriodValid(subscription.currentPeriodEnd);
}

export async function ensureTenantSubscription(tenantId) {
  if (SUBSCRIPTION_EXEMPT_TENANT_IDS.includes(tenantId)) return null;

  const existing = await getTenantSubscription(tenantId);
  if (existing) return existing;

  return createTrialSubscription(tenantId, 'starter');
}

export async function createTrialSubscription(tenantId, planId = 'starter') {
  const plan = await getSubscriptionPlan(planId);
  if (!plan) return { error: 'Plano não encontrado.' };

  await execute(
    `INSERT INTO tenant_subscriptions (
       tenant_id, plan_id, status, provider, trial_ends_at, updated_at
     ) VALUES (?, ?, ?, 'manual', ?, ${sqlNow()})`,
    [tenantId, planId, SUBSCRIPTION_STATUSES.TRIALING, addDays(DEFAULT_TRIAL_DAYS)]
  );

  return { subscription: await getTenantSubscription(tenantId) };
}

export async function activateSubscription(tenantId, patch) {
  const planId = patch.planId || 'starter';
  const plan = await getSubscriptionPlan(planId);
  if (!plan) return { error: 'Plano não encontrado.' };

  const status = patch.status || SUBSCRIPTION_STATUSES.ACTIVE;
  const provider = patch.provider || 'manual';
  const currentPeriodEnd = patch.currentPeriodEnd || addMonths(1);

  await execute(
    `INSERT INTO tenant_subscriptions (
       tenant_id, plan_id, status, provider, provider_subscription_id,
       current_period_end, trial_ends_at, updated_at
     ) VALUES (?, ?, ?, ?, ?, ?, NULL, ${sqlNow()})
     ON CONFLICT(tenant_id) DO UPDATE SET
       plan_id = excluded.plan_id,
       status = excluded.status,
       provider = excluded.provider,
       provider_subscription_id = excluded.provider_subscription_id,
       current_period_end = excluded.current_period_end,
       trial_ends_at = NULL,
       updated_at = ${sqlNow()}`,
    [
      tenantId,
      planId,
      status,
      provider,
      patch.providerSubscriptionId || null,
      currentPeriodEnd,
    ]
  );

  return { subscription: await getTenantSubscription(tenantId) };
}

export async function updateTenantSubscription(tenantId, patch) {
  const existing = await getTenantSubscription(tenantId);
  if (!existing) {
    return createTrialSubscription(tenantId, patch.planId || 'starter');
  }

  const planId = patch.planId || existing.planId;
  const plan = await getSubscriptionPlan(planId);
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

  await execute(
    `UPDATE tenant_subscriptions
     SET plan_id = ?, status = ?, provider = ?, current_period_end = ?,
         trial_ends_at = ?, updated_at = ${sqlNow()}
     WHERE tenant_id = ?`,
    [planId, status, patch.provider || existing.provider, currentPeriodEnd, trialEndsAt, tenantId]
  );

  return { subscription: await getTenantSubscription(tenantId) };
}

export async function seedSubscriptionsForExistingTenants() {
  const tenants = await queryAll('SELECT id FROM tenants');

  for (const tenant of tenants) {
    if (SUBSCRIPTION_EXEMPT_TENANT_IDS.includes(tenant.id)) continue;
    await ensureTenantSubscription(tenant.id);
  }
}

export async function listTenantsWithSubscriptions() {
  const rows = await queryAll(
    `SELECT t.id, t.name, t.active, t.created_at, t.updated_at, u.email AS owner_email
     FROM tenants t
     LEFT JOIN users u ON u.tenant_id = t.id AND u.role = 'tenant_owner'
     ORDER BY t.created_at DESC, t.id ASC`
  );

  const results = [];
  for (const tenant of rows) {
    results.push({
      id: tenant.id,
      name: tenant.name,
      active: fromActiveValue(tenant.active),
      ownerEmail: tenant.owner_email || null,
      createdAt: tenant.created_at || null,
      updatedAt: tenant.updated_at || null,
      subscription: await getTenantSubscription(tenant.id),
      subscriptionActive: await isTenantSubscriptionActive(tenant.id),
    });
  }

  return results;
}
