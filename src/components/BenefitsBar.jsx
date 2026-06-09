import { BENEFITS } from '../data/siteData';
import Icon from './Icon';
import { Container } from './UI';

export default function BenefitsBar() {
  return (
    <div className="border-y border-slate-200/70 bg-white">
      <Container className="py-4 md:py-5">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
          {BENEFITS.map((benefit) => (
            <div
              key={benefit.title}
              className="flex items-center gap-2.5 rounded-xl bg-slate-50 px-3 py-2.5 md:justify-center md:px-4"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white">
                <Icon name={benefit.icon} className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-ink sm:text-sm">{benefit.title}</span>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
