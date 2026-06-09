import { useSiteConfig } from '../../context/SiteConfigContext';
import Icon from '../Icon';
import {
  AdminGrid,
  AdminPanel,
  AdminPanelHeader,
  ProgressRow,
  StatCard,
  StatusPill,
} from './AdminFormFields';

function formatDate(iso) {
  if (!iso) return 'Ainda não registrada';
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AdminDashboard({ onNavigate }) {
  const { dashboardStats, sections, store } = useSiteConfig();

  const sectionLabels = {
    ofertas: 'Ofertas',
    produtos: 'Produtos',
    faq: 'FAQ',
    contato: 'Contato',
  };

  const quickLinks = [
    { id: 'produtos', label: 'Editar produtos', icon: 'tag' },
    { id: 'ofertas', label: 'Editar ofertas', icon: 'star' },
    { id: 'assinatura', label: 'Assinatura', icon: 'star' },
    { id: 'contato', label: 'Atualizar contato', icon: 'whatsapp' },
    { id: 'secoes', label: 'Seções visíveis', icon: 'check' },
  ];

  return (
    <div className="space-y-5">
      <AdminPanel className="overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-brand-950 p-0 text-white ring-0">
        <div className="relative p-5 sm:p-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,84,232,0.35),transparent_55%)]" />
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-300">
                Painel Koryn Tech
              </p>
              <h3 className="mt-2 text-2xl font-extrabold tracking-tight">{store.name}</h3>
              <p className="mt-1 text-sm text-slate-300">{store.tagline}</p>
              <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-200 ring-1 ring-white/10">
                <Icon name="map-pin" className="h-3.5 w-3.5" />
                {store.city}
              </p>
            </div>
            <div className="hidden rounded-2xl bg-white/10 p-3 ring-1 ring-white/10 sm:block">
              <Icon name="smartphone" className="h-8 w-8 text-brand-200" />
            </div>
          </div>
        </div>
      </AdminPanel>

      <AdminGrid>
        <StatCard
          label="Produtos ativos"
          value={dashboardStats.activeProducts}
          hint={`${dashboardStats.totalProducts} no total`}
          accent="brand"
        />
        <StatCard
          label="Ofertas ativas"
          value={dashboardStats.activeOffers}
          hint={`${dashboardStats.totalOffers} cadastradas`}
          accent="orange"
        />
        <StatCard
          label="Perguntas FAQ"
          value={dashboardStats.activeFaqs}
          hint={`${dashboardStats.totalFaqs} configuradas`}
          accent="violet"
        />
        <StatCard
          label="Páginas catálogo"
          value={dashboardStats.catalogPages}
          hint={`${dashboardStats.productsPerPage} produtos por página`}
          accent="green"
        />
      </AdminGrid>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <AdminPanel>
          <AdminPanelHeader
            title="Tráfego local"
            description="Dados salvos neste navegador"
          />
          <AdminGrid cols={2}>
            <StatCard
              label="Visitas"
              value={dashboardStats.analytics.pageViews}
              accent="slate"
            />
            <StatCard
              label="Cliques WhatsApp"
              value={dashboardStats.analytics.whatsAppClicks}
              accent="green"
            />
          </AdminGrid>
          <p className="mt-4 rounded-xl bg-slate-50 px-3 py-2.5 text-xs text-slate-500">
            Última visita: <span className="font-semibold text-slate-700">{formatDate(dashboardStats.analytics.lastVisit)}</span>
          </p>
        </AdminPanel>

        <AdminPanel>
          <AdminPanelHeader
            title="Seções publicadas"
            description={`${dashboardStats.activeSections} de ${dashboardStats.totalSections} visíveis no site`}
          />
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(sections).map(([key, visible]) => (
              <div
                key={key}
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2.5"
              >
                <span className="text-sm font-semibold text-slate-700">{sectionLabels[key]}</span>
                <StatusPill active={visible} label={visible ? 'Ativa' : 'Oculta'} />
              </div>
            ))}
          </div>
        </AdminPanel>
      </div>

      <AdminPanel>
        <AdminPanelHeader title="Produtos por categoria" description="Ativos vs. cadastrados" />
        <div className="space-y-2">
          {dashboardStats.productsByCategory.map(({ category, active, total }) => (
            <ProgressRow key={category} label={category} active={active} total={total} />
          ))}
        </div>
      </AdminPanel>

      <AdminPanel>
        <AdminPanelHeader title="Acesso rápido" description="Ir direto para a configuração" />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {quickLinks.map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => onNavigate?.(link.id)}
              className="group flex flex-col items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50/50 px-3 py-4 text-center transition hover:border-brand-200 hover:bg-brand-50/60"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-soft ring-1 ring-slate-900/[0.04] transition group-hover:bg-brand-600 group-hover:text-white">
                <Icon
                  name={link.icon}
                  className="h-5 w-5 text-brand-700 group-hover:text-white"
                  filled={link.icon === 'whatsapp'}
                />
              </span>
              <span className="text-xs font-bold text-slate-700">{link.label}</span>
            </button>
          ))}
        </div>
      </AdminPanel>

      {dashboardStats.inactiveProducts > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-100">
          <span className="font-bold">{dashboardStats.inactiveProducts} produto(s)</span> oculto(s) no
          catálogo público.
        </div>
      )}
    </div>
  );
}
