import { DEFAULT_TENANT_ID } from './storeConfigKeys';
import { normalizeStoreConfig } from './storeConfigSchema';
import {
  clearLocalStoreConfig,
  loadLocalStoreConfig,
  saveLocalStoreConfig,
} from './localStoreConfigAdapter';
import {
  fetchRemoteStoreConfig,
  persistRemoteStoreConfig,
  SubscriptionBlockedError,
} from './remoteStoreConfigAdapter';

export { DEFAULT_TENANT_ID, LEGACY_STORE_CONFIG_KEY, getStoreConfigStorageKey } from './storeConfigKeys';

/** Carregamento imediato do cache local (sem API). */
export function loadStoreConfigSync(tenantId = DEFAULT_TENANT_ID) {
  return loadLocalStoreConfig(tenantId);
}

/**
 * Carrega configuração da loja.
 * Ordem: API remota → cache local → defaults.
 */
export async function loadStoreConfig(tenantId = DEFAULT_TENANT_ID) {
  try {
    const remoteConfig = await fetchRemoteStoreConfig(tenantId);
    if (remoteConfig) {
      const normalized = normalizeStoreConfig(remoteConfig);
      saveLocalStoreConfig(normalized, tenantId);
      return normalized;
    }
  } catch (error) {
    if (error instanceof SubscriptionBlockedError) {
      throw error;
    }
    console.warn('Usando cache local da loja:', error.message);
  }

  return loadLocalStoreConfig(tenantId);
}

/**
 * Salva configuração da loja.
 * Sempre grava cache local e tenta sincronizar com a API.
 */
export async function saveStoreConfig(config, tenantId = DEFAULT_TENANT_ID) {
  const normalized = normalizeStoreConfig(config);
  const savedLocally = saveLocalStoreConfig(normalized, tenantId);

  try {
    const synced = await persistRemoteStoreConfig(tenantId, normalized);
    saveLocalStoreConfig(synced, tenantId);
    return { ok: true, source: 'remote', cached: true };
  } catch (error) {
    console.warn('Configuração salva apenas localmente:', error.message);
    return { ok: savedLocally, source: 'local', cached: savedLocally };
  }
}

/** Compatibilidade com fluxos síncronos antigos (cache local). */
export function saveStoreConfigSync(config, tenantId = DEFAULT_TENANT_ID) {
  return saveLocalStoreConfig(config, tenantId);
}

export function clearStoreConfig(tenantId = DEFAULT_TENANT_ID) {
  clearLocalStoreConfig(tenantId);
}
