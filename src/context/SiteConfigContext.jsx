import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createDefaultStoreConfig } from '../data/storeConfigSchema';
import {
  loadStoreConfig,
  loadStoreConfigSync,
  saveStoreConfig,
  saveStoreConfigSync,
} from '../data/storeConfigRepository';
import { applyStoreTheme } from '../utils/applyStoreTheme.js';
import { useTenant } from './TenantContext';

const PAGE_VIEW_SESSION_KEY = 'koryn-tech-page-view-tracked';

const SiteConfigContext = createContext(null);

export function SiteConfigProvider({ children }) {
  const { tenantId } = useTenant();
  const [config, setConfig] = useState(() => loadStoreConfigSync(tenantId));
  const [configReady, setConfigReady] = useState(false);
  const [subscriptionBlocked, setSubscriptionBlocked] = useState(false);
  const [siteBlocked, setSiteBlocked] = useState(false);
  const configRef = useRef(config);
  configRef.current = config;
  const pendingSaveHandlersRef = useRef(new Set());

  useEffect(() => {
    let cancelled = false;

    setConfig(loadStoreConfigSync(tenantId));
    setConfigReady(false);
    setSubscriptionBlocked(false);
    setSiteBlocked(false);

    loadStoreConfig(tenantId)
      .then((loadedConfig) => {
        if (cancelled) return;
        setConfig(loadedConfig);
        setConfigReady(true);
      })
      .catch((error) => {
        if (cancelled) return;
        if (error?.code === 'SUBSCRIPTION_INACTIVE') {
          setSubscriptionBlocked(true);
          setConfigReady(true);
          return;
        }
        if (error?.code === 'SITE_SUSPENDED' || error?.name === 'SiteBlockedError') {
          setSiteBlocked(true);
          setConfigReady(true);
          return;
        }
        setConfig(loadStoreConfigSync(tenantId));
        setConfigReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [tenantId]);

  const registerSaveHandler = useCallback((handler) => {
    pendingSaveHandlersRef.current.add(handler);
    return () => {
      pendingSaveHandlersRef.current.delete(handler);
    };
  }, []);

  const persist = useCallback(
    (updater) => {
      setConfig((previous) => {
        const next = typeof updater === 'function' ? updater(previous) : updater;
        saveStoreConfigSync(next, tenantId);
        saveStoreConfig(next, tenantId).catch((error) => {
          console.warn('Falha ao sincronizar configuração remota:', error);
        });
        return next;
      });
    },
    [tenantId]
  );

  useEffect(() => {
    applyStoreTheme(config.theme);
  }, [config.theme]);

  const updateTheme = useCallback(
    (field, value) => {
      persist((previous) => ({
        ...previous,
        theme: { ...previous.theme, [field]: value },
      }));
    },
    [persist]
  );

  const updateCopy = useCallback(
    (field, value) => {
      persist((previous) => ({
        ...previous,
        copy: { ...previous.copy, [field]: value },
      }));
    },
    [persist]
  );

  const updateCategories = useCallback(
    (categories) => {
      persist((previous) => ({
        ...previous,
        categories: Array.isArray(categories) ? categories : previous.categories,
      }));
    },
    [persist]
  );

  const updateStore = useCallback(
    (field, value) => {
      persist((previous) => ({
        ...previous,
        store: { ...previous.store, [field]: value },
      }));
    },
    [persist]
  );

  const updateMessages = useCallback(
    (field, value) => {
      persist((previous) => ({
        ...previous,
        messages: { ...previous.messages, [field]: value },
      }));
    },
    [persist]
  );

  const updateSection = useCallback(
    (field, value) => {
      persist((previous) => ({
        ...previous,
        sections: { ...previous.sections, [field]: value },
      }));
    },
    [persist]
  );

  const updateAuth = useCallback(
    (field, value) => {
      persist((previous) => ({
        ...previous,
        auth: { ...previous.auth, [field]: value },
      }));
    },
    [persist]
  );

  const registerUserAccount = useCallback(
    (email, password) => {
      const normalizedEmail = email.trim().toLowerCase();
      const trimmedPassword = password.trim();

      if (!normalizedEmail || !trimmedPassword) {
        return { ok: false, error: 'Preencha e-mail e senha.' };
      }

      let result = { ok: false, error: 'Não foi possível criar a conta.' };

      persist((previous) => {
        const { auth } = previous;

        if (normalizedEmail === auth.adminEmail.trim().toLowerCase()) {
          result = { ok: false, error: 'Este e-mail já está em uso.' };
          return previous;
        }

        if (normalizedEmail === auth.userEmail.trim().toLowerCase()) {
          result = { ok: false, error: 'Este e-mail já está em uso.' };
          return previous;
        }

        if (
          auth.registeredUsers.some((user) => user.email === normalizedEmail)
        ) {
          result = { ok: false, error: 'Já existe uma conta com este e-mail.' };
          return previous;
        }

        result = { ok: true };
        return {
          ...previous,
          auth: {
            ...auth,
            registeredUsers: [
              ...auth.registeredUsers,
              { email: normalizedEmail, password: trimmedPassword },
            ],
          },
        };
      });

      return result;
    },
    [persist]
  );

  const updateProductsPerPage = useCallback(
    (value) => {
      const parsed = Number.parseInt(value, 10);
      if (Number.isNaN(parsed)) return;
      persist((previous) => ({
        ...previous,
        productsPerPage: Math.min(24, Math.max(4, parsed)),
      }));
    },
    [persist]
  );

  const updateProduct = useCallback(
    (id, patch) => {
      persist((previous) => ({
        ...previous,
        products: previous.products.map((product) =>
          product.id === id ? { ...product, ...patch } : product
        ),
      }));
    },
    [persist]
  );

  const addProduct = useCallback(() => {
    persist((previous) => {
      const nextId = Math.max(0, ...previous.products.map((product) => product.id)) + 1;

      return {
        ...previous,
        products: [
          ...previous.products,
          {
            id: nextId,
            category: previous.categories[0] || 'Geral',
            image: 'smartphone',
            name: 'Novo produto',
            price: 'R$ 0,00',
            badge: 'Novo',
            badgeColor: 'blue',
            description: 'Descrição do produto.',
            details: ['Detalhe 1'],
            payment: 'Pix, cartão ou dinheiro',
            photo: '/products/celulares-1.jpg',
            photoAlt: 'Novo produto',
            active: true,
            deliveryEnabled: true,
          },
        ],
      };
    });
  }, [persist]);

  const removeProduct = useCallback(
    (id) => {
      persist((previous) => ({
        ...previous,
        products: previous.products.filter((product) => product.id !== id),
      }));
    },
    [persist]
  );

  const updateOffer = useCallback(
    (id, patch) => {
      persist((previous) => ({
        ...previous,
        offers: previous.offers.map((offer) => (offer.id === id ? { ...offer, ...patch } : offer)),
      }));
    },
    [persist]
  );

  const addOffer = useCallback(() => {
    persist((previous) => {
      const nextId = Math.max(0, ...previous.offers.map((offer) => offer.id)) + 1;

      return {
        ...previous,
        offers: [
          ...previous.offers,
          {
            id: nextId,
            name: 'Nova oferta',
            includes: ['Item 1', 'Item 2'],
            price: 'R$ 0,00',
            savings: 'Promoção',
            highlight: false,
            deliveryEnabled: true,
            image: '/offers/kit-essencial.jpg',
            imageAlt: 'Nova oferta',
            description: 'Descrição da oferta.',
            details: ['Detalhe 1'],
            active: true,
          },
        ],
      };
    });
  }, [persist]);

  const removeOffer = useCallback(
    (id) => {
      persist((previous) => ({
        ...previous,
        offers: previous.offers.filter((offer) => offer.id !== id),
      }));
    },
    [persist]
  );

  const updateFaq = useCallback(
    (id, patch) => {
      persist((previous) => ({
        ...previous,
        faqs: previous.faqs.map((faq) => (faq.id === id ? { ...faq, ...patch } : faq)),
      }));
    },
    [persist]
  );

  const addFaq = useCallback(() => {
    persist((previous) => {
      const nextId = Math.max(0, ...previous.faqs.map((faq) => faq.id)) + 1;

      return {
        ...previous,
        faqs: [
          ...previous.faqs,
          {
            id: nextId,
            question: 'Nova pergunta',
            answer: 'Resposta da pergunta.',
            active: true,
          },
        ],
      };
    });
  }, [persist]);

  const removeFaq = useCallback(
    (id) => {
      persist((previous) => ({
        ...previous,
        faqs: previous.faqs.filter((faq) => faq.id !== id),
      }));
    },
    [persist]
  );

  const trackEvent = useCallback(
    (event) => {
      persist((previous) => {
        if (event === 'pageView') {
          try {
            if (sessionStorage.getItem(PAGE_VIEW_SESSION_KEY)) {
              return previous;
            }
            sessionStorage.setItem(PAGE_VIEW_SESSION_KEY, '1');
          } catch {
            // ignore
          }

          return {
            ...previous,
            analytics: {
              ...previous.analytics,
              pageViews: previous.analytics.pageViews + 1,
              lastVisit: new Date().toISOString(),
            },
          };
        }

        if (event === 'whatsappClick') {
          return {
            ...previous,
            analytics: {
              ...previous.analytics,
              whatsAppClicks: previous.analytics.whatsAppClicks + 1,
            },
          };
        }

        return previous;
      });
    },
    [persist]
  );

  const resetConfig = useCallback(() => {
    const defaults = createDefaultStoreConfig();
    persist(defaults);
  }, [persist]);

  const saveSettings = useCallback(async () => {
    let next = configRef.current;

    for (const handler of pendingSaveHandlersRef.current) {
      const patch = handler(next);
      if (patch) {
        next = { ...next, ...patch };
      }
    }

    saveStoreConfigSync(next, tenantId);
    const result = await saveStoreConfig(next, tenantId);

    if (result.ok) {
      configRef.current = next;
      setConfig(next);
    }

    return result.ok;
  }, [tenantId]);

  const whatsAppLink = useCallback(
    (message) => {
      const phone = config.store.phone.replace(/\D/g, '');
      return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    },
    [config.store.phone]
  );

  const activeProducts = useMemo(
    () => config.products.filter((product) => product.active !== false),
    [config.products]
  );

  const activeOffers = useMemo(
    () => config.offers.filter((offer) => offer.active !== false),
    [config.offers]
  );

  const activeFaqs = useMemo(
    () => config.faqs.filter((faq) => faq.active !== false),
    [config.faqs]
  );

  const dashboardStats = useMemo(() => {
    const productsByCategory = config.categories.map((category) => ({
      category,
      total: config.products.filter((product) => product.category === category).length,
      active: activeProducts.filter((product) => product.category === category).length,
    }));

    const activeSections = Object.entries(config.sections).filter(([, visible]) => visible).length;

    return {
      totalProducts: config.products.length,
      activeProducts: activeProducts.length,
      inactiveProducts: config.products.length - activeProducts.length,
      totalOffers: config.offers.length,
      activeOffers: activeOffers.length,
      totalFaqs: config.faqs.length,
      activeFaqs: activeFaqs.length,
      productsByCategory,
      activeSections,
      totalSections: Object.keys(config.sections).length,
      productsPerPage: config.productsPerPage,
      catalogPages: Math.max(1, Math.ceil(activeProducts.length / config.productsPerPage)),
      analytics: config.analytics,
      storeName: config.store.name,
      storeCity: config.store.city,
    };
  }, [activeFaqs.length, activeOffers.length, activeProducts, config]);

  const value = useMemo(
    () => ({
      config,
      configReady,
      subscriptionBlocked,
      siteBlocked,
      tenantId,
      store: config.store,
      categories: config.categories,
      theme: config.theme,
      copy: config.copy,
      auth: config.auth,
      messages: config.messages,
      sections: config.sections,
      productsPerPage: config.productsPerPage,
      products: config.products,
      activeProducts,
      offers: config.offers,
      activeOffers,
      faqs: config.faqs,
      activeFaqs,
      analytics: config.analytics,
      dashboardStats,
      updateStore,
      updateTheme,
      updateCopy,
      updateCategories,
      updateAuth,
      registerUserAccount,
      updateMessages,
      updateSection,
      updateProductsPerPage,
      updateProduct,
      addProduct,
      removeProduct,
      updateOffer,
      addOffer,
      removeOffer,
      updateFaq,
      addFaq,
      removeFaq,
      trackEvent,
      resetConfig,
      saveSettings,
      registerSaveHandler,
      whatsAppLink,
    }),
    [
      activeFaqs,
      activeOffers,
      activeProducts,
      config,
      configReady,
      subscriptionBlocked,
      siteBlocked,
      dashboardStats,
      resetConfig,
      saveSettings,
      registerSaveHandler,
      trackEvent,
      updateMessages,
      updateProductsPerPage,
      addFaq,
      addOffer,
      addProduct,
      removeFaq,
      removeOffer,
      removeProduct,
      updateFaq,
      updateOffer,
      updateProduct,
      updateSection,
      updateAuth,
      registerUserAccount,
      updateStore,
      updateTheme,
      updateCopy,
      updateCategories,
      whatsAppLink,
    ]
  );

  return <SiteConfigContext.Provider value={value}>{children}</SiteConfigContext.Provider>;
}

export function useSiteConfig() {
  const context = useContext(SiteConfigContext);
  if (!context) {
    throw new Error('useSiteConfig must be used within SiteConfigProvider');
  }
  return context;
}
