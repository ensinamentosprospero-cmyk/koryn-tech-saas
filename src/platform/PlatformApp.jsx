import { useCallback, useEffect, useState } from 'react';
import { buildTenantStoreUrl, getTenantBaseDomains } from '../tenant/resolveTenant.js';
import {
  createBillingCheckout,
  createTenant,
  fetchAllTenants,
  updateTenant,
  updateTenantSubscription,
} from './platformApi.js';
import {
  isPlatformAuthenticated,
  loginPlatform,
  logoutPlatform,
} from './platformAuth.js';

function PlatformLogin({ onSuccess }) {
  const [email, setEmail] = useState('admin@koryntech.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    const success = await loginPlatform(email, password);
    setSubmitting(false);

    if (success) {
      onSuccess();
      return;
    }

    setError('E-mail ou senha incorretos.');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-8 shadow-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-400">
          Koryn Tech SaaS
        </p>
        <h1 className="mt-2 text-2xl font-extrabold text-white">Painel da plataforma</h1>
        <p className="mt-2 text-sm text-slate-400">
          Acesso restrito ao administrador da plataforma.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-slate-300">E-mail</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none ring-brand-500 focus:ring-2"
              autoComplete="username"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-slate-300">Senha</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none ring-brand-500 focus:ring-2"
              autoComplete="current-password"
            />
          </label>

          {error && <p className="text-sm font-medium text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-brand-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-brand-700 disabled:opacity-60"
          >
            {submitting ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}

function CreateTenantForm({ onCreated }) {
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const tenant = await createTenant({ id, name });
      setId('');
      setName('');
      onCreated(tenant);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-white/10 bg-slate-900/70 p-5"
    >
      <h2 className="text-sm font-bold text-white">Nova loja</h2>
      <p className="mt-1 text-xs text-slate-400">
        ID usado na URL: <code className="text-brand-300">?loja=seu-id</code>
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-300">ID da loja</span>
          <input
            value={id}
            onChange={(event) => setId(event.target.value.toLowerCase())}
            placeholder="minha-loja"
            className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none ring-brand-500 focus:ring-2"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-300">Nome exibido</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Minha Loja de Eletrônicos"
            className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none ring-brand-500 focus:ring-2"
          />
        </label>
      </div>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="mt-4 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700 disabled:opacity-60"
      >
        {submitting ? 'Criando…' : 'Criar loja'}
      </button>
    </form>
  );
}

function subscriptionLabel(tenant) {
  if (tenant.id === 'default') return 'Isenta';

  const subscription = tenant.subscription;
  if (!subscription) return 'Sem plano';

  const labels = {
    trialing: 'Trial',
    active: 'Ativa',
    past_due: 'Atrasada',
    canceled: 'Cancelada',
    unpaid: 'Não paga',
  };

  return `${subscription.planName || subscription.planId} · ${labels[subscription.status] || subscription.status}`;
}

function subscriptionBadgeClass(tenant) {
  if (tenant.id === 'default' || tenant.subscriptionActive) {
    return 'bg-green-500/15 text-green-300';
  }

  return 'bg-red-500/15 text-red-300';
}

function TenantRow({ tenant, onUpdated }) {
  const [busy, setBusy] = useState(false);
  const storeUrl = buildTenantStoreUrl(tenant.id, {
    protocol: window.location.protocol,
    hostname: window.location.hostname,
    port: window.location.port,
    baseDomains: getTenantBaseDomains(),
  });

  const handleToggleActive = async () => {
    setBusy(true);

    try {
      const updated = await updateTenant(tenant.id, { active: !tenant.active });
      onUpdated({ ...tenant, ...updated });
    } catch (error) {
      alert(error.message);
    } finally {
      setBusy(false);
    }
  };

  const handleSubscriptionPatch = async (patch) => {
    setBusy(true);

    try {
      const result = await updateTenantSubscription(tenant.id, patch);
      onUpdated({
        ...tenant,
        subscription: result.subscription,
        subscriptionActive: result.subscriptionActive,
      });
    } catch (error) {
      alert(error.message);
    } finally {
      setBusy(false);
    }
  };

  const handleSimulateCheckout = async () => {
    setBusy(true);

    try {
      const result = await createBillingCheckout(tenant.id, tenant.subscription?.planId || 'starter');
      onUpdated({
        ...tenant,
        subscription: result.subscription,
        subscriptionActive: true,
      });
    } catch (error) {
      alert(error.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <tr className="border-t border-white/5">
      <td className="px-4 py-3 font-mono text-sm text-brand-200">{tenant.id}</td>
      <td className="px-4 py-3 text-sm text-white">{tenant.name}</td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${subscriptionBadgeClass(tenant)}`}
        >
          {subscriptionLabel(tenant)}
        </span>
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
            tenant.active
              ? 'bg-green-500/15 text-green-300'
              : 'bg-slate-700 text-slate-300'
          }`}
        >
          {tenant.active ? 'Ativa' : 'Inativa'}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-2">
          <a
            href={storeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-white/5"
          >
            Abrir loja
          </a>
          <button
            type="button"
            disabled={busy}
            onClick={handleToggleActive}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-white/5 disabled:opacity-60"
          >
            {tenant.active ? 'Desativar' : 'Ativar'}
          </button>
          {tenant.id !== 'default' && (
            <>
              <button
                type="button"
                disabled={busy}
                onClick={() => handleSubscriptionPatch({ status: 'active', planId: 'starter' })}
                className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-white/5 disabled:opacity-60"
              >
                Ativar plano
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => handleSubscriptionPatch({ status: 'canceled' })}
                className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-white/5 disabled:opacity-60"
              >
                Suspender
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={handleSimulateCheckout}
                className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-white/5 disabled:opacity-60"
              >
                Simular checkout
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

function PlatformDashboard({ onLogout }) {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadTenants = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const rows = await fetchAllTenants();
      setTenants(rows);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTenants();
  }, [loadTenants]);

  const handleTenantCreated = (tenant) => {
    setTenants((current) => {
      const exists = current.some((row) => row.id === tenant.id);
      if (exists) {
        return current.map((row) => (row.id === tenant.id ? tenant : row));
      }
      return [...current, tenant].sort((a, b) => a.id.localeCompare(b.id));
    });
  };

  const handleTenantUpdated = (tenant) => {
    setTenants((current) =>
      current.map((row) => (row.id === tenant.id ? tenant : row))
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 bg-slate-900/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-400">
              Plataforma
            </p>
            <h1 className="text-xl font-extrabold">Gerenciamento de lojas</h1>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/"
              className="rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/5"
            >
              Ver site
            </a>
            <button
              type="button"
              onClick={onLogout}
              className="rounded-xl bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-700"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        <CreateTenantForm onCreated={handleTenantCreated} />

        <section className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70">
          <div className="flex items-center justify-between gap-3 border-b border-white/5 px-5 py-4">
            <div>
              <h2 className="text-sm font-bold text-white">Lojas cadastradas</h2>
              <p className="text-xs text-slate-400">
                Lojas inativas não aparecem na listagem pública da API.
              </p>
            </div>
            <button
              type="button"
              onClick={loadTenants}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-white/5"
            >
              Atualizar
            </button>
          </div>

          {loading ? (
            <p className="px-5 py-8 text-sm text-slate-400">Carregando lojas…</p>
          ) : error ? (
            <p className="px-5 py-8 text-sm text-red-400">{error}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-slate-950/40 text-xs uppercase tracking-wide text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-semibold">ID</th>
                    <th className="px-4 py-3 font-semibold">Nome</th>
                    <th className="px-4 py-3 font-semibold">Assinatura</th>
                    <th className="px-4 py-3 font-semibold">Loja</th>
                    <th className="px-4 py-3 font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {tenants.map((tenant) => (
                    <TenantRow
                      key={tenant.id}
                      tenant={tenant}
                      onUpdated={handleTenantUpdated}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default function PlatformApp() {
  const [authenticated, setAuthenticated] = useState(() => isPlatformAuthenticated());

  const handleLogout = () => {
    logoutPlatform();
    setAuthenticated(false);
  };

  if (!authenticated) {
    return <PlatformLogin onSuccess={() => setAuthenticated(true)} />;
  }

  return <PlatformDashboard onLogout={handleLogout} />;
}
