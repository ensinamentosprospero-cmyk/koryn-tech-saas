import { TESTIMONIALS } from '../data/siteData';
import Icon from './Icon';
import { Container, Section, SectionHeader } from './UI';

function Stars() {
  return (
    <div className="flex gap-0.5 text-amber-400">
      {[...Array(5)].map((_, i) => (
        <Icon key={i} name="star" className="h-4 w-4" filled />
      ))}
    </div>
  );
}

function getInitials(name) {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function Testimonials() {
  return (
    <Section id="avaliacoes" className="bg-surface" ariaLabel="Avaliações de clientes">
      <Container>
        <SectionHeader
          eyebrow="Depoimentos"
          title="O que nossos clientes dizem"
          subtitle="Experiências reais de quem comprou e foi atendido pela nossa equipe."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TESTIMONIALS.map((testimonial) => (
            <blockquote
              key={testimonial.name}
              className="group relative flex h-full flex-col rounded-2xl border border-slate-200/90 bg-white p-5 shadow-soft ring-premium transition-all duration-300 hover:-translate-y-1 hover:shadow-card sm:p-6"
            >
              <span className="absolute right-5 top-4 text-5xl font-serif leading-none text-brand-100 transition-colors group-hover:text-brand-200">
                &ldquo;
              </span>

              <Stars />

              <p className="relative mt-4 flex-1 text-sm leading-relaxed text-slate-700">
                {testimonial.text}
              </p>

              <footer className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-brand-800 text-xs font-bold text-white shadow-sm">
                  {getInitials(testimonial.name)}
                </div>
                <cite className="not-italic">
                  <span className="block text-sm font-extrabold text-ink">{testimonial.name}</span>
                  <span className="mt-0.5 flex items-center gap-1 text-[11px] font-medium text-muted">
                    <Icon name="check-circle" className="h-3.5 w-3.5 text-green-500" />
                    Compra verificada · {testimonial.purchase}
                  </span>
                </cite>
              </footer>
            </blockquote>
          ))}
        </div>
      </Container>
    </Section>
  );
}
