import { createContext, useContext, useMemo } from 'react';
import { DEFAULT_TENANT_ID } from '../tenant/tenantConstants';
import { resolveTenantId } from '../tenant/resolveTenant';

const TenantContext = createContext(null);

export function TenantProvider({ children }) {
  const tenantId = useMemo(() => resolveTenantId(), []);

  const value = useMemo(
    () => ({
      tenantId,
      isDefaultTenant: tenantId === DEFAULT_TENANT_ID,
    }),
    [tenantId]
  );

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within TenantProvider');
  }
  return context;
}
