import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { loginWithApi, mapApiRoleToClientRole, registerWithApi } from '../api/authApi';
import { useSiteConfig } from './SiteConfigContext';
import { useTenant } from './TenantContext';
import {
  getAdminSessionKey,
  getUserSessionKey,
  loadSavedLogin,
  readAuthSession,
  saveSavedLogin,
  writeAuthSession,
} from '../utils/authStorage';
import { clearAuthToken, readAuthToken, writeAuthToken } from '../utils/authTokenStorage';

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function matchesVisitorAccount(auth, email, password) {
  const normalizedEmail = normalizeEmail(email);
  const trimmedPassword = password.trim();

  if (
    normalizedEmail === normalizeEmail(auth.userEmail) &&
    trimmedPassword === auth.userPassword
  ) {
    return true;
  }

  return auth.registeredUsers.some(
    (user) => user.email === normalizedEmail && user.password === trimmedPassword
  );
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { tenantId } = useTenant();
  const { auth, registerUserAccount } = useSiteConfig();
  const adminSessionKey = getAdminSessionKey(tenantId);
  const userSessionKey = getUserSessionKey(tenantId);

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() =>
    readAuthSession(adminSessionKey)
  );
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(() =>
    readAuthSession(userSessionKey)
  );
  const [loginOpen, setLoginOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const pendingCallbacksRef = useRef({ onAdminSuccess: null, onUserSuccess: null });
  const accountCallbacksRef = useRef({ onAdminSuccess: null });

  useEffect(() => {
    setIsAdminAuthenticated(readAuthSession(getAdminSessionKey(tenantId)));
    setIsUserAuthenticated(readAuthSession(getUserSessionKey(tenantId)));
    setLoginOpen(false);
    setAccountOpen(false);
  }, [tenantId]);

  useEffect(() => {
    const hasSession =
      readAuthSession(getAdminSessionKey(tenantId)) ||
      readAuthSession(getUserSessionKey(tenantId));

    if (!hasSession || readAuthToken(tenantId)) return;

    const saved = loadSavedLogin(tenantId);
    if (!saved?.email || !saved?.password) return;

    loginWithApi({
      email: saved.email,
      password: saved.password,
      tenantId,
    })
      .then((result) => {
        if (result?.token) writeAuthToken(tenantId, result.token);
      })
      .catch(() => {
        // Mantém sessão legada local sem token JWT.
      });
  }, [tenantId]);

  const setUserSession = useCallback(
    (active) => {
      writeAuthSession(getUserSessionKey(tenantId), active);
      setIsUserAuthenticated(active);
    },
    [tenantId]
  );

  const setAdminSession = useCallback(
    (active) => {
      writeAuthSession(getAdminSessionKey(tenantId), active);
      setIsAdminAuthenticated(active);
    },
    [tenantId]
  );

  const applyClientRole = useCallback(
    (role) => {
      if (role === 'admin') {
        setUserSession(false);
        setAdminSession(true);
        return 'admin';
      }

      if (role === 'user') {
        setAdminSession(false);
        setUserSession(true);
        return 'user';
      }

      return false;
    },
    [setAdminSession, setUserSession]
  );

  const loginLocally = useCallback(
    (email, password) => {
      const normalizedEmail = normalizeEmail(email);
      const trimmedPassword = password.trim();

      if (!normalizedEmail || !trimmedPassword) return false;

      if (
        normalizedEmail === normalizeEmail(auth.adminEmail) &&
        trimmedPassword === auth.adminPassword
      ) {
        return applyClientRole('admin');
      }

      if (matchesVisitorAccount(auth, email, password)) {
        return applyClientRole('user');
      }

      return false;
    },
    [applyClientRole, auth]
  );

  const login = useCallback(
    async (email, password) => {
      try {
        const result = await loginWithApi({ email, password, tenantId });
        const clientRole = mapApiRoleToClientRole(result.user?.role);

        if (result.token) {
          writeAuthToken(tenantId, result.token);
        }

        if (clientRole) {
          return applyClientRole(clientRole);
        }
      } catch {
        // Fallback para auth legada no SiteConfig/localStorage.
      }

      return loginLocally(email, password);
    },
    [applyClientRole, loginLocally, tenantId]
  );

  const register = useCallback(
    async (email, password, confirmPassword) => {
      if (password.trim() !== confirmPassword.trim()) {
        return { ok: false, error: 'As senhas não coincidem.' };
      }

      try {
        const result = await registerWithApi({ email, password, tenantId });
        if (result.token) {
          writeAuthToken(tenantId, result.token);
        }

        setAdminSession(false);
        setUserSession(true);
        return { ok: true, role: 'user' };
      } catch (error) {
        const message = error?.message;
        if (message && !message.includes('Failed to fetch')) {
          return { ok: false, error: message };
        }
      }

      const created = registerUserAccount(email, password);
      if (!created.ok) return created;

      setAdminSession(false);
      setUserSession(true);
      return { ok: true, role: 'user' };
    },
    [registerUserAccount, setAdminSession, setUserSession, tenantId]
  );

  const logout = useCallback(() => {
    writeAuthSession(getAdminSessionKey(tenantId), false);
    writeAuthSession(getUserSessionKey(tenantId), false);
    clearAuthToken(tenantId);
    setIsAdminAuthenticated(false);
    setIsUserAuthenticated(false);
    setAccountOpen(false);
    setLoginOpen(false);
  }, [tenantId]);

  const rememberLogin = useCallback(
    (email, password, remember) => {
      saveSavedLogin(email, password, remember, tenantId);
    },
    [tenantId]
  );

  const readSavedLogin = useCallback(() => loadSavedLogin(tenantId), [tenantId]);

  const openLogin = useCallback(
    (callbacks = {}) => {
      if (isAdminAuthenticated || isUserAuthenticated) {
        accountCallbacksRef.current = {
          onAdminSuccess: callbacks.onAdminSuccess || null,
        };
        setAccountOpen(true);
        return;
      }

      pendingCallbacksRef.current = {
        onAdminSuccess: callbacks.onAdminSuccess || null,
        onUserSuccess: callbacks.onUserSuccess || null,
      };
      setLoginOpen(true);
    },
    [isAdminAuthenticated, isUserAuthenticated]
  );

  const closeLogin = useCallback(() => {
    setLoginOpen(false);
    pendingCallbacksRef.current = { onAdminSuccess: null, onUserSuccess: null };
  }, []);

  const closeAccount = useCallback(() => {
    setAccountOpen(false);
    accountCallbacksRef.current = { onAdminSuccess: null };
  }, []);

  const openAdminPanelFromAccount = useCallback(() => {
    const { onAdminSuccess } = accountCallbacksRef.current;
    accountCallbacksRef.current = { onAdminSuccess: null };
    setAccountOpen(false);
    onAdminSuccess?.();
  }, []);

  const completeLogin = useCallback((role) => {
    const { onAdminSuccess, onUserSuccess } = pendingCallbacksRef.current;
    pendingCallbacksRef.current = { onAdminSuccess: null, onUserSuccess: null };
    setLoginOpen(false);

    if (role === 'admin') {
      if (onAdminSuccess) onAdminSuccess();
      else onUserSuccess?.();
      return;
    }

    if (role === 'user') onUserSuccess?.();
  }, []);

  const requestUserAccess = useCallback(
    (action) => {
      if (isUserAuthenticated || isAdminAuthenticated) {
        action();
        return;
      }

      openLogin({ onUserSuccess: action });
    },
    [isAdminAuthenticated, isUserAuthenticated, openLogin]
  );

  const handleProtectedWhatsAppClick = useCallback(
    (event, href, onAuthorized) => {
      const openLink = () => {
        onAuthorized?.();
        window.open(href, '_blank', 'noopener,noreferrer');
      };

      if (isUserAuthenticated || isAdminAuthenticated) {
        onAuthorized?.();
        return;
      }

      event.preventDefault();
      requestUserAccess(openLink);
    },
    [isAdminAuthenticated, isUserAuthenticated, requestUserAccess]
  );

  const currentUserEmail = useMemo(() => {
    if (!isAdminAuthenticated && !isUserAuthenticated) return null;

    const savedEmail = loadSavedLogin(tenantId)?.email;
    if (savedEmail) return normalizeEmail(savedEmail);
    if (isAdminAuthenticated) return normalizeEmail(auth.adminEmail);
    return normalizeEmail(auth.userEmail);
  }, [auth.adminEmail, auth.userEmail, isAdminAuthenticated, isUserAuthenticated, tenantId]);

  const value = useMemo(
    () => ({
      isAdminAuthenticated,
      isUserAuthenticated,
      currentUserEmail,
      loginOpen,
      accountOpen,
      login,
      register,
      logout,
      rememberLogin,
      loadSavedLogin: readSavedLogin,
      openLogin,
      closeLogin,
      closeAccount,
      openAdminPanelFromAccount,
      completeLogin,
      requestUserAccess,
      handleProtectedWhatsAppClick,
    }),
    [
      accountOpen,
      closeAccount,
      closeLogin,
      completeLogin,
      currentUserEmail,
      handleProtectedWhatsAppClick,
      isAdminAuthenticated,
      isUserAuthenticated,
      login,
      loginOpen,
      logout,
      openAdminPanelFromAccount,
      readSavedLogin,
      rememberLogin,
      openLogin,
      register,
      requestUserAccess,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
