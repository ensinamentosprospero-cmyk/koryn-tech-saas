import { SUBSCRIPTION_STATUSES } from './billingConstants.js';
import { activateSubscription } from '../db/subscriptionRepository.js';

const STRIPE_API = 'https://api.stripe.com/v1';

async function stripeRequest(secretKey, path, body) {
  const response = await fetch(`${STRIPE_API}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(body).toString(),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error?.message || 'Erro ao comunicar com Stripe.');
  }

  return payload;
}

export async function createCheckoutSession({ tenantId, planId, plan, successUrl, cancelUrl }) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return {
      error: 'Stripe não configurado. Defina STRIPE_SECRET_KEY ou use BILLING_PROVIDER=manual.',
    };
  }

  const priceId = plan?.stripe_price_id;
  if (!priceId) {
    return { error: 'Plano sem stripe_price_id configurado.' };
  }

  const session = await stripeRequest(secretKey, '/checkout/sessions', {
    mode: 'subscription',
    success_url: successUrl || `${process.env.APP_BASE_URL || 'http://localhost:5173'}/?billing=success`,
    cancel_url: cancelUrl || `${process.env.APP_BASE_URL || 'http://localhost:5173'}/?billing=cancel`,
    'line_items[0][price]': priceId,
    'line_items[0][quantity]': '1',
    'metadata[tenant_id]': tenantId,
    'metadata[plan_id]': planId,
  });

  return {
    provider: 'stripe',
    completed: false,
    checkoutUrl: session.url,
    sessionId: session.id,
  };
}

export async function handleWebhook(requestBody, signatureHeader) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return { error: 'STRIPE_WEBHOOK_SECRET não configurado.' };
  }

  if (!signatureHeader) {
    return { error: 'Assinatura Stripe ausente.' };
  }

  let event;
  try {
    event = JSON.parse(requestBody);
  } catch {
    return { error: 'Payload webhook inválido.' };
  }

  if (event.type === 'checkout.session.completed') {
    const tenantId = event.data?.object?.metadata?.tenant_id;
    const planId = event.data?.object?.metadata?.plan_id;

    if (tenantId && planId) {
      await activateSubscription(tenantId, {
        planId,
        status: SUBSCRIPTION_STATUSES.ACTIVE,
        provider: 'stripe',
        providerSubscriptionId: event.data?.object?.subscription || null,
      });
    }
  }

  return { ok: true };
}
