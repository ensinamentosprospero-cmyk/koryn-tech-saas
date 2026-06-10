import { useEffect, useState } from 'react';
import { createTenant, fetchSiteTemplates } from './platformApi.js';
import OnboardingSuccessModal from './OnboardingSuccessModal.jsx';

export default function CreateTenantForm({ onCreated }) {
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [autoPassword, setAutoPassword] = useState(true);
  const [templateId, setTemplateId] = useState('koryn-electronics-v1');
  const [status, setStatus] = useState('draft');
  const [templates, setTemplates] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [onboarding, setOnboarding] = useState(null);

  useEffect(() => {
    fetchSiteTemplates()
      .then(setTemplates)
      .catch(() => setTemplates([]));
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const result = await createTenant({
        id,
        name,
        ownerEmail,
        ownerPassword: autoPassword ? undefined : ownerPassword,
        templateId,
        status,
        clientName: name,
      });

      setId('');
      setName('');
      setOwnerEmail('');
      setOwnerPassword('');
      setAutoPassword(true);
      onCreated(result.tenant);
      setOnboarding(result);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-white/10 bg-slate-900/70 p-6"
      >
        <h2 className="text-lg font-bold text-white">Nova loja</h2>
        <p className="mt-1 text-sm text-slate-400">
          Cria loja, dono e trial de 14 dias no plano Starter. A URL pública usa{' '}
          <code className="rounded bg-slate-950 px-1.5 py-0.5 text-brand-300">/loja/id</code>.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
              ID da loja
            </span>
            <input
              value={id}
              onChange={(event) => setId(event.target.value.toLowerCase())}
              placeholder="minha-loja"
              className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none ring-brand-500 focus:ring-2"
            />
            <span className="mt-1 block text-[11px] text-slate-500">
              3–32 caracteres: letras minúsculas, números e hífen
            </span>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
              Nome exibido
            </span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Minha Loja de Eletrônicos"
              className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none ring-brand-500 focus:ring-2"
            />
          </label>

          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
              E-mail do dono
            </span>
            <input
              type="email"
              value={ownerEmail}
              onChange={(event) => setOwnerEmail(event.target.value)}
              placeholder="dono@minhaloja.com"
              className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none ring-brand-500 focus:ring-2"
            />
          </label>

          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
              Modelo do site
            </span>
            <select
              value={templateId}
              onChange={(event) => setTemplateId(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none ring-brand-500 focus:ring-2"
            >
              {(templates.length ? templates : [{ id: 'koryn-electronics-v1', name: 'Koryn Eletrônicos' }]).map(
                (template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                )
              )}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
              Status inicial
            </span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none ring-brand-500 focus:ring-2"
            >
              <option value="draft">Rascunho (demonstração)</option>
              <option value="active">Ativo</option>
              <option value="suspended">Suspenso</option>
            </select>
          </label>

          <label className="flex items-center gap-2 sm:col-span-2">
            <input
              type="checkbox"
              checked={autoPassword}
              onChange={(event) => setAutoPassword(event.target.checked)}
              className="rounded border-white/20 bg-slate-950"
            />
            <span className="text-sm text-slate-300">Gerar senha automaticamente</span>
          </label>

          {!autoPassword && (
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                Senha do dono
              </span>
              <input
                type="text"
                value={ownerPassword}
                onChange={(event) => setOwnerPassword(event.target.value)}
                placeholder="Senha forte"
                className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none ring-brand-500 focus:ring-2"
              />
            </label>
          )}
        </div>

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-6 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700 disabled:opacity-60"
        >
          {submitting ? 'Criando loja…' : 'Criar loja com onboarding'}
        </button>
      </form>

      <OnboardingSuccessModal data={onboarding} onClose={() => setOnboarding(null)} />
    </>
  );
}
