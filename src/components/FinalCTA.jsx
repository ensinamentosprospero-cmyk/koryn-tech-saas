import { useSiteConfig } from '../context/SiteConfigContext';
import { Container, WhatsAppButton } from './UI';

export default function FinalCTA() {
  const { store, messages, whatsAppLink, trackEvent } = useSiteConfig();

  return (
    <section id="contato" className="scroll-mt-24 bg-brand-900 py-12 md:py-14" aria-label="Chamada final">
      <Container className="text-center">
        <h2 className="text-2xl font-extrabold text-white sm:text-3xl">Pronto para comprar?</h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-blue-100 sm:text-base">
          Fale com a {store.name} pelo WhatsApp.
        </p>
        <p className="mx-auto mt-2 max-w-md whitespace-pre-line text-xs font-medium text-blue-200/90 sm:text-sm">
          {store.hours}
        </p>
        <WhatsAppButton
          href={whatsAppLink(messages.general)}
          onClick={() => trackEvent('whatsappClick')}
          className="mt-6"
          size="lg"
        >
          Chamar no WhatsApp
        </WhatsAppButton>
      </Container>
    </section>
  );
}
