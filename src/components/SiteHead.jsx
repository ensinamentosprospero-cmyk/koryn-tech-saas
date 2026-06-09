import { useEffect } from 'react';
import { useSiteConfig } from '../context/SiteConfigContext';

export default function SiteHead() {
  const { store } = useSiteConfig();

  useEffect(() => {
    document.title = `${store.name} | Celulares, acessórios e eletrônicos`;

    const description = document.querySelector('meta[name="description"]');
    if (description) {
      description.setAttribute('content', store.description);
    }
  }, [store.name, store.description]);

  return null;
}
