import { useEffect, useMemo, useState } from 'react';
import { useSiteConfig } from '../context/SiteConfigContext';
import { filterProducts } from '../utils/productFilters';
import Icon from './Icon';
import ProductCard from './ProductCard';
import { Container } from './UI';

const PAGE_SIZE = 6;

export default function ProductCategoryResultsPage({ category, onClose, onProductDetails }) {
  const { activeProducts, productsPerPage } = useSiteConfig();
  const pageSize = productsPerPage || PAGE_SIZE;
  const [currentPage, setCurrentPage] = useState(1);

  const filteredProducts = useMemo(
    () => filterProducts(activeProducts, { category }),
    [activeProducts, category]
  );

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));

  useEffect(() => {
    setCurrentPage(1);
  }, [category, pageSize]);

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
    <div className="fixed inset-x-0 bottom-0 top-[7.75rem] z-30 overflow-y-auto bg-surface">
      <Container className="py-6 sm:py-8">
        <div className="sticky top-0 z-10 mb-4 bg-surface py-1">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 transition hover:text-brand-900"
          >
            <Icon name="chevron-left" className="h-4 w-4" />
            Início
          </button>
        </div>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">{category}</h1>
            <p className="mt-1 text-sm text-muted">
              {filteredProducts.length}{' '}
              {filteredProducts.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
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
            <p className="text-base font-bold text-ink">Nenhum produto nesta categoria</p>
          </div>
        )}
      </Container>
    </div>
  );
}
