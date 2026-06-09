export function normalizeText(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function filterProducts(products, { category = null, searchQuery = '' } = {}) {
  const query = normalizeText(searchQuery);

  return products.filter((product) => {
    const matchesCategory = !category || product.category === category;

    if (!query) return matchesCategory;

    const searchable = normalizeText(
      [product.name, product.description, product.category, ...(product.details || [])].join(' ')
    );

    return matchesCategory && searchable.includes(query);
  });
}
