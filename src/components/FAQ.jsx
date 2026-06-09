import { useState } from 'react';
import { useSiteConfig } from '../context/SiteConfigContext';
import Icon from './Icon';
import { Container, Section, SectionHeader } from './UI';

function FAQItem({ faq, isOpen, onToggle }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span className="text-sm font-semibold text-ink">{faq.question}</span>
        <Icon
          name="chevron"
          className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <p className="border-t border-slate-100 px-4 pb-3.5 pt-2 text-sm text-muted">{faq.answer}</p>
      )}
    </div>
  );
}

export default function FAQ() {
  const { activeFaqs } = useSiteConfig();
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <Section id="faq" className="bg-surface" ariaLabel="Perguntas frequentes">
      <Container>
        <SectionHeader title="Dúvidas frequentes" />

        <div className="mx-auto max-w-2xl space-y-2">
          {activeFaqs.map((faq, index) => (
            <FAQItem
              key={faq.id}
              faq={faq}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex(openIndex === index ? -1 : index)}
            />
          ))}
        </div>
      </Container>
    </Section>
  );
}
