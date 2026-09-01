/* ============================================================
   orders.js — orders list + order details with status timeline
   ============================================================ */
import { orderService } from '../services/orders.js';
import { ORDER_STATUS, SHIPPING_METHODS } from '../data/constants.js';
import { formatPrice } from '../utils/format-price.js';
import { icon } from '../utils/helpers.icons.js';
import { PAGE_HREF } from '../utils/page-href.js';

const fa = (n) => new Intl.NumberFormat('fa-IR').format(n);
const HOME_HREF = location.pathname.includes('/pages/') ? '../index.html' : 'index.html';

export function init() {
  document.title = 'سفارش‌های من | مد استایل';
  const main = document.getElementById('main');
  const orderId = new URLSearchParams(location.search).get('o');

  main.innerHTML = `
    <div class="container-x" style="padding-block:1.4rem .2rem">
      <nav class="breadcrumbs">
        <a href="${HOME_HREF}">خانه</a><span class="bc-sep">/</span>
        ${orderId ? `<a href="${PAGE_HREF('orders.html')}">سفارش‌ها</a><span class="bc-sep">/</span><span aria-current="page">${orderId}</span>`
          : '<span aria-current="page">سفارش‌ها</span>'}
      </nav>
    </div>
    <section class="container-x" data-orders-root style="padding-top:.8rem;padding-bottom:3rem;max-width:900px"></section>`;

  const root = main.querySelector('[data-orders-root]');
  orderId ? renderDetail(root, orderId) : renderList(root);
}

/* API orders (snake_case, items with product_detail) and locally cached
   checkout orders (camelCase with totals/images) are both accepted. */
function normalizeOrder(o) {
  const items = (o.items ?? []).map((it) => {
    const p = it.product_detail ?? it.product ?? {};
    return {
      image: it.image ?? p.images?.[0] ?? '/images/fallback.svg',
      qty: it.qty ?? it.quantity ?? 1,
      name: it.name ?? p.name ?? '',
      brand: it.brand ?? p.brand ?? '',
      size: it.size ?? it.selected_size ?? '',
      price: it.price ?? it.unit_price ?? 0,
    };
  });
  const totals = o.totals ?? {
    subtotal: o.total_price ?? 0,
    savings: 0,
    shippingCost: 0,
    total: o.total_price ?? 0,
  };
  return { ...o, items, totals };
}

async function renderList(root) {
  const orders = (await orderService.getOrders()).map(normalizeOrder);
  root.innerHTML = `
    <header class="section-head" style="margin-bottom:1.4rem">
      <h1 class="display-2">سفارش‌های من
        <span class="badge badge-muted num">${fa(orders.length)}</span></h1>
      <a href="${PAGE_HREF('shop.html')}" class="link-underline" style="color:var(--color-cobalt-500)">ادامه خرید</a>
    </header>
    ${
      orders.length
        ? `<div>${orders.map(listCard).join('')}</div>`
        : emptyState()
    }`;

  if (orders.length) {
    root.querySelectorAll('[data-order-link]').forEach((el) =>
      el.addEventListener('click', () => {
        location.href = `${PAGE_HREF('orders.html')}?o=${el.dataset.orderLink}`;
      }),
    );
  }
}

function listCard(o) {
  return `
    <article class="order-card">
      <div class="oc-row">
        <b class="num" style="color:var(--color-ink-900);font-size:1rem">${o.id}</b>
        ${statusBadge(o.status)}
      </div>
      <div class="oc-row">
        <span class="num">${o.dateLabel ?? ''} · ${fa(o.items.length)} کالا</span>
        <b class="num" style="color:var(--color-ink-900)">${formatPrice(o.totals.total)}</b>
      </div>
      <div class="oc-row">
        <span class="order-thumb-row">
          ${o.items.slice(0, 5).map((it) => `<img src="${it.image}" alt="" loading="lazy"/>`).join('')}
        </span>
        <span style="display:flex;gap:.4rem;align-items:center">
          <button type="button" class="btn btn-dark btn-sm" data-order-link="${o.id}">
            جزئیات سفارش ${icon('chevron-start', 13)}
          </button>
        </span>
      </div>
    </article>`;
}

async function renderDetail(root, id) {
  const raw = await orderService.getOrder(id);
  const o = raw ? normalizeOrder(raw) : null;
  if (!o) {
    root.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">${icon('package', 30)}</span>
        <h3>سفارشی با این شماره پیدا نشد.</h3>
        <a href="${PAGE_HREF('orders.html')}" class="btn btn-dark">همه سفارش‌ها</a>
      </div>`;
    return;
  }

  const method =
    SHIPPING_METHODS.find((m) => m.id === o.shippingMethodId)?.title ?? '—';
  const payFa = { online: 'پرداخت آنلاین', cod: 'پرداخت در محل', wallet: 'کیف پول' };

  const TIMELINE = ['pending_payment', 'processing', 'shipped', 'delivered'];
  const currentIdx = TIMELINE.indexOf(o.status);

  root.innerHTML = `
    <header class="section-head" style="margin-bottom:1.6rem">
      <h2 class="display-2 num">سفارش ${o.id}</h2>
      ${statusBadge(o.status)}
    </header>

    <!-- timeline -->
    ${
      o.status !== 'canceled'
        ? `<ol class="co-steps-timeline" style="display:flex;margin-bottom:2rem">
            ${TIMELINE.map(
              (s, i) => `
              <li style="flex:1;text-align:center;position:relative">
                <span style="display:inline-grid;place-content:center;width:38px;height:38px;border-radius:50%;
                  font-weight:800;background:${i <= currentIdx ? 'var(--color-cobalt-500)' : '#fff'};
                  color:${i <= currentIdx ? '#fff' : 'var(--color-ink-400)'};
                  border:2px solid ${i <= currentIdx ? 'var(--color-cobalt-500)' : 'var(--color-ink-200)'};">
                  ${i <= currentIdx && i < currentIdx ? icon('check', 15) : fa(i + 1)}
                </span>
                <p style="font-size:.74rem;color:${
                  i <= currentIdx ? 'var(--color-ink-900);font-weight:700' : 'var(--color-ink-400)'
                };margin-top:.35rem">${ORDER_STATUS[s].fa}</p>
              </li>`,
            ).join('')}
          </ol>`
        : ''
    }

    <!-- items -->
    <div class="account-panel" style="margin-bottom:1.4rem">
      <h2>اقلام سفارش</h2>
      <ul style="display:grid;gap:1rem">
        ${o.items
          .map(
            (it) => `
          <li style="display:flex;gap:1rem;align-items:center;border-bottom:1px solid var(--color-ink-100);padding-bottom:1rem">
            <img src="${it.image}" alt="${it.name}" loading="lazy"
              style="width:64px;height:80px;border-radius:12px;object-fit:cover;background:var(--color-shell)"/>
            <div style="flex:1;font-size:.88rem">
              <b>${it.name}</b><br/>
              <i style="font-style:normal;color:var(--color-ink-400);font-size:.76rem">
                ${it.brand}${it.size ? ` · سایز ${it.size}` : ''} · تعداد ${fa(it.qty)}</i>
            </div>
            <b class="num">${formatPrice(it.price * it.qty)}</b>
          </li>`,
          )
          .join('')}
      </ul>

      <div style="margin-top:1.3rem;display:grid;gap:.45rem">
        <div class="sum-row"><span>جمع کالاها</span><b class="num">${formatPrice(o.totals.subtotal)}</b></div>
        ${
          o.totals.savings > 0
            ? `<div class="sum-row savings"><span>سود شما</span><b class="num">${formatPrice(o.totals.savings)}</b></div>`
            : ''
        }
        <div class="sum-row"><span>هزینه ارسال (${method})</span><b class="num">${o.totals.shippingCost === 0 ? 'رایگان' : formatPrice(o.totals.shippingCost)}</b></div>
        <div class="sum-total"><span>مبلغ کل</span><b class="num">${formatPrice(o.totals.total)}</b></div>
      </div>
    </div>

    <!-- payment -->
    <div class="account-panel">
      <h2>پرداخت و ارسال</h2>
      <p style="font-size:.86rem;line-height:2.1;color:var(--color-ink-600)">
        روش پرداخت: ${payFa[o.paymentMethodId] ?? 'پرداخت آنلاین'}<br/>
        روش ارسال: ${method}<br/>
        زمان تخمینی تحویل: <b>${o.deliveryEstimate ?? '۳ تا ۵ روز کاری'}</b><br/>
        ${o.dateLabel ? `تاریخ ثبت: <span class="num">${o.dateLabel}</span>` : ''}
      </p>
    </div>

    <div style="margin-top:1.6rem;display:flex;gap:.7rem">
      <a href="${PAGE_HREF('orders.html')}" class="btn btn-outline">بازگشت به لیست</a>
      <a href="${PAGE_HREF('shop.html')}" class="btn btn-dark">خرید مجدد اقلام</a>
    </div>`;
}

function emptyState() {
  return `
    <div class="empty-state">
      <span class="empty-icon">${icon('package', 30)}</span>
      <h3>هنوز سفارشی ثبت نکرده‌ای.</h3>
      <p>اولین خریدت را انجام بده تا اینجا ببینی‌اش!</p>
      <a href="${PAGE_HREF('shop.html')}" class="btn btn-dark">شروع خرید</a>
    </div>`;
}

function statusBadge(status) {
  const s = ORDER_STATUS[status] ?? { fa: status, tone: 'muted' };
  return `<span class="badge badge-${s.tone} num">${s.fa}</span>`;
}
