const NAV_ITEMS = [
  { id: 'overview', label: 'Visão geral', hint: 'Métricas e alertas' },
  { id: 'tenants', label: 'Lojas', hint: 'Gerenciar tenants' },
  { id: 'create', label: 'Nova loja', hint: 'Onboarding' },
];

function NavButton({ item, active, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(item.id)}
      className={`w-full rounded-xl px-3 py-3 text-left transition ${
        active
          ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/30'
          : 'text-slate-300 hover:bg-white/5 hover:text-white'
      }`}
    >
      <span className="block text-sm font-bold">{item.label}</span>
      <span className={`mt-0.5 block text-[11px] ${active ? 'text-brand-100' : 'text-slate-500'}`}>
        {item.hint}
      </span>
    </button>
  );
}

export default function PlatformShell({ activeSection, onSectionChange, onLogout, children }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white lg:flex">
      <aside className="border-b border-white/10 bg-slate-900/90 lg:flex lg:w-72 lg:shrink-0 lg:flex-col lg:border-b-0 lg:border-r">
        <div className="border-b border-white/5 px-5 py-5">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-400">Koryn Tech</p>
          <h1 className="mt-1 text-lg font-extrabold text-white">Plataforma SaaS</h1>
          <p className="mt-1 text-xs text-slate-400">Administração multi-loja</p>
        </div>

        <nav className="flex gap-2 overflow-x-auto px-4 py-4 lg:flex-col lg:overflow-visible lg:px-3">
          {NAV_ITEMS.map((item) => (
            <NavButton
              key={item.id}
              item={item}
              active={activeSection === item.id}
              onClick={onSectionChange}
            />
          ))}
        </nav>

        <div className="mt-auto hidden border-t border-white/5 p-4 lg:block">
          <a
            href="/"
            className="mb-2 block rounded-xl border border-white/10 px-3 py-2 text-center text-xs font-semibold text-slate-200 transition hover:bg-white/5"
          >
            Ver site principal
          </a>
          <button
            type="button"
            onClick={onLogout}
            className="w-full rounded-xl bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-700"
          >
            Sair
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-white/10 bg-slate-900/50 px-4 py-3 lg:hidden">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-brand-400">Plataforma</p>
            <p className="text-sm font-bold text-white">
              {NAV_ITEMS.find((item) => item.id === activeSection)?.label}
            </p>
          </div>
          <div className="flex gap-2">
            <a
              href="/"
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-200"
            >
              Site
            </a>
            <button
              type="button"
              onClick={onLogout}
              className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200"
            >
              Sair
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
