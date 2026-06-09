import { useSiteConfig } from '../context/SiteConfigContext';
import { useAuth } from '../context/AuthContext';
import Icon from './Icon';

export default function Footer() {
  const { store, messages, whatsAppLink, trackEvent } = useSiteConfig();
  const { handleProtectedWhatsAppClick } = useAuth();
  const currentYear = new Date().getFullYear();
  const whatsappHref = whatsAppLink(messages.general);

  function ContactCard({ icon, label, value, href, onClick, accent = false, protectedLink = false }) {
    const content = (
      <>
        <div
          className={`mx-auto flex h-10 w-10 items-center justify-center rounded-xl ${
            accent ? 'bg-green-500/15 text-green-400' : 'bg-white/5 text-slate-300'
          }`}
        >
          <Icon name={icon} className="h-5 w-5" filled={icon === 'whatsapp'} />
        </div>
        <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
          {label}
        </p>
        <p className={`mt-1 whitespace-pre-line text-sm font-semibold ${accent ? 'text-white' : 'text-slate-200'}`}>
          {value}
        </p>
      </>
    );

    const className =
      'rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-5 text-center transition-colors hover:border-white/15 hover:bg-white/[0.05]';

    if (href) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(event) => {
            if (protectedLink) {
              handleProtectedWhatsAppClick(event, href, onClick);
              return;
            }
            onClick?.(event);
          }}
          className={className}
        >
          {content}
        </a>
      );
    }

    return <div className={className}>{content}</div>;
  }

  return (
    <footer className="border-t border-slate-800/80 bg-slate-950">
      <div className="mx-auto max-w-3xl px-4 py-12 text-center sm:px-6 lg:px-8">
        <div className="flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 shadow-glow-brand">
            <Icon name="smartphone" className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-4 text-xl font-extrabold tracking-tight text-white">{store.name}</h2>
          <p className="mt-1 text-sm font-medium text-brand-300">{store.tagline}</p>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-400">{store.description}</p>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <ContactCard
            icon="whatsapp"
            label="WhatsApp"
            value={store.phoneDisplay}
            href={whatsappHref}
            onClick={() => trackEvent('whatsappClick')}
            protectedLink
            accent
          />
          <ContactCard
            icon="instagram"
            label="Instagram"
            value={store.instagram}
            href={store.instagramUrl}
          />
          <ContactCard icon="map-pin" label="Localização" value={store.city} />
          <ContactCard icon="watch" label="Atendimento" value={store.hours} />
        </div>

        <p className="mt-10 border-t border-slate-800 pt-6 text-xs text-slate-500">
          © {currentYear} {store.name}. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
