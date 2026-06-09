import { useState, useEffect } from 'react';
import { NAV_LINKS } from '../data/siteData';
import { useSiteConfig } from '../context/SiteConfigContext';
import { useAuth } from '../context/AuthContext';
import { useUserData } from '../context/UserDataContext';
import Icon from './Icon';
import ProductSearchBar from './ProductSearchBar';
import SiteAdminPanel from './SiteAdminPanel';
import { WhatsAppButton } from './UI';

export default function Header({ searchQuery = '', onSearchChange, onSearchSubmit }) {
  const { store, sections, messages, whatsAppLink, trackEvent } = useSiteConfig();
  const { openLogin, isAdminAuthenticated, isUserAuthenticated } = useAuth();
  const { cartCount } = useUserData();
  const [panelOpen, setPanelOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const visibleNavLinks = NAV_LINKS.filter((link) => sections[link.section]);
  const showSearch = sections.produtos && typeof onSearchChange === 'function';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!isAdminAuthenticated) setPanelOpen(false);
  }, [isAdminAuthenticated]);

  const handleLoginClick = () => {
    openLogin({
      onAdminSuccess: () => setPanelOpen(true),
    });
  };

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'border-b border-slate-200/70 bg-white/95 shadow-soft backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95'
            : 'border-b border-transparent bg-white/70 backdrop-blur-md dark:bg-slate-950/70'
        }`}
      >
        <div className="mx-auto flex h-[4.25rem] max-w-7xl items-center gap-3 px-4 sm:gap-4 sm:px-6 lg:px-8">
          <a
            href={visibleNavLinks[0]?.href ?? '#produtos'}
            className="group flex min-w-0 shrink-0 items-center gap-2.5 sm:gap-3"
          >
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 shadow-glow-brand sm:h-10 sm:w-10">
              <Icon name="smartphone" className="h-4 w-4 text-white sm:h-5 sm:w-5" />
              <div className="absolute inset-0 rounded-xl bg-white/10 opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
            <div className="min-w-0">
              <span className="block truncate text-sm font-extrabold tracking-tight text-ink sm:text-[1.05rem]">
                {store.name}
              </span>
              <span className="hidden text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-600 md:block">
                {store.tagline}
              </span>
            </div>
          </a>

          {showSearch && (
            <div className="flex min-w-0 flex-1 justify-center px-1 sm:px-2">
              <ProductSearchBar
                id="header-product-search"
                value={searchQuery}
                onChange={onSearchChange}
                onSubmit={onSearchSubmit}
                variant="header"
                className="w-full max-w-md"
              />
            </div>
          )}

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={handleLoginClick}
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/90 bg-white text-slate-700 shadow-soft ring-premium transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-800 sm:h-10 sm:w-10"
              aria-label="Entrar ou criar conta"
              aria-expanded={panelOpen}
            >
              <Icon name="user" className="h-5 w-5" />
              {isUserAuthenticated && cartCount > 0 && (
                <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </button>

            <div className="hidden lg:block">
              <WhatsAppButton
                href={whatsAppLink(messages.general)}
                onClick={() => trackEvent('whatsappClick')}
                size="sm"
              >
                WhatsApp
              </WhatsAppButton>
            </div>
          </div>
        </div>
      </header>

      <SiteAdminPanel open={panelOpen} onClose={() => setPanelOpen(false)} />
    </>
  );
}
