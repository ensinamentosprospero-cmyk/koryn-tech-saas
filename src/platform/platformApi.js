import { buildApiUrl } from '../config/api.js';
import { buildPlatformAuthHeaders } from '../utils/authTokenStorage.js';

async function parseJsonResponse(response) {
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error || 'Erro ao comunicar com a API.');
  }

  return payload;
}

function authHeaders() {
  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...buildPlatformAuthHeaders(),
  };
}

export async function fetchAllTenants() {
  const response = await fetch(buildApiUrl('/tenants?all=1'), {
    headers: authHeaders(),
  });
  const payload = await parseJsonResponse(response);
  return payload.tenants ?? [];
}

export async function createTenant({ id, name }) {
  const response = await fetch(buildApiUrl('/tenants'), {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ id, name }),
  });

  const payload = await parseJsonResponse(response);
  return payload.tenant;
}

export async function updateTenant(tenantId, patch) {
  const response = await fetch(buildApiUrl(`/tenants/${encodeURIComponent(tenantId)}`), {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(patch),
  });

  const payload = await parseJsonResponse(response);
  return payload.tenant;
}

export async function updateTenantSubscription(tenantId, patch) {
  const response = await fetch(buildApiUrl(`/tenants/${encodeURIComponent(tenantId)}/subscription`), {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(patch),
  });

  return parseJsonResponse(response);
}

export async function createBillingCheckout(tenantId, planId = 'starter') {
  const response = await fetch(buildApiUrl('/billing/checkout'), {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ tenantId, planId }),
  });

  return parseJsonResponse(response);
}

export async function fetchBillingPlans() {
  const response = await fetch(buildApiUrl('/billing/plans'), {
    headers: { Accept: 'application/json' },
  });

  return parseJsonResponse(response);
}
