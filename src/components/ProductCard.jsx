import { useSiteConfig } from '../context/SiteConfigContext';
import { useUserData } from '../context/UserDataContext';
import { productMessage } from '../utils/whatsapp';
import Icon from './Icon';
import { SecondaryButton, WhatsAppButton } from './UI';

const badgeColors = {
  blue: 'bg-brand-600/95 text-white',
  green: 'bg-emerald-600/95 text-white',
  orange: 'bg-orange-500/95 text-white',
  purple: 'bg-violet-600/95 text-white',
  slate: 'bg-slate-700/95 text-white',
};

const imageGradients = {
  smartphone: 'from-brand-600 via-brand-700 to-brand-950',
  iphone: 'from-slate-600 via-slate-800 to-slate-950',
  charger: 'from-amber-500 via-orange-500 to-orange-700',
  headphones: 'from-violet-500 via-purple-600 to-purple-900',
  film: 'from-slate-500 via-slate-600 to-slate-800',
  cable: 'from-blue-500 via-indigo-600 to-indigo-900',
  case: 'from-slate-600 via-slate-700 to-slate-900',
  car: 'from-brand-700 via-brand-800 to-slate-900',
};

const imageIcons = {
  smartphone: 'smartphone',
  iphone: 'smartphone',
  charger: 'charger',
  headphones: 'headphones',
  film: 'film',
  cable: 'cable',
  case: 'case',
  car: 'car',
};

export default function ProductCard({ product, onDetails }) {
  const { whatsAppLink, trackEvent } = useSiteConfig();
  const { isFavorite, requestToggleFavorite, requestAddToCart } = useUserData();
  const gradient = imageGradients[product.image] || 'from-brand-600 to-brand-900';
  const icon = imageIcons[product.image] || 'smartphone';
  const badgeClass = badgeColors[product.badgeColor] || badgeColors.blue;
  const favorite = isFavorite(product.id);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-soft transition-all duration-200 hover:border-brand-200 hover:shadow-card">
      <div className={`relative aspect-square overflow-hidden ${product.photo ? 'bg-slate-100' : `bg-gradient-to-br ${gradient}`}`}>
        <span
          className={`absolute left-2 top-2 z-10 rounded-md px-2 py-0.5 text-[9px] font-bold uppercase sm:text-[10px] ${badgeClass}`}
        >
          {product.badge}
        </span>

        <button
          type="button"
          onClick={() => requestToggleFavorite(product.id)}
          className={`absolute right-2 top-2 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-sm transition ${
            favorite ? 'bg-red-500/90 text-white' : 'bg-black/25 text-white hover:bg-black/40'
          }`}
          aria-label={favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        >
          <Icon name="heart" filled={favorite} className="h-4 w-4" />
        </button>

        {product.photo ? (
          <>
            <img
              src={product.photo}
              alt={product.photoAlt || product.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
          </>
        ) : (
          <div className="flex h-full items-center justify-center">
            <Icon
              name={icon}
              className="h-14 w-14 text-white/90 transition-transform group-hover:scale-105 sm:h-16 sm:w-16"
            />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3">
        <h3 className="line-clamp-2 text-sm font-bold leading-snug text-ink">{product.name}</h3>
        <p className="mt-1 line-clamp-1 text-xs text-muted">{product.description}</p>

        <div className="mt-auto pt-3">
          <p className="text-base font-extrabold text-brand-800 sm:text-lg">{product.price}</p>
          <div className="mt-2.5 flex flex-col gap-1.5">
            <WhatsAppButton
              href={whatsAppLink(productMessage(product.name))}
              onClick={() => trackEvent('whatsappClick')}
              size="sm"
              className="w-full"
            >
              Comprar
            </WhatsAppButton>
            <SecondaryButton
              onClick={() => requestAddToCart(product.id)}
              className="w-full py-1.5 text-xs"
            >
              Adicionar ao carrinho
            </SecondaryButton>
            <SecondaryButton
              onClick={() => onDetails?.(product)}
              className="w-full py-1.5 text-xs"
            >
              Detalhes
            </SecondaryButton>
          </div>
        </div>
      </div>
    </article>
  );
}
