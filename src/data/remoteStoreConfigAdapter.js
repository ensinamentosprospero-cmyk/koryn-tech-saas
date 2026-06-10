import { buildApiUrl } from '../config/api';
import { buildAuthHeaders } from '../utils/authTokenStorage';
import { normalizeStoreConfig } from './storeConfigSchema';

export class SiteBlockedError extends Error {
  constructor(message, code = 'SITE_SUSPENDED') {
    super(message);
    this.name = 'SiteBlockedError';
    this.code = code;
  }
}

export class SubscriptionBlockedError extends Error {
  constructor(message, subscription) {
    super(message);
    this.name = 'SubscriptionBlockedError';
    this.code = 'SUBSCRIPTION_INACTIVE';
    this.subscription = subscription;
  }
}

export async function fetchRemoteStoreConfig(tenantId) {
  const response = await fetch(buildApiUrl(`/tenants/${encodeURIComponent(tenantId)}/config`), {
    headers: { Accept: 'application/json' },
  });

  if (response.status === 403) {
    const payload = await response.json().catch(() => ({}));
    if (payload.code === 'SUBSCRIPTION_INACTIVE') {
      throw new SubscriptionBlockedError(
        payload.error || 'Assinatura inativa.',
        payload.subscription
      );
    }
    if (payload.code === 'SITE_SUSPENDED' || payload.code === 'SITE_INACCESSIBLE') {
      throw new SiteBlockedError(payload.error || 'Site suspenso.');
    }
  }

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Falha ao carregar configuração remota (${response.status}).`);
  }

  const payload = await response.json();
  return payload?.config ?? payload;
}

export async function persistRemoteStoreConfig(tenantId, config) {
  const response = await fetch(buildApiUrl(`/tenants/${encodeURIComponent(tenantId)}/config`), {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...buildAuthHeaders(tenantId),
    },
    body: JSON.stringify({ config: normalizeStoreConfig(config) }),
  });

  if (!response.ok) {
    throw new Error(`Falha ao salvar configuração remota (${response.status}).`);
  }

  const payload = await response.json();
  return payload?.config ?? normalizeStoreConfig(config);
}

export async function fetchTenantRegistry() {
  const response = await fetch(buildApiUrl('/tenants'), {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Falha ao carregar tenants (${response.status}).`);
  }

  const payload = await response.json();
  return Array.isArray(payload?.tenants) ? payload.tenants : [];
}
