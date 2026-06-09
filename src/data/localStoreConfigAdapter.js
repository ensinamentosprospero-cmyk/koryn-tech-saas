import {
  createDefaultStoreConfig,
  mergeStoredStoreConfig,
  normalizeStoreConfig,
} from './storeConfigSchema';
import { DEFAULT_TENANT_ID, getStoreConfigStorageKey } from './storeConfigKeys';

const MAX_STORAGE_BYTES = 512_000;

function readRawStoreConfig(tenantId = DEFAULT_TENANT_ID) {
  try {
    return localStorage.getItem(getStoreConfigStorageKey(tenantId));
  } catch {
    return null;
  }
}

function writeRawStoreConfig(raw, tenantId = DEFAULT_TENANT_ID) {
  try {
    localStorage.setItem(getStoreConfigStorageKey(tenantId), raw);
    return true;
  } catch {
    return false;
  }
}

export function clearLocalStoreConfig(tenantId = DEFAULT_TENANT_ID) {
  try {
    localStorage.removeItem(getStoreConfigStorageKey(tenantId));
  } catch {
    // ignore
  }
}

export function loadLocalStoreConfig(tenantId = DEFAULT_TENANT_ID) {
  try {
    const raw = readRawStoreConfig(tenantId);
    if (!raw) return createDefaultStoreConfig();

    if (raw.length > MAX_STORAGE_BYTES) {
      console.warn('Configurações locais corrompidas ou muito grandes. Restaurando padrão.');
      clearLocalStoreConfig(tenantId);
      return createDefaultStoreConfig();
    }

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      clearLocalStoreConfig(tenantId);
      return createDefaultStoreConfig();
    }

    return mergeStoredStoreConfig(parsed);
  } catch {
    clearLocalStoreConfig(tenantId);
    return createDefaultStoreConfig();
  }
}

export function saveLocalStoreConfig(config, tenantId = DEFAULT_TENANT_ID) {
  const normalized = normalizeStoreConfig(config);

  try {
    const serialized = JSON.stringify(normalized);
    if (writeRawStoreConfig(serialized, tenantId)) {
      return true;
    }
  } catch (error) {
    console.warn('Não foi possível salvar as configurações localmente:', error);
  }

  try {
    const lighter = {
      ...normalized,
      analytics: createDefaultStoreConfig().analytics,
    };
    return writeRawStoreConfig(JSON.stringify(lighter), tenantId);
  } catch {
    return false;
  }
}
