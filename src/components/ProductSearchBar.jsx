import { useState } from 'react';
import Icon from './Icon';

export default function ProductSearchBar({
  id = 'product-search',
  value,
  onChange,
  onSubmit,
  className = '',
  variant = 'default',
}) {
  const [focused, setFocused] = useState(false);
  const isHeader = variant === 'header';
  const hasValue = Boolean(value.trim());
  const showLeftSearch = !focused;
  const showRightSearch = focused && hasValue;

  const submitSearch = () => {
    if (!hasValue) return;
    onSubmit?.(value.trim());
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      submitSearch();
    }
  };

  const iconButtonClass = isHeader
    ? 'right-2 flex h-7 w-7 items-center justify-center rounded-lg text-brand-600 transition hover:bg-brand-50'
    : 'right-3 flex h-8 w-8 items-center justify-center rounded-xl text-brand-600 transition hover:bg-brand-50';

  const leftIconClass = isHeader
    ? 'left-3 flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-brand-600'
    : 'left-4 flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-brand-600';

  return (
    <div className={`relative ${className}`}>
      <label htmlFor={id} className="sr-only">
        Buscar produtos
      </label>

      {showLeftSearch &&
        (hasValue ? (
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={submitSearch}
            className={`absolute top-1/2 -translate-y-1/2 ${leftIconClass}`}
            aria-label="Buscar produtos"
          >
            <Icon name="search" className={isHeader ? 'h-4 w-4' : 'h-5 w-5'} />
          </button>
        ) : (
          <Icon
            name="search"
            className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-slate-400 ${
              isHeader ? 'left-3 h-4 w-4' : 'left-4 h-5 w-5'
            }`}
          />
        ))}

      {showRightSearch && (
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={submitSearch}
          className={`absolute top-1/2 -translate-y-1/2 ${iconButtonClass}`}
          aria-label="Buscar produtos"
        >
          <Icon name="search" className={isHeader ? 'h-4 w-4' : 'h-5 w-5'} />
        </button>
      )}

      <input
        id={id}
        type="text"
        inputMode="search"
        enterKeyHint="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={handleKeyDown}
        placeholder={isHeader ? 'Buscar produtos...' : 'Buscar celular, fone, cabo, película...'}
        className={`w-full border border-slate-200 bg-slate-50 text-ink shadow-soft outline-none transition-all placeholder:text-slate-400 focus:border-brand-300 focus:bg-white focus:ring-4 focus:ring-brand-100 ${
          isHeader
            ? `rounded-xl py-2 text-sm ${showLeftSearch ? 'pl-9' : 'pl-3'} ${showRightSearch ? 'pr-9' : 'pr-3'}`
            : `rounded-2xl py-3.5 text-sm ${showLeftSearch ? 'pl-12' : 'pl-4'} ${showRightSearch ? 'pr-12' : 'pr-4'}`
        }`}
      />
    </div>
  );
}
