import { buildTenantStoreUrl, getTenantBaseDomains } from '../tenant/resolveTenant.js';

export default function OnboardingSuccessModal({ data, onClose }) {
  if (!data) return null;

  const storeUrl = buildTenantStoreUrl(data.tenant.id, {
    protocol: window.location.protocol,
    hostname: window.location.hostname,
    port: window.location.port,
    baseDomains: getTenantBaseDomains(),
  });

  const copyText = [
    `Loja: ${data.tenant.name}`,
    `URL: ${storeUrl}`,
    `Admin: ${data.onboarding.ownerEmail}`,
    `Senha: ${data.onboarding.ownerPassword}`,
    `Plano: ${data.onboarding.planName} (trial 14 dias)`,
  ].join('\n');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(copyText);
    } catch {
      // ignore
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 px-4">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">Loja criada</p>
        <h2 className="mt-2 text-xl font-extrabold text-white">{data.tenant.name}</h2>
        <p className="mt-1 text-sm text-slate-400">
          Envie estes dados ao lojista para o primeiro acesso.
        </p>

        <dl className="mt-5 space-y-3 rounded-2xl bg-slate-950/80 p-4 text-sm">
          <div>
            <dt className="text-xs font-semibold text-slate-500">URL da loja</dt>
            <dd className="mt-1 break-all font-mono text-brand-200">{storeUrl}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-slate-500">E-mail admin</dt>
            <dd className="mt-1 font-semibold text-white">{data.onboarding.ownerEmail}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-slate-500">Senha admin</dt>
            <dd className="mt-1 font-mono text-amber-200">{data.onboarding.ownerPassword}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-slate-500">Trial</dt>
            <dd className="mt-1 text-slate-200">
              {data.onboarding.planName} — 14 dias
              {data.onboarding.trialEndsAt
                ? ` (até ${new Date(data.onboarding.trialEndsAt).toLocaleDateString('pt-BR')})`
                : ''}
            </dd>
          </div>
        </dl>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-700"
          >
            Copiar credenciais
          </button>
          <a
            href={storeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-white/5"
          >
            Abrir loja
          </a>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-white/5"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
