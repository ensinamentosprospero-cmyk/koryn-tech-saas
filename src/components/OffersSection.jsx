import { useEffect, useState } from 'react';
import { useSiteConfig } from '../context/SiteConfigContext';
import { offerMessage } from '../utils/whatsapp';
import Icon from './Icon';
import { Container, Section, SectionHeader, SecondaryButton, WhatsAppButton } from './UI';

const AUTO_PLAY_MS = 4000;

function OfferCard({ offer, onDetails, whatsAppLink, onWhatsAppClick }) {
  return (
    <article className="mx-auto grid h-[12.5rem] w-full max-w-3xl grid-cols-[9.75rem_minmax(0,1fr)] overflow-hidden rounded-2xl border border-brand-300/30 bg-white shadow-card sm:h-[16rem] sm:grid-cols-[18rem_minmax(0,1fr)]">
      <div className="relative h-full overflow-hidden bg-slate-100">
        <img
          src={offer.image}
          alt={offer.imageAlt || offer.name}
          className="absolute inset-0 h-full w-full object-cover object-center"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10" />
        {offer.savings && (
          <span className="absolute left-2 top-2 max-w-[calc(100%-0.75rem)] rounded-lg bg-orange-500 px-2 py-1 text-[9px] font-bold uppercase leading-tight tracking-wide text-white shadow-sm sm:left-3 sm:top-3 sm:px-2.5 sm:text-[10px]">
            {offer.savings}
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-col justify-center overflow-hidden p-3 sm:p-5">
        <h3 className="truncate text-base font-bold text-ink sm:text-2xl">{offer.name}</h3>

        <ul className="mt-2 flex min-h-0 flex-wrap gap-1.5 overflow-hidden sm:mt-3 sm:gap-2">
          {offer.includes.map((item) => (
            <li
              key={item}
              className="inline-flex max-w-full items-center gap-1 truncate rounded-full bg-brand-50 px-2 py-1 text-[10px] font-semibold text-brand-900 sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-sm"
            >
              <Icon name="check" className="h-3 w-3 shrink-0 text-green-500 sm:h-3.5 sm:w-3.5" />
              <span className="truncate">{item}</span>
            </li>
          ))}
        </ul>

        <p className="mt-2 shrink-0 text-lg font-extrabold text-brand-800 sm:mt-3 sm:text-3xl">{offer.price}</p>

        <div className="mt-2 flex shrink-0 flex-row items-stretch gap-2 sm:mt-3">
          <WhatsAppButton
            href={whatsAppLink(offerMessage(offer.name))}
            onClick={onWhatsAppClick}
            className="min-w-0 flex-1"
            size="sm"
          >
            Quero este kit
          </WhatsAppButton>
          <SecondaryButton
            type="button"
            onClick={() => onDetails?.(offer)}
            className="shrink-0 px-3 py-2 text-[10px] sm:min-w-[7.5rem] sm:text-xs"
          >
            Detalhes
          </SecondaryButton>
        </div>
      </div>
    </article>
  );
}

export default function OffersSection({ onOfferDetails }) {
  const { activeOffers, copy, whatsAppLink, trackEvent } = useSiteConfig();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    setActiveIndex(0);
  }, [activeOffers.length]);

  useEffect(() => {
    if (activeOffers.length <= 1 || isPaused) return undefined;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % activeOffers.length);
    }, AUTO_PLAY_MS);

    return () => window.clearInterval(timer);
  }, [activeOffers.length, isPaused]);

  if (activeOffers.length === 0) return null;

  const currentOffer = activeOffers[activeIndex];
  const hasMultipleOffers = activeOffers.length > 1;

  const goToPrevious = () => {
    setActiveIndex((current) => (current - 1 + activeOffers.length) % activeOffers.length);
  };

  const goToNext = () => {
    setActiveIndex((current) => (current + 1) % activeOffers.length);
  };

  return (
    <Section
      id="ofertas"
      className="bg-gradient-to-br from-brand-950 via-brand-900 to-slate-950"
      ariaLabel="Ofertas especiais"
    >
      <Container>
        <SectionHeader title={copy.sectionOffers} subtitle={copy.sectionOffersSubtitle} light />

        <div
          className="relative px-10 sm:px-14"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocus={() => setIsPaused(true)}
          onBlur={() => setIsPaused(false)}
        >
          {hasMultipleOffers && (
            <>
              <button
                type="button"
                onClick={goToPrevious}
                aria-label="Ver oferta anterior"
                className="absolute left-0 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white shadow-lg backdrop-blur-md transition hover:bg-white/20 sm:h-11 sm:w-11"
              >
                <Icon name="chevron-left" className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={goToNext}
                aria-label="Ver próxima oferta"
                className="absolute right-0 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white shadow-lg backdrop-blur-md transition hover:bg-white/20 sm:h-11 sm:w-11"
              >
                <Icon name="chevron-right" className="h-5 w-5" />
              </button>
            </>
          )}

          <div className="overflow-hidden">
            <div key={currentOffer.id} className="animate-offer-slide">
              <OfferCard
                offer={currentOffer}
                onDetails={onOfferDetails}
                whatsAppLink={whatsAppLink}
                onWhatsAppClick={() => trackEvent('whatsappClick')}
              />
            </div>
          </div>

          {hasMultipleOffers && (
            <div className="mt-5 flex items-center justify-center gap-2">
              {activeOffers.map((offer, index) => {
                const active = index === activeIndex;

                return (
                  <button
                    key={offer.id}
                    type="button"
                    aria-label={`Ver oferta ${offer.name}`}
                    aria-current={active ? 'true' : undefined}
                    onClick={() => setActiveIndex(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      active ? 'w-7 bg-white' : 'w-2 bg-white/35 hover:bg-white/55'
                    }`}
                  />
                );
              })}
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
}
