export function AdminPanel({ children, className = '' }) {
  return (
    <div
      className={`rounded-2xl border border-slate-200/80 bg-white p-4 shadow-soft ring-1 ring-slate-900/[0.03] sm:p-5 ${className}`}
    >
      {children}
    </div>
  );
}

export function AdminPanelHeader({ title, description, action }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
      <div>
        <h3 className="text-sm font-extrabold text-slate-900">{title}</h3>
        {description && <p className="mt-1 text-xs leading-relaxed text-slate-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function AdminGrid({ children, cols = 2 }) {
  const gridClass =
    cols === 1 ? 'grid grid-cols-1 gap-4' : 'grid grid-cols-1 gap-4 sm:grid-cols-2';

  return <div className={gridClass}>{children}</div>;
}

export function ConfigField({ label, hint, children }) {
  return (
    <label className="block">
      <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </span>
      {hint && <p className="mt-1 text-xs leading-relaxed text-slate-400">{hint}</p>}
      <div className="mt-2">{children}</div>
    </label>
  );
}

export function ConfigInput({ value, onChange, type = 'text', ...props }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
      {...props}
    />
  );
}

export function ConfigTextarea({ value, onChange, rows = 3 }) {
  return (
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      rows={rows}
      className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
    />
  );
}

export function ConfigSelect({ value, onChange, children }) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
    >
      {children}
    </select>
  );
}

export function ConfigSwitch({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200/80 bg-slate-50/40 px-4 py-3.5 transition hover:border-slate-300">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-900">{label}</p>
        {description && <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${
          checked ? 'bg-brand-600' : 'bg-slate-300'
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

export function StatCard({ label, value, hint, trend, accent = 'brand' }) {
  const accents = {
    brand: 'from-brand-600 to-brand-700',
    green: 'from-emerald-500 to-emerald-600',
    orange: 'from-orange-500 to-orange-600',
    slate: 'from-slate-700 to-slate-800',
    violet: 'from-violet-500 to-violet-600',
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-soft ring-1 ring-slate-900/[0.03]">
      <div
        className={`absolute right-0 top-0 h-20 w-20 rounded-bl-[2.5rem] bg-gradient-to-br opacity-10 ${accents[accent] || accents.brand}`}
      />
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      {trend && <p className="mt-2 text-[11px] font-semibold text-brand-600">{trend}</p>}
    </div>
  );
}

export function ProgressRow({ label, active, total }) {
  const percent = total > 0 ? Math.round((active / total) * 100) : 0;

  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/50 px-3.5 py-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-slate-700">{label}</span>
        <span className="text-xs font-bold text-slate-500">
          {active}
          <span className="text-slate-400">/{total}</span>
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200/80">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-500 transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export function StatusPill({ active, label }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
        active
          ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
          : 'bg-slate-100 text-slate-500 ring-1 ring-slate-200'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
      {label}
    </span>
  );
}

export function AddButton({ onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-brand-300/80 bg-brand-50/50 px-4 py-3.5 text-sm font-bold text-brand-700 transition hover:border-brand-400 hover:bg-brand-50"
    >
      <span className="flex h-5 w-5 items-center justify-center rounded-md bg-brand-600 text-xs text-white">
        +
      </span>
      {children}
    </button>
  );
}
