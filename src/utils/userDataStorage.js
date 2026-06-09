import { DEFAULT_TENANT_ID } from '../data/storeConfigKeys';
import { getUserDataStorageKey } from '../utils/tenantStorageKeys';

export function normalizeUserEmail(email) {
  return String(email || '')
    .trim()
    .toLowerCase();
}

function defaultUserData() {
  return {
    cart: [],
    favorites: [],
    orders: [],
  };
}

function normalizeCartItem(item) {
  if (!item?.productId) return null;

  return {
    productId: Number(item.productId),
    quantity: Math.max(1, Number(item.quantity) || 1),
    addedAt: item.addedAt || new Date().toISOString(),
  };
}

function normalizeOrder(order) {
  if (!order?.id || !Array.isArray(order.items) || order.items.length === 0) return null;

  return {
    id: String(order.id),
    createdAt: order.createdAt || new Date().toISOString(),
    status: order.status || 'enviado',
    channel: order.channel || 'whatsapp',
    total: Number(order.total) || 0,
    items: order.items
      .map((item) => ({
        productId: Number(item.productId),
        name: String(item.name || ''),
        price: String(item.price || ''),
        quantity: Math.max(1, Number(item.quantity) || 1),
      }))
      .filter((item) => item.productId && item.name),
  };
}

export function normalizeUserData(raw) {
  const defaults = defaultUserData();
  if (!raw || typeof raw !== 'object') return defaults;

  const cart = Array.isArray(raw.cart)
    ? raw.cart.map(normalizeCartItem).filter(Boolean)
    : defaults.cart;

  const favorites = Array.isArray(raw.favorites)
    ? [...new Set(raw.favorites.map((id) => Number(id)).filter(Boolean))]
    : defaults.favorites;

  const orders = Array.isArray(raw.orders)
    ? raw.orders.map(normalizeOrder).filter(Boolean)
    : defaults.orders;

  return { cart, favorites, orders };
}

export function loadUserData(email, tenantId = DEFAULT_TENANT_ID) {
  const normalizedEmail = normalizeUserEmail(email);
  if (!normalizedEmail) return defaultUserData();

  try {
    const raw = localStorage.getItem(getUserDataStorageKey(tenantId, normalizedEmail));
    if (!raw) return defaultUserData();
    return normalizeUserData(JSON.parse(raw));
  } catch {
    return defaultUserData();
  }
}

export function saveUserData(email, data, tenantId = DEFAULT_TENANT_ID) {
  const normalizedEmail = normalizeUserEmail(email);
  if (!normalizedEmail) return;

  try {
    localStorage.setItem(
      getUserDataStorageKey(tenantId, normalizedEmail),
      JSON.stringify(normalizeUserData(data))
    );
  } catch {
    // ignore
  }
}
