import { useEffect, useMemo, useState } from 'react';
import { useSiteConfig } from '../context/SiteConfigContext';
import { filterProducts } from '../utils/productFilters';
import Icon from './Icon';
import ProductCard from './ProductCard';
import { Container } from './UI';

const PAGE_SIZE = 6;

export default function ProductSearchResultsPage({ query, onClose, onProductDetails }) {
  const { activeProducts, productsPerPage } = useSiteConfig();
  const pageSize = productsPerPage || PAGE_SIZE;
  const [currentPage, setCurrentPage] = useState(1);

  const filteredProducts = useMemo(
    () => filterProducts(activeProducts, { searchQuery: query }),
    [activeProducts, query]
  );

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));

  useEffect(() => {
    setCurrentPage(1);
  }, [query, pageSize]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const visibleProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  return (
    <div className="fixed inset-x-0 bottom-0 top-[4.25rem] z-40 overflow-y-auto bg-surface">
      <Container className="py-6 sm:py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 transition hover:text-brand-900"
            >
              <Icon name="chevron-left" className="h-4 w-4" />
              Voltar
            </button>
            <h1 className="mt-3 text-2xl font-extrabold text-ink sm:text-3xl">Resultados da busca</h1>
            <p className="mt-1 text-sm text-muted">
              {filteredProducts.length}{' '}
              {filteredProducts.length === 1 ? 'produto encontrado' : 'produtos encontrados'} para{' '}
              <span className="font-semibold text-ink">&quot;{query}&quot;</span>
            </p>
          </div>

          <p className="text-sm text-muted">
            Página {currentPage} de {totalPages}
          </p>
        </div>

        {visibleProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {visibleProducts.map((product) => (
                <ProductCard key={product.id} product={product} onDetails={onProductDetails} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={currentPage === 1}
                  className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Icon name="chevron-left" className="h-4 w-4" />
                  Anterior
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  disabled={currentPage === totalPages}
                  className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Próxima
                  <Icon name="chevron-right" className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center shadow-soft">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
              <Icon name="search" className="h-5 w-5" />
            </div>
            <p className="mt-4 text-base font-bold text-ink">Nenhum produto encontrado</p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
              Tente outro termo na barra de pesquisa.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-5 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700"
            >
              Voltar
            </button>
          </div>
        )}
      </Container>
    </div>
  );
}
