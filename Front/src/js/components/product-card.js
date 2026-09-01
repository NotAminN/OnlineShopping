/* ============================================================
   product-card.js — reusable premium product card
   ============================================================ */
import { COLORS } from '../data/constants.js';
import { CATEGORIES } from '../data/categories.js';
import { wishlistState } from '../state/wishlist-state.js';
import { bus } from '../utils/helpers.js';
import { formatPrice } from '../utils/format-price.js';
import { icon, guardImage } from '../utils/helpers.icons.js';

const PAGE_HREF = (p) => `${location.pathname.includes('/pages/') ? '' : 'pages/'}${p}`;
const fa = (n) => new Intl.NumberFormat('fa-IR').format(n);
const catName = (id) => CATEGORIES.find((c) => c.id === id)?.name ?? '';

/**
 * createProductCard(product, { showQuickAdd = true }) → HTMLElement
 */
export function createProductCard(product, opts = {}) {
  const { showQuickAdd = true } = opts;
  const card = document.createElement('article');
  card.className = 'product-card';
  const onSale = product.discount > 0;

  const badges = [];
  if (onSale)
    badges.push(`<span class="badge badge-sale">${fa(product.discount)}٪ تخفیف</span>`);
  if (product.newArrival && !onSale) badges.push('<span class="badge badge-new">جدید</span>');
  if (product.stock <= 0) badges.push('<span class="badge badge-muted">ناموجود</span>');
  else if (product.tags.includes('محدود')) badges.push('<span class="badge badge-limited">محدود</span>');

  card.innerHTML = `
    <a class="pc-media" href="${PAGE_HREF('product.html')}?p=${product.slug}" aria-label="${product.name}">
      <img class="pc-img-primary" src="${product.images[0]}" alt="${product.name}"
        loading="lazy" width="600" height="800"/>
      ${
        product.images[1]
          ? `<img class="pc-img-secondary" src="${product.images[1]}" alt="" loading="lazy" aria-hidden="true"/>`
          : ''
      }
    </a>
    <div class="pc-badges">${badges.join('')}</div>
    <button type="button" class="pc-wish" data-wish aria-pressed="false"
      aria-label="افزودن به علاقه‌مندی‌ها">${icon('heart', 18)}</button>
    <div class="pc-colors" aria-hidden="true">
      ${product.colors.slice(0, 4).map((c) => `<i style="background:${COLORS[c]?.hex ?? '#ccc'}"></i>`).join('')}
    </div>
    ${
      showQuickAdd && product.stock > 0
        ? `<div class="pc-quickadd">
             <button type="button" class="btn btn-sm" data-quickview>
               ${icon('cart', 15)} افزودن سریع
             </button>
           </div>`
        : ''
    }
    <div class="pc-info">
      <span class="pc-cat">${catName(product.category)} · ${product.brand}</span>
      <h3 class="pc-name"><a href="${PAGE_HREF('product.html')}?p=${product.slug}">${product.name}</a></h3>
      <span class="pc-rating num">${icon('star', 13)} ${fa(product.rating)} <i style="opacity:.6">(${fa(product.reviews)} نظر)</i></span>
      <div class="pc-price-row">
        <b class="pc-price num ${onSale ? 'has-sale' : ''}">${formatPrice(product.price)}</b>
        ${onSale ? `<del class="pc-old-price num">${formatPrice(product.originalPrice, { unit: false })}</del>` : ''}
      </div>
    </div>`;

  /* image guards */
  guardImage(card.querySelector('.pc-img-primary'), product.name);
  card.querySelectorAll('.pc-img-secondary').forEach((im) => guardImage(im));

  /* ---------- wishlist ---------- */
  const wishBtn = card.querySelector('[data-wish]');
  const syncWish = () => {
    const active = wishlistState.has(product.id);
    wishBtn.classList.toggle('active', active);
    wishBtn.setAttribute('aria-pressed', String(active));
    wishBtn.innerHTML = icon('heart', 18);
    wishBtn.style.color = active ? 'var(--color-coral-500)' : '';
  };
  syncWish();
  wishBtn.addEventListener('click', () => {
    const added = wishlistState.toggle(product.id);
    showToastFor(added);
    wishBtn.classList.remove('pop');
    void wishBtn.offsetWidth;
    wishBtn.classList.add('pop');
    syncWish();
  });

  /* ---------- quick add / quick view ---------- */
  card.querySelector('[data-quickview]')?.addEventListener('click', (e) => {
    e.preventDefault();
    bus.emit('ui:quick-view', { productId: product.id });
  });

  return card;
}

import { showToast } from './toast.js';
function showToastFor(added) {
  added
    ? showToast('به علاقه‌مندی‌ها اضافه شد.', { type: 'wishlist' })
    : showToast('از علاقه‌مندی‌ها حذف شد.', { type: 'info' });
}
