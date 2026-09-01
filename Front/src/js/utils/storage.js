/* ============================================================
   storage.js — namespaced, crash-safe localStorage wrapper.
   Never store passwords/payment data here (demo state only).
   ============================================================ */
const NS = 'mod-style:';

export const storage = {
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(NS + key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(NS + key, JSON.stringify(value));
    } catch {
      /* storage unavailable — degrade silently */
    }
  },
  remove(key) {
    try {
      localStorage.removeItem(NS + key);
    } catch {
      /* noop */
    }
  },
};

export const STORAGE_KEYS = Object.freeze({
  cart: 'cart',
  wishlist: 'wishlist',
  recentlyViewed: 'recently-viewed',
  user: 'demo-user',
  orders: 'demo-orders',
  announcementDismissed: 'announcement-dismissed',
  filters: 'shop-filters',
  profile: 'demo-profile',
  addresses: 'demo-addresses',
});
