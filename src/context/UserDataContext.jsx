import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { useTenant } from './TenantContext';
import { useSiteConfig } from './SiteConfigContext';
import {
  loadUserData,
  loadUserDataSync,
  saveUserData,
  saveUserDataSync,
} from '../data/userDataRepository';
import { formatPrice, parsePrice } from '../utils/payment';
import { cartMessage } from '../utils/whatsapp';

const UserDataContext = createContext(null);

function resolveCartItems(cart, products) {
  return cart
    .map((item) => {
      const product = products.find((entry) => entry.id === item.productId && entry.active !== false);
      if (!product) return null;

      return {
        ...item,
        product,
        name: product.name,
        price: product.price,
        photo: product.photo,
        photoAlt: product.photoAlt,
        lineTotal: parsePrice(product.price) * item.quantity,
      };
    })
    .filter(Boolean);
}

export function UserDataProvider({ children }) {
  const { tenantId } = useTenant();
  const { currentUserEmail, isUserAuthenticated, requestUserAccess } = useAuth();
  const { products, whatsAppLink, trackEvent } = useSiteConfig();
  const [data, setData] = useState(() => loadUserDataSync(currentUserEmail, tenantId));
  const [userDataReady, setUserDataReady] = useState(false);

  useEffect(() => {
    if (!currentUserEmail) {
      setData(loadUserDataSync(currentUserEmail, tenantId));
      setUserDataReady(true);
      return undefined;
    }

    setData(loadUserDataSync(currentUserEmail, tenantId));
    setUserDataReady(false);

    let cancelled = false;

    loadUserData(currentUserEmail, tenantId).then((loadedData) => {
      if (cancelled) return;
      setData(loadedData);
      setUserDataReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, [currentUserEmail, tenantId]);

  const persist = useCallback(
    (updater) => {
      setData((previous) => {
        const next = typeof updater === 'function' ? updater(previous) : updater;
        if (currentUserEmail) {
          saveUserDataSync(currentUserEmail, next, tenantId);
          saveUserData(currentUserEmail, next, tenantId).catch((error) => {
            console.warn('Falha ao sincronizar dados do usuário:', error.message);
          });
        }
        return next;
      });
    },
    [currentUserEmail, tenantId]
  );

  const addToCart = useCallback(
    (productId, quantity = 1) => {
      const safeQuantity = Math.max(1, Number(quantity) || 1);

      persist((previous) => {
        const existing = previous.cart.find((item) => item.productId === productId);

        if (existing) {
          return {
            ...previous,
            cart: previous.cart.map((item) =>
              item.productId === productId
                ? { ...item, quantity: item.quantity + safeQuantity }
                : item
            ),
          };
        }

        return {
          ...previous,
          cart: [
            ...previous.cart,
            {
              productId,
              quantity: safeQuantity,
              addedAt: new Date().toISOString(),
            },
          ],
        };
      });
    },
    [persist]
  );

  const updateCartQuantity = useCallback(
    (productId, quantity) => {
      const safeQuantity = Number(quantity);

      if (!Number.isFinite(safeQuantity) || safeQuantity <= 0) {
        persist((previous) => ({
          ...previous,
          cart: previous.cart.filter((item) => item.productId !== productId),
        }));
        return;
      }

      persist((previous) => ({
        ...previous,
        cart: previous.cart.map((item) =>
          item.productId === productId ? { ...item, quantity: safeQuantity } : item
        ),
      }));
    },
    [persist]
  );

  const removeFromCart = useCallback(
    (productId) => {
      persist((previous) => ({
        ...previous,
        cart: previous.cart.filter((item) => item.productId !== productId),
      }));
    },
    [persist]
  );

  const clearCart = useCallback(() => {
    persist((previous) => ({ ...previous, cart: [] }));
  }, [persist]);

  const toggleFavorite = useCallback(
    (productId) => {
      persist((previous) => {
        const isFavorite = previous.favorites.includes(productId);

        return {
          ...previous,
          favorites: isFavorite
            ? previous.favorites.filter((id) => id !== productId)
            : [...previous.favorites, productId],
        };
      });
    },
    [persist]
  );

  const isFavorite = useCallback(
    (productId) => data.favorites.includes(productId),
    [data.favorites]
  );

  const checkoutCart = useCallback(() => {
    const items = resolveCartItems(data.cart, products);
    if (items.length === 0) return;

    const total = items.reduce((sum, item) => sum + item.lineTotal, 0);
    const order = {
      id: String(Date.now()),
      createdAt: new Date().toISOString(),
      status: 'enviado',
      channel: 'whatsapp',
      total,
      items: items.map((item) => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
    };

    persist((previous) => ({
      ...previous,
      cart: [],
      orders: [order, ...previous.orders],
    }));

    trackEvent('whatsappClick');
    window.open(whatsAppLink(cartMessage(items, total)), '_blank', 'noopener,noreferrer');
  }, [data.cart, persist, products, trackEvent, whatsAppLink]);

  const requestAddToCart = useCallback(
    (productId, quantity = 1) => {
      requestUserAccess(() => {
        if (!isUserAuthenticated) return;
        addToCart(productId, quantity);
      });
    },
    [addToCart, isUserAuthenticated, requestUserAccess]
  );

  const requestToggleFavorite = useCallback(
    (productId) => {
      requestUserAccess(() => {
        if (!isUserAuthenticated) return;
        toggleFavorite(productId);
      });
    },
    [isUserAuthenticated, requestUserAccess, toggleFavorite]
  );

  const repeatOrder = useCallback(
    (orderId) => {
      const order = data.orders.find((entry) => entry.id === orderId);
      if (!order) return { ok: false, added: 0, skipped: 0 };

      const validItems = order.items.filter((item) =>
        products.some((product) => product.id === item.productId && product.active !== false)
      );

      if (validItems.length === 0) {
        return { ok: false, added: 0, skipped: order.items.length };
      }

      persist((previous) => {
        let cart = [...previous.cart];

        validItems.forEach((item) => {
          const existing = cart.find((entry) => entry.productId === item.productId);

          if (existing) {
            cart = cart.map((entry) =>
              entry.productId === item.productId
                ? { ...entry, quantity: entry.quantity + item.quantity }
                : entry
            );
          } else {
            cart.push({
              productId: item.productId,
              quantity: item.quantity,
              addedAt: new Date().toISOString(),
            });
          }
        });

        return { ...previous, cart };
      });

      return {
        ok: true,
        added: validItems.length,
        skipped: order.items.length - validItems.length,
      };
    },
    [data.orders, persist, products]
  );

  const cartItems = useMemo(
    () => resolveCartItems(data.cart, products),
    [data.cart, products]
  );

  const favoriteProducts = useMemo(
    () =>
      data.favorites
        .map((productId) => products.find((product) => product.id === productId && product.active !== false))
        .filter(Boolean),
    [data.favorites, products]
  );

  const cartTotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.lineTotal, 0),
    [cartItems]
  );

  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  const value = useMemo(
    () => ({
      isUserDataReady: Boolean(currentUserEmail && isUserAuthenticated && userDataReady),
      cartItems,
      cartTotal,
      cartCount,
      favoriteProducts,
      orders: data.orders,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      clearCart,
      checkoutCart,
      toggleFavorite,
      isFavorite,
      requestAddToCart,
      requestToggleFavorite,
      repeatOrder,
      formatPrice,
    }),
    [
      addToCart,
      cartCount,
      cartItems,
      cartTotal,
      checkoutCart,
      clearCart,
      currentUserEmail,
      data.orders,
      favoriteProducts,
      formatPrice,
      isFavorite,
      isUserAuthenticated,
      removeFromCart,
      repeatOrder,
      requestAddToCart,
      requestToggleFavorite,
      toggleFavorite,
      updateCartQuantity,
      userDataReady,
    ]
  );

  return <UserDataContext.Provider value={value}>{children}</UserDataContext.Provider>;
}

export function useUserData() {
  const context = useContext(UserDataContext);
  if (!context) {
    throw new Error('useUserData must be used within UserDataProvider');
  }
  return context;
}
