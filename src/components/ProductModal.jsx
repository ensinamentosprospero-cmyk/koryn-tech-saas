import { useEffect } from 'react';
import { useSiteConfig } from '../context/SiteConfigContext';
import { useUserData } from '../context/UserDataContext';
import { productMessage } from '../utils/whatsapp';
import DeliveryDetail from './DeliveryBlock';
import Icon from './Icon';
import PaymentOptionsLink from './PaymentOptionsLink';
import { SecondaryButton, WhatsAppButton } from './UI';

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

export default function ProductModal({ product, onClose, onShowPayment }) {
  const { whatsAppLink, trackEvent } = useSiteConfig();
  const { isFavorite, requestToggleFavorite, requestAddToCart } = useUserData();

  useEffect(() => {
    if (!product) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [product, onClose]);

  if (!product) return null;

  const gradient = imageGradients[product.image] || 'from-brand-600 to-brand-900';
  const icon = imageIcons[product.image] || 'smartphone';
  const details = product.details || [product.description];
  const favorite = isFavorite(product.id);

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Fechar detalhes do produto"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
        className="relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border border-slate-200 bg-white shadow-elevated sm:rounded-3xl"
      >
        <div className={`relative h-44 shrink-0 overflow-hidden sm:h-52 ${product.photo ? '' : `bg-gradient-to-br ${gradient}`}`}>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-black/25 text-white backdrop-blur-sm"
            aria-label="Fechar"
          >
            <Icon name="close" className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={() => requestToggleFavorite(product.id)}
            className={`absolute right-16 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-xl backdrop-blur-sm transition ${
              favorite ? 'bg-red-500/90 text-white' : 'bg-black/25 text-white hover:bg-black/40'
            }`}
            aria-label={favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          >
            <Icon name="heart" filled={favorite} className="h-5 w-5" />
          </button>

          <span className="absolute left-4 top-4 z-10 rounded-lg bg-black/25 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
            {product.badge}
          </span>

          {product.photo ? (
            <>
              <img
                src={product.photo}
                alt={product.photoAlt || product.name}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent" />
            </>
          ) : (
            <div className="flex h-full items-center justify-center">
              <Icon name={icon} className="h-20 w-20 text-white/95 sm:h-24 sm:w-24" />
            </div>
          )}
        </div>

        <div className="overflow-y-auto p-5 sm:p-6">
          <h3 id="product-modal-title" className="text-xl font-extrabold tracking-tight text-ink sm:text-2xl">
            {product.name}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">{product.description}</p>

          <div className="mt-5 rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100">
            <p className="text-2xl font-extrabold text-brand-800">{product.price}</p>
            <p className="mt-1 text-xs text-muted">{product.payment}</p>
          </div>

          <div className="mt-5">
            <p className="text-sm font-bold text-ink">Detalhes do produto</p>
            <ul className="mt-3 space-y-2">
              {details.slice(0, 4).map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <Icon name="check-circle" className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                  {item}
                </li>
              ))}
            </ul>
            {product.deliveryEnabled !== false && <DeliveryDetail />}
            <PaymentOptionsLink
              onClick={() =>
                onShowPayment?.({
                  name: product.name,
                  price: product.price,
                  image: product.photo,
                  imageAlt: product.photoAlt,
                })
              }
            />
          </div>

          <div className="mt-6 flex flex-col gap-2.5">
            <WhatsAppButton
              href={whatsAppLink(productMessage(product.name))}
              onClick={() => trackEvent('whatsappClick')}
              className="w-full"
            >
              Comprar no WhatsApp
            </WhatsAppButton>
            <SecondaryButton
              type="button"
              onClick={() => requestAddToCart(product.id)}
              className="w-full"
            >
              Adicionar ao carrinho
            </SecondaryButton>
            <SecondaryButton type="button" onClick={onClose} className="w-full">
              Fechar
            </SecondaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}
