import { useSiteConfig } from '../context/SiteConfigContext';
import { useAuth } from '../context/AuthContext';
import Icon from './Icon';

export function WhatsAppButton({
  href,
  children,
  className = '',
  size = 'md',
  variant = 'solid',
  onClick,
  requireAuth = true,
}) {
  const { handleProtectedWhatsAppClick } = useAuth();
  const sizes = {
    sm: 'min-h-[40px] px-3.5 py-2 text-xs gap-1.5',
    md: 'min-h-[44px] px-5 py-2.5 text-sm gap-2',
    lg: 'min-h-[52px] px-7 py-3.5 text-base gap-2.5',
  };

  const variants = {
    solid:
      'bg-whatsapp text-white hover:bg-whatsapp-dark shadow-glow-green ring-1 ring-green-500/20',
    outline:
      'border-2 border-whatsapp/80 bg-white text-green-700 hover:bg-green-50 hover:border-whatsapp',
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(event) => {
        if (requireAuth) {
          handleProtectedWhatsAppClick(event, href, onClick);
          return;
        }
        onClick?.(event);
      }}
      className={`inline-flex items-center justify-center rounded-xl font-bold tracking-tight transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 ${sizes[size]} ${variants[variant]} ${className}`}
    >
      <Icon name="whatsapp" className="w-4 h-4 shrink-0" filled />
      <span>{children}</span>
    </a>
  );
}

export function PrimaryButton({ href, children, className = '', onClick }) {
  const classes = `inline-flex min-h-[44px] items-center justify-center rounded-xl bg-gradient-to-r from-brand-700 to-brand-600 px-6 py-2.5 text-sm font-bold tracking-tight text-white shadow-glow-brand ring-1 ring-brand-500/20 transition-all duration-300 hover:from-brand-800 hover:to-brand-700 hover:-translate-y-0.5 active:translate-y-0 ${className}`;

  if (href) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className={classes}>
      {children}
    </button>
  );
}

export function SecondaryButton({ href, children, className = '', onClick }) {
  const classes = `inline-flex min-h-[40px] items-center justify-center rounded-xl border border-slate-200/90 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-soft ring-premium transition-all duration-300 hover:border-brand-200 hover:bg-brand-50/80 hover:text-brand-800 ${className}`;

  if (href) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className={classes}>
      {children}
    </button>
  );
}

export function SectionEyebrow({ children, light = false }) {
  return (
    <span
      className={`mb-4 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] ${
        light
          ? 'border border-white/15 bg-white/10 text-blue-100 backdrop-blur-sm'
          : 'border border-brand-200/80 bg-brand-50 text-brand-700'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${light ? 'bg-green-400' : 'bg-brand-600'}`} />
      {children}
    </span>
  );
}

export function SectionHeader({
  title,
  subtitle,
  light = false,
  centered = true,
  eyebrow,
  size = 'default',
  gradient = false,
}) {
  const titleSizes = {
    default: 'text-xl sm:text-2xl md:text-3xl',
    large: 'text-3xl sm:text-4xl md:text-[3.25rem] md:leading-none',
  };

  const titleClass = gradient && !light
    ? 'text-gradient-brand'
    : light
      ? 'text-white'
      : 'text-ink';

  return (
    <div
      className={`mb-8 md:mb-10 ${centered ? 'mx-auto max-w-3xl text-center' : 'max-w-2xl text-center md:text-left'}`}
    >
      {eyebrow && <SectionEyebrow light={light}>{eyebrow}</SectionEyebrow>}
      <h2 className={`${titleSizes[size]} font-extrabold tracking-tight ${titleClass}`}>
        {title}
      </h2>
      {subtitle && (
        <p
          className={`mt-4 text-base leading-relaxed sm:text-lg ${
            light ? 'text-blue-100/90' : 'text-muted'
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

export function Container({ children, className = '' }) {
  return (
    <div className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>
  );
}

export function Section({ id, children, className = '', ariaLabel }) {
  return (
    <section
      id={id}
      aria-label={ariaLabel}
      className={`py-10 md:py-14 ${id ? 'scroll-mt-24' : ''} ${className}`}
    >
      {children}
    </section>
  );
}

export function TrustPill({ icon, children, light = false }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold sm:text-sm ${
        light
          ? 'border border-white/10 bg-white/10 text-white/90 backdrop-blur-sm'
          : 'border border-slate-200/80 bg-white text-slate-700 shadow-soft'
      }`}
    >
      {icon}
      {children}
    </span>
  );
}
