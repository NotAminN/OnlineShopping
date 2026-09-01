/* ============================================================
   gallery.js — product image gallery: thumbs, arrows, lightbox,
   swipe, zoom cursor
   ============================================================ */
import { createModal } from './modal.js';
import { icon } from '../utils/icons.js';
import { guardImage } from '../utils/helpers.js';

export function createGallery(images, altText) {
  let index = 0;

  const root = document.createElement('div');
  root.className = 'pdp-gallery';
  root.innerHTML = `
    <div class="pdp-thumbs" role="tablist" aria-label="تصاویر محصول">
      ${images
        .map(
          (src, i) => `
        <button type="button" class="pd-thumb${i === 0 ? ' active' : ''}" data-thumb="${i}"
          aria-label="تصویر ${i + 1}" aria-selected="${i === 0}" role="tab">
          <img src="${src}" alt="" loading="lazy"/>
        </button>`,
        )
        .join('')}
    </div>
    <div class="pdp-main img-frame" data-main tabindex="0" role="button"
      aria-label="بزرگ‌نمایی تصویر">
      <img src="${images[0]}" alt="${altText}" id="pdp-main-img"/>
      <span class="pdp-zoom-hint">${icon('zoom', 18)}</span>
      <div class="pdp-arrows">
        <button type="button" class="hero-arrow pd-arrow" data-g-prev aria-label="تصویر قبلی"
          style="background:rgb(255 255 255 / .92);color:var(--color-ink-800);border-color:#fff">${icon('chevron-end', 18)}</button>
        <button type="button" class="hero-arrow pd-arrow" data-g-next aria-label="تصویر بعدی"
          style="background:rgb(255 255 255 / .92);color:var(--color-ink-800);border-color:#fff">${icon('chevron-start', 18)}</button>
      </div>
    </div>`;

  const mainImg = root.querySelector('#pdp-main-img');
  guardImage(mainImg, altText);
  root.querySelectorAll('.pd-thumb img').forEach((im) => guardImage(im));

  function show(i) {
    index = (i + images.length) % images.length;
    /* crossfade */
    const nextSrc = images[index];
    if (mainImg.src.endsWith(nextSrc)) return;
    const ghost = document.createElement('img');
    ghost.src = nextSrc;
    ghost.alt = '';
    ghost.className = 'pdp-ghost';
    guardImage(ghost);
    root.querySelector('[data-main]').appendChild(ghost);
    requestAnimationFrame(() => ghost.classList.add('visible'));
    setTimeout(() => {
      mainImg.src = nextSrc;
      ghost.remove();
    }, 320);
    root.querySelectorAll('.pd-thumb').forEach((t, ti) => {
      t.classList.toggle('active', ti === index);
      t.setAttribute('aria-selected', String(ti === index));
    });
  }

  root.querySelector('[data-thumb]') &&
    root.addEventListener('click', (e) => {
      const thumb = e.target.closest('[data-thumb]');
      if (thumb) show(Number(thumb.dataset.thumb));
      if (e.target.closest('[data-g-prev]')) show(index - 1);
      if (e.target.closest('[data-g-next]')) show(index + 1);
      if (e.target.closest('[data-main]') && !e.target.closest('.pd-arrow')) {
        openLightbox(index);
      }
    });
  root.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') show(index + 1); /* RTL: left = next */
    if (e.key === 'ArrowRight') show(index - 1);
    if (e.key === 'Enter' && document.activeElement?.hasAttribute('data-main'))
      openLightbox(index);
  });

  /* swipe */
  let startX = null;
  root.querySelector('[data-main]').addEventListener(
    'pointerdown',
    (e) => (startX = e.clientX),
    { passive: true },
  );
  root.querySelector('[data-main]').addEventListener(
    'pointerup',
    (e) => {
      if (startX === null) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 45) dx < 0 ? show(index + 1) : show(index - 1);
      startX = null;
    },
    { passive: true },
  );

  /* ---------- lightbox ---------- */
  function openLightbox(startIdx) {
    let idx = startIdx;
    const lb = createModal({ title: '', width: 980 });
    const headlessBody = lb.body;
    headlessBody.style.padding = '0';
    headlessCell(lb, images[idx], altText);

    function headlessCell(modalInstance, src, alt) {
      modalInstance.body.innerHTML = `
        <div style="position:relative;background:var(--color-shell)">
          <img src="${src}" alt="${alt}" style="width:100%;max-height:78vh;object-fit:contain"/>
        </div>
        ${
          images.length > 1
            ? `<div style="position:absolute;top:50%;transform:translateY(-50%);inset-inline-start:.8rem">
                 <button class="btn btn-light btn-icon" data-lb-next aria-label="بعدی">${icon('chevron-start', 20)}</button>
               </div>
               <div style="position:absolute;top:50%;transform:translateY(-50%);inset-inline-end:.8rem">
                 <button class="btn btn-light btn-icon" data-lb-prev aria-label="قبلی">${icon('chevron-end', 20)}</button>
               </div>`
            : ''
        }
        <div class="num" style="text-align:center;color:var(--color-ink-400);font-size:.8rem;padding-block:.7rem">
          تصویر ${(idx + 1).toLocaleString('fa-IR')} از ${images.length.toLocaleString('fa-IR')}
        </div>`;
      modalInstance.body.addEventListener('click', (e) => {
        if (e.target.closest('[data-lb-next]')) step(1);
        if (e.target.closest('[data-lb-prev]')) step(-1);
      });
    }

    function step(dir) {
      idx = (idx + dir + images.length) % images.length;
      headlessCell(lb, images[idx], altText);
    }

    lb.root.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') step(1);
      if (e.key === 'ArrowRight') step(-1);
    });

    /* hide sticky header title since headless */
    const h = lb.root.querySelector('.modal-head');
    if (h) h.style.display = 'none';
    lb.open();
  }

  return root;
}
