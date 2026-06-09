import { SERVICES } from '../data/siteData';
import { createWhatsAppLink, serviceMessage } from '../utils/whatsapp';
import Icon from './Icon';
import { Container, Section, SectionHeader, WhatsAppButton } from './UI';

export default function ServicesSection() {
  return (
    <Section id="assistencia" className="bg-surface" ariaLabel="Assistência e serviços">
      <Container>
        <SectionHeader
          eyebrow="Suporte"
          title="Também ajudamos você com suporte e orientação"
          subtitle="Precisa de ajuda para escolher o produto certo ou configurar seu novo aparelho? Nossa equipe orienta você de forma simples e prática."
        />

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service) => (
            <div
              key={service}
              className="group flex items-start gap-4 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-soft ring-premium transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-200/70 hover:shadow-card sm:p-5"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 text-white shadow-sm">
                <Icon name="check-circle" className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold leading-snug text-ink sm:text-[15px]">{service}</h3>
                <a
                  href={createWhatsAppLink(serviceMessage(service))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-brand-700 transition-colors hover:text-brand-800 sm:text-sm"
                >
                  Solicitar pelo WhatsApp
                  <Icon name="arrow" className="h-3 w-3 rotate-[-45deg]" />
                </a>
              </div>
            </div>
          ))}
        </div>

        <p className="mx-auto mt-8 max-w-2xl rounded-xl border border-slate-200/80 bg-white px-4 py-3 text-center text-xs font-medium text-muted shadow-soft sm:text-sm">
          Serviços básicos de orientação e suporte. Não realizamos manutenção técnica avançada.
        </p>

        <div className="mt-8 text-center">
          <WhatsAppButton href={createWhatsAppLink('Olá, preciso de ajuda com um serviço. Pode me atender?')}>
            Falar com atendente
          </WhatsAppButton>
        </div>
      </Container>
    </Section>
  );
}
