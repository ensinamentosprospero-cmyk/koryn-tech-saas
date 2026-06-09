import {
  computePlatformStats,
  daysUntil,
  formatDate,
  formatMoney,
} from './platformUtils.js';

function StatCard({ label, value, hint, tone = 'default' }) {
  const toneClass =
    tone === 'success'
      ? 'border-emerald-500/20 bg-emerald-500/5'
      : tone === 'warning'
        ? 'border-amber-500/20 bg-amber-500/5'
        : tone === 'danger'
          ? 'border-red-500/20 bg-red-500/5'
          : 'border-white/10 bg-slate-900/70';

  return (
    <div className={`rounded-2xl border p-4 ${toneClass}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-extrabold text-white">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

function SystemBadge({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2">
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-slate-200">{value}</p>
    </div>
  );
}

export default function PlatformOverview({ tenants, health, onOpenTenant, onGoToCreate }) {
  const stats = computePlatformStats(tenants);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-white">Visão geral</h2>
        <p className="mt-1 text-sm text-slate-400">
          Resumo das lojas, assinaturas e alertas da plataforma.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Lojas cadastradas" value={stats.total} hint="Exclui loja default" />
        <StatCard
          label="Lojas ativas"
          value={stats.activeStores}
          hint={`${stats.inactiveStores} desativada(s)`}
          tone="success"
        />
        <StatCard
          label="Em trial"
          value={stats.trialing}
          hint={`${stats.trialsExpiringSoon.length} expira(m) em 7 dias`}
          tone="warning"
        />
        <StatCard
          label="MRR estimado"
          value={formatMoney(stats.estimatedMrr)}
          hint={`${stats.paidActive} assinatura(s) pagas`}
          tone="success"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-2xl border border-white/10 bg-slate-900/70 p-5 lg:col-span-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white">Trials expirando em breve</h3>
              <p className="mt-1 text-xs text-slate-400">Próximos 7 dias — acompanhe conversão</p>
            </div>
            <button
              type="button"
              onClick={onGoToCreate}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-white/5"
            >
              Nova loja
            </button>
          </div>

          {stats.trialsExpiringSoon.length === 0 ? (
            <p className="mt-6 text-sm text-slate-500">Nenhum trial expira nos próximos 7 dias.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {stats.trialsExpiringSoon.map((tenant) => {
                const days = daysUntil(tenant.subscription.trialEndsAt);
                return (
                  <li
                    key={tenant.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-slate-950/50 px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">{tenant.name}</p>
                      <p className="truncate text-xs text-slate-500">
                        {tenant.id} · {tenant.ownerEmail || 'Sem e-mail'}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xs font-bold text-amber-300">
                        {days === 0 ? 'Hoje' : `${days} dia(s)`}
                      </p>
                      <button
                        type="button"
                        onClick={() => onOpenTenant(tenant.id)}
                        className="mt-1 text-[11px] font-semibold text-brand-300 hover:text-brand-200"
                      >
                        Ver detalhes
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
          <h3 className="text-sm font-bold text-white">Sistema</h3>
          <p className="mt-1 text-xs text-slate-400">Status da API em produção</p>

          <div className="mt-4 grid gap-2">
            <SystemBadge label="Ambiente" value={health?.nodeEnv || '—'} />
            <SystemBadge label="Banco" value={health?.databaseDriver || '—'} />
            <SystemBadge label="Cobrança" value={health?.billingProvider || '—'} />
            <SystemBadge label="Bloqueadas" value={String(stats.blocked)} />
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
        <h3 className="text-sm font-bold text-white">Lojas recentes</h3>
        <p className="mt-1 text-xs text-slate-400">Últimas contas criadas na plataforma</p>

        {stats.recentStores.length === 0 ? (
          <p className="mt-6 text-sm text-slate-500">Nenhuma loja cadastrada ainda.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2 font-semibold">Loja</th>
                  <th className="px-3 py-2 font-semibold">Dono</th>
                  <th className="px-3 py-2 font-semibold">Criada em</th>
                  <th className="px-3 py-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentStores.map((tenant) => (
                  <tr key={tenant.id} className="border-t border-white/5">
                    <td className="px-3 py-3">
                      <button
                        type="button"
                        onClick={() => onOpenTenant(tenant.id)}
                        className="text-left hover:text-brand-200"
                      >
                        <span className="block font-semibold text-white">{tenant.name}</span>
                        <span className="font-mono text-xs text-slate-500">{tenant.id}</span>
                      </button>
                    </td>
                    <td className="px-3 py-3 text-slate-300">{tenant.ownerEmail || '—'}</td>
                    <td className="px-3 py-3 text-slate-400">{formatDate(tenant.createdAt)}</td>
                    <td className="px-3 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ring-1 ${
                          tenant.subscriptionActive
                            ? 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/20'
                            : 'bg-red-500/15 text-red-300 ring-red-500/20'
                        }`}
                      >
                        {tenant.subscriptionActive ? 'Acesso ok' : 'Bloqueada'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
