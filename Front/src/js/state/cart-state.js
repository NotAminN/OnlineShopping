/* ============================================================
   cart-state — observable cart store, persisted to localStorage.
   Future: every mutation mirrors a REST call via cartService.
   ============================================================ */
import { storage, STORAGE_KEYS } from '../utils/storage.js';
import { bus } from '../utils/helpers.js';

let items = storage.get(STORAGE_KEYS.cart, []);

const persist = () => {
  storage.set(STORAGE_KEYS.cart, items);
  bus.emit('cart:changed', items);
};

const itemKey = (productId, color, size) => `${productId}|${color}|${size}`;

export const cartState = {
  getItems: () => structuredClone(items),

  find(productId, color, size) {
    return items.find((i) => i.key === itemKey(productId, color, size)) ?? null;
  },

  count() {
    return items.reduce((s, i) => s + i.qty, 0);
  },

  add(product, { color, size, qty = 1 } = {}) {
    const key = itemKey(product.id, color ?? '', size ?? '');
    const existing = items.find((i) => i.key === key);
    if (existing) {
      existing.qty = Math.min(existing.qty + qty, 10);
    } else {
      items.push({
        key,
        productId: product.id,
        slug: product.slug,
        name: product.name,
        image: product.images[0],
        category: product.category,
        brand: product.brand,
        color: color ?? product.colors?.[0] ?? '',
        size: size ?? product.sizes?.[0] ?? '',
        price: product.price,
        originalPrice: product.originalPrice,
        qty: Math.min(qty, 10),
        stock: product.stock,
      });
    }
    persist();
    bus.emit('cart:added', { product, qty });
  },

  updateQty(key, delta) {
    const item = items.find((i) => i.key === key);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) items = items.filter((i) => i.key !== key);
    else if (item.qty > 10) item.qty = 10;
    persist();
  },

  setQty(key, qty) {
    const item = items.find((i) => i.key === key);
    if (!item) return;
    item.qty = Math.max(1, Math.min(10, qty));
    persist();
  },

  remove(key) {
    items = items.filter((i) => i.key !== key);
    persist();
  },

  clear() {
    items = [];
    persist();
  },

  totals() {
    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    const savings = items.reduce(
      (s, i) => s + Math.max(0, (i.originalPrice ?? i.price) - i.price) * i.qty,
      0,
    );
    return { subtotal, savings, count: this.count(), itemCount: items.length };
  },
};
