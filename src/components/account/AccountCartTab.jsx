import Icon from '../Icon';

export default function AccountCartTab({
  cartItems,
  cartTotal,
  formatPrice,
  updateCartQuantity,
  removeFromCart,
  checkoutCart,
}) {
  if (cartItems.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-8 text-center">
        <Icon name="shopping" className="mx-auto h-8 w-8 text-slate-400" />
        <p className="mt-3 text-sm font-semibold text-slate-700">Seu carrinho está vazio</p>
        <p className="mt-1 text-sm text-slate-500">Adicione produtos para finalizar no WhatsApp.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ul className="space-y-3">
        {cartItems.map((item) => (
          <li
            key={item.productId}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft"
          >
            <div className="h-36 w-full overflow-hidden rounded-xl bg-slate-100">
              {item.photo ? (
                <img
                  src={item.photo}
                  alt={item.photoAlt || item.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-brand-50 text-brand-700">
                  <Icon name="smartphone" className="h-8 w-8" />
                </div>
              )}
            </div>

            <div className="mt-3">
              <p className="text-sm font-bold text-ink">{item.name}</p>
              <p className="mt-1 text-sm font-extrabold text-brand-800">{item.price}</p>

              <div className="mt-3 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                    aria-label="Diminuir quantidade"
                  >
                    -
                  </button>
                  <span className="min-w-[2rem] text-center text-sm font-bold text-slate-800">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                    aria-label="Aumentar quantidade"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeFromCart(item.productId)}
                  className="w-full rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                >
                  Remover
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-semibold text-slate-600">Total</span>
          <span className="text-lg font-extrabold text-brand-800">{formatPrice(cartTotal)}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={checkoutCart}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-whatsapp px-4 py-3 text-sm font-bold text-white shadow-glow-green transition hover:bg-whatsapp-dark"
      >
        <Icon name="whatsapp" filled className="h-4 w-4" />
        Finalizar no WhatsApp
      </button>
    </div>
  );
}
