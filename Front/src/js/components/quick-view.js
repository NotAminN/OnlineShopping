/* ============================================================
   quick-view.js — premium product quick-view modal
   ============================================================ */
import { createModal } from './modal.js';
import { productService } from '../services/products.js';
import { cartState } from '../state/cart-state.js';
import { wishlistState } from '../state/wishlist-state.js';
import { COLORS } from '../data/constants.js';
import { CATEGORIES } from '../data/categories.js';
import { formatPrice, formatNumber } from '../utils/format-price.js';
import { icon, guardImage } from '../utils/helpers.icons.js';
import { showToast } from './toast.js';
import { gsap } from '../animations/gsap.js';

const PAGE_HREF = (p) => `${location.pathname.includes('/pages/') ? '' : 'pages/'}${p}`;
const catName = (id) => CATEGORIES.find((c) => c.id === id)?.name ?? '';

export async function openQuickView(productId) {
  const product = await productService.getProduct(productId);
  if (!product) return;

  const modal = createModal({ title: 'نمایش سریع', width: 760, contentClass: 'qv-modal' });
  let color = product.colors[0];
  let size = null;
  const sizeable = !product.sizes.includes('اندازه آزاد');

  modal.body.innerHTML = `
    <div class="qv-layout">
      <div class="qv-img img-frame">
        <img src="${product.images[0]}" alt="${product.name}" id="qv-img"/>
      </div>
      <div>
        <span class="pc-cat">${catName(product.category)} · ${product.brand}</span>
        <h3 style="font-weight:800;font-size:1.25rem;margin:.2rem 0 .4rem">${product.name}</h3>
        <div style="display:flex;align-items:center;gap:1rem;flex-wrap:wrap">
          <span class="pc-rating num">${icon('star', 14)} ${formatNumber(product.rating)}
            <i style="opacity:.6">(${formatNumber(product.reviews)} نظر)</i></span>
          ${
            product.stock > 0
              ? '<span class="badge badge-success">موجود در انبار</span>'
              : '<span class="badge badge-muted">ناموجود</span>'
          }
        </div>
        <div class="pc-price-row" style="margin-top:.8rem">
          <b class="num" style="font-size:1.25rem;font-weight:800;${product.discount ? 'color:var(--color-cobalt-600)' : ''}">${formatPrice(product.price)}</b>
          ${
            product.discount
              ? `<del class="pc-old-price num">${formatPrice(product.originalPrice, { unit: false })}</del>
                 <span class="badge badge-sale">${formatNumber(product.discount)}٪</span>`
              : ''
          }
        </div>

        <div style="margin-top:1.1rem">
          <p class="variant-label">رنگ: <span data-color-name>${COLORS[color]?.fa ?? ''}</span></p>
          <div class="variant-row" data-colors>
            ${product.colors
              .map(
                (c, i) =>
                  `<button type="button" class="swatch ${i === 0 ? 'selected' : ''}"
                     style="background:${COLORS[c]?.hex}" data-color="${c}"
                     aria-label="${COLORS[c]?.fa}"></button>`,
              )
              .join('')}
          </div>
        </div>

        ${
          sizeable
            ? `<div style="margin-top:1rem">
                 <p class="variant-label">
                   سایز: <span data-size-selected style="font-weight:600;color:var(--color-ink-400)">انتخاب نشده</span>
                   <button type="button" class="link-underline" data-size-guide
                     style="color:var(--color-cobalt-500);font-size:.78rem">${icon('ruler', 13)} راهنمای سایز</button>
                 </p>
                 <div class="variant-row" data-sizes>
                   ${product.sizes.map((s) => `<button type="button" class="size-chip" data-size="${s}">${s}</button>`).join('')}
                 </div>
               </div>`
            : ''
        }

        <div style="display:flex;gap:.7rem;align-items:center;margin-top:1.4rem;flex-wrap:wrap">
          <div class="qty-stepper" data-qty>
            <button type="button" data-inc aria-label="افزایش">${icon('plus', 15)}</button>
            <span class="qty-value num" data-value>۱</span>
            <button type="button" data-dec aria-label="کاهش">${icon('minus', 15)}</button>
          </div>
          <button type="button" class="btn btn-primary" data-add-to-cart style="flex:1"
            ${product.stock <= 0 ? 'disabled' : ''}>
            ${icon('cart', 17)} افزودن به سبد خرید
          </button>
          <button type="button" class="btn btn-icon btn-outline" data-qv-wish
            aria-label="علاقه‌مندی" style="${wishlistState.has(product.id) ? 'color:var(--color-coral-500)' : ''}">
            ${icon('heart', 19)}
          </button>
        </div>

        <a href="${PAGE_HREF('product.html')}?p=${product.slug}" class="btn btn-ghost btn-sm" style="margin-top:.9rem;padding-inline:0">
          مشاهده جزئیات کامل ${icon('chevron-start', 14)}
        </a>
      </div>
    </div>`;

  /* ---------- interactions ---------- */
  let qty = 1;
  const valueEl = modal.body.querySelector('[data-value]');

  modal.body.querySelector('[data-qty]').addEventListener('click', (e) => {
    if (e.target.closest('[data-inc]')) qty = Math.min(10, qty + 1);
    if (e.target.closest('[data-dec]')) qty = Math.max(1, qty - 1);
    valueEl.textContent = formatNumber(qty);
  });

  modal.body.querySelector('[data-colors]').addEventListener('click', (e) => {
    const sw = e.target.closest('[data-color]');
    if (!sw) return;
    color = sw.dataset.color;
    modal.body.querySelectorAll('.swatch').forEach((s) =>
      s.classList.toggle('selected', s === sw),
    );
    modal.body.querySelector('[data-color-name]').textContent = COLORS[color]?.fa ?? '';
  });

  modal.body.querySelector('[data-sizes]')?.addEventListener('click', (e) => {
    const chip = e.target.closest('[data-size]');
    if (!chip) return;
    size = chip.dataset.size;
    modal.body.querySelectorAll('.size-chip').forEach((c) =>
      c.classList.toggle('selected', c === chip),
    );
    const label = modal.body.querySelector('[data-size-selected]');
    label.textContent = size;
    label.style.color = 'var(--color-ink-900)';
  });

  modal.body.querySelector('[data-size-guide]')?.addEventListener('click', () => {
    import('./size-guide.js').then((m) => m.openSizeGuide());
  });

  modal.body.querySelector('[data-add-to-cart]').addEventListener('click', () => {
    if (sizeable && !size) {
      showToast('لطفاً ابتدا سایز را انتخاب کن.', { type: 'error' });
      gsap.fromTo(
        modal.body.querySelector('[data-sizes]'),
        { x: -6 },
        { x: 0, duration: 0.4, ease: 'elastic.out(1,0.3)' },
      );
      return;
    }
    cartState.add(product, { color, size: size ?? 'اندازه آزاد', qty });
    showToast('محصول به سبد خرید اضافه شد.', { type: 'cart' });
    busOpenCart();
    modal.close();
  });

  modal.body.querySelector('[data-qv-wish]').addEventListener('click', (e) => {
    const added = wishlistState.toggle(product.id);
    const btn = e.currentTarget;
    btn.style.color = added ? 'var(--color-coral-500)' : '';
    showToast(added ? 'به علاقه‌مندی‌ها اضافه شد.' : 'از علاقه‌مندی‌ها حذف شد.', {
      type: added ? 'wishlist' : 'info',
    });
  });

  guardImage(modal.body.querySelector('#qv-img'), product.name);
  modal.open();
}

function busOpenCart() {
  setTimeout(() => {
    import('../utils/helpers.js').then(({ bus }) => bus.emit('ui:open-cart'));
  }, 350);
}
