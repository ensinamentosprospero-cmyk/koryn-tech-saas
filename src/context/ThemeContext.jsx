import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { useTenant } from './TenantContext';
import { applyTheme, getStoredTheme, setStoredTheme } from '../utils/themeStorage';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const { tenantId } = useTenant();
  const { currentUserEmail, isAdminAuthenticated, isUserAuthenticated } = useAuth();
  const isLoggedIn = isAdminAuthenticated || isUserAuthenticated;
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    if (!isLoggedIn || !currentUserEmail) {
      setTheme('light');
      applyTheme('light');
      return;
    }

    const storedTheme = getStoredTheme(currentUserEmail, tenantId);
    setTheme(storedTheme);
    applyTheme(storedTheme);
  }, [currentUserEmail, isLoggedIn, tenantId]);

  const toggleTheme = useCallback(() => {
    if (!currentUserEmail) return;

    setTheme((current) => {
      const nextTheme = current === 'dark' ? 'light' : 'dark';
      setStoredTheme(currentUserEmail, nextTheme, tenantId);
      applyTheme(nextTheme);
      return nextTheme;
    });
  }, [currentUserEmail, tenantId]);

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === 'dark',
      toggleTheme,
    }),
    [theme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
