/* Temporary smoke test for pure logic modules (run with node) */
import { formatPrice, toFaDigits, toLatinDigits, formatDiscount } from '../../src/js/utils/format-price.js';
import { PRODUCTS, PRICE_BOUNDS } from '../../src/js/data/products.js';
import { createFilterState, applyFilters } from '../../src/js/state/filter-state.js';

const map = new Map();
globalThis.localStorage = {
  getItem: (k) => (map.has(k) ? map.get(k) : null),
  setItem: (k, v) => map.set(k, String(v)),
  removeItem: (k) => map.delete(k),
  clear: () => map.clear(),
};

let failures = 0;
const check = (name, cond) => {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}`);
  if (!cond) failures++;
};

/* formatting */
check('formatPrice produces Persian digits', /\u06F2/.test(formatPrice(2890000)));
check('formatPrice includes unit', formatPrice(1000).includes('\u062A\u0648\u0645\u0627\u0646'));
check('toFaDigits', toFaDigits('42') === '\u06F4\u06F2');
check('toLatinDigits roundtrip', toLatinDigits(toFaDigits('09123456789')) === '09123456789');
check('formatDiscount 20%', formatDiscount(2880000, 3600000) === '\u06F2\u06F0\u066A');

/* data integrity */
check('62 products seeded', PRODUCTS.length === 62);
check('unique ids', new Set(PRODUCTS.map((p) => p.id)).size === PRODUCTS.length);
check('unique slugs', new Set(PRODUCTS.map((p) => p.slug)).size === PRODUCTS.length);
check(
  'all images resolve locally',
  PRODUCTS.every((p) => p.images.every((i) => i.startsWith('/images/products/'))),
);
check(
  'colors/sizes non-empty',
  PRODUCTS.every((p) => p.colors.length > 0 && p.sizes.length > 0),
);

/* filters */
let fs = createFilterState();
check('no filters -> all products', applyFilters(PRODUCTS, fs.get()).length === 62);

fs.patch({ categories: ['women'] });
check(
  'category filter women',
  applyFilters(PRODUCTS, fs.get()).every((p) => p.category === 'women'),
);

fs = createFilterState({ onlyDiscount: true });
check('discount-only > 0', applyFilters(PRODUCTS, fs.get()).length > 0);

fs = createFilterState({ sort: 'cheapest' });
const sorted = applyFilters(PRODUCTS, fs.get());
check('cheapest sort ascending', sorted[0].price <= sorted[sorted.length - 1].price);

fs = createFilterState({ priceMin: 3_000_000, priceMax: 6_000_000 });
check(
  'price window respected',
  applyFilters(PRODUCTS, fs.get()).every((p) => p.price >= 3_000_000 && p.price <= 6_000_000),
);

const FREE_SIZE_FA = '\u0627\u0646\u062F\u0627\u0632\u0647 \u0622\u0632\u0627\u062F';
fs = createFilterState({ sizes: [FREE_SIZE_FA] });
const freeSizeCount = applyFilters(PRODUCTS, fs.get()).length;
console.log(`      (free-size matches: ${freeSizeCount})`);
check('free-size filter finds one-size items', freeSizeCount >= 5);

/* cart state */
const { cartState } = await import('../../src/js/state/cart-state.js');
cartState.add(PRODUCTS[0], { color: 'beige', size: 'M', qty: 2 });
check('cart count 2', cartState.count() === 2);
check('subtotal correct', cartState.totals().subtotal === PRODUCTS[0].price * 2);
cartState.updateQty(`${PRODUCTS[0].id}|beige|M`, -1);
check('qty decremented', cartState.getItems()[0].qty === 1);
cartState.remove(`${PRODUCTS[0].id}|beige|M`);
check('cart empty after remove', cartState.count() === 0);

/* persistence roundtrip */
const { wishlistState } = await import('../../src/js/state/wishlist-state.js');
wishlistState.toggle(PRODUCTS[1].id);
wishlistState.toggle(PRODUCTS[2].id);
check('wishlist has 2', wishlistState.count() === 2);
check('toggle off works', wishlistState.toggle(PRODUCTS[1].id) === false);
check('wishlist persisted', JSON.parse(map.get('mod-style:wishlist')).length === 1);

/* order service */
global.fetch = async () => ({
    ok: true,
    json: async () => ({ id: 'A-123456', created_at: new Date().toISOString() })
});
const { orderService } = await import('../../src/js/services/orders.js');
let order;
try {
  order = await orderService.createOrder({
    items: [],
    totals: { subtotal: 1000, savings: 0, shippingCost: 0, total: 1000 },
    address: { province: 'p', city: 'c', line: 'l', postalCode: '1', receiver: 'r', phone: '9' },
    shippingMethodId: 'post',
    paymentMethodId: 'online',
  });
  check('order created with id', order.id === 'A-123456');
} catch(e) {
  check('order created with id', false);
}
check('status fa maps', typeof orderService.statusFa('shipped') === 'string');

console.log(failures ? `\n${failures} FAILURES` : '\nALL PASS');
process.exit(failures ? 1 : 0);
