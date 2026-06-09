import { useEffect, useMemo, useState } from 'react';
import { PRODUCTS, STORE } from '../data/siteData';
import { filterProducts } from '../utils/productFilters';
import Icon from './Icon';
import ProductCard from './ProductCard';
import ProductCategoryFilters from './ProductCategoryFilters';
import ProductSearchBar from './ProductSearchBar';
import { Container } from './UI';

export default function AllProductsPage({ onBack, onProductDetails }) {
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onBack();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onBack]);

  const filteredProducts = useMemo(
    () => filterProducts(PRODUCTS, { category: activeCategory, searchQuery }),
    [activeCategory, searchQuery]
  );

  const hasActiveFilters = Boolean(activeCategory || searchQuery.trim());

  const clearFilters = () => {
    setActiveCategory(null);
    setSearchQuery('');
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-white">
      <header className="shrink-0 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
        <Container className="py-4">
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={onBack}
              className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-soft transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-800"
              aria-label="Voltar para o site"
            >
              <Icon name="chevron-left" className="h-5 w-5" />
            </button>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800">
                  <Icon name="smartphone" className="h-5 w-5 text-white" />
                </div>
                <div className="min-w-0">
                  <h1 className="truncate text-lg font-extrabold tracking-tight text-ink sm:text-xl">
                    {STORE.name}
                  </h1>
                  <p className="truncate text-xs font-semibold text-brand-600 sm:text-sm">
                    {STORE.tagline}
                  </p>
                </div>
              </div>

              <ProductSearchBar
                id="catalog-search"
                value={searchQuery}
                onChange={setSearchQuery}
                className="mt-4"
              />
            </div>
          </div>
        </Container>
      </header>

      <div className="flex-1 overflow-y-auto">
        <Container className="py-6">
          <div className="mb-6">
            <h2 className="text-center text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
              Todos os produtos
            </h2>
            <p className="mt-2 text-center text-sm text-muted">
              Catálogo completo da {STORE.name}
            </p>
          </div>

          <ProductCategoryFilters
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />

          <div className="mb-5 mt-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted">
              {filteredProducts.length}{' '}
              {filteredProducts.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
              {activeCategory ? ` em ${activeCategory}` : ''}
              {searchQuery.trim() ? ` para "${searchQuery.trim()}"` : ''}
            </p>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm font-semibold text-brand-700 transition hover:text-brand-900"
              >
                Limpar filtros
              </button>
            )}
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} onDetails={onProductDetails} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                <Icon name="search" className="h-5 w-5" />
              </div>
              <p className="mt-4 text-base font-bold text-ink">Nenhum produto encontrado</p>
              <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
                Tente outro termo ou escolha uma categoria diferente.
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="mt-5 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700"
              >
                Limpar filtros
              </button>
            </div>
          )}
        </Container>
      </div>
    </div>
  );
}
