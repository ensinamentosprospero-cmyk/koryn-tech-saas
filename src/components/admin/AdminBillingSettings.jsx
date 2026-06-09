import { useEffect, useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import {
  createTenantCheckout,
  fetchBillingPlans,
  fetchTenantSubscription,
} from '../../api/billingApi.js';
import Icon from '../Icon';
import { AdminPanel, AdminPanelHeader, StatusPill } from './AdminFormFields';

function formatMoney(cents, currency = 'BRL') {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  }).format((cents || 0) / 100);
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function daysUntil(iso) {
  if (!iso) return null;
  const diff = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

const STATUS_LABELS = {
  trialing: 'Trial gratuito',
  active: 'Plano ativo',
  past_due: 'Pagamento atrasado',
  canceled: 'Cancelado',
  unpaid: 'Não pago',
};

export default function AdminBillingSettings() {
  const { tenantId, isDefaultTenant } = useTenant();
  const [loading, setLoading] = useState(true);
  const [busyPlanId, setBusyPlanId] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [provider, setProvider] = useState('manual');
  const [plans, setPlans] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [subscriptionActive, setSubscriptionActive] = useState(true);

  const loadBilling = async () => {
    setLoading(true);
    setError('');

    try {
      const [plansPayload, subscriptionPayload] = await Promise.all([
        fetchBillingPlans(),
        fetchTenantSubscription(tenantId),
      ]);

      setProvider(plansPayload.provider || 'manual');
      setPlans(plansPayload.plans || []);
      setSubscription(subscriptionPayload.subscription);
      setSubscriptionActive(Boolean(subscriptionPayload.subscriptionActive));
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBilling();
  }, [tenantId]);

  const handleCheckout = async (planId) => {
    setBusyPlanId(planId);
    setError('');
    setMessage('');

    try {
      const result = await createTenantCheckout(tenantId, planId, {
        successUrl: window.location.href,
        cancelUrl: window.location.href,
      });

      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
        return;
      }

      setSubscription(result.subscription);
      setSubscriptionActive(true);
      setMessage(result.message || 'Plano ativado com sucesso.');
    } catch (checkoutError) {
      setError(checkoutError.message);
    } finally {
      setBusyPlanId('');
    }
  };

  if (isDefaultTenant) {
    return (
      <AdminPanel>
        <AdminPanelHeader
          title="Assinatura isenta"
          description="A loja principal da plataforma não exige plano pago."
        />
        <p className="text-sm text-slate-600">
          Esta é a vitrine padrão Koryn Tech. Novas lojas criadas na plataforma entram em trial de 14 dias.
        </p>
      </AdminPanel>
    );
  }

  if (loading) {
    return <p className="text-sm text-slate-500">Carregando assinatura…</p>;
  }

  const trialDays = subscription?.status === 'trialing' ? daysUntil(subscription.trialEndsAt) : null;
  const currentPlanId = subscription?.planId;

  return (
    <div className="space-y-5">
      <AdminPanel>
        <AdminPanelHeader
          title="Situação atual"
          description="Plano, trial e status da sua loja"
        />

        {error && (
          <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        {message && (
          <p className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            {message}
          </p>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">Plano</p>
            <p className="mt-1 text-lg font-extrabold text-slate-900">
              {subscription?.planName || 'Sem plano'}
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">Status</p>
            <div className="mt-2">
              <StatusPill
                active={subscriptionActive}
                label={STATUS_LABELS[subscription?.status] || subscription?.status || 'Indefinido'}
              />
            </div>
          </div>

          {subscription?.status === 'trialing' && (
            <div className="rounded-xl border border-brand-100 bg-brand-50/70 px-4 py-3 sm:col-span-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-700">
                Trial gratuito
              </p>
              <p className="mt-1 text-sm font-semibold text-brand-900">
                {trialDays === 0
                  ? 'Seu trial termina hoje.'
                  : `${trialDays} dia(s) restante(s) — até ${formatDate(subscription.trialEndsAt)}`}
              </p>
            </div>
          )}

          {subscription?.status === 'active' && subscription.currentPeriodEnd && (
            <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3 sm:col-span-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
                Próxima renovação
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                {formatDate(subscription.currentPeriodEnd)}
              </p>
            </div>
          )}
        </div>
      </AdminPanel>

      <AdminPanel>
        <AdminPanelHeader
          title="Planos disponíveis"
          description={
            provider === 'stripe'
              ? 'Pagamento via Stripe Checkout'
              : 'Modo manual — ativação imediata para testes'
          }
        />

        <div className="grid gap-4 sm:grid-cols-2">
          {plans.map((plan) => {
            const isCurrent = currentPlanId === plan.id;
            const busy = busyPlanId === plan.id;

            return (
              <div
                key={plan.id}
                className={`rounded-2xl border p-4 ${
                  isCurrent
                    ? 'border-brand-200 bg-brand-50/50 ring-1 ring-brand-100'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-extrabold text-slate-900">{plan.name}</p>
                    <p className="mt-1 text-2xl font-black text-brand-700">
                      {formatMoney(plan.priceCents, plan.currency)}
                      <span className="text-sm font-semibold text-slate-500">/mês</span>
                    </p>
                  </div>
                  {isCurrent && (
                    <span className="rounded-full bg-brand-600 px-2.5 py-1 text-[10px] font-bold uppercase text-white">
                      Atual
                    </span>
                  )}
                </div>

                <ul className="mt-4 space-y-2 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <Icon name="check" className="h-4 w-4 text-emerald-600" />
                    Loja online com subdomínio
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon name="check" className="h-4 w-4 text-emerald-600" />
                    Painel admin completo
                  </li>
                  {plan.id === 'pro' && (
                    <li className="flex items-center gap-2">
                      <Icon name="star" className="h-4 w-4 text-amber-500" />
                      Prioridade e recursos Pro
                    </li>
                  )}
                </ul>

                <button
                  type="button"
                  disabled={busy || (isCurrent && subscriptionActive)}
                  onClick={() => handleCheckout(plan.id)}
                  className="mt-4 w-full rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busy
                    ? 'Processando…'
                    : isCurrent && subscriptionActive
                      ? 'Plano ativo'
                      : isCurrent
                        ? 'Reativar plano'
                        : `Escolher ${plan.name}`}
                </button>
              </div>
            );
          })}
        </div>
      </AdminPanel>
    </div>
  );
}
