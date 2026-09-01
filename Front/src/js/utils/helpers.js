/* ============================================================
   helpers.js — small DOM/format utilities
   ============================================================ */

export const qs = (sel, scope = document) => scope.querySelector(sel);
export const qsa = (sel, scope = document) => [...scope.querySelectorAll(sel)];

export function debounce(fn, wait = 250) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

export function throttle(fn, limit = 100) {
  let waiting = false;
  return (...args) => {
    if (!waiting) {
      fn(...args);
      waiting = true;
      setTimeout(() => (waiting = false), limit);
    }
  };
}

export const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

let uidCounter = 0;
export const uid = () => `a${Date.now().toString(36)}${(uidCounter++).toString(36)}`;

/** Build DOM from an HTML string */
export function el(html) {
  const tpl = document.createElement('template');
  tpl.innerHTML = html.trim();
  return tpl.content.firstElementChild;
}

export const escapeHtml = (str = '') =>
  String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

/** Attach branded fallback when a product image fails to load */
export function guardImage(img, altText = 'تصویر محصول') {
  img.addEventListener(
    'error',
    () => {
      if (img.dataset.fallbackApplied) return;
      img.dataset.fallbackApplied = 'true';
      img.src = '/images/fallback.svg';
      img.alt = altText;
    },
    { once: true },
  );
  return img;
}

/** Image URL resolver — single point to swap remote → future CDN/API */
export function resolveImage(path, width = 900) {
  if (!path) return '/images/fallback.svg';
  if (/^https?:\/\//.test(path)) return path;
  return path.startsWith('/') ? path : `/images/${path}`;
}

/** Simple event-bus for cross-component communication */
const listeners = new Map();
export const bus = {
  on(event, fn) {
    if (!listeners.has(event)) listeners.set(event, new Set());
    listeners.get(event).add(fn);
    return () => bus.off(event, fn);
  },
  off(event, fn) {
    listeners.get(event)?.delete(fn);
  },
  emit(event, payload) {
    listeners.get(event)?.forEach((fn) => fn(payload));
  },
};

/** Focus-trap inside a container (for modals/drawers) */
export function trapFocus(container) {
  const sel =
    'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';
  const handler = (e) => {
    if (e.key !== 'Tab') return;
    const focusables = [...container.querySelectorAll(sel)].filter(
      (n) => n.offsetParent !== null,
    );
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables.at(-1);
    if (e.shiftKey && document.activeElement === first) {
      last.focus();
      e.preventDefault();
    } else if (!e.shiftKey && document.activeElement === last) {
      first.focus();
      e.preventDefault();
    }
  };
  container.addEventListener('keydown', handler);
  return () => container.removeEventListener('keydown', handler);
}
