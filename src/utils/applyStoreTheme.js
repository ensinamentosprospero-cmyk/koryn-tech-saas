export function applyStoreTheme(theme = {}) {
  const root = document.documentElement;
  const primary = theme.primaryColor || '#2554e8';
  const secondary = theme.secondaryColor || '#1d42d4';

  root.style.setProperty('--store-brand-600', primary);
  root.style.setProperty('--store-brand-700', secondary);
  root.style.setProperty('--store-brand-800', secondary);
}
