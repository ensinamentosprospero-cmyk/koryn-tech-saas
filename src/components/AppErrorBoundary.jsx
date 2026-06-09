import { Component } from 'react';
import { clearStoreConfig } from '../data/storeConfigRepository';
import { resolveTenantId } from '../tenant/resolveTenant';

export default class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error('Erro ao carregar o site:', error);
    try {
      clearStoreConfig(resolveTenantId());
    } catch {
      // ignore
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
          <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-soft">
            <h1 className="text-lg font-extrabold text-slate-900">Não foi possível carregar o site</h1>
            <p className="mt-2 text-sm text-slate-600">
              Os dados salvos neste navegador estavam corrompidos. Clique abaixo para recarregar com as
              configurações padrão.
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              className="mt-5 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-700"
            >
              Recarregar site
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
