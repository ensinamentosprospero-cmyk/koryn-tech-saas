import { useEffect, useMemo, useState } from 'react';
import { useSiteConfig } from '../context/SiteConfigContext';
import ProductCard from './ProductCard';
import Icon from './Icon';
import { Container, Section, SectionHeader } from './UI';

const PAGE_SIZE = 6;

export default function ProductsSection({ onProductDetails }) {
  const { activeProducts, productsPerPage } = useSiteConfig();
  const pageSize = productsPerPage || PAGE_SIZE;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(activeProducts.length / pageSize));

  useEffect(() => {
    setCurrentPage(1);
  }, [pageSize, activeProducts.length]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const visibleProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return activeProducts.slice(start, start + pageSize);
  }, [activeProducts, currentPage, pageSize]);

  return (
    <Section id="produtos" className="bg-white" ariaLabel="Produtos">
      <Container>
        <SectionHeader title="Produtos" size="large" gradient />

        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
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
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
            <p className="text-base font-bold text-ink">Nenhum produto disponível no momento</p>
          </div>
        )}
      </Container>
    </Section>
  );
}
