import { useSiteConfig } from '../context/SiteConfigContext';
import Icon from './Icon';

export default function DeliveryBlock({ compact = false }) {
  const { store } = useSiteConfig();

  if (compact) {
    return (
      <div className="flex items-start gap-2.5 rounded-xl border border-emerald-100 bg-emerald-50/80 px-3 py-2.5">
        <Icon name="truck" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
        <div>
          <p className="text-xs font-bold text-emerald-900">{store.deliveryTitle}</p>
          <p className="mt-0.5 text-[11px] leading-snug text-emerald-800">{store.city}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
          <Icon name="truck" className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-bold text-emerald-900">{store.deliveryTitle}</p>
          <p className="mt-1 text-xs leading-relaxed text-emerald-800">{store.deliveryDescription}</p>
          <p className="mt-2 text-xs font-semibold text-emerald-700">{store.city}</p>
        </div>
      </div>
    </div>
  );
}
