import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import PlatformApp from './platform/PlatformApp.jsx';
import AppErrorBoundary from './components/AppErrorBoundary.jsx';
import { SiteConfigProvider } from './context/SiteConfigContext.jsx';
import { TenantProvider } from './context/TenantContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { UserDataProvider } from './context/UserDataContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';

import { shouldRenderPlatformApp } from './tenant/resolveTenant.js';

const isPlatformRoute = shouldRenderPlatformApp();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppErrorBoundary>
      {isPlatformRoute ? (
        <PlatformApp />
      ) : (
        <TenantProvider>
          <SiteConfigProvider>
            <AuthProvider>
              <ThemeProvider>
                <UserDataProvider>
                  <App />
                </UserDataProvider>
              </ThemeProvider>
            </AuthProvider>
          </SiteConfigProvider>
        </TenantProvider>
      )}
    </AppErrorBoundary>
  </StrictMode>,
);
