import { useEffect, useRef, useState } from 'react';
import Header from './components/Header';
import ProductsSection from './components/ProductsSection';
import ProductSearchResultsPage from './components/ProductSearchResultsPage';
import ProductCategoryResultsPage from './components/ProductCategoryResultsPage';
import ProductCategoryFilters from './components/ProductCategoryFilters';
import PaymentMethodsModal from './components/PaymentMethodsModal';
import ProductModal from './components/ProductModal';
import OfferModal from './components/OfferModal';
import OffersSection from './components/OffersSection';
import FAQ from './components/FAQ';
import FinalCTA from './components/FinalCTA';
import Footer from './components/Footer';
import FloatingWhatsAppButton from './components/FloatingWhatsAppButton';
import LoginModal from './components/LoginModal';
import AccountModal from './components/AccountModal';
import SiteHead from './components/SiteHead';
import { Container } from './components/UI';
import { useSiteConfig } from './context/SiteConfigContext';

export default function App() {
  const { sections, products, offers, trackEvent, subscriptionBlocked, siteBlocked, configReady, categories } =
    useSiteConfig();
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedOfferId, setSelectedOfferId] = useState(null);
  const [paymentItem, setPaymentItem] = useState(null);
  const [productSearchDraft, setProductSearchDraft] = useState('');
  const [searchResultsOpen, setSearchResultsOpen] = useState(false);
  const [submittedSearchQuery, setSubmittedSearchQuery] = useState('');
  const [categoryViewOpen, setCategoryViewOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const selectedProduct = selectedProductId
    ? products.find((product) => product.id === selectedProductId) ?? null
    : null;

  const selectedOffer = selectedOfferId
    ? offers.find((offer) => offer.id === selectedOfferId) ?? null
    : null;

  const pageViewTracked = useRef(false);
  const trackEventRef = useRef(trackEvent);
  trackEventRef.current = trackEvent;

  const overlayOpen = searchResultsOpen || categoryViewOpen;

  useEffect(() => {
    if (pageViewTracked.current) return;
    pageViewTracked.current = true;
    trackEventRef.current('pageView');
  }, []);

  if (configReady && (subscriptionBlocked || siteBlocked)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-soft">
          <h1 className="text-lg font-extrabold text-slate-900">Loja temporariamente indisponível</h1>
          <p className="mt-2 text-sm text-slate-600">
            {siteBlocked
              ? 'Este site está suspenso. Entre em contato com o suporte.'
              : 'A assinatura desta loja não está ativa. Entre em contato com o lojista ou renove o plano.'}
          </p>
        </div>
      </div>
    );
  }

  const handleSearchSubmit = (query) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setSubmittedSearchQuery(trimmed);
    setSearchResultsOpen(true);
    setCategoryViewOpen(false);
    setSelectedCategory(null);
  };

  const handleCloseSearchResults = () => {
    setSearchResultsOpen(false);
  };

  const handleCategoryChange = (category) => {
    if (!category) {
      setCategoryViewOpen(false);
      setSelectedCategory(null);
      return;
    }

    setSelectedCategory(category);
    setCategoryViewOpen(true);
    setSearchResultsOpen(false);
  };

  const handleCloseCategoryView = () => {
    setCategoryViewOpen(false);
    setSelectedCategory(null);
  };

  return (
    <>
      <SiteHead />
      <Header
        searchQuery={productSearchDraft}
        onSearchChange={setProductSearchDraft}
        onSearchSubmit={handleSearchSubmit}
      />

      {sections.produtos && !searchResultsOpen && (
        <div className="fixed inset-x-0 top-[4.25rem] z-40 border-b border-slate-200/80 bg-white py-3 sm:py-4">
          <Container>
            <ProductCategoryFilters
              categories={categories}
              activeCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
            />
          </Container>
        </div>
      )}

      {searchResultsOpen ? (
        <ProductSearchResultsPage
          query={submittedSearchQuery}
          onClose={handleCloseSearchResults}
          onProductDetails={(product) => setSelectedProductId(product.id)}
        />
      ) : categoryViewOpen && selectedCategory ? (
        <ProductCategoryResultsPage
          category={selectedCategory}
          onClose={handleCloseCategoryView}
          onProductDetails={(product) => setSelectedProductId(product.id)}
        />
      ) : (
        <main className="pt-[7.75rem]">
          {sections.ofertas && <OffersSection onOfferDetails={(offer) => setSelectedOfferId(offer.id)} />}
          {sections.produtos && (
            <ProductsSection onProductDetails={(product) => setSelectedProductId(product.id)} />
          )}
          {sections.faq && <FAQ />}
          {sections.contato && <FinalCTA />}
        </main>
      )}
      {!overlayOpen && <Footer />}
      {!overlayOpen && <FloatingWhatsAppButton />}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProductId(null)}
        onShowPayment={setPaymentItem}
      />
      <OfferModal
        offer={selectedOffer}
        onClose={() => setSelectedOfferId(null)}
        onShowPayment={setPaymentItem}
      />
      <PaymentMethodsModal item={paymentItem} onClose={() => setPaymentItem(null)} />
      <LoginModal />
      <AccountModal onOpenProduct={setSelectedProductId} />
    </>
  );
}
