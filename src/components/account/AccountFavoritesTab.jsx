import Icon from '../Icon';
import { SecondaryButton } from '../UI';

export default function AccountFavoritesTab({
  favoriteProducts,
  requestToggleFavorite,
  onOpenProduct,
}) {
  if (favoriteProducts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-8 text-center">
        <Icon name="heart" filled className="mx-auto h-8 w-8 text-slate-400" />
        <p className="mt-3 text-sm font-semibold text-slate-700">Nenhum favorito ainda</p>
        <p className="mt-1 text-sm text-slate-500">Toque no coração nos produtos para salvar aqui.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {favoriteProducts.map((product) => (
        <li
          key={product.id}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft"
        >
          <div className="h-36 w-full overflow-hidden rounded-xl bg-slate-100">
            {product.photo ? (
              <img
                src={product.photo}
                alt={product.photoAlt || product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-brand-50 text-brand-700">
                <Icon name="smartphone" className="h-8 w-8" />
              </div>
            )}
          </div>

          <div className="mt-3">
            <p className="text-sm font-bold text-ink">{product.name}</p>
            <p className="mt-1 text-sm font-extrabold text-brand-800">{product.price}</p>

            <div className="mt-3 flex flex-col gap-2">
              <SecondaryButton
                type="button"
                onClick={() => onOpenProduct?.(product.id)}
                className="w-full"
              >
                Ver produto
              </SecondaryButton>
              <button
                type="button"
                onClick={() => requestToggleFavorite(product.id)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-100"
              >
                <Icon name="heart" filled className="h-4 w-4" />
                Remover dos favoritos
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
