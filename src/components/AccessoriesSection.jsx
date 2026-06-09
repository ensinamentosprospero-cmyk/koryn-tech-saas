import { ACCESSORY_ITEMS } from '../data/siteData';
import { createWhatsAppLink } from '../utils/whatsapp';
import Icon from './Icon';
import { Container, Section, SectionHeader, WhatsAppButton } from './UI';

export default function AccessoriesSection() {
  return (
    <Section id="acessorios" className="bg-white" ariaLabel="Acessórios">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-20">
          <div>
            <SectionHeader
              eyebrow="Acessórios"
              title="Acessórios para proteger, carregar e melhorar seu celular"
              subtitle="Temos opções para quem precisa de mais proteção, bateria, praticidade e conforto no uso diário."
              centered={false}
            />

            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              {ACCESSORY_ITEMS.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2.5 rounded-xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50/80 px-3 py-3 shadow-soft transition-all duration-300 hover:border-brand-200/70 hover:shadow-card sm:px-4 sm:py-3.5"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
                    <Icon name="check-circle" className="h-4 w-4" />
                  </div>
                  <span className="text-[13px] font-semibold text-ink sm:text-sm">{item}</span>
                </div>
              ))}
            </div>

            <WhatsAppButton
              href={createWhatsAppLink('Olá, gostaria de ver os acessórios disponíveis.')}
              className="mt-8"
              size="md"
            >
              Ver acessórios no WhatsApp
            </WhatsAppButton>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-brand-200/40 to-indigo-200/30 blur-2xl" />
            <div className="relative aspect-square overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-gradient-to-br from-slate-50 via-white to-brand-50 p-8 shadow-card sm:p-10">
              <div className="absolute inset-0 bg-grid-subtle opacity-40" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(37,84,232,0.12),transparent_55%)]" />

              <div className="relative flex h-full flex-col items-center justify-center">
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {['case', 'film', 'charger', 'headphones'].map((icon, i) => (
                    <div
                      key={icon}
                      className={`flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-2xl bg-white shadow-card ring-premium sm:h-24 sm:w-24 ${
                        i % 2 === 0 ? 'animate-float' : 'animate-float-delayed'
                      }`}
                    >
                      <Icon name={icon} className="h-8 w-8 text-brand-700 sm:h-10 sm:w-10" />
                    </div>
                  ))}
                </div>
                <p className="mt-8 max-w-[220px] text-center text-sm font-semibold leading-relaxed text-muted">
                  Proteção, carregamento e conforto para o dia a dia
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
