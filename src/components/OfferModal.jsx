import { useEffect } from 'react';
import { useSiteConfig } from '../context/SiteConfigContext';
import { offerMessage } from '../utils/whatsapp';
import DeliveryDetail from './DeliveryBlock';
import Icon from './Icon';
import PaymentOptionsLink from './PaymentOptionsLink';
import { SecondaryButton, WhatsAppButton } from './UI';

export default function OfferModal({ offer, onClose, onShowPayment }) {
  const { whatsAppLink, trackEvent } = useSiteConfig();

  useEffect(() => {
    if (!offer) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [offer, onClose]);

  if (!offer) return null;

  const details = offer.details || offer.includes;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Fechar detalhes da oferta"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="offer-modal-title"
        className="relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border border-slate-200 bg-white shadow-elevated sm:rounded-3xl"
      >
        <div className="relative h-44 shrink-0 overflow-hidden sm:h-52">
          <img
            src={offer.image}
            alt={offer.imageAlt || offer.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-black/25 text-white backdrop-blur-sm"
            aria-label="Fechar"
          >
            <Icon name="close" className="h-5 w-5" />
          </button>

          {offer.savings && (
            <span className="absolute left-4 top-4 rounded-lg bg-orange-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
              {offer.savings}
            </span>
          )}
        </div>

        <div className="overflow-y-auto p-5 sm:p-6">
          <h3 id="offer-modal-title" className="text-xl font-extrabold tracking-tight text-ink sm:text-2xl">
            {offer.name}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">{offer.description}</p>

          <div className="mt-5 rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100">
            <p className="text-2xl font-extrabold text-brand-800">{offer.price}</p>
            <p className="mt-1 text-xs text-muted">Pix, cartão ou dinheiro</p>
          </div>

          <div className="mt-5">
            <p className="text-sm font-bold text-ink">O kit inclui</p>
            <ul className="mt-3 space-y-2">
              {details.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <Icon name="check-circle" className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                  {item}
                </li>
              ))}
            </ul>
            {offer.deliveryEnabled !== false && <DeliveryDetail />}
            <PaymentOptionsLink
              onClick={() =>
                onShowPayment?.({
                  name: offer.name,
                  price: offer.price,
                  image: offer.image,
                  imageAlt: offer.imageAlt,
                })
              }
            />
          </div>

          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
            <WhatsAppButton
              href={whatsAppLink(offerMessage(offer.name))}
              onClick={() => trackEvent('whatsappClick')}
              className="w-full sm:flex-1"
            >
              Quero este kit
            </WhatsAppButton>
            <SecondaryButton type="button" onClick={onClose} className="w-full sm:w-auto">
              Fechar
            </SecondaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}
