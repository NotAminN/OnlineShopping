/* ============================================================
   product-state — recently viewed history (localStorage)
   ============================================================ */
import { storage, STORAGE_KEYS } from '../utils/storage.js';

const MAX = 12;

export const productState = {
  pushRecentlyViewed(id) {
    const list = (storage.get(STORAGE_KEYS.recentlyViewed, []) ?? []).filter((x) => x !== id);
    list.unshift(id);
    storage.set(STORAGE_KEYS.recentlyViewed, list.slice(0, MAX));
  },
  getRecentlyViewed(excludeId = null) {
    return (storage.get(STORAGE_KEYS.recentlyViewed, []) ?? []).filter((x) => x !== excludeId);
  },
  clearRecentlyViewed() {
    storage.remove(STORAGE_KEYS.recentlyViewed);
  },
};
