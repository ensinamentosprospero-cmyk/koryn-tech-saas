import { HOW_IT_WORKS } from '../data/siteData';
import Icon from './Icon';
import { Container, Section, SectionHeader } from './UI';

export default function HowItWorks() {
  return (
    <Section id="como-comprar" className="bg-white" ariaLabel="Como funciona a compra">
      <Container>
        <SectionHeader title="Como comprar" />

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {HOW_IT_WORKS.map((step) => (
            <div key={step.step} className="rounded-2xl border border-slate-200/90 bg-slate-50 p-4 text-center">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white">
                <Icon name={step.icon} className="h-5 w-5" />
              </div>
              <p className="mt-1 text-[10px] font-bold text-brand-600">Passo {step.step}</p>
              <h3 className="mt-1 text-sm font-bold text-ink">{step.title}</h3>
              <p className="mt-1 text-xs text-muted">{step.text}</p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
