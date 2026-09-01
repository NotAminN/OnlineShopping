/* ============================================================
   toast.js — global toast notifications (GSAP animated)
   ============================================================ */
import { gsap } from '../animations/gsap.js';
import { icon } from '../utils/icons.js';

let container = null;

function ensureContainer() {
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    container.setAttribute('role', 'status');
    container.setAttribute('aria-live', 'polite');
    document.body.appendChild(container);
  }
  return container;
}

const ICONS = {
  success: 'check',
  error: 'close',
  info: 'sparkles',
  wishlist: 'heart',
  cart: 'cart',
};

/**
 * showToast('پیام', { type: 'success'|'error'|'info'|'wishlist'|'cart', duration })
 */
export function showToast(message, { type = 'success', duration = 2600 } = {}) {
  const host = ensureContainer();
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `
    <span class="toast-icon">${icon(ICONS[type] ?? 'check', 16)}</span>
    <span>${message}</span>`;
  host.appendChild(el);

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    gsap.set(el, { opacity: 1 });
    setTimeout(() => el.remove(), duration);
    return;
  }

  gsap
    .timeline({ onComplete: () => el.remove() })
    .fromTo(
      el,
      { y: 24, autoAlpha: 0, scale: 0.95 },
      { y: 0, autoAlpha: 1, scale: 1, duration: 0.42, ease: 'back.out(1.6)' },
    )
    .to(el, {
      autoAlpha: 0,
      y: -14,
      duration: 0.35,
      ease: 'power2.in',
      delay: duration / 1000,
    });
}
