/* ============================================================
   cart-page.js — full shopping cart page
   ============================================================ */
import { cartState } from '../state/cart-state.js';
import { productService } from '../services/products.js';
import { COLORS } from '../data/constants.js';
import { FREE_SHIPPING_THRESHOLD } from '../data/constants.js';
import { formatPrice } from '../utils/format-price.js';
import { icon } from '../utils/helpers.icons.js';
import { createProductSlider } from '../components/product-slider.js';
import { gsap } from '../animations/gsap.js';

const fa = (n) => new Intl.NumberFormat('fa-IR').format(n);
const PAGE_HREF = (p) => `${location.pathname.includes('/pages/') ? '' : 'pages/'}${p}`;
const HOME_HREF = location.pathname.includes('/pages/') ? '../index.html' : 'index.html';

export function init() {
  document.title = 'سبد خرید | مد استایل';
  const main = document.getElementById('main');
  main.innerHTML = `
    <div class="container-x" style="padding-block:1.4rem .2rem">
      <nav class="breadcrumbs" aria-label="مسیر صفحه">
        <a href="${HOME_HREF}">خانه</a><span class="bc-sep">/</span>
        <span aria-current="page">سبد خرید</span>
      </nav>
    </div>
    <section class="container-x" data-cart-root style="padding-top:.8rem"></section>
    <div id="cart-suggest"></div>`;

  const rootEl = main.querySelector('[data-cart-root]');
  let removeHandler = null;

  function render() {
    const items = cartState.getItems();
    if (!items.length) return renderEmpty(rootEl);

    const { subtotal, savings } = cartState.totals();
    const freeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
    const shippingCost = freeShipping ? 0 : 65_000;
    const total = subtotal + shippingCost;

    rootEl.innerHTML = `
      <header class="section-head" style="margin-bottom:1.4rem">
        <h1 class="display-2">سبد خرید
          <span class="badge badge-muted num">${fa(cartState.count())} کالا</span></h1>
        <a href="${PAGE_HREF('shop.html')}" class="link-underline" style="color:var(--color-cobalt-500)">
          ادامه خرید ${icon('chevron-start', 14)}
        </a>
      </header>

      <div class="cart-layout">
        <ul class="cart-items cart-page-items" data-items>
          ${items.map(renderItem).join('')}
        </ul>

        <aside class="cart-summary" aria-label="خلاصه سفارش">
          <h3>خلاصه سفارش</h3>
          ${
            savings > 0
              ? `<div class="sum-row savings"><span>سود شما از تخفیف‌ها</span><b class="num">${formatPrice(savings)}</b></div>`
              : ''
          }
          <div class="sum-row"><span>جمع کالاها</span><b class="num">${formatPrice(subtotal)}</b></div>
          <div class="sum-row"><span>تخفیف</span><b class="num">${formatPrice(0)}</b></div>
          <div class="sum-row">
            <span>هزینه ارسال</span>
            <b class="num">${freeShipping ? 'رایگان' : formatPrice(shippingCost)}</b>
          </div>
          ${
            !freeShipping
              ? `<p class="ship-hint num">${formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)} تا ارسال رایگان</p>`
              : ''
          }
          <div class="sum-total"><span>مبلغ قابل پرداخت</span><b class="num">${formatPrice(total)}</b></div>
          <a href="${PAGE_HREF('checkout.html')}" class="btn btn-primary btn-lg btn-block" style="margin-top:1rem">
            تکمیل سفارش ${icon('chevron-start', 16)}
          </a>
          <p style="font-size:.72rem;color:var(--color-ink-400);text-align:center;margin-top:.6rem">
            هزینه ارسال در مرحله بعد بر اساس روش انتخابی محاسبه می‌شود.
          </p>
        </aside>
      </div>`;

    bindItems(main.querySelector('[data-items]'));
  }

  const renderItem = (it) => `
    <li class="cart-item" data-key="${it.key}">
      <a class="ci-img img-frame" href="${PAGE_HREF('product.html')}?p=${it.slug}" tabindex="-1">
        <img src="${it.image}" alt="${it.name}" loading="lazy"/>
      </a>
      <div class="ci-body">
        <div class="ci-toprow">
          <div>
            <a class="ci-name" href="${PAGE_HREF('product.html')}?p=${it.slug}">${it.name}</a>
            <p class="ci-meta">${it.brand} · ${COLORS[it.color]?.fa ?? it.color}${it.size ? ` · سایز ${it.size}` : ''}</p>
          </div>
          <button class="ci-remove" data-remove aria-label="حذف ${it.name}">${icon('trash', 17)}</button>
        </div>
        <div class="ci-botrow">
          <div class="qty-stepper">
            <button type="button" data-inc aria-label="افزایش تعداد">${icon('plus', 15)}</button>
            <span class="qty-value num">${fa(it.qty)}</span>
            <button type="button" data-dec aria-label="کاهش تعداد">${icon('minus', 15)}</button>
          </div>
          <div style="display:grid;justify-items:end">
            ${
              it.originalPrice && it.originalPrice > it.price
                ? `<del class="num pc-old-price">${formatPrice(it.originalPrice * it.qty, { unit: false })}</del>`
                : ''
            }
            <b class="num ci-price">${formatPrice(it.price * it.qty)}</b>
          </div>
        </div>
      </div>
    </li>`;

  function bindItems(listEl) {
    if (removeHandler) removeHandler();
    const handler = (e) => {
      const itemEl = e.target.closest('.cart-item');
      if (!itemEl) return;
      const key = itemEl.dataset.key;
      if (e.target.closest('[data-remove]')) {
        gsap.to(itemEl, {
          opacity: 0,
          xPercent: -10,
          duration: 0.28,
          ease: 'power2.in',
          onComplete: () => cartState.remove(key),
        });
        return;
      }
      if (e.target.closest('[data-inc]')) cartState.updateQty(key, 1);
      if (e.target.closest('[data-dec]')) cartState.updateQty(key, -1);
    };
    listEl.addEventListener('click', handler);
    removeHandler = () => listEl.removeEventListener('click', handler);
  }

  render();

  /* suggestions below */
  productService.getBestSellers(8).then((products) => {
    document.getElementById('cart-suggest').replaceWith(
      createProductSlider({
        eyebrow: null,
        title: 'شاید این‌ها را هم بپسندی',
        linkLabel: '',
        href: `${PAGE_HREF('shop.html')}`,
        products,
      }),
    );
  });
}

function renderEmpty(root) {
  root.innerHTML = `
    <div class="empty-state">
      <span class="empty-icon">${icon('cart', 32)}</span>
      <h3>سبد خریدت هنوز خالی است.</h3>
      <p>از کالکشن‌های تازه ما دیدن کن؛ چیزی که دوستش داری همین‌جا منتظر توست.</p>
      <div style="display:flex;gap:.7rem;flex-wrap:wrap;justify-content:center">
        <a href="${PAGE_HREF('shop.html')}" class="btn btn-primary">مشاهده محصولات</a>
        <a href="${PAGE_HREF('wishlist.html')}" class="btn btn-outline">علاقه‌مندی‌های من</a>
      </div>
    </div>`;
}
