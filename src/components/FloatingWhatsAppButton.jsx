import { useSiteConfig } from '../context/SiteConfigContext';
import { useAuth } from '../context/AuthContext';
import Icon from './Icon';

export default function FloatingWhatsAppButton() {
  const { messages, whatsAppLink, trackEvent } = useSiteConfig();
  const { handleProtectedWhatsAppClick } = useAuth();
  const href = whatsAppLink(messages.general);

  return (
    <a
      href={href}
      onClick={(event) => handleProtectedWhatsAppClick(event, href, () => trackEvent('whatsappClick'))}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-5 z-40 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-whatsapp text-white shadow-glow-green ring-1 ring-green-500/20 transition hover:-translate-y-0.5 hover:bg-whatsapp-dark active:translate-y-0 sm:bottom-6 sm:right-6"
      aria-label="Chamar no WhatsApp"
    >
      <Icon name="whatsapp" className="h-7 w-7" filled />
    </a>
  );
}
