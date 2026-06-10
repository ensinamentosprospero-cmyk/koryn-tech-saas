import { useState } from 'react';
import { useSiteConfig } from '../../context/SiteConfigContext';
import Icon from '../Icon';
import {
  AddButton,
  AdminPanel,
  AdminPanelHeader,
  ConfigField,
  ConfigInput,
  ConfigSwitch,
  ConfigTextarea,
  StatusPill,
} from './AdminFormFields';

function EditorCard({ title, subtitle, badge, open, onToggle, onRemove, children }) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border transition ${
        open
          ? 'border-brand-200 bg-white shadow-soft ring-1 ring-brand-500/10'
          : 'border-slate-200/80 bg-white hover:border-slate-300'
      }`}
    >
      <div className="flex items-center gap-2 p-3.5 sm:p-4">
        <button
          type="button"
          onClick={onToggle}
          className="min-w-0 flex-1 text-left"
          aria-expanded={open}
        >
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-bold text-slate-900">{title}</p>
            {badge}
          </div>
          {subtitle && <p className="mt-0.5 truncate text-xs text-slate-500">{subtitle}</p>}
        </button>
        <button
          type="button"
          onClick={onToggle}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200"
          aria-label={open ? 'Recolher' : 'Expandir'}
        >
          <Icon name="chevron" className={`h-4 w-4 transition ${open ? 'rotate-180' : ''}`} />
        </button>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 transition hover:bg-red-100"
            aria-label="Remover"
          >
            <Icon name="close" className="h-4 w-4" />
          </button>
        )}
      </div>
      {open && (
        <div className="space-y-3 border-t border-slate-100 bg-slate-50/40 p-3.5 sm:p-4">
          {children}
        </div>
      )}
    </div>
  );
}

export function AdminOffersEditor() {
  const { offers, updateOffer, addOffer, removeOffer } = useSiteConfig();
  const [openId, setOpenId] = useState(null);

  return (
    <div className="space-y-5">
      <AdminPanel className="bg-gradient-to-r from-orange-50/80 to-white">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-orange-600">
          Ofertas da semana
        </p>
        <p className="mt-1 text-2xl font-extrabold text-slate-900">{offers.length} kits</p>
        <p className="mt-0.5 text-xs text-slate-500">Exibidos no carrossel principal</p>
      </AdminPanel>

      <div className="space-y-2">
        {offers.map((offer) => (
          <EditorCard
            key={offer.id}
            title={offer.name}
            subtitle={offer.price}
            badge={
              offer.highlight ? (
                <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-bold uppercase text-brand-700">
                  Destaque
                </span>
              ) : null
            }
            open={openId === offer.id}
            onToggle={() => setOpenId(openId === offer.id ? null : offer.id)}
            onRemove={() => removeOffer(offer.id)}
          >
            <ConfigSwitch
              label="Visível no site"
              checked={offer.active !== false}
              onChange={(value) => updateOffer(offer.id, { active: value })}
            />
            <ConfigSwitch
              label="Destaque no carrossel"
              checked={Boolean(offer.highlight)}
              onChange={(value) => updateOffer(offer.id, { highlight: value })}
            />
            <ConfigSwitch
              label="Entrega grátis"
              description="Exibe informações de entrega nos detalhes da oferta"
              checked={offer.deliveryEnabled !== false}
              onChange={(value) => updateOffer(offer.id, { deliveryEnabled: value })}
            />
            <ConfigField label="Imagem (URL)">
              <ConfigInput
                value={offer.image || ''}
                onChange={(value) => updateOffer(offer.id, { image: value })}
                placeholder="/offers/kit-carregamento.jpg"
              />
            </ConfigField>
            <ConfigField label="Nome">
              <ConfigInput
                value={offer.name}
                onChange={(value) => updateOffer(offer.id, { name: value, imageAlt: value })}
              />
            </ConfigField>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <ConfigField label="Preço">
                <ConfigInput
                  value={offer.price}
                  onChange={(value) => updateOffer(offer.id, { price: value })}
                />
              </ConfigField>
              <ConfigField label="Etiqueta">
                <ConfigInput
                  value={offer.savings}
                  onChange={(value) => updateOffer(offer.id, { savings: value })}
                />
              </ConfigField>
            </div>
            <ConfigField label="Itens incluídos" hint="Um item por linha">
              <ConfigTextarea
                value={offer.includes.join('\n')}
                onChange={(value) =>
                  updateOffer(offer.id, {
                    includes: value
                      .split('\n')
                      .map((item) => item.trim())
                      .filter(Boolean),
                  })
                }
                rows={4}
              />
            </ConfigField>
            <ConfigField label="Descrição">
              <ConfigTextarea
                value={offer.description}
                onChange={(value) => updateOffer(offer.id, { description: value })}
                rows={3}
              />
            </ConfigField>
          </EditorCard>
        ))}
      </div>

      <AddButton onClick={addOffer}>Adicionar oferta</AddButton>
    </div>
  );
}

export function AdminFaqEditor() {
  const { faqs, updateFaq, addFaq, removeFaq } = useSiteConfig();
  const [openId, setOpenId] = useState(null);

  return (
    <div className="space-y-5">
      <AdminPanel className="bg-gradient-to-r from-violet-50/80 to-white">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-violet-600">
          FAQ
        </p>
        <p className="mt-1 text-2xl font-extrabold text-slate-900">{faqs.length} perguntas</p>
        <p className="mt-0.5 text-xs text-slate-500">Seção de dúvidas frequentes</p>
      </AdminPanel>

      <div className="space-y-2">
        {faqs.map((faq) => (
          <EditorCard
            key={faq.id}
            title={faq.question}
            subtitle={faq.active === false ? 'Oculta no site' : 'Visível no site'}
            open={openId === faq.id}
            onToggle={() => setOpenId(openId === faq.id ? null : faq.id)}
            onRemove={() => removeFaq(faq.id)}
          >
            <ConfigSwitch
              label="Visível no site"
              checked={faq.active !== false}
              onChange={(value) => updateFaq(faq.id, { active: value })}
            />
            <ConfigField label="Pergunta">
              <ConfigInput
                value={faq.question}
                onChange={(value) => updateFaq(faq.id, { question: value })}
              />
            </ConfigField>
            <ConfigField label="Resposta">
              <ConfigTextarea
                value={faq.answer}
                onChange={(value) => updateFaq(faq.id, { answer: value })}
                rows={4}
              />
            </ConfigField>
          </EditorCard>
        ))}
      </div>

      <AddButton onClick={addFaq}>Adicionar pergunta</AddButton>
    </div>
  );
}
