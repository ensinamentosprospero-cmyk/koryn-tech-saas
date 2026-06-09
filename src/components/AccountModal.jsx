import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSiteConfig } from '../context/SiteConfigContext';
import { useUserData } from '../context/UserDataContext';
import { useTheme } from '../context/ThemeContext';
import AccountCartTab from './account/AccountCartTab';
import AccountFavoritesTab from './account/AccountFavoritesTab';
import AccountOrdersTab from './account/AccountOrdersTab';
import Icon from './Icon';

const USER_MENU_ITEMS = [
  { id: 'pedidos', label: 'Minhas Compras' },
  { id: 'carrinho', label: 'Carrinho' },
  { id: 'favoritos', label: 'Meus favoritos' },
];

const ADMIN_MENU_ITEMS = [{ id: 'painel', label: 'Painel administrativo' }];

function getDisplayName(email) {
  if (!email) return 'Visitante';

  const localPart = email.split('@')[0]?.trim();
  if (!localPart) return 'Visitante';

  return localPart.charAt(0).toUpperCase() + localPart.slice(1);
}

function getInitials(email) {
  const name = getDisplayName(email);
  return name.slice(0, 1).toUpperCase();
}

function AccountDetails({ displayEmail, displayName, onLogout }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xl font-extrabold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
          {getInitials(displayEmail)}
        </div>
        <div>
          <p className="text-base font-medium text-slate-800 dark:text-slate-100">{displayName}</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{displayEmail}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onLogout}
        className="block w-full py-3 text-left text-base text-slate-700 transition hover:text-red-600 dark:text-slate-200 dark:hover:text-red-400"
      >
        Sair da conta
      </button>
    </div>
  );
}

export default function AccountModal({ onOpenProduct }) {
  const {
    accountOpen,
    closeAccount,
    logout,
    loadSavedLogin,
    isAdminAuthenticated,
    openAdminPanelFromAccount,
  } = useAuth();
  const { auth } = useSiteConfig();
  const {
    cartItems,
    cartTotal,
    cartCount,
    favoriteProducts,
    orders,
    formatPrice,
    updateCartQuantity,
    removeFromCart,
    checkoutCart,
    requestToggleFavorite,
    repeatOrder,
  } = useUserData();
  const [activeSection, setActiveSection] = useState('menu');
  const [notice, setNotice] = useState('');
  const { isDark, toggleTheme } = useTheme();

  const savedEmail = loadSavedLogin()?.email;
  const displayEmail = savedEmail || (isAdminAuthenticated ? auth.adminEmail : auth.userEmail);
  const displayName = getDisplayName(displayEmail);
  const menuItems = isAdminAuthenticated ? ADMIN_MENU_ITEMS : USER_MENU_ITEMS;

  useEffect(() => {
    if (!accountOpen) return undefined;

    setActiveSection('menu');
    setNotice('');

    const onKeyDown = (event) => {
      if (event.key === 'Escape') closeAccount();
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [accountOpen, closeAccount]);

  if (!accountOpen) return null;

  const sectionTitle = {
    detalhes: 'Minha conta',
    carrinho: 'Carrinho',
    favoritos: 'Meus favoritos',
    pedidos: 'Minhas Compras',
    painel: 'Painel administrativo',
  };

  const handleLogout = () => {
    logout();
  };

  const handleOpenProduct = (productId) => {
    closeAccount();
    onOpenProduct?.(productId);
  };

  const handleRepeatOrder = (orderId) => {
    const result = repeatOrder(orderId);
    if (!result.ok) {
      setNotice('Não foi possível repetir este pedido. Os produtos podem não estar mais disponíveis.');
      return result;
    }

    setNotice(
      result.skipped > 0
        ? 'Pedido adicionado ao carrinho. Alguns itens não estão mais disponíveis.'
        : 'Pedido adicionado ao carrinho.'
    );
    setActiveSection('carrinho');
    return result;
  };

  const handleMenuClick = (itemId) => {
    if (itemId === 'painel') {
      openAdminPanelFromAccount();
      return;
    }

    setActiveSection(itemId);
  };

  const showMenu = activeSection === 'menu';

  return (
    <div className="fixed inset-0 z-[80]">
      <button
        type="button"
        className="absolute inset-0 bg-transparent"
        onClick={closeAccount}
        aria-label="Fechar conta"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="account-modal-title"
        className="absolute right-3 top-[4.35rem] z-[81] flex max-h-[min(34rem,calc(100vh-5rem))] w-[min(19rem,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-elevated dark:border-slate-700 dark:bg-slate-900 sm:right-6 lg:right-8"
      >
        <button
          type="button"
          onClick={closeAccount}
          className="absolute right-4 top-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          aria-label="Fechar"
        >
          <Icon name="close" className="h-5 w-5" />
        </button>

        {showMenu ? (
          <div className="overflow-y-auto px-5 pb-6 pt-6 sm:px-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-100 text-xl font-extrabold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                {getInitials(displayEmail)}
              </div>

              <div className="min-w-0 pr-8">
                <h2 id="account-modal-title" className="text-lg font-medium text-slate-800 dark:text-slate-100">
                  Olá, {displayName}!
                </h2>
                <button
                  type="button"
                  onClick={() => setActiveSection('detalhes')}
                  className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400 transition hover:text-brand-600 dark:text-slate-500 dark:hover:text-brand-400"
                >
                  Ver minha conta
                </button>
              </div>
            </div>

            <nav className="mt-8 space-y-0">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleMenuClick(item.id)}
                  className="block w-full py-4 text-left text-base text-slate-800 transition hover:text-brand-700 dark:text-slate-100 dark:hover:text-brand-400"
                >
                  {item.label}
                  {item.id === 'carrinho' && cartCount > 0 ? ` (${cartCount})` : ''}
                </button>
              ))}

              <button
                type="button"
                onClick={toggleTheme}
                className="flex w-full items-center gap-2 py-4 text-left text-base text-slate-800 transition hover:text-brand-700 dark:text-slate-100 dark:hover:text-brand-400"
              >
                <Icon name="moon" className="h-4 w-4" />
                {isDark ? 'Tema claro' : 'Tema escuro'}
              </button>
            </nav>
          </div>
        ) : (
          <>
            <div className="shrink-0 border-b border-slate-100 px-5 pb-4 pt-6 dark:border-slate-800 sm:px-6">
              <button
                type="button"
                onClick={() => setActiveSection('menu')}
                className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-slate-500 transition hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              >
                <Icon name="chevron-left" className="h-4 w-4" />
                Voltar
              </button>

              <h2 className="pr-10 text-xl font-medium text-slate-800 dark:text-slate-100">
                {sectionTitle[activeSection] || 'Minha conta'}
              </h2>
            </div>

            <div className="overflow-y-auto px-5 py-5 sm:px-6">
              {notice && (
                <p className="mb-4 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-800 dark:border-brand-800 dark:bg-brand-950/40 dark:text-brand-200">
                  {notice}
                </p>
              )}

              {activeSection === 'detalhes' && (
                <AccountDetails
                  displayEmail={displayEmail}
                  displayName={displayName}
                  onLogout={handleLogout}
                />
              )}

              {!isAdminAuthenticated && activeSection === 'carrinho' && (
                <AccountCartTab
                  cartItems={cartItems}
                  cartTotal={cartTotal}
                  formatPrice={formatPrice}
                  updateCartQuantity={updateCartQuantity}
                  removeFromCart={removeFromCart}
                  checkoutCart={checkoutCart}
                />
              )}

              {!isAdminAuthenticated && activeSection === 'favoritos' && (
                <AccountFavoritesTab
                  favoriteProducts={favoriteProducts}
                  requestToggleFavorite={requestToggleFavorite}
                  onOpenProduct={handleOpenProduct}
                />
              )}

              {!isAdminAuthenticated && activeSection === 'pedidos' && (
                <AccountOrdersTab
                  orders={orders}
                  onOpenProduct={handleOpenProduct}
                  onRepeatOrder={handleRepeatOrder}
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
