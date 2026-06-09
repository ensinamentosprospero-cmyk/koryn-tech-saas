import { fetchRemoteUserData, persistRemoteUserData } from '../api/userDataApi.js';
import { readAuthToken } from '../utils/authTokenStorage.js';
import {
  loadUserData as loadLocalUserData,
  normalizeUserData,
  saveUserData as saveLocalUserData,
} from '../utils/userDataStorage.js';

export { normalizeUserData, normalizeUserEmail } from '../utils/userDataStorage.js';

/** Carregamento imediato do cache local (sem API). */
export function loadUserDataSync(email, tenantId) {
  return loadLocalUserData(email, tenantId);
}

/**
 * Carrega dados do usuário.
 * Ordem: API remota (se autenticado) → cache local.
 */
export async function loadUserData(email, tenantId) {
  const localData = loadLocalUserData(email, tenantId);

  if (!email || !readAuthToken(tenantId)) {
    return localData;
  }

  try {
    const remoteData = await fetchRemoteUserData(tenantId);
    const normalized = normalizeUserData(remoteData);

    const hasRemoteContent =
      normalized.cart.length > 0 ||
      normalized.favorites.length > 0 ||
      normalized.orders.length > 0;

    const hasLocalContent =
      localData.cart.length > 0 ||
      localData.favorites.length > 0 ||
      localData.orders.length > 0;

    if (hasRemoteContent || !hasLocalContent) {
      saveLocalUserData(email, normalized, tenantId);
      return normalized;
    }

    await persistRemoteUserData(tenantId, localData);
    return localData;
  } catch (error) {
    console.warn('Usando cache local de carrinho/favoritos/pedidos:', error.message);
    return localData;
  }
}

/**
 * Salva dados do usuário.
 * Sempre grava cache local e tenta sincronizar com a API.
 */
export async function saveUserData(email, data, tenantId) {
  const normalized = normalizeUserData(data);
  saveLocalUserData(email, normalized, tenantId);

  if (!email || !readAuthToken(tenantId)) {
    return { ok: true, source: 'local' };
  }

  try {
    const synced = await persistRemoteUserData(tenantId, normalized);
    saveLocalUserData(email, synced, tenantId);
    return { ok: true, source: 'remote' };
  } catch (error) {
    console.warn('Dados salvos apenas localmente:', error.message);
    return { ok: true, source: 'local' };
  }
}

/** Compatibilidade com fluxos síncronos (cache local). */
export function saveUserDataSync(email, data, tenantId) {
  saveLocalUserData(email, data, tenantId);
}
