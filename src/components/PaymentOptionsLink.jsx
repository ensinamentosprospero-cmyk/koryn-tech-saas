export default function PaymentOptionsLink({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-4 w-full rounded-lg border border-brand-600 px-4 py-2.5 text-center text-sm font-semibold text-brand-700 underline decoration-brand-600 underline-offset-4 transition hover:bg-brand-50"
    >
      Ver mais opções de pagamento &gt;
    </button>
  );
}
