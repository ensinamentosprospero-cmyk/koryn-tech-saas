import { buildApiUrl } from '../config/api.js';
import { buildAuthHeaders } from '../utils/authTokenStorage.js';

async function parseJsonResponse(response) {
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error || 'Erro ao comunicar com a API.');
  }

  return payload;
}

export async function fetchBillingPlans() {
  const response = await fetch(buildApiUrl('/billing/plans'), {
    headers: { Accept: 'application/json' },
  });

  return parseJsonResponse(response);
}

export async function fetchTenantSubscription(tenantId) {
  const response = await fetch(buildApiUrl(`/tenants/${encodeURIComponent(tenantId)}/subscription`), {
    headers: {
      Accept: 'application/json',
      ...buildAuthHeaders(tenantId),
    },
  });

  return parseJsonResponse(response);
}

export async function createTenantCheckout(tenantId, planId, urls = {}) {
  const response = await fetch(buildApiUrl('/billing/checkout'), {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...buildAuthHeaders(tenantId),
    },
    body: JSON.stringify({
      tenantId,
      planId,
      successUrl: urls.successUrl,
      cancelUrl: urls.cancelUrl,
    }),
  });

  return parseJsonResponse(response);
}
