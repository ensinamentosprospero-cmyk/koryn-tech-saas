import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Icon from './Icon';

export default function LoginModal() {
  const { loginOpen, closeLogin, login, register, completeLogin, rememberLogin, loadSavedLogin } =
    useAuth();
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loginOpen) return undefined;

    setMode('signin');
    setConfirmPassword('');
    setError('');

    const saved = loadSavedLogin();
    setEmail(saved?.email || '');
    setPassword(saved?.password || '');
    setRemember(saved?.remember !== false);

    const onKeyDown = (event) => {
      if (event.key === 'Escape') closeLogin();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [closeLogin, loadSavedLogin, loginOpen]);

  if (!loginOpen) return null;

  const handleSignIn = async (event) => {
    event.preventDefault();

    const role = await login(email, password);
    if (!role) {
      setError('E-mail ou senha incorretos.');
      return;
    }

    rememberLogin(email, password, remember);
    setConfirmPassword('');
    setError('');
    completeLogin(role);
  };

  const handleRegister = async (event) => {
    event.preventDefault();

    const result = await register(email, password, confirmPassword);
    if (!result.ok) {
      setError(result.error);
      return;
    }

    rememberLogin(email, password, remember);
    setConfirmPassword('');
    setError('');
    completeLogin('user');
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        onClick={closeLogin}
        aria-label="Fechar login"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-modal-title"
        className="relative w-full max-w-md overflow-hidden rounded-t-3xl border border-slate-200 bg-white shadow-elevated sm:rounded-3xl"
      >
        <div className="bg-gradient-to-br from-brand-700 via-brand-600 to-brand-900 px-5 pb-5 pt-6 text-white sm:px-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/70">Conta</p>
              <h2 id="login-modal-title" className="mt-1 text-xl font-extrabold tracking-tight">
                {mode === 'signin' ? 'Entrar' : 'Criar conta'}
              </h2>
              <p className="mt-2 text-sm text-white/85">
                {mode === 'signin'
                  ? 'Entre com sua conta existente. Administradores vão para a dashboard.'
                  : 'Crie uma conta para falar com a loja pelo WhatsApp.'}
              </p>
            </div>
            <button
              type="button"
              onClick={closeLogin}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20"
              aria-label="Fechar"
            >
              <Icon name="close" className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="border-b border-slate-100 px-5 pt-4 sm:px-6">
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setError('');
              }}
              className={`rounded-lg px-3 py-2 text-sm font-bold transition ${
                mode === 'signin'
                  ? 'bg-white text-brand-700 shadow-soft'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError('');
              }}
              className={`rounded-lg px-3 py-2 text-sm font-bold transition ${
                mode === 'register'
                  ? 'bg-white text-brand-700 shadow-soft'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Criar conta
            </button>
          </div>
        </div>

        {mode === 'signin' ? (
          <form onSubmit={handleSignIn} className="space-y-4 px-5 py-5 sm:px-6">
            <div>
              <label htmlFor="login-email" className="mb-1.5 block text-sm font-semibold text-slate-800">
                E-mail
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (error) setError('');
                }}
                autoComplete="username"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label htmlFor="login-password" className="mb-1.5 block text-sm font-semibold text-slate-800">
                Senha
              </label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  if (error) setError('');
                }}
                autoComplete="current-password"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
                placeholder="Digite sua senha"
              />
              {error && <p className="mt-2 text-sm font-semibold text-red-600">{error}</p>}
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={remember}
                onChange={(event) => setRemember(event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              Lembrar meu login e senha neste navegador
            </label>

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-bold text-white shadow-glow-brand transition hover:bg-brand-700"
            >
              <Icon name="check" className="h-4 w-4" />
              Entrar
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4 px-5 py-5 sm:px-6">
            <div>
              <label htmlFor="register-email" className="mb-1.5 block text-sm font-semibold text-slate-800">
                E-mail
              </label>
              <input
                id="register-email"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (error) setError('');
                }}
                autoComplete="email"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label htmlFor="register-password" className="mb-1.5 block text-sm font-semibold text-slate-800">
                Senha
              </label>
              <input
                id="register-password"
                type="password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  if (error) setError('');
                }}
                autoComplete="new-password"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
                placeholder="Crie uma senha"
              />
            </div>

            <div>
              <label
                htmlFor="register-confirm-password"
                className="mb-1.5 block text-sm font-semibold text-slate-800"
              >
                Confirmar senha
              </label>
              <input
                id="register-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(event.target.value);
                  if (error) setError('');
                }}
                autoComplete="new-password"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
                placeholder="Repita a senha"
              />
              {error && <p className="mt-2 text-sm font-semibold text-red-600">{error}</p>}
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={remember}
                onChange={(event) => setRemember(event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              Lembrar meu login e senha neste navegador
            </label>

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-bold text-white shadow-glow-brand transition hover:bg-brand-700"
            >
              <Icon name="check" className="h-4 w-4" />
              Criar conta
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
