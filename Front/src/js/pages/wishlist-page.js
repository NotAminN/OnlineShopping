/* ============================================================
   wishlist-page.js — favorites listing with move-to-cart
   ============================================================ */
import { wishlistState } from '../state/wishlist-state.js';
import { createProductCard } from '../components/product-card.js';
import { icon } from '../utils/helpers.icons.js';
import { bus } from '../utils/helpers.js';

const PAGE_HREF = (p) => `${location.pathname.includes('/pages/') ? '' : 'pages/'}${p}`;
const HOME_HREF = location.pathname.includes('/pages/') ? '../index.html' : 'index.html';
const fa = (n) => new Intl.NumberFormat('fa-IR').format(n);

export function init() {
  document.title = 'علاقه‌مندی‌ها | مد استایل';
  const main = document.getElementById('main');

  async function render() {
    const y = window.scrollY;
    const products = await wishlistState.products();
    main.innerHTML = `
      <div class="container-x" style="padding-block:1.4rem .2rem">
        <nav class="breadcrumbs" aria-label="مسیر صفحه">
          <a href="${HOME_HREF}">خانه</a><span class="bc-sep">/</span>
          <span aria-current="page">علاقه‌مندی‌ها</span>
        </nav>
      </div>
      <section class="container-x" style="padding-top:.8rem;padding-bottom:3rem">
        <header class="section-head" style="margin-bottom:1.6rem">
          <h1 class="display-2">علاقه‌مندی‌های من
            <span class="badge badge-muted num">${fa(products.length)} محصول</span></h1>
          <a href="${PAGE_HREF('shop.html')}" class="link-underline" style="color:var(--color-cobalt-500)">
            مشاهده محصولات
          </a>
        </header>

        ${
          products.length
            ? `<div class="product-grid" data-wl-grid></div>`
            : `<div class="empty-state">
                 <span class="empty-icon">${icon('heart', 30)}</span>
                 <h3>هنوز چیزی به علاقه‌مندی‌ها اضافه نکرده‌ای.</h3>
                 <p>قلب روی هر محصول را بزن تا اینجا ذخیره شود؛ برای بعد از این!</p>
                 <a href="${PAGE_HREF('shop.html')}" class="btn btn-dark">مشاهده محصولات</a>
               </div>`
        }
      </section>`;

    if (!products.length) return;
    window.scrollTo(0, y); /* preserve position across re-renders */

    const grid = main.querySelector('[data-wl-grid]');
    products.forEach((p) => {
      const wrapper = document.createElement('div');
      wrapper.appendChild(createProductCard(p));
      /* extra action row under each card */
      const actions = document.createElement('div');
      actions.style.cssText = 'display:flex;gap:.5rem;margin-top:.4rem;padding-inline:.35rem';
      actions.innerHTML = `
        <button type="button" class="btn btn-outline btn-sm" style="flex:1" data-move-cart="${p.id}">
          ${icon('cart', 14)} انتقال به سبد
        </button>`;
      actions.querySelector('[data-move-cart]').addEventListener('click', () => {
        bus.emit('ui:quick-view', { productId: p.id });
      });
      wrapper.appendChild(actions);
      grid.appendChild(wrapper);
    });
  }

  render();
  bus.on('wishlist:changed', render);
}
