/* ============================================================
   wishlist-state — favorite product ids, persisted
   ============================================================ */
import { storage, STORAGE_KEYS } from '../utils/storage.js';
import { bus } from '../utils/helpers.js';
import { productService } from '../services/products.js';

let ids = storage.get(STORAGE_KEYS.wishlist, []);

const persist = () => {
  storage.set(STORAGE_KEYS.wishlist, ids);
  bus.emit('wishlist:changed', ids);
};

export const wishlistState = {
  getIds: () => [...ids],
  count: () => ids.length,
  has: (id) => ids.includes(id),
  toggle(id) {
    if (ids.includes(id)) {
      ids = ids.filter((x) => x !== id);
      persist();
      return false;
    }
    ids.push(id);
    persist();
    return true;
  },
  remove(id) {
    if (!ids.includes(id)) return;
    ids = ids.filter((x) => x !== id);
    persist();
  },
  async products() {
    return await productService.getMany(ids);
  },
};
