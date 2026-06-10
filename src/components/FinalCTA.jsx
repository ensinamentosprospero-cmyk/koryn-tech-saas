import { useSiteConfig } from '../context/SiteConfigContext';
import { Container, WhatsAppButton } from './UI';

export default function FinalCTA() {
  const { store, messages, copy, whatsAppLink, trackEvent } = useSiteConfig();
  const ctaSubtitle = String(copy.sectionCtaSubtitle || '').replace('{storeName}', store.name);

  return (
    <section id="contato" className="scroll-mt-24 bg-brand-900 py-12 md:py-14" aria-label="Chamada final">
      <Container className="text-center">
        <h2 className="text-2xl font-extrabold text-white sm:text-3xl">{copy.sectionCtaTitle}</h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-blue-100 sm:text-base">{ctaSubtitle}</p>
        <p className="mx-auto mt-2 max-w-md whitespace-pre-line text-xs font-medium text-blue-200/90 sm:text-sm">
          {store.hours}
        </p>
        <WhatsAppButton
          href={whatsAppLink(messages.general)}
          onClick={() => trackEvent('whatsappClick')}
          className="mt-6"
          size="lg"
        >
          {copy.sectionCtaButton}
        </WhatsAppButton>
      </Container>
    </section>
  );
}
