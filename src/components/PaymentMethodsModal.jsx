import { useEffect, useMemo, useState } from 'react';
import {
  buildCreditInstallments,
  formatInstallmentValue,
  formatPrice,
  parsePrice,
} from '../utils/payment';
import Icon from './Icon';

const PAYMENT_METHODS = [
  { id: 'credit', label: 'Cartão de Crédito', icon: 'card' },
  { id: 'pix', label: 'Pix', icon: 'pix' },
];

function PixMark({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2 4 12l8 10 8-10L12 2zm0 3.2L17.8 12 12 18.8 6.2 12 12 5.2z"
      />
    </svg>
  );
}

function MethodIcon({ name, active }) {
  const className = `h-5 w-5 shrink-0 ${active ? 'text-brand-600' : 'text-slate-500'}`;

  if (name === 'pix') return <PixMark className={className} />;
  return <Icon name="card" className={className} />;
}

function ProductSummary({ item }) {
  return (
    <div className="flex gap-3 border-b border-slate-200 pb-4">
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md border border-slate-200 bg-slate-100">
        {item.image ? (
          <img src={item.image} alt={item.imageAlt || item.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-400">
            <Icon name="smartphone" className="h-6 w-6" />
          </div>
        )}
      </div>
      <div className="min-w-0">
        <p className="line-clamp-2 text-sm leading-snug text-slate-700">{item.name}</p>
        <p className="mt-1 text-sm font-semibold text-slate-800">{item.price}</p>
      </div>
    </div>
  );
}

function InstallmentTable({ plans }) {
  return (
    <div className="mt-4">
      <div className="grid grid-cols-[1fr_auto] gap-x-4 border-b border-slate-200 pb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        <span>Qtd parcelas</span>
        <span>Valor total</span>
      </div>
      <div className="max-h-56 overflow-y-auto">
        {plans.map((plan) => (
          <div
            key={plan.installments}
            className="grid grid-cols-[1fr_auto] gap-x-4 border-b border-slate-100 py-2.5 text-sm"
          >
            <span className="text-slate-700">
              {plan.installments}x R$ {formatInstallmentValue(plan.installmentValue)}{' '}
              <span className="text-slate-500">{plan.suffix}</span>
            </span>
            <span className="font-medium text-slate-800">{formatPrice(plan.total)}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-slate-500">*Parcela mínima de R$ 5,00 nas compras com juros.</p>
    </div>
  );
}

function PixContent({ priceLabel }) {
  return (
    <div className="mt-4">
      <p className="text-sm text-slate-500">Pix</p>
      <p className="mt-2 text-3xl font-bold text-brand-600">{priceLabel}</p>
      <p className="mt-1 text-sm text-slate-600">Utilizando o Pix.</p>

      <div className="mt-6 space-y-5 text-sm text-slate-600">
        <div>
          <p className="font-semibold text-slate-800">Como funciona?</p>
          <ol className="mt-2 list-decimal space-y-1 pl-4">
            <li>Finalize a compra pelo WhatsApp.</li>
            <li>Receba o código Pix para pagamento.</li>
            <li>A confirmação é feita rapidamente após o pagamento.</li>
          </ol>
        </div>
        <div>
          <p className="font-semibold text-slate-800">O que é Pix?</p>
          <p className="mt-2 leading-relaxed">
            Pix é um meio de pagamento instantâneo criado pelo Banco Central. Você paga em segundos,
            a qualquer hora, direto pelo app do seu banco.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PaymentMethodsModal({ item, onClose }) {
  const [method, setMethod] = useState('pix');

  useEffect(() => {
    if (!item) return undefined;

    setMethod('pix');

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [item, onClose]);

  const total = useMemo(() => parsePrice(item?.price), [item]);
  const creditPlans = useMemo(() => buildCreditInstallments(total), [total]);

  if (!item) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Fechar formas de pagamento"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-modal-title"
        className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-elevated sm:rounded-2xl"
      >
        <div className="flex items-center justify-between bg-brand-600 px-4 py-3 sm:px-5">
          <h2 id="payment-modal-title" className="text-base font-bold text-white sm:text-lg">
            Formas de pagamento
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-white/90 transition hover:bg-white/10"
            aria-label="Fechar"
          >
            <Icon name="close" className="h-5 w-5" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col sm:flex-row">
          <aside className="shrink-0 border-b border-slate-200 sm:w-56 sm:border-b-0 sm:border-r">
            {PAYMENT_METHODS.map((option) => {
              const active = method === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setMethod(option.id)}
                  className={`flex w-full items-center gap-3 border-b border-slate-100 px-4 py-4 text-left transition sm:px-5 ${
                    active ? 'bg-brand-50/70' : 'hover:bg-slate-50'
                  }`}
                >
                  <MethodIcon name={option.icon} active={active} />
                  <span className={`text-sm ${active ? 'font-semibold text-brand-700' : 'text-slate-700'}`}>
                    {option.label}
                  </span>
                </button>
              );
            })}
          </aside>

          <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
            <ProductSummary item={item} />

            {method === 'pix' && <PixContent priceLabel={item.price} />}
            {method === 'credit' && (
              <div className="mt-4">
                <p className="text-sm text-slate-500">Cartão de Crédito</p>
                <InstallmentTable plans={creditPlans} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
