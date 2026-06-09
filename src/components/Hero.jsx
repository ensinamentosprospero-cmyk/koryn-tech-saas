import { createWhatsAppLink, generalMessage } from '../utils/whatsapp';
import { STORE } from '../data/siteData';
import { Container, PrimaryButton, WhatsAppButton } from './UI';

export default function Hero() {
  return (
    <section
      id="inicio"
      className="relative overflow-hidden pt-[4.25rem]"
      aria-label="Apresentação principal"
    >
      <div className="absolute inset-0 -z-10 bg-mesh-hero" />
      <div className="absolute -right-32 top-0 -z-10 h-72 w-72 rounded-full bg-brand-400/10 blur-[80px]" />

      <Container className="py-12 md:py-16">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-200/90 bg-white/80 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-700">
            {STORE.heroBadge}
          </span>

          <h1 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight text-ink sm:text-4xl md:text-[2.75rem]">
            {STORE.heroTitleBefore}
            <span className="text-gradient-brand">{STORE.heroTitleHighlight}</span>
            {STORE.heroTitleAfter}
          </h1>

          <p className="mx-auto mt-4 max-w-lg text-base text-muted sm:text-lg">
            {STORE.heroSubtitle}
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <WhatsAppButton href={createWhatsAppLink(generalMessage)} className="w-full sm:w-auto">
              Chamar no WhatsApp
            </WhatsAppButton>
            <PrimaryButton href="#produtos" className="w-full sm:w-auto">
              Ver produtos
            </PrimaryButton>
          </div>
        </div>
      </Container>
    </section>
  );
}
