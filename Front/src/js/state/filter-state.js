/* ============================================================
   filter-state — shop filtering/sorting state (single source)
   ============================================================ */
const PRICE_BOUNDS = { min: 0, max: 50_000_000 };

export const DEFAULT_FILTERS = Object.freeze({
  query: '',
  categories: [],
  brands: [],
  colors: [],
  sizes: [],
  materials: [],
  priceMin: PRICE_BOUNDS.min,
  priceMax: PRICE_BOUNDS.max,
  onlyAvailable: false,
  onlyDiscount: false,
  minRating: 0,
  sort: 'newest',
  page: 1,
  perPage: 12,
});

export function createFilterState(initial = {}) {
  let filters = { ...DEFAULT_FILTERS, ...initial };
  const subs = new Set();

  const emit = () =>
    subs.forEach((fn) => fn(filters));

  return {
    get: () => ({ ...filters }),
    patch(partial) {
      const resetPage = !('page' in partial);
      filters = {
        ...filters,
        ...partial,
        ...(resetPage ? { page: 1 } : {}),
      };
      emit();
    },
    toggleIn(listName, value) {
      const list = new Set(filters[listName]);
      list.has(value) ? list.delete(value) : list.add(value);
      this.patch({ [listName]: [...list] });
    },
    setPage(page) {
      filters = { ...filters, page };
      emit();
    },
    reset(keepQuery = true) {
      filters = {
        ...DEFAULT_FILTERS,
        query: keepQuery ? filters.query : '',
        sort: filters.sort,
      };
      emit();
    },
    activeCount() {
      let n = 0;
      ['categories', 'brands', 'colors', 'sizes', 'materials'].forEach(
        (k) => (n += filters[k].length),
      );
      if (filters.onlyAvailable) n++;
      if (filters.onlyDiscount) n++;
      if (filters.minRating > 0) n++;
      if (
        filters.priceMin !== DEFAULT_FILTERS.priceMin ||
        filters.priceMax !== DEFAULT_FILTERS.priceMax
      )
        n++;
      return n;
    },
    subscribe(fn) {
      subs.add(fn);
      return () => subs.delete(fn);
    },
  };
}

/** Client-side filter+sort engine over the product array */
export function applyFilters(products, f) {
  let out = products.filter((p) => {
    if (f.categories.length && !f.categories.includes(p.category)) return false;
    if (f.brands.length && !f.brands.includes(p.brand)) return false;
    if (f.colors.length && !p.colors.some((c) => f.colors.includes(c))) return false;
    if (f.sizes.length && !p.sizes.some((s) => f.sizes.includes(s))) return false;
    if (f.materials.length && !f.materials.some((m) => p.material.includes(m))) return false;
    if (p.price < f.priceMin || p.price > f.priceMax) return false;
    if (f.onlyAvailable && p.stock <= 0) return false;
    if (f.onlyDiscount && !(p.discount > 0)) return false;
    if (f.minRating && p.rating < f.minRating) return false;
    if (f.query) {
      const q = f.query.trim().toLowerCase();
      const hay = `${p.name} ${p.brand} ${p.material} ${p.tags.join(' ')}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  switch (f.sort) {
    case 'popular':
      out.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
      break;
    case 'best-selling':
      out.sort((a, b) => b.sold - a.sold);
      break;
    case 'cheapest':
      out.sort((a, b) => a.price - b.price);
      break;
    case 'expensive':
      out.sort((a, b) => b.price - a.price);
      break;
    case 'most-discount':
      out.sort((a, b) => b.discount - a.discount);
      break;
    default:
      out.sort(
        (a, b) =>
          Number(b.newArrival) - Number(a.newArrival) || b.id.localeCompare(a.id),
      );
  }
  return out;
}
