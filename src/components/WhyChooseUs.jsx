import { WHY_CHOOSE_US } from '../data/siteData';
import Icon from './Icon';
import { Container, Section, SectionHeader } from './UI';

export default function WhyChooseUs() {
  return (
    <Section id="por-que" className="bg-surface" ariaLabel="Por que comprar conosco">
      <Container>
        <SectionHeader title="Por que a Koryn Tech?" />

        <div className="grid gap-3 sm:grid-cols-3">
          {WHY_CHOOSE_US.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-200/90 bg-white p-4 text-center sm:p-5"
            >
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white">
                <Icon name={item.icon} className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-ink">{item.title}</h3>
              <p className="mt-1 text-xs text-muted sm:text-sm">{item.text}</p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
