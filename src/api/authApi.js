import { buildApiUrl } from '../config/api.js';

async function parseJsonResponse(response) {
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error || 'Erro ao comunicar com a API.');
  }

  return payload;
}

export async function loginWithApi({ email, password, tenantId, scope }) {
  const response = await fetch(buildApiUrl('/auth/login'), {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, tenantId, scope }),
  });

  return parseJsonResponse(response);
}

export async function registerWithApi({ email, password, tenantId }) {
  const response = await fetch(buildApiUrl('/auth/register'), {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, tenantId }),
  });

  return parseJsonResponse(response);
}

export async function fetchAuthMe(token) {
  const response = await fetch(buildApiUrl('/auth/me'), {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  return parseJsonResponse(response);
}

export function mapApiRoleToClientRole(role) {
  if (role === 'tenant_owner') return 'admin';
  if (role === 'visitor') return 'user';
  return null;
}
