import { DEFAULT_AUTH, FAQS, NAV_LINKS, OFFERS, STORE, CATEGORY_TAGS } from './siteData';
import { PRODUCTS } from './products';
import { generalMessage } from '../utils/whatsapp';

const DEFAULT_THEME = {
  primaryColor: '#2554e8',
  secondaryColor: '#1d42d4',
};

const DEFAULT_COPY = {
  sectionOffers: 'Ofertas da semana',
  sectionOffersSubtitle: 'Compre o kit e economize',
  sectionProducts: 'Produtos',
  sectionFaq: 'Dúvidas frequentes',
  sectionCtaTitle: 'Pronto para comprar?',
  sectionCtaSubtitle: 'Fale com a {storeName} pelo WhatsApp.',
  sectionCtaButton: 'Chamar no WhatsApp',
  navLinks: NAV_LINKS,
};

export function createDefaultStoreConfig() {
  return {
    store: {
      name: STORE.name,
      tagline: STORE.tagline,
      phone: STORE.phone,
      phoneDisplay: STORE.phoneDisplay,
      instagram: STORE.instagram,
      instagramUrl: STORE.instagramUrl,
      city: STORE.city,
      address: STORE.city,
      hours: STORE.hours,
      description: STORE.description,
      deliveryTitle: STORE.deliveryTitle,
      deliveryDescription: STORE.deliveryDescription,
      logoUrl: '',
      bannerUrl: '',
    },
    categories: [...CATEGORY_TAGS],
    theme: { ...DEFAULT_THEME },
    copy: {
      ...DEFAULT_COPY,
      navLinks: NAV_LINKS.map((link) => ({ ...link })),
    },
    messages: {
      general: generalMessage,
    },
    sections: {
      ofertas: true,
      produtos: true,
      faq: true,
      contato: true,
    },
    productsPerPage: 6,
    products: PRODUCTS.map((product) => ({ ...product, active: true, deliveryEnabled: true })),
    offers: OFFERS.map((offer) => ({ ...offer, active: true, deliveryEnabled: true })),
    faqs: FAQS.map((faq, index) => ({ id: index + 1, ...faq, active: true })),
    auth: { ...DEFAULT_AUTH },
    analytics: {
      pageViews: 0,
      whatsAppClicks: 0,
      lastVisit: null,
    },
  };
}

function normalizeProducts(products) {
  return products.map((product) => ({
    ...product,
    active: product.active ?? true,
    deliveryEnabled: product.deliveryEnabled ?? true,
  }));
}

function normalizeOffers(offers) {
  return offers.map((offer) => ({
    ...offer,
    active: offer.active ?? true,
    deliveryEnabled: offer.deliveryEnabled ?? true,
  }));
}

function normalizeAuth(auth) {
  const defaults = createDefaultStoreConfig().auth;
  const registeredUsers = Array.isArray(auth?.registeredUsers)
    ? auth.registeredUsers
        .filter((user) => user?.email && user?.password)
        .map((user) => ({
          email: user.email.trim().toLowerCase(),
          password: user.password,
        }))
    : defaults.registeredUsers;

  return {
    adminEmail: auth?.adminEmail || defaults.adminEmail,
    adminPassword: auth?.adminPassword || defaults.adminPassword,
    userEmail: auth?.userEmail || defaults.userEmail,
    userPassword: auth?.userPassword || defaults.userPassword,
    registeredUsers,
  };
}

function normalizeFaqs(faqs) {
  return faqs.map((faq, index) => ({
    id: faq.id ?? index + 1,
    ...faq,
    active: faq.active ?? true,
  }));
}

function normalizeAnalytics(analytics) {
  const defaults = createDefaultStoreConfig().analytics;
  const pageViews = Number.isFinite(analytics?.pageViews) ? analytics.pageViews : defaults.pageViews;
  const whatsAppClicks = Number.isFinite(analytics?.whatsAppClicks)
    ? analytics.whatsAppClicks
    : defaults.whatsAppClicks;

  return {
    pageViews: Math.min(pageViews, 999999),
    whatsAppClicks: Math.min(whatsAppClicks, 999999),
    lastVisit: analytics?.lastVisit ?? defaults.lastVisit,
  };
}

function normalizeCategories(categories, defaults) {
  if (!Array.isArray(categories) || categories.length === 0) return defaults;
  return categories.map((item) => String(item || '').trim()).filter(Boolean);
}

function normalizeTheme(theme, defaults) {
  return {
    primaryColor: theme?.primaryColor || defaults.primaryColor,
    secondaryColor: theme?.secondaryColor || defaults.secondaryColor,
  };
}

function normalizeCopy(copy, defaults) {
  const navLinks = Array.isArray(copy?.navLinks) && copy.navLinks.length > 0 ? copy.navLinks : defaults.navLinks;

  return {
    ...defaults,
    ...copy,
    navLinks: navLinks.map((link) => ({
      label: link.label || '',
      href: link.href || '#',
      section: link.section || '',
    })),
  };
}

export function normalizeStoreConfig(config) {
  const defaults = createDefaultStoreConfig();
  const sections = { ...defaults.sections, ...(config.sections || {}) };
  const allSectionsOff = Object.values(sections).every((visible) => !visible);

  if (allSectionsOff) {
    Object.assign(sections, defaults.sections);
  }

  return {
    ...defaults,
    ...config,
    store: { ...defaults.store, ...(config.store || {}) },
    categories: normalizeCategories(config.categories, defaults.categories),
    theme: normalizeTheme(config.theme, defaults.theme),
    copy: normalizeCopy(config.copy, defaults.copy),
    messages: { ...defaults.messages, ...(config.messages || {}) },
    sections,
    productsPerPage: config.productsPerPage ?? defaults.productsPerPage,
    products: Array.isArray(config.products) ? normalizeProducts(config.products) : defaults.products,
    offers: Array.isArray(config.offers) ? normalizeOffers(config.offers) : defaults.offers,
    faqs: Array.isArray(config.faqs) ? normalizeFaqs(config.faqs) : defaults.faqs,
    auth: normalizeAuth(config.auth),
    analytics: normalizeAnalytics(config.analytics),
  };
}

export function mergeStoredStoreConfig(parsed) {
  return normalizeStoreConfig({
    store: parsed.store,
    categories: parsed.categories,
    theme: parsed.theme,
    copy: parsed.copy,
    messages: parsed.messages,
    sections: parsed.sections,
    productsPerPage: parsed.productsPerPage,
    products: parsed.products?.length ? parsed.products : undefined,
    offers: parsed.offers?.length ? parsed.offers : undefined,
    faqs: parsed.faqs?.length ? parsed.faqs : undefined,
    auth: parsed.auth ? parsed.auth : undefined,
    analytics: parsed.analytics,
  });
}
