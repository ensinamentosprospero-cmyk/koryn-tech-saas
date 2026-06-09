import { buildApiUrl } from '../config/api.js';
import { buildAuthHeaders } from '../utils/authTokenStorage.js';

async function parseJsonResponse(response) {
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error || 'Erro ao comunicar com a API.');
  }

  return payload;
}

export async function fetchRemoteUserData(tenantId) {
  const response = await fetch(buildApiUrl(`/tenants/${encodeURIComponent(tenantId)}/user-data`), {
    headers: {
      Accept: 'application/json',
      ...buildAuthHeaders(tenantId),
    },
  });

  const payload = await parseJsonResponse(response);
  return payload.data;
}

export async function persistRemoteUserData(tenantId, data) {
  const response = await fetch(buildApiUrl(`/tenants/${encodeURIComponent(tenantId)}/user-data`), {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...buildAuthHeaders(tenantId),
    },
    body: JSON.stringify({ data }),
  });

  const payload = await parseJsonResponse(response);
  return payload.data;
}
