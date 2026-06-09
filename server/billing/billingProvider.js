import { BILLING_PROVIDER } from './billingConstants.js';
import * as manualProvider from './manualProvider.js';
import * as stripeProvider from './stripeProvider.js';

function getProviderModule() {
  if (BILLING_PROVIDER === 'stripe') return stripeProvider;
  return manualProvider;
}

export function getBillingProviderName() {
  return BILLING_PROVIDER === 'stripe' ? 'stripe' : 'manual';
}

export async function createCheckoutSession(options) {
  return getProviderModule().createCheckoutSession(options);
}

export async function handleBillingWebhook(requestBody, signatureHeader) {
  if (BILLING_PROVIDER !== 'stripe') {
    return { error: 'Webhook disponível apenas com BILLING_PROVIDER=stripe.' };
  }

  return stripeProvider.handleWebhook(requestBody, signatureHeader);
}
