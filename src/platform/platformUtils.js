const SITE_STATUS_LABELS = {
  draft: 'Rascunho',
  active: 'Ativo',
  suspended: 'Suspenso',
};

export function siteStatusLabel(status) {
  return SITE_STATUS_LABELS[status] || status || '—';
}

export function siteStatusBadgeClass(status) {
  if (status === 'active') return 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/20';
  if (status === 'draft') return 'bg-amber-500/15 text-amber-300 ring-amber-500/20';
  return 'bg-red-500/15 text-red-300 ring-red-500/20';
}

const SUBSCRIPTION_STATUS_LABELS = {
  trialing: 'Trial',
  active: 'Ativa',
  past_due: 'Atrasada',
  canceled: 'Cancelada',
  unpaid: 'Não paga',
};

const PLAN_PRICES = {
  starter: 4990,
  pro: 9990,
};

export function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatMoney(cents, currency = 'BRL') {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  }).format((cents || 0) / 100);
}

export function daysUntil(iso) {
  if (!iso) return null;
  const diff = new Date(iso).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function subscriptionLabel(tenant) {
  if (tenant.id === 'default') return 'Isenta';

  const subscription = tenant.subscription;
  if (!subscription) return 'Sem plano';

  const status = SUBSCRIPTION_STATUS_LABELS[subscription.status] || subscription.status;
  return `${subscription.planName || subscription.planId} · ${status}`;
}

export function subscriptionBadgeClass(tenant) {
  if (tenant.id === 'default' || tenant.subscriptionActive) {
    return 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/20';
  }

  return 'bg-red-500/15 text-red-300 ring-red-500/20';
}

export function storeBadgeClass(active) {
  return active
    ? 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/20'
    : 'bg-slate-700/80 text-slate-300 ring-white/5';
}

export function computePlatformStats(tenants) {
  const billable = tenants.filter((tenant) => tenant.id !== 'default');
  const activeStores = billable.filter((tenant) => tenant.active);
  const trialing = billable.filter((tenant) => tenant.subscription?.status === 'trialing');
  const paidActive = billable.filter(
    (tenant) =>
      tenant.subscriptionActive &&
      tenant.subscription?.status === 'active' &&
      tenant.active
  );
  const blocked = billable.filter((tenant) => !tenant.subscriptionActive && tenant.active);
  const inactiveStores = billable.filter((tenant) => !tenant.active);

  const estimatedMrr = paidActive.reduce((total, tenant) => {
    const planId = tenant.subscription?.planId || 'starter';
    return total + (PLAN_PRICES[planId] || PLAN_PRICES.starter);
  }, 0);

  const trialsExpiringSoon = billable
    .filter((tenant) => {
      const days = daysUntil(tenant.subscription?.trialEndsAt);
      return tenant.subscription?.status === 'trialing' && days !== null && days >= 0 && days <= 7;
    })
    .sort(
      (a, b) =>
        new Date(a.subscription.trialEndsAt).getTime() -
        new Date(b.subscription.trialEndsAt).getTime()
    );

  const recentStores = [...billable]
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 5);

  return {
    total: billable.length,
    activeStores: activeStores.length,
    trialing: trialing.length,
    paidActive: paidActive.length,
    blocked: blocked.length,
    inactiveStores: inactiveStores.length,
    estimatedMrr,
    trialsExpiringSoon,
    recentStores,
  };
}

export function filterTenants(tenants, { search = '', filter = 'all' }) {
  const query = search.trim().toLowerCase();

  return tenants.filter((tenant) => {
    if (filter === 'active' && !tenant.active) return false;
    if (filter === 'inactive' && tenant.active) return false;
    if (filter === 'trial' && tenant.subscription?.status !== 'trialing') return false;
    if (filter === 'paid' && tenant.subscription?.status !== 'active') return false;
    if (filter === 'blocked' && (tenant.subscriptionActive || !tenant.active)) return false;

    if (!query) return true;

    return (
      tenant.id.toLowerCase().includes(query) ||
      tenant.name.toLowerCase().includes(query) ||
      String(tenant.ownerEmail || '')
        .toLowerCase()
        .includes(query)
    );
  });
}
