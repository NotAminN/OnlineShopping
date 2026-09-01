/* ============================================================
   cart & wishlist services — thin API-shaped wrappers over state.
   Swapping bodies for fetch() later requires no UI changes.
   ============================================================ */
import { cartState } from '../state/cart-state.js';
import { wishlistState } from '../state/wishlist-state.js';

export const cartService = {
  getItems: () => Promise.resolve(cartState.getItems()),
  add: (product, variant) => Promise.resolve(cartState.add(product, variant)),
  updateQty: (key, qty) => Promise.resolve(cartState.setQty(key, qty)),
  remove: (key) => Promise.resolve(cartState.remove(key)),
  clear: () => Promise.resolve(cartState.clear()),
  totals: () => Promise.resolve(cartState.totals()),
};

export const wishlistService = {
  list: () => Promise.resolve(wishlistState.products()),
  toggle: (id) => Promise.resolve(wishlistState.toggle(id)),
  has: (id) => wishlistState.has(id),
};
