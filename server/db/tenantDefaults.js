function createBootstrapConfig(tenantId, storeName) {
  if (storeName) {
    return {
      store: {
        name: storeName,
      },
    };
  }

  if (tenantId === 'demo') {
    return {
      store: {
        name: 'Loja Demo Eletrônicos',
        tagline: 'Demonstração multi-tenant',
        city: 'Demonstração',
      },
    };
  }

  return {
    store: {
      name: 'Koryn Tech',
    },
  };
}

const DEFAULT_TENANTS = [
  { id: 'default', name: 'Koryn Tech', active: true },
  { id: 'demo', name: 'Loja Demo', active: true },
];

export { createBootstrapConfig, DEFAULT_TENANTS };
