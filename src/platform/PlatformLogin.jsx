import { useState } from 'react';
import { loginPlatform } from './platformAuth.js';

export default function PlatformLogin({ onSuccess }) {
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
