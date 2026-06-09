import { SUBSCRIPTION_STATUSES } from './billingConstants.js';
import { activateSubscription } from '../db/subscriptionRepository.js';

export async function createCheckoutSession({ tenantId, planId }) {
  const result = await activateSubscription(tenantId, {
    planId,
    status: SUBSCRIPTION_STATUSES.ACTIVE,
    provider: 'manual',
  });

  if (result.error) return result;

  return {
    provider: 'manual',
    completed: true,
    subscription: result.subscription,
    message: 'Assinatura ativada (modo manual de desenvolvimento).',
  };
}

export async function handleWebhook() {
  return { error: 'Webhook manual não suportado.' };
}
