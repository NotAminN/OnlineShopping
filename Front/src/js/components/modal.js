/* ============================================================
   modal.js — reusable accessible modal factory
   ============================================================ */
import { gsap, reducedMotion, lockBody, unlockBody } from '../animations/gsap.js';
import { trapFocus, icon } from '../utils/helpers.icons.js';

export function createModal({
  title = '',
  width = 520,
  onClose = null,
  contentClass = '',
} = {}) {
  const root = document.createElement('div');
  root.className = 'overlay-root';
  root.style.setProperty('--modal-w', `${width}px`);
  root.innerHTML = `
    <div class="overlay-backdrop" data-modal-close></div>
    <div class="modal-panel ${contentClass}" role="dialog" aria-modal="true" aria-label="${title}">
      ${
        title
          ? `<div class="modal-head">
               <h2 class="modal-title">${title}</h2>
               <button type="button" class="btn btn-ghost btn-icon btn-sm" data-modal-close
                 aria-label="بستن">${icon('close', 20)}</button>
             </div>`
          : ''
      }
      <div class="modal-body" data-modal-content></div>
    </div>`;

  const panel = root.querySelector('.modal-panel');
  const body = root.querySelector('[data-modal-content]');
  let releaseTrap = () => {};
  let lastFocused = null;

  function open() {
    lastFocused = document.activeElement;
    document.body.appendChild(root);
    lockBody();
    if (!title) panel.querySelector('.modal-head')?.remove();
    releaseTrap = trapFocus(panel);
    if (reducedMotion()) {
      gsap.set(root, { visibility: 'visible', autoAlpha: 1 });
    } else {
      gsap
        .timeline()
        .set(root, { visibility: 'visible' })
        .fromTo(root.querySelector('.overlay-backdrop'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 })
        .fromTo(
          panel,
          { autoAlpha: 0, y: 40, scale: 0.97 },
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.45, ease: 'power3.out' },
          '<0.04',
        );
    }
    /* focus first focusable */
    requestAnimationFrame(() => {
      const f = panel.querySelector(
        'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      f?.focus();
    });
  }

  function close() {
    releaseTrap();
    const done = () => {
      root.remove();
      unlockBody();
      onClose?.();
      lastFocused?.focus?.();
    };
    if (reducedMotion()) return done();
    gsap
      .timeline({ onComplete: done })
      .to(panel, { autoAlpha: 0, y: 26, scale: 0.98, duration: 0.28, ease: 'power2.in' })
      .to(root.querySelector('.overlay-backdrop'), { autoAlpha: 0, duration: 0.25 }, '<');
  }

  root.addEventListener('click', (e) => {
    if (e.target.closest('[data-modal-close]')) close();
  });
  root.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });

  return { root, body, open, close };
}

/** Confirm-style helper */
export function confirmModal({ title, message, confirmLabel = 'تأیید', danger = false }) {
  return new Promise((resolve) => {
    const modal = createModal({ title, width: 420 });
    modal.body.innerHTML = `
      <p style="color:var(--color-ink-600); font-size:.92rem; line-height:2">${message}</p>
      <div style="display:flex; gap:.6rem; justify-content:flex-start; margin-top:1.4rem">
        <button class="btn btn-sm ${danger ? 'btn-danger' : 'btn-dark'}" data-confirm>${confirmLabel}</button>
        <button class="btn btn-sm btn-outline" data-cancel>انصراف</button>
      </div>`;
    modal.body.addEventListener('click', (e) => {
      if (e.target.closest('[data-confirm]')) {
        modal.close();
        resolve(true);
      }
      if (e.target.closest('[data-cancel]')) {
        modal.close();
        resolve(false);
      }
    });
    const origClose = modal.close.bind(modal);
    modal.close = () => {
      resolve(false);
      origClose();
    };
    modal.open();
  });
}
