import { useEffect, useState } from 'react';
import { useSiteConfig } from '../context/SiteConfigContext';
import Icon from './Icon';
import { ADMIN_MOBILE_NAV, ADMIN_NAV, ADMIN_PAGES } from './admin/adminNav';
import AdminDashboard from './admin/AdminDashboard';
import AdminBillingSettings from './admin/AdminBillingSettings';
import AdminProductsEditor from './admin/AdminProductsEditor';
import { AdminFaqEditor, AdminOffersEditor } from './admin/AdminCatalogEditors';
import {
  AdminContactSettings,
  AdminDeliverySettings,
  AdminMessagesSettings,
  AdminAccessSettings,
  AdminCategoriesSettings,
  AdminCopySettings,
  AdminSectionsSettings,
  AdminStoreSettings,
  AdminThemeSettings,
} from './admin/AdminSettingsSections';

function AdminDescriptionLine({ description, onSave, className = '' }) {
  return (
    <div className={`flex items-center justify-between gap-3 ${className}`}>
      <p className="min-w-0 flex-1 text-sm text-slate-500">{description}</p>
      <button
        type="button"
        onClick={onSave}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-brand-600 px-3 py-1.5 text-xs font-bold text-white shadow-glow-brand transition hover:bg-brand-700 sm:py-2"
      >
        <Icon name="check" className="h-4 w-4" />
        Salvar
      </button>
    </div>
  );
}

function AdminSidebarNav({ activePage, onNavigate, store, saveStatus }) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/10 px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-glow-brand">
            <Icon name="smartphone" className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-extrabold text-white">{store.name}</p>
            <p className="truncate text-[11px] font-semibold text-slate-400">Painel administrativo</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-5">
        {ADMIN_NAV.map((group) => (
          <div key={group.label} className="mb-7 last:mb-0">
            <p className="mb-3 px-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
              {group.label}
            </p>
            <div className="space-y-2">
              {group.items.map((item) => {
                const active = activePage === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onNavigate(item.id)}
                    className={`flex w-full items-center gap-3.5 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                      active
                        ? 'bg-brand-600 text-white shadow-glow-brand'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon
                      name={item.icon}
                      className={`h-4 w-4 shrink-0 ${active ? 'text-white' : 'text-slate-400'}`}
                      filled={item.icon === 'whatsapp' && active}
                    />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="rounded-xl bg-white/5 px-3 py-2.5 ring-1 ring-white/10">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Status</p>
          <p
            className={`mt-1 flex items-center gap-1.5 text-xs font-semibold ${
              saveStatus === 'error'
                ? 'text-red-400'
                : saveStatus === 'saved'
                  ? 'text-emerald-400'
                  : 'text-slate-400'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                saveStatus === 'error'
                  ? 'bg-red-400'
                  : saveStatus === 'saved'
                    ? 'bg-emerald-400'
                    : 'bg-slate-500'
              }`}
            />
            {saveStatus === 'saved'
              ? 'Salvo com sucesso'
              : saveStatus === 'error'
                ? 'Erro ao salvar'
                : 'Clique em Salvar para aplicar no site'}
          </p>
        </div>
      </div>
    </div>
  );
}

function renderPage(page, onNavigate) {
  switch (page) {
    case 'dashboard':
      return <AdminDashboard onNavigate={onNavigate} />;
    case 'assinatura':
      return <AdminBillingSettings />;
    case 'loja':
      return <AdminStoreSettings />;
    case 'tema':
      return <AdminThemeSettings />;
    case 'categorias':
      return <AdminCategoriesSettings />;
    case 'textos':
      return <AdminCopySettings />;
    case 'contato':
      return <AdminContactSettings />;
    case 'entrega':
      return <AdminDeliverySettings />;
    case 'mensagens':
      return <AdminMessagesSettings />;
    case 'acesso':
      return <AdminAccessSettings />;
    case 'produtos':
      return <AdminProductsEditor />;
    case 'ofertas':
      return <AdminOffersEditor />;
    case 'secoes':
      return <AdminSectionsSettings />;
    case 'faq':
      return <AdminFaqEditor />;
    default:
      return <AdminDashboard onNavigate={onNavigate} />;
  }
}

export default function SiteAdminPanel({ open, onClose }) {
  const { store, saveSettings } = useSiteConfig();
  const [activePage, setActivePage] = useState('dashboard');
  const [saveStatus, setSaveStatus] = useState('idle');

  const page = ADMIN_PAGES[activePage] || ADMIN_PAGES.dashboard;
  const contentMaxWidth = activePage === 'produtos' ? 'max-w-6xl' : 'max-w-4xl';

  const handleSave = () => {
    const saved = saveSettings();
    setSaveStatus(saved ? 'saved' : 'error');
  };

  useEffect(() => {
    if (open) setActivePage('dashboard');
  }, [open]);

  useEffect(() => {
    if (saveStatus === 'idle') return undefined;

    const timer = window.setTimeout(() => {
      setSaveStatus('idle');
    }, 2500);

    return () => window.clearTimeout(timer);
  }, [saveStatus]);

  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-[60] bg-slate-950/40 lg:hidden"
        onClick={onClose}
        aria-label="Fechar painel"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="site-admin-title"
        className="fixed inset-y-0 right-0 z-[70] flex w-full max-w-[580px] flex-col overflow-hidden border-l border-slate-200/80 bg-[#f4f6fb] shadow-2xl lg:max-w-[760px]"
      >
        <div className="hidden shrink-0 bg-brand-600 px-4 py-2.5 text-center lg:block">
          <p className="text-xs font-semibold text-white">
            Alterações ao vivo — role o site ao lado para testar
          </p>
        </div>

        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          <aside className="hidden w-[17.5rem] shrink-0 border-r border-white/10 bg-slate-950 lg:flex">
            <AdminSidebarNav
              activePage={activePage}
              onNavigate={setActivePage}
              store={store}
              saveStatus={saveStatus}
            />
          </aside>

          <div className="flex min-h-0 flex-1 flex-col">
            <header className="shrink-0 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
              <div className="px-4 py-3 sm:px-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-600">
                      {page.group}
                    </p>
                    <h2 id="site-admin-title" className="truncate text-lg font-extrabold text-slate-900 lg:text-xl">
                      {page.title}
                    </h2>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="inline-flex rounded-xl bg-brand-600 px-3 py-2 text-xs font-bold text-white shadow-glow-brand transition hover:bg-brand-700 lg:hidden"
                    >
                      Ver site
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="hidden rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 lg:inline-flex"
                    >
                      Ver site
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-soft transition hover:border-slate-300 hover:bg-slate-50"
                      aria-label="Fechar painel"
                    >
                      <Icon name="close" className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </header>

            <main className="min-h-0 flex-1 overflow-y-auto">
              <div className={`mx-auto w-full ${contentMaxWidth} px-4 py-5 sm:px-6 sm:py-6`}>
                <div className="mb-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:hidden">
                  {ADMIN_MOBILE_NAV.map((item) => {
                    const active = activePage === item.id;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActivePage(item.id)}
                        className={`inline-flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-xs font-bold transition ${
                          active
                            ? 'bg-brand-600 text-white shadow-glow-brand'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Icon
                          name={item.icon}
                          className="h-3.5 w-3.5"
                          filled={item.icon === 'whatsapp' && active}
                        />
                        {item.label}
                      </button>
                    );
                  })}
                </div>

                <div className="mb-5 w-full">
                  <AdminDescriptionLine description={page.description} onSave={handleSave} />
                </div>
                {renderPage(activePage, setActivePage)}
              </div>
            </main>
          </div>
        </div>
      </aside>
    </>
  );
}
