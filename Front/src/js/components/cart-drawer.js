/* ============================================================
   cart-drawer.js — premium slide-in cart (RTL right side)
   ============================================================ */
import { cartState } from '../state/cart-state.js';
import { bus, icon, guardImage } from '../utils/helpers.icons.js';
import { formatPrice } from '../utils/format-price.js';
import { drawerOpen, drawerClose } from '../animations/gsap.js';
import { gsap } from '../animations/gsap.js';
import { FREE_SHIPPING_THRESHOLD } from '../data/constants.js';
import { COLORS } from '../data/constants.js';

const PAGE_HREF = (p) => `${location.pathname.includes('/pages/') ? '' : 'pages/'}${p}`;
const fa = (n) => new Intl.NumberFormat('fa-IR').format(n);

export function createCartDrawer() {
  const overlay = document.createElement('div');
  overlay.className = 'drawer-overlay';
  overlay.hidden = true;
  const drawer = document.createElement('aside');
  drawer.className = 'cart-drawer drawer';
  drawer.setAttribute('role', 'dialog');
  drawer.setAttribute('aria-modal', 'true');
  drawer.setAttribute('aria-label', 'سبد خرید');

  document.body.append(overlay, drawer);

  let isOpen = false;
  let removeHandler = null;

  function render() {
    const items = cartState.getItems();
    const { subtotal, savings } = cartState.totals();
    const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
    const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

    if (!items.length) {
      drawer.innerHTML = `
        <div class="drawer-head">
          <h2 class="modal-title">سبد خرید</h2>
          <button class="btn btn-ghost btn-icon btn-sm" data-cart-close aria-label="بستن سبد">${icon('close', 20)}</button>
        </div>
        <div class="drawer-body">
          <div class="empty-state" style="margin-top:3rem">
            <span class="empty-icon">${icon('cart', 30)}</span>
            <h3>سبد خریدت هنوز خالی است.</h3>
            <p>از کالکشن‌های تازه ما دیدن کن؛ چیزی که دوستش داری همین‌جا منتظر توست.</p>
            <a href="${PAGE_HREF('shop.html')}" class="btn btn-dark">مشاهده محصولات</a>
          </div>
        </div>`;
    } else {
      drawer.innerHTML = `
        <div class="drawer-head">
          <h2 class="modal-title">سبد خرید
            <span class="num badge badge-muted" style="margin-inline-start:.4rem">${fa(cartState.count())} کالا</span>
          </h2>
          <button class="btn btn-ghost btn-icon btn-sm" data-cart-close aria-label="بستن سبد">${icon('close', 20)}</button>
        </div>

        ${
          remaining > 0
            ? `<div class="ship-progress">
                 <p>${formatPrice(remaining)} تا ارسال رایگان!</p>
                 <div class="sp-track"><div class="sp-fill" style="width:${progress}%"></div></div>
               </div>`
            : `<div class="ship-progress done"><p>${icon('check', 15)} ارسال این سفارش رایگان است.</p></div>`
        }

        <ul class="cart-items" data-cart-items>
          ${items.map(renderItem).join('')}
        </ul>

        <div class="drawer-foot">
          ${savings > 0 ? `<div class="cart-row savings"><span>سود شما از خرید</span><b class="num">${formatPrice(savings)}</b></div>` : ''}
          <div class="cart-row"><span>جمع محصولات</span><b class="num">${formatPrice(subtotal)}</b></div>
          <div style="display:grid;gap:.6rem;margin-top:.9rem">
            <a href="${PAGE_HREF('checkout.html')}" class="btn btn-primary btn-lg btn-block">تکمیل سفارش</a>
            <a href="${PAGE_HREF('cart.html')}" class="btn btn-outline btn-block">مشاهده سبد</a>
          </div>
        </div>`;
    }

    /* events */
    drawer.querySelector('[data-cart-close]').addEventListener('click', close);
    if (removeHandler) removeHandler();
    removeHandler = bindItemEvents(drawer);
  }

  const renderItem = (it) => `
    <li class="cart-item" data-key="${it.key}">
      <a class="ci-img img-frame" href="${PAGE_HREF('product.html')}?p=${it.slug}" tabindex="-1">
        <img src="${it.image}" alt="${it.name}" loading="lazy"/>
      </a>
      <div class="ci-body">
        <div class="ci-toprow">
          <a class="ci-name" href="${PAGE_HREF('product.html')}?p=${it.slug}">${it.name}</a>
          <button class="ci-remove" data-remove aria-label="حذف ${it.name}">${icon('trash', 16)}</button>
        </div>
        <p class="ci-meta">${COLORS[it.color]?.fa ?? it.color}${it.size ? ` · سایز ${it.size}` : ''}</p>
        <div class="ci-botrow">
          <div class="qty-stepper qty-sm">
            <button type="button" data-inc aria-label="افزایش تعداد">${icon('plus', 14)}</button>
            <span class="qty-value num">${fa(it.qty)}</span>
            <button type="button" data-dec aria-label="کاهش تعداد">${icon('minus', 14)}</button>
          </div>
          <b class="num ci-price">${
            it.qty > 1 ? formatPrice(it.price * it.qty) : formatPrice(it.price)
          }</b>
        </div>
      </div>
    </li>`;

  function bindItemEvents(scopeEl) {
    const handler = (e) => {
      const itemEl = e.target.closest('.cart-item');
      if (!itemEl) return;
      const key = itemEl.dataset.key;

      if (e.target.closest('[data-remove]')) {
        gsap.to(itemEl, {
          opacity: 0,
          xPercent: -8,
          height: 0,
          marginTop: 0,
          paddingBottom: 0,
          duration: 0.32,
          ease: 'power2.in',
          onComplete: () => cartState.remove(key),
        });
        return;
      }
      if (e.target.closest('[data-inc]')) cartState.updateQty(key, +1);
      if (e.target.closest('[data-dec]')) cartState.updateQty(key, -1);
    };
    scopeEl.addEventListener('click', handler);
    return () => scopeEl.removeEventListener('click', handler);
  }

  function open() {
    if (isOpen) return;
    isOpen = true;
    render();
    overlay.hidden = false;
    drawerOpen(drawer, overlay);
  }
  function close() {
    if (!isOpen) return;
    isOpen = false;
    drawerClose(drawer, overlay, () => (overlay.hidden = true));
  }

  overlay.addEventListener('click', close);
  document.addEventListener('keydown', (e) => e.key === 'Escape' && close());

  /* live re-render when cart changes while open */
  let firstEmit = true;
  bus.on('cart:changed', () => {
    if (firstEmit) {
      firstEmit = false;
      return;
    }
    if (isOpen) render();
  });

  return { open, close };
}
