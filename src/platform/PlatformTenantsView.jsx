import { useMemo, useState } from 'react';
import { buildTenantStoreUrl, getTenantBaseDomains } from '../tenant/resolveTenant.js';
import {
  createBillingCheckout,
  updateTenant,
  updateTenantSubscription,
} from './platformApi.js';
import {
  daysUntil,
  filterTenants,
  formatDate,
  formatDateTime,
  siteStatusBadgeClass,
  siteStatusLabel,
  subscriptionBadgeClass,
  subscriptionLabel,
  storeBadgeClass,
} from './platformUtils.js';

const FILTER_OPTIONS = [
  { value: 'all', label: 'Todas' },
  { value: 'active', label: 'Ativas' },
  { value: 'inactive', label: 'Desativadas' },
  { value: 'trial', label: 'Em trial' },
  { value: 'paid', label: 'Pagas' },
  { value: 'blocked', label: 'Bloqueadas' },
];

function buildStoreUrl(tenantId) {
  return buildTenantStoreUrl(tenantId, {
    protocol: window.location.protocol,
    hostname: window.location.hostname,
    port: window.location.port,
    baseDomains: getTenantBaseDomains(),
  });
}

function TenantDetailDrawer({ tenant, onClose, onUpdated }) {
  const [busy, setBusy] = useState('');

  if (!tenant) return null;

  const storeUrl = buildStoreUrl(tenant.id);
  const isDefault = tenant.id === 'default';

  const runAction = async (actionId, action) => {
    setBusy(actionId);
    try {
      await action();
    } catch (error) {
      alert(error.message);
    } finally {
      setBusy('');
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(storeUrl);
    } catch {
      // ignore
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex justify-end bg-slate-950/60">
      <button
        type="button"
        aria-label="Fechar"
        className="flex-1"
        onClick={onClose}
      />

      <aside className="flex h-full w-full max-w-md flex-col border-l border-white/10 bg-slate-900 shadow-2xl">
        <div className="border-b border-white/5 px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-mono text-xs text-brand-300">{tenant.id}</p>
              <h2 className="truncate text-lg font-extrabold text-white">{tenant.name}</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-white/10 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:bg-white/5"
            >
              Fechar
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ${storeBadgeClass(tenant.active)}`}
            >
              {tenant.active ? 'Loja ativa' : 'Loja desativada'}
            </span>
            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ${subscriptionBadgeClass(tenant)}`}
            >
              {subscriptionLabel(tenant)}
            </span>
          </div>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
          <section>
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">Contato</h3>
            <dl className="mt-3 space-y-3 text-sm">
              <div>
                <dt className="text-xs text-slate-500">E-mail do dono</dt>
                <dd className="mt-0.5 font-medium text-white">{tenant.ownerEmail || '—'}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">URL pública</dt>
                <dd className="mt-0.5 break-all font-mono text-xs text-brand-200">{storeUrl}</dd>
              </div>
            </dl>
          </section>

          <section>
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">Assinatura</h3>
            <dl className="mt-3 space-y-3 text-sm">
              <div>
                <dt className="text-xs text-slate-500">Status do site</dt>
                <dd className="mt-0.5 text-white">{siteStatusLabel(tenant.status)}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Modelo</dt>
                <dd className="mt-0.5 text-white">{tenant.templateId || 'koryn-electronics-v1'}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Cliente</dt>
                <dd className="mt-0.5 text-white">{tenant.clientName || tenant.name}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Plano</dt>
                <dd className="mt-0.5 text-white">
                  {tenant.subscription?.planName || tenant.subscription?.planId || '—'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Status</dt>
                <dd className="mt-0.5 text-white">{tenant.subscription?.status || '—'}</dd>
              </div>
              {tenant.subscription?.trialEndsAt && (
                <div>
                  <dt className="text-xs text-slate-500">Fim do trial</dt>
                  <dd className="mt-0.5 text-white">
                    {formatDate(tenant.subscription.trialEndsAt)}
                    {daysUntil(tenant.subscription.trialEndsAt) !== null && (
                      <span className="ml-2 text-xs text-amber-300">
                        ({daysUntil(tenant.subscription.trialEndsAt)} dia(s))
                      </span>
                    )}
                  </dd>
                </div>
              )}
              {tenant.subscription?.currentPeriodEnd && (
                <div>
                  <dt className="text-xs text-slate-500">Próxima cobrança</dt>
                  <dd className="mt-0.5 text-white">
                    {formatDate(tenant.subscription.currentPeriodEnd)}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-xs text-slate-500">Acesso à loja</dt>
                <dd className="mt-0.5 text-white">
                  {tenant.subscriptionActive ? 'Liberado' : 'Bloqueado por assinatura'}
                </dd>
              </div>
            </dl>
          </section>

          <section>
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">Histórico</h3>
            <dl className="mt-3 space-y-3 text-sm">
              <div>
                <dt className="text-xs text-slate-500">Criada em</dt>
                <dd className="mt-0.5 text-white">{formatDateTime(tenant.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Atualizada em</dt>
                <dd className="mt-0.5 text-white">{formatDateTime(tenant.updatedAt)}</dd>
              </div>
            </dl>
          </section>
        </div>

        <div className="space-y-2 border-t border-white/5 px-5 py-4">
          <div className="flex flex-wrap gap-2">
            <a
              href={storeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/5"
            >
              Abrir loja
            </a>
            <button
              type="button"
              onClick={handleCopyUrl}
              className="rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/5"
            >
              Copiar URL
            </button>
            <button
              type="button"
              disabled={Boolean(busy)}
              onClick={() =>
                runAction('toggle', async () => {
                  const updated = await updateTenant(tenant.id, { active: !tenant.active });
                  onUpdated({ ...tenant, ...updated });
                })
              }
              className="rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/5 disabled:opacity-60"
            >
              {tenant.active ? 'Desativar loja' : 'Ativar loja'}
            </button>
          </div>

          {!isDefault && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={Boolean(busy)}
                onClick={() =>
                  runAction('status-active', async () => {
                    const updated = await updateTenant(tenant.id, { status: 'active' });
                    onUpdated({ ...tenant, ...updated });
                  })
                }
                className="rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/5 disabled:opacity-60"
              >
                Publicar (ativo)
              </button>
              <button
                type="button"
                disabled={Boolean(busy)}
                onClick={() =>
                  runAction('status-draft', async () => {
                    const updated = await updateTenant(tenant.id, { status: 'draft' });
                    onUpdated({ ...tenant, ...updated });
                  })
                }
                className="rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/5 disabled:opacity-60"
              >
                Rascunho
              </button>
              <button
                type="button"
                disabled={Boolean(busy)}
                onClick={() =>
                  runAction('status-suspended', async () => {
                    const updated = await updateTenant(tenant.id, { status: 'suspended' });
                    onUpdated({ ...tenant, ...updated });
                  })
                }
                className="rounded-xl border border-red-500/30 px-3 py-2 text-xs font-semibold text-red-300 hover:bg-red-500/10 disabled:opacity-60"
              >
                Suspender site
              </button>
            </div>
          )}

          {!isDefault && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={Boolean(busy)}
                onClick={() =>
                  runAction('starter', async () => {
                    const result = await updateTenantSubscription(tenant.id, {
                      status: 'active',
                      planId: 'starter',
                    });
                    onUpdated({
                      ...tenant,
                      subscription: result.subscription,
                      subscriptionActive: result.subscriptionActive,
                    });
                  })
                }
                className="rounded-xl bg-brand-600 px-3 py-2 text-xs font-bold text-white hover:bg-brand-700 disabled:opacity-60"
              >
                Ativar Starter
              </button>
              <button
                type="button"
                disabled={Boolean(busy)}
                onClick={() =>
                  runAction('pro', async () => {
                    const result = await updateTenantSubscription(tenant.id, {
                      status: 'active',
                      planId: 'pro',
                    });
                    onUpdated({
                      ...tenant,
                      subscription: result.subscription,
                      subscriptionActive: result.subscriptionActive,
                    });
                  })
                }
                className="rounded-xl bg-brand-600 px-3 py-2 text-xs font-bold text-white hover:bg-brand-700 disabled:opacity-60"
              >
                Ativar Pro
              </button>
              <button
                type="button"
                disabled={Boolean(busy)}
                onClick={() =>
                  runAction('suspend', async () => {
                    const result = await updateTenantSubscription(tenant.id, { status: 'canceled' });
                    onUpdated({
                      ...tenant,
                      subscription: result.subscription,
                      subscriptionActive: result.subscriptionActive,
                    });
                  })
                }
                className="rounded-xl border border-red-500/30 px-3 py-2 text-xs font-semibold text-red-300 hover:bg-red-500/10 disabled:opacity-60"
              >
                Suspender
              </button>
              <button
                type="button"
                disabled={Boolean(busy)}
                onClick={() =>
                  runAction('checkout', async () => {
                    const result = await createBillingCheckout(
                      tenant.id,
                      tenant.subscription?.planId || 'starter'
                    );
                    onUpdated({
                      ...tenant,
                      subscription: result.subscription,
                      subscriptionActive: true,
                    });
                  })
                }
                className="rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/5 disabled:opacity-60"
              >
                Simular checkout
              </button>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

export default function PlatformTenantsView({
  tenants,
  loading,
  error,
  onRefresh,
  selectedTenantId,
  onSelectTenant,
  onUpdated,
}) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filteredTenants = useMemo(
    () => filterTenants(tenants, { search, filter }),
    [tenants, search, filter]
  );

  const selectedTenant = tenants.find((tenant) => tenant.id === selectedTenantId) || null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white">Lojas</h2>
          <p className="mt-1 text-sm text-slate-400">
            {filteredTenants.length} de {tenants.length} loja(s) exibida(s)
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-white/5"
        >
          Atualizar lista
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por ID, nome ou e-mail…"
          className="flex-1 rounded-xl border border-white/10 bg-slate-900/70 px-4 py-2.5 text-sm text-white outline-none ring-brand-500 focus:ring-2"
        />
        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          className="rounded-xl border border-white/10 bg-slate-900/70 px-4 py-2.5 text-sm text-white outline-none ring-brand-500 focus:ring-2"
        >
          {FILTER_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70">
        {loading ? (
          <p className="px-5 py-10 text-sm text-slate-400">Carregando lojas…</p>
        ) : error ? (
          <p className="px-5 py-10 text-sm text-red-400">{error}</p>
        ) : filteredTenants.length === 0 ? (
          <p className="px-5 py-10 text-sm text-slate-500">Nenhuma loja encontrada com estes filtros.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-slate-950/40 text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-semibold">Loja</th>
                  <th className="px-4 py-3 font-semibold">Dono</th>
                  <th className="px-4 py-3 font-semibold">Site</th>
                  <th className="px-4 py-3 font-semibold">Assinatura</th>
                  <th className="px-4 py-3 font-semibold">Trial / cobrança</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredTenants.map((tenant) => {
                  const trialDays =
                    tenant.subscription?.status === 'trialing'
                      ? daysUntil(tenant.subscription.trialEndsAt)
                      : null;

                  return (
                    <tr
                      key={tenant.id}
                      className="border-t border-white/5 transition hover:bg-white/[0.02]"
                    >
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => onSelectTenant(tenant.id)}
                          className="text-left"
                        >
                          <span className="block text-sm font-semibold text-white">{tenant.name}</span>
                          <span className="font-mono text-xs text-brand-300">{tenant.id}</span>
                        </button>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-300">
                        {tenant.ownerEmail || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ${siteStatusBadgeClass(tenant.status)}`}
                        >
                          {siteStatusLabel(tenant.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ${subscriptionBadgeClass(tenant)}`}
                        >
                          {subscriptionLabel(tenant)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400">
                        {tenant.subscription?.status === 'trialing' && trialDays !== null ? (
                          <span className="text-amber-300">
                            {trialDays <= 0 ? 'Expirado' : `${trialDays} dia(s)`} ·{' '}
                            {formatDate(tenant.subscription.trialEndsAt)}
                          </span>
                        ) : tenant.subscription?.currentPeriodEnd ? (
                          formatDate(tenant.subscription.currentPeriodEnd)
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ${storeBadgeClass(tenant.active)}`}
                        >
                          {tenant.active ? 'Ativa' : 'Inativa'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => onSelectTenant(tenant.id)}
                            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-white/5"
                          >
                            Detalhes
                          </button>
                          <a
                            href={buildStoreUrl(tenant.id)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-white/5"
                          >
                            Abrir
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <TenantDetailDrawer
        tenant={selectedTenant}
        onClose={() => onSelectTenant(null)}
        onUpdated={onUpdated}
      />
    </div>
  );
}
