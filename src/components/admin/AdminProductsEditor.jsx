import { useEffect, useMemo, useRef, useState } from 'react';
import { useSiteConfig } from '../../context/SiteConfigContext';
import Icon from '../Icon';
import {
  AdminPanel,
  ConfigField,
  ConfigInput,
  ConfigSwitch,
  ConfigTextarea,
  StatusPill,
} from './AdminFormFields';

const BADGE_COLORS = [
  { id: 'blue', label: 'Destaque', className: 'bg-brand-600' },
  { id: 'green', label: 'Econômico', className: 'bg-emerald-600' },
  { id: 'orange', label: 'Oferta', className: 'bg-orange-500' },
  { id: 'purple', label: 'Novo', className: 'bg-violet-600' },
  { id: 'slate', label: 'Premium', className: 'bg-slate-700' },
];

function ProductPreview({ product }) {
  const { store } = useSiteConfig();
  if (!product) return null;

  const badgeColor =
    BADGE_COLORS.find((color) => color.id === product.badgeColor)?.className || 'bg-brand-600';

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
      <div className="relative aspect-[4/3] bg-slate-100">
        {product.photo ? (
          <img src={product.photo} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-brand-600 to-brand-900">
            <Icon name="smartphone" className="h-12 w-12 text-white/80" />
          </div>
        )}
        <span
          className={`absolute left-2 top-2 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase text-white ${badgeColor}`}
        >
          {product.badge || 'Novo'}
        </span>
      </div>
      <div className="p-3">
        <p className="line-clamp-2 text-sm font-bold text-slate-900">{product.name || 'Nome do produto'}</p>
        <p className="mt-1 line-clamp-2 text-xs text-slate-500">
          {product.description || 'Descrição do produto'}
        </p>
        <p className="mt-2 text-lg font-extrabold text-brand-700">{product.price || 'R$ 0,00'}</p>
        {product.deliveryEnabled !== false && (
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-100">
            <Icon name="truck" className="h-3.5 w-3.5" />
            {store.deliveryTitle}
          </div>
        )}
      </div>
    </div>
  );
}

function ProductListItem({ product, selected, onSelect, onToggleActive }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(product.id)}
      className={`flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition ${
        product.active === false ? 'opacity-55' : ''
      } ${
        selected
          ? 'border-brand-500 bg-brand-50/80 shadow-soft ring-2 ring-brand-500/20'
          : 'border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/80'
      }`}
    >
      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-100">
        {product.photo ? (
          <img src={product.photo} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-200">
            <Icon name="smartphone" className="h-5 w-5 text-slate-400" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-slate-900">{product.name}</p>
        <p className="mt-0.5 truncate text-xs font-semibold text-brand-700">{product.price}</p>
        <p className="mt-0.5 truncate text-[11px] text-slate-500">{product.category}</p>
        {product.deliveryEnabled !== false && (
          <p className="mt-0.5 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600">
            <Icon name="truck" className="h-3 w-3" />
            Entrega
          </p>
        )}
      </div>
      <div
        role="presentation"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => onToggleActive(product.id, product.active === false)}
          className={`inline-flex h-9 w-9 items-center justify-center rounded-lg transition ${
            product.active !== false
              ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
              : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
          }`}
          aria-label={product.active !== false ? 'Ocultar produto' : 'Mostrar produto'}
          title={product.active !== false ? 'Visível no site' : 'Oculto no site'}
        >
          <Icon name="check" className="h-4 w-4" />
        </button>
      </div>
    </button>
  );
}

function ProductEditorForm({ draft, onDraftChange, onSave, saveStatus, onDelete, onBack }) {
  const { categories } = useSiteConfig();

  if (!draft) {
    return (
      <AdminPanel className="flex h-full min-h-[320px] flex-col items-center justify-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
          <Icon name="tag" className="h-7 w-7 text-slate-400" />
        </div>
        <p className="mt-4 text-sm font-bold text-slate-700">Selecione um produto</p>
        <p className="mt-1 max-w-xs text-xs text-slate-500">
          Escolha um item na lista ao lado para editar nome, preço, categoria e mais.
        </p>
      </AdminPanel>
    );
  }

  const patch = (fields) => onDraftChange({ ...draft, ...fields });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-brand-700 lg:hidden"
          >
            <Icon name="chevron-left" className="h-4 w-4" />
            Voltar
          </button>
        )}
        <div className="ml-auto flex items-center gap-2">
          <StatusPill
            active={draft.active !== false}
            label={draft.active !== false ? 'Publicado' : 'Oculto'}
          />
          <button
            type="button"
            onClick={() => {
              if (window.confirm(`Remover "${draft.name}" do catálogo?`)) onDelete(draft.id);
            }}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 text-xs font-bold text-red-700 transition hover:bg-red-100"
          >
            <Icon name="close" className="h-3.5 w-3.5" />
            Excluir
          </button>
        </div>
      </div>

      <AdminPanel>
        <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
          Prévia no site
        </p>
        <ProductPreview product={draft} />
      </AdminPanel>

      <AdminPanel>
        <div className="space-y-4">
          <ConfigSwitch
            label="Publicar no site"
            description="Desligue para ocultar sem excluir"
            checked={draft.active !== false}
            onChange={(value) => patch({ active: value })}
          />

          <ConfigSwitch
            label="Entrega grátis"
            description="Exibe informações de entrega nos detalhes do produto"
            checked={draft.deliveryEnabled !== false}
            onChange={(value) => patch({ deliveryEnabled: value })}
          />

          <ConfigField label="Nome do produto">
            <ConfigInput
              value={draft.name}
              onChange={(value) => patch({ name: value, photoAlt: value })}
              placeholder="Ex: Smartphone Galaxy A15 128GB"
            />
          </ConfigField>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ConfigField label="Preço">
              <ConfigInput
                value={draft.price}
                onChange={(value) => patch({ price: value })}
                placeholder="R$ 999,90"
              />
            </ConfigField>
            <ConfigField label="Selo promocional">
              <ConfigInput
                value={draft.badge}
                onChange={(value) => patch({ badge: value })}
                placeholder="Ex: Mais vendido"
              />
            </ConfigField>
          </div>

          <ConfigField label="Categoria">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const active = draft.category === category;

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => patch({ category })}
                    className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                      active
                        ? 'bg-brand-600 text-white shadow-glow-brand'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </ConfigField>

          <ConfigField
            label="Tipo do selo"
            hint="Escolha o estilo visual conforme a mensagem do produto"
          >
            <div className="flex flex-wrap gap-2">
              {BADGE_COLORS.map((color) => {
                const active = draft.badgeColor === color.id;

                return (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => patch({ badgeColor: color.id })}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                      active
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <span className={`h-2.5 w-2.5 rounded-full ${color.className}`} />
                    {color.label}
                  </button>
                );
              })}
            </div>
          </ConfigField>

          <ConfigField label="Foto (URL)">
            <ConfigInput
              value={draft.photo || ''}
              onChange={(value) => patch({ photo: value, photoAlt: draft.name })}
              placeholder="/products/celulares-1.jpg"
            />
          </ConfigField>

          <ConfigField label="Descrição curta">
            <ConfigTextarea
              value={draft.description}
              onChange={(value) => patch({ description: value })}
              rows={3}
            />
          </ConfigField>

          <ConfigField label="Detalhes" hint="Um item por linha — aparece no modal de detalhes">
            <ConfigTextarea
              value={(draft.details || []).join('\n')}
              onChange={(value) =>
                patch({
                  details: value
                    .split('\n')
                    .map((item) => item.trim())
                    .filter(Boolean),
                })
              }
              rows={4}
            />
          </ConfigField>
        </div>
      </AdminPanel>

      <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
        <p
          className={`text-xs ${
            saveStatus === 'saved'
              ? 'font-semibold text-emerald-600'
              : saveStatus === 'error'
                ? 'font-semibold text-red-600'
                : 'text-slate-400'
          }`}
        >
          {saveStatus === 'saved'
            ? 'Produto salvo!'
            : saveStatus === 'error'
              ? 'Não foi possível salvar'
              : ''}
        </p>
        <button
          type="button"
          onClick={onSave}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white shadow-glow-brand transition hover:bg-brand-700"
        >
          <Icon name="check" className="h-4 w-4" />
          Salvar
        </button>
      </div>
    </div>
  );
}

function cloneProduct(product) {
  if (!product) return null;
  return {
    ...product,
    details: [...(product.details || [])],
  };
}

export default function AdminProductsEditor() {
  const { products, categories, updateProduct, addProduct, removeProduct, saveSettings, registerSaveHandler } =
    useSiteConfig();
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todos');
  const [mobileView, setMobileView] = useState('list');
  const [draft, setDraft] = useState(null);
  const [saveStatus, setSaveStatus] = useState('idle');
  const draftRef = useRef(draft);
  draftRef.current = draft;

  const activeCount = products.filter((product) => product.active !== false).length;

  const filtered = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        categoryFilter === 'Todos' || product.category === categoryFilter;
      const query = search.trim().toLowerCase();
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.price.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [products, search, categoryFilter]);

  const selectedProduct = products.find((product) => product.id === selectedId) || null;
  const savedSnapshot = selectedProduct ? JSON.stringify(selectedProduct) : null;

  useEffect(() => {
    if (selectedId && products.some((product) => product.id === selectedId)) return;
    setSelectedId(filtered[0]?.id ?? products[0]?.id ?? null);
  }, [filtered, products, selectedId]);

  useEffect(() => {
    if (!selectedProduct) {
      setDraft(null);
      return;
    }

    setDraft(cloneProduct(selectedProduct));
  }, [selectedId, savedSnapshot, selectedProduct]);

  useEffect(() => {
    return registerSaveHandler((currentConfig) => {
      const pending = draftRef.current;
      if (!pending) return null;

      const saved = currentConfig.products.find((product) => product.id === pending.id);
      if (!saved) return null;

      const { id, ...fields } = pending;
      const merged = { ...saved, ...fields };

      if (JSON.stringify(saved) === JSON.stringify(merged)) return null;

      return {
        products: currentConfig.products.map((product) =>
          product.id === id ? merged : product
        ),
      };
    });
  }, [registerSaveHandler]);

  useEffect(() => {
    setSaveStatus('idle');
  }, [selectedId]);

  useEffect(() => {
    if (saveStatus === 'idle') return undefined;

    const timer = window.setTimeout(() => {
      setSaveStatus('idle');
    }, 2500);

    return () => window.clearTimeout(timer);
  }, [saveStatus]);

  const handleAddProduct = () => {
    const nextId = Math.max(0, ...products.map((product) => product.id)) + 1;
    addProduct();
    setSelectedId(nextId);
    setMobileView('edit');
  };

  const handleSelect = (id) => {
    setSelectedId(id);
    setMobileView('edit');
  };

  const handleToggleActive = (id, isHidden) => {
    updateProduct(id, { active: isHidden });
  };

  const handleSaveProduct = () => {
    if (!draft) return;

    const saved = saveSettings();
    setSaveStatus(saved ? 'saved' : 'error');
  };

  return (
    <div className="space-y-4">
      <AdminPanel className="p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-600">
              Catálogo
            </p>
            <p className="mt-1 text-2xl font-extrabold text-slate-900">
              {products.length} produtos
              <span className="ml-2 text-base font-bold text-slate-400">
                · {activeCount} publicados
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddProduct}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white shadow-glow-brand transition hover:bg-brand-700"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-white/20 text-xs">
              +
            </span>
            Novo produto
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto]">
          <div className="relative">
            <Icon
              name="search"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nome, categoria ou preço..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
            />
          </div>
          <p className="self-center text-xs font-semibold text-slate-500">
            {filtered.length} resultado(s)
          </p>
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {['Todos', ...categories].map((category) => {
            const active = categoryFilter === category;

            return (
              <button
                key={category}
                type="button"
                onClick={() => setCategoryFilter(category)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition ${
                  active
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </AdminPanel>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(280px,360px)_minmax(0,1fr)] lg:items-start">
        <div className={`space-y-2 ${mobileView === 'edit' ? 'hidden lg:block' : ''}`}>
          {filtered.length > 0 ? (
            filtered.map((product) => (
              <ProductListItem
                key={product.id}
                product={product}
                selected={product.id === selectedId}
                onSelect={handleSelect}
                onToggleActive={handleToggleActive}
              />
            ))
          ) : (
            <AdminPanel className="text-center">
              <p className="text-sm font-semibold text-slate-700">Nenhum produto encontrado</p>
              <p className="mt-1 text-xs text-slate-500">Tente outro filtro ou termo de busca.</p>
            </AdminPanel>
          )}
        </div>

        <div className={`min-w-0 ${mobileView === 'list' ? 'hidden lg:block' : ''}`}>
          <ProductEditorForm
            draft={draft}
            onDraftChange={setDraft}
            onSave={handleSaveProduct}
            saveStatus={saveStatus}
            onDelete={(id) => {
              removeProduct(id);
              setMobileView('list');
            }}
            onBack={() => setMobileView('list')}
          />
        </div>
      </div>
    </div>
  );
}
