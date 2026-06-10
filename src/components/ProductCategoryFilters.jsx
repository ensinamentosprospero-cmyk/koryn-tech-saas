export default function ProductCategoryFilters({ categories = [], activeCategory, onCategoryChange }) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {categories.map((tag) => {
        const isActive = activeCategory === tag;

        return (
          <button
            key={tag}
            type="button"
            aria-pressed={isActive}
            onClick={() => onCategoryChange(tag)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 ${
              isActive
                ? 'border-brand-600 bg-brand-600 text-white shadow-glow-brand'
                : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-brand-200 hover:bg-brand-50 hover:text-brand-800'
            }`}
          >
            {tag}
          </button>
        );
      })}
    </div>
  );
}
