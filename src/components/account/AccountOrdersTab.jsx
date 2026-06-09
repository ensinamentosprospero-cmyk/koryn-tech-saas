import { formatPrice } from '../../utils/payment';
import Icon from '../Icon';
import { SecondaryButton } from '../UI';

function formatOrderDate(value) {
  try {
    return new Date(value).toLocaleString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return value;
  }
}

export default function AccountOrdersTab({ orders, onOpenProduct, onRepeatOrder }) {
  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-8 text-center">
        <Icon name="shopping" className="mx-auto h-8 w-8 text-slate-400" />
        <p className="mt-3 text-sm font-semibold text-slate-700">Nenhum pedido ainda</p>
        <p className="mt-1 text-sm text-slate-500">Seus pedidos finalizados no WhatsApp aparecerão aqui.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {orders.map((order) => (
        <li
          key={order.id}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft"
        >
          <div>
            <p className="text-sm font-bold text-ink">Pedido #{order.id.slice(-6)}</p>
            <p className="mt-1 text-xs text-slate-500">{formatOrderDate(order.createdAt)}</p>
            <span className="mt-2 inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-emerald-700">
              {order.status}
            </span>
          </div>

          <ul className="mt-3 space-y-2">
            {order.items.map((item) => (
              <li
                key={`${order.id}-${item.productId}`}
                className="rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2"
              >
                <p className="text-sm text-slate-700">
                  {item.quantity}x {item.name}
                </p>
                <p className="mt-1 text-xs font-semibold text-brand-800">{item.price}</p>
                {onOpenProduct && (
                  <button
                    type="button"
                    onClick={() => onOpenProduct(item.productId)}
                    className="mt-2 text-xs font-bold text-brand-700 transition hover:text-brand-900"
                  >
                    Ver produto
                  </button>
                )}
              </li>
            ))}
          </ul>

          <p className="mt-3 text-sm font-extrabold text-brand-800">
            Total: {formatPrice(order.total)}
          </p>

          <SecondaryButton
            type="button"
            onClick={() => onRepeatOrder?.(order.id)}
            className="mt-3 w-full"
          >
            Repetir pedido
          </SecondaryButton>
        </li>
      ))}
    </ul>
  );
}
