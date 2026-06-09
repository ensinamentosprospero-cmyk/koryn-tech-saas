import { CATEGORIES } from '../data/siteData';
import Icon from './Icon';
import { Container, Section, SectionHeader } from './UI';

export default function CategoriesSection() {
  return (
    <Section id="categorias" ariaLabel="Categorias principais">
      <Container>
        <SectionHeader
          eyebrow="Categorias"
          title="Escolha o que você procura"
          subtitle="Navegue por smartphones, acessórios e produtos selecionados para o seu dia a dia."
        />

        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {CATEGORIES.map((category) => (
            <a
              key={category.id}
              href={category.href}
              className="group relative flex min-h-[168px] flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-4 shadow-soft ring-premium transition-all duration-300 hover:-translate-y-1 hover:border-brand-200/80 hover:shadow-card sm:min-h-[180px] sm:p-5"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-500 to-brand-700 opacity-0 transition-opacity group-hover:opacity-100" />

              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-50 to-brand-100 text-brand-700 ring-1 ring-brand-100 transition-all duration-300 group-hover:from-brand-600 group-hover:to-brand-800 group-hover:text-white group-hover:ring-brand-500/30 group-hover:shadow-glow-brand">
                <Icon name={category.icon} className="h-6 w-6" />
              </div>

              <h3 className="text-[13px] font-bold text-ink sm:text-[15px]">{category.name}</h3>
              <p className="mt-1.5 flex-1 text-[11px] leading-relaxed text-muted sm:text-[13px]">
                {category.description}
              </p>

              <span className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-bold text-brand-700 transition-all group-hover:gap-2 sm:text-xs">
                Ver produtos
                <Icon name="arrow" className="h-3.5 w-3.5 rotate-[-45deg]" />
              </span>
            </a>
          ))}
        </div>
      </Container>
    </Section>
  );
}
