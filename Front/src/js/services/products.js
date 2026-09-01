import { fetchApi } from '../api/client.js';
import { PRODUCTS, PRODUCTS_BY_SLUG, PRODUCTS_BY_ID } from '../data/products.js';

/** Map an API product (snake_case, category object) to the frontend shape. */
export function normalizeProduct(p) {
  if (!p) return p;
  const category = typeof p.category === 'object' && p.category !== null ? p.category.slug : p.category;
  const originalPrice = p.originalPrice ?? p.original_price ?? null;
  const price = p.price;
  return {
    ...p,
    id: p.slug ?? String(p.id),
    category,
    originalPrice,
    newArrival: p.newArrival ?? Boolean(p.new_arrival),
    discount:
      p.discount ??
      (originalPrice && originalPrice > price
        ? Math.round(((originalPrice - price) / originalPrice) * 100)
        : 0),
  };
}

/** Pull every page until `limit` items (DRF PageNumberPagination ignores `limit`). */
async function fetchAllPages({ page = 1, limit = 1000, params = '' } = {}) {
  const items = [];
  let url = `/products/?page=${page}${params ? `&${params}` : ''}`;
  while (url && items.length < limit) {
    const data = await fetchApi(url.replace('/api', ''));
    items.push(...data.results);
    url = data.next
      ? data.next.replace(/^https?:\/\/[^/]+\/api/, '')
      : null;
  }
  return items.slice(0, limit);
}

/** Try the API; on any failure, fall back to local demo data. */
async function fromApiOrMock(params, mockPredicate) {
  try {
    const raw = await fetchAllPages({ params });
    if (!raw.length && !mockPredicate) return [];
    if (raw.length) return raw.map(normalizeProduct);
  } catch (e) {
    /* API unavailable → mock fallback below */
  }
  return PRODUCTS.filter(mockPredicate ?? (() => true));
}

export const productService = {
  async getProducts({ page = 1, limit = 20, category = '', brand = '', search = '', ordering = '' } = {}) {
    const parts = [];
    if (category) parts.push(`category__slug=${encodeURIComponent(category)}`);
    if (brand) parts.push(`brand=${encodeURIComponent(brand)}`);
    if (search) parts.push(`search=${encodeURIComponent(search)}`);
    if (ordering) parts.push(`ordering=${encodeURIComponent(ordering)}`);
    const params = parts.join('&');
    const items = await fromApiOrMock(params, (p) =>
      (!category || p.category === category) &&
      (!brand || p.brand === brand) &&
      (!search || `${p.name} ${p.brand} ${p.material} ${p.tags.join(' ')}`.toLowerCase().includes(search.toLowerCase())),
    );
    return { items, total: items.length, page, pages: Math.max(1, Math.ceil(items.length / limit)) };
  },

  async getProduct(slugOrId) {
    if (!slugOrId) return null;
    try {
      const p = await fetchApi(`/products/${slugOrId}/`);
      return normalizeProduct(p);
    } catch (e) {
      return PRODUCTS_BY_SLUG[slugOrId] ?? PRODUCTS_BY_ID[slugOrId] ?? null;
    }
  },

  async getMany(ids) {
    if (!ids.length) return [];
    const all = await fromApiOrMock('');
    const byKey = new Map(all.flatMap((p) => [[p.id, p], [p.slug, p]]));
    const found = [];
    for (const id of ids) {
      const p = byKey.get(id) ?? (await this.getProduct(id));
      if (p) found.push(p);
    }
    return found;
  },

  async getNewArrivals(limit = 8) {
    const items = await fromApiOrMock('new_arrival=true', (p) => p.newArrival);
    return items.slice(0, limit);
  },

  async getFeatured(limit = 8) {
    const items = await fromApiOrMock('featured=true', (p) => p.featured);
    return items.slice(0, limit);
  },

  async getBestSellers(limit = 8) {
    const items = await fromApiOrMock('ordering=-sold', (p) => p.sold > 0);
    items.sort((a, b) => b.sold - a.sold);
    return items.slice(0, limit);
  },

  async getTrending(limit = 10) {
    const items = await fromApiOrMock('ordering=-sold,-rating', (p) => p.sold > 0);
    items.sort((a, b) => b.sold - a.sold || b.rating - a.rating);
    return items.slice(0, limit);
  },

  async getSaleProducts() {
    const items = await fromApiOrMock('', (p) => p.discount > 0);
    return items.filter((p) => p.discount > 0);
  },

  async getByCategory(categoryId, limit = 100) {
    const res = await this.getProducts({ category: categoryId, limit });
    return res.items.slice(0, limit);
  },

  async getRelated(product, limit = 8) {
    if (!product || !product.category) return [];
    const res = await this.getProducts({ category: product.category, limit: limit + 10 });
    return res.items.filter((p) => p.id !== product.id && p.slug !== product.slug).slice(0, limit);
  },

  async search(query) {
    const q = query.trim();
    if (!q) return [];
    const res = await this.getProducts({ search: q });
    return res.items;
  },
};

const REVIEW_AUTHORS = [
  'سارا محمدی', 'نیلوفر رضایی', 'علی کریمی', 'مریم احمدی', 'حسین شریفی',
  'فاطمه حسینی', 'رضا موسوی', 'الهام نوری', 'امیر تهرانی', 'زهرا کاظمی',
  'پریسا صادقی', 'مهدی جعفری', 'شیما عزیزی', 'کاربر مد استایل', 'نگار سلیمی',
];

const POSITIVE_TEXTS = [
  'کیفیت پارچه‌اش واقعاً عالیه، دقیقاً همون‌طوری که در عکس‌ها دیده می‌شه. خیلی راحته و دوختش تمیزه.',
  'بعد از مدت‌ها دنبال یه تیپ این شکلی می‌گشتم و بالاخره پیداش کردم! رنگش هم کاملاً با عکس هماهنگه.',
  'سایزش دقیق بود و اندازه‌ای که سفارش دادم کاملاً اندازه‌م شد. بسته‌بندی هم خیلی شیک بود.',
  'از خرید راضی‌ام؛ جنسش لطیفه و بعد از شست‌وشو هم فرم و رنگش به‌هم نریخت. پیشنهاد می‌کنم.',
  'ارسال سریع بود و محصول دقیقاً مطابق توضیحات. برای مهمانی گرفتم و کلی تعریف شنیدم!',
  'رنگش در واقعیت حتی قشنگ‌تر از عکسه. خیلی وقته دنبال همچین مدلی بودم.',
  'قیمتش نسبت به کیفیت منصفانه‌ست. کیفیت دوخت و پارچه انتظارم رو برآورده کرد.',
  'برای روزمره خیلی مناسبه؛ راحته، شیک‌ه و با هر استایلی ست می‌شه.',
];

const NEUTRAL_TEXTS = [
  'کیفیت خوبه ولی یک سایز بزرگ‌تر از انتظارم بود؛ پیشنهاد می‌کنم یک سایز کوچیک‌تر سفارش بدید.',
  'رنگش کمی روشن‌تر از عکسه ولی در کل از خرید راضی‌ام.',
  'محصول خوبیه، فقط چمدان رسیدنش یه کم طول کشید.',
  'جنسش خوبه ولی دلم می‌خواست تنوع رنگی بیشتری داشته باشه.',
  'قیمتش یه ذرّه بالاست ولی کیفیتش ارزشش رو داره.',
];

const REVIEW_COUNTS = [4, 5, 6, 7];

/* tiny deterministic hash so each product always shows the same reviews */
function seedFrom(str) {
  let h = 2166136261;
  for (const ch of String(str)) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function makeRng(seed) {
  let s = seed || 1;
  return () => {
    s = Math.imul(s ^ (s >>> 15), s | 1);
    s ^= s + Math.imul(s ^ (s >>> 7), s | 61);
    return ((s ^ (s >>> 14)) >>> 0) / 4294967296;
  };
}

const FA_MONTHS = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];

export function getMockReviews(product, count = 4) {
  if (!product?.id) return [];
  const rng = makeRng(seedFrom(product.id));
  const total = REVIEW_COUNTS[Math.floor(rng() * REVIEW_COUNTS.length)];
  const usedAuthors = new Set();
  const reviews = [];

  for (let i = 0; i < total; i++) {
    let author;
    do {
      author = REVIEW_AUTHORS[Math.floor(rng() * REVIEW_AUTHORS.length)];
    } while (usedAuthors.has(author));
    usedAuthors.add(author);

    // mostly positive, in line with product rating
    const positive = rng() < Math.min(0.9, 0.45 + product.rating / 10);
    const textPool = positive ? POSITIVE_TEXTS : NEUTRAL_TEXTS;
    const rating = positive ? (rng() < 0.7 ? 5 : 4) : rng() < 0.5 ? 4 : 3;

    const year = 1402 + Math.floor(rng() * 3);
    const date = `${1 + Math.floor(rng() * 28)} ${FA_MONTHS[Math.floor(rng() * 12)]} ${year}`;

    const color = product.colors?.length
      ? product.colors[Math.floor(rng() * product.colors.length)]
      : null;
    const size = product.sizes?.length
      ? product.sizes[Math.floor(rng() * product.sizes.length)]
      : null;
    const variant = [color, size].filter(Boolean).join(' · ');

    reviews.push({ author, rating, date, text: textPool[Math.floor(rng() * textPool.length)], variant });
  }

  return reviews;
}
