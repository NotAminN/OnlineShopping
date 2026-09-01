/* ============================================================
   account.js — user account dashboard (profile, addresses, settings)
   ============================================================ */
import { userState } from '../state/user-state.js';
import { wishlistState } from '../state/wishlist-state.js';
import { orderService } from '../services/orders.js';
import { icon } from '../utils/helpers.icons.js';
import { showToast } from '../components/toast.js';
import { createModal } from '../components/modal.js';
import { PROVINCES } from '../data/demo-user.js';

const PAGE_HREF = (p) => `${location.pathname.includes('/pages/') ? '' : 'pages/'}${p}`;
const HOME_HREF = location.pathname.includes('/pages/') ? '../index.html' : 'index.html';
const fa = (n) => new Intl.NumberFormat('fa-IR').format(n);

const TABS = [
  ['profile', 'پروفایل', 'user'],
  ['addresses', 'آدرس‌ها', 'pin'],
  ['settings', 'تنظیمات', 'settings'],
];

export function init() {
  document.title = 'حساب کاربری | مد استایل';

  if (!userState.isLoggedIn()) {
    /* demo gate: show login CTA */
    const main = document.getElementById('main');
    main.innerHTML = `
      <div class="container-x section">
        <div class="empty-state">
          <span class="empty-icon">${icon('user', 30)}</span>
          <h3>برای دیدن حساب کاربری، وارد شو.</h3>
          <p>(نسخه نمایشی — ورود بدون پیامک واقعی انجام می‌شود)</p>
          <button type="button" class="btn btn-primary" data-open-login>ورود / ثبت‌نام</button>
        </div>
      </div>`;
    main.querySelector('[data-open-login]').addEventListener('click', () => {
      import('../components/overlays.js').then(() => {});
      import('../components/auth-modal.js').then((m) => m.openAuthModal());
    });
    return;
  }

  const profile = userState.getProfile();
  const main = document.getElementById('main');
  main.innerHTML = `
    <div class="container-x" style="padding-block:1.4rem .2rem">
      <nav class="breadcrumbs"><a href="${HOME_HREF}">خانه</a><span class="bc-sep">/</span><span aria-current="page">حساب کاربری</span></nav>
    </div>

    <section class="container-x" style="padding-top:.6rem;padding-bottom:3rem">
      <h1 class="display-2" style="margin-bottom:1.8rem">حساب کاربری من</h1>

      <div class="account-layout">
        <!-- quick links -->
        <aside class="account-nav">
          <div class="an-user">
            <span class="an-avatar">${profile.avatarInitials ?? ''}</span>
            <span>
              <b>${userState.fullName() || profile.username || 'کاربر'}</b><br/>
              <i class="num" style="font-style:normal;font-size:.76rem;color:var(--color-ink-400)">${profile.mobile ?? ''}</i>
            </span>
          </div>
          <nav class="an-nav-list" aria-label="بخش‌های حساب">
            <button type="button" data-tab="orders" class="active">
              ${icon('package', 17)} سفارش‌های من
              <span class="badge badge-muted num" data-orders-badge>…</span>
            </button>
            <button type="button" data-tab="wishlist">
              ${icon('heart', 17)} علاقه‌مندی‌ها
              <span class="badge badge-muted num" data-wishlist-badge>${fa(wishlistState.count())}</span>
            </button>
            ${TABS.map(
              ([id, label, ic]) =>
                `<button type="button" data-tab="${id}">${icon(ic, 17)} ${label}</button>`,
            ).join('')}
            <a href="${PAGE_HREF('shop.html')}">${icon('cart', 17)} فروشگاه</a>
            <button type="button" data-logout style="color:var(--color-danger)">
              ${icon('logout', 17)} خروج از حساب
            </button>
          </nav>
        </aside>

        <!-- panel -->
        <div class="account-panel" data-panel></div>
      </div>
    </section>`;

  const panel = main.querySelector('[data-panel]');

  async function renderOrders() {
    const list = await orderService.getOrders();
    const badge = main.querySelector('[data-orders-badge]');
    if (badge) badge.textContent = fa(list.length);
    panel.innerHTML = `
      <h2>سفارش‌های من
        <a href="${PAGE_HREF('orders.html')}" class="link-underline btn-text-danger" style="color:var(--color-cobalt-500)">همه سفارش‌ها</a>
      </h2>
      ${
        list.length
          ? `<div>${list.slice(0, 3).map(orderCard).join('')}</div>`
          : emptyBox('هنوز سفارشی ثبت نکرده‌ای.', 'اولین خریدت را شروع کن!')
      }`;
  }

  async function renderWishlist() {
    const products = await wishlistState.products();
    panel.innerHTML = `
      <h2>علاقه‌مندی‌ها
        <a href="${PAGE_HREF('wishlist.html')}" style="color:var(--color-cobalt-500);font-size:.85rem" class="link-underline">مدیریت</a></h2>
      ${
        products.length
          ? `<div class="order-thumb-row" style="flex-wrap:wrap;gap:.8rem">
              ${products.slice(0, 12).map((p) => `
                <a href="${PAGE_HREF('product.html')}?p=${p.slug}" title="${p.name}"
                  style="width:86px;height:108px;border-radius:12px;overflow:hidden;display:block;background:var(--color-shell)">
                  <img src="${p.images[0]}" alt="${p.name}" loading="lazy"
                    style="width:100%;height:100%;object-fit:cover"/>
                </a>`).join('')}
             </div>`
          : emptyBox('لیست علاقه‌مندی‌هایت خالی است.', 'قلب روی محصول‌های موردعلاقه بزن.')
      }`;
  }

  function renderProfile() {
    panel.innerHTML = `
      <h2>پروفایل من</h2>
      <form class="profile-form" novalidate>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem">
          <div class="field"><label for="afn">نام</label>
            <input id="afn" name="firstName" class="input" value="${profile.firstName ?? ''}"/></div>
          <div class="field"><label for="aln">نام خانوادگی</label>
            <input id="aln" name="lastName" class="input" value="${profile.lastName ?? ''}"/></div>
          <div class="field"><label for="amobile">موبایل (غیرقابل تغییر در دمو)</label>
            <input id="amobile" class="input num" value="${profile.mobile ?? ''}" disabled/></div>
          <div class="field"><label for="aemail">ایمیل</label>
            <input id="aemail" name="email" class="input num-ltr" dir="ltr" style="text-align:right" value="${profile.email ?? ''}"/></div>
        </div>
        ${profile.joinedAt ? `<p style="font-size:.78rem;color:var(--color-ink-400)">عضو مد استایل از ${profile.joinedAt}</p>` : ''}
        <button class="btn btn-dark" type="submit" style="margin-top:1rem">ذخیره تغییرات</button>
      </form>`;
    panel.querySelector('.profile-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const f = e.target;
      if (f.firstName.value.trim().length < 2 || f.lastName.value.trim().length < 2) {
        showToast('نام و نام خانوادگی را کامل کن.', { type: 'error' });
        return;
      }
      try {
        await userState.updateProfile({
          firstName: f.firstName.value.trim(),
          lastName: f.lastName.value.trim(),
          email: f.email.value.trim(),
        });
        showToast('اطلاعات با موفقیت ذخیره شد.', { type: 'success' });
        init(); /* refresh header of page */
      } catch (err) {
        showToast(err?.message || 'ذخیره اطلاعات ناموفق بود.', { type: 'error' });
      }
    });
  }

  function renderAddresses() {
    const addrs = userState.getAddresses();
    panel.innerHTML = `
      <h2>آدرس‌های من
        <button type="button" class="btn btn-outline btn-sm" data-add-addr>${icon('plus', 15)} افزودن</button></h2>
      ${
        addrs.length
          ? `<div style="display:grid;gap:.9rem">
              ${addrs
                .map(
                  (a) => `
                <div class="addr-card ${a.isDefault ? 'default' : ''}">
                  <div style="display:flex;justify-content:space-between;align-items:center;gap:.7rem">
                    <b style="font-size:.92rem">${a.title}${a.isDefault ? ' <span class="badge badge-info">پیش‌فرض</span>' : ''}</b>
                    <span style="display:flex;gap:.2rem">
                      <button class="btn btn-ghost btn-icon btn-sm" data-del-addr="${a.id}" aria-label="حذف آدرس">${icon('trash', 15)}</button>
                    </span>
                  </div>
                  <p style="font-size:.84rem;color:var(--color-ink-500);line-height:2">${a.province}، ${a.city}، ${a.line}</p>
                  <span class="num" style="font-size:.76rem;color:var(--color-ink-400)">${a.receiver} · ${a.phone} · کدپستی ${fa(a.postalCode)}</span>
                </div>`,
                )
                .join('')}
             </div>`
          : emptyBox('هنوز آدرسی ذخیره نکرده‌ای.', 'برای تسریع خرید یک آدرس اضافه کن.')
      }`;
    panel.querySelector('[data-add-addr]').addEventListener('click', () => openAddressModal());
    panel.querySelectorAll('[data-del-addr]').forEach((b) =>
      b.addEventListener('click', async () => {
        try {
          await userState.removeAddress(Number(b.dataset.delAddr));
          showToast('آدرس حذف شد.', { type: 'info' });
        } catch (err) {
          showToast(err?.message || 'حذف آدرس ناموفق بود.', { type: 'error' });
        }
        renderAddresses();
      }),
    );
  }

  function openAddressModal(existing = null) {
    const modal = createModal({ title: existing ? 'ویرایش آدرس' : 'افزودن آدرس جدید', width: 520 });
    modal.body.innerHTML = `
      <form data-addr-form novalidate style="display:grid;gap:.9rem">
        <div class="field"><label>عنوان</label>
          <input name="title" class="input" placeholder="خانه / محل کار" value="${existing?.title ?? ''}"/></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:.9rem">
          <div class="field"><label>استان</label>
            <select name="province" class="select">
              ${PROVINCES.map(
                (p) => `<option ${existing?.province === p ? 'selected' : ''}>${p}</option>`,
              ).join('')}
            </select></div>
          <div class="field"><label>شهر</label>
            <input name="city" class="input" value="${existing?.city ?? ''}"/></div>
        </div>
        <div class="field"><label>نشانی کامل</label>
          <textarea name="line" class="textarea" rows="2">${existing?.line ?? ''}</textarea></div>
        <div class="field"><label>نام گیرنده</label>
          <input name="receiver" class="input" value="${existing?.receiver ?? ''}" placeholder="مثلاً نام خودتان"/></div>
        <div style="grid-template-columns:1fr 1fr;display:grid;gap:.9rem">
          <div class="field"><label>کد پستی</label>
            <input name="postalCode" class="input num" inputmode="numeric" value="${existing?.postalCode ?? ''}"/></div>
          <div class="field"><label>شماره تماس گیرنده</label>
            <input name="phone" class="input num" inputmode="tel" value="${existing?.phone ?? ''}"/></div>
        </div>
        <label class="checkbox"><input type="checkbox" name="isDefault" ${!existing?.isDefault ? 'checked' : existing?.isDefault ? 'checked' : ''}/>
          <span>تنظیم به عنوان پیش‌فرض</span></label>
        <button class="btn btn-primary btn-block" type="submit">ذخیره آدرس</button>
      </form>`;
    modal.body.querySelector('[data-addr-form]').addEventListener('submit', async (e) => {
      e.preventDefault();
      const f = e.target;
      if (!f.title.value.trim() || !f.city.value.trim() || f.line.value.trim().length < 10 || !f.receiver.value.trim()) {
        showToast('عنوان، شهر، نشانی کامل و نام گیرنده را پر کن.', { type: 'error' });
        return;
      }
      try {
        await userState.saveAddress({
          id: existing?.id,
          title: f.title.value.trim(),
          province: f.province.value,
          city: f.city.value.trim(),
          line: f.line.value.trim(),
          receiver: f.receiver.value.trim(),
          postalCode: toLatinDigitsSafe(f.postalCode.value),
          phone: toLatinDigitsSafe(f.phone.value),
          isDefault: f.isDefault.checked,
        });
        showToast('آدرس ذخیره شد.', { type: 'success' });
        modal.close();
        renderAddresses();
      } catch (err) {
        showToast(err?.message || 'ذخیره آدرس ناموفق بود.', { type: 'error' });
      }
    });
    modal.open();
  }

  function renderSettings() {
    panel.innerHTML = `
      <h2>تنظیمات</h2>
      <div style="display:grid;gap:.9rem;max-width:480px">
        <label class="checkbox"><input type="checkbox" checked disabled/><span>نمایش محصولات پیشنهادی بر اساس بازدیدها</span></label>
        <label class="checkbox"><input type="checkbox" checked disabled/><span>اعلان کالکشن‌های جدید (باشگاه استایل)</span></label>
        <hr style="border-color:var(--color-ink-100);margin-block:.4rem"/>
        <p style="font-size:.82rem;color:var(--color-ink-400);line-height:2">
          این نسخه نمایشی است؛ داده‌های حساب فقط روی همین مرورگر ذخیره شده‌اند و هیچ اطلاعات حساسی نگهداری نمی‌شود.
        </p>
        <button type="button" class="btn btn-danger btn-sm" data-wipe-demo>پاک کردن داده‌های دمو</button>
      </div>`;
    panel.querySelector('[data-wipe-demo]').addEventListener('click', () => {
      import('../utils/storage.js').then(({ storage }) => {
        Object.values(storageKeys()).forEach((k) => storage.remove(k));
        showToast('داده‌های دمو پاک شد. صفحه رفرش می‌شود…', { type: 'info' });
        setTimeout(() => location.reload(), 900);
      });
    });
  }

  const storageKeysMap = {
    cart: null,
  };
  function storageKeys() {
    /* local mirror of STORAGE_KEYS to avoid extra import cycle weight */
    return {
      cart: 'cart',
      wishlist: 'wishlist',
      recentlyViewed: 'recently-viewed',
      user: 'demo-user',
      orders: 'demo-orders',
      filters: 'shop-filters',
      profile: 'demo-profile',
      addresses: 'demo-addresses',
    };
  }
  void storageKeysMap;

  /* tab switching */
  const views = {
    orders: renderOrders,
    wishlist: renderWishlist,
    profile: renderProfile,
    addresses: renderAddresses,
    settings: renderSettings,
  };
  main.querySelectorAll('[data-tab]').forEach((btn) =>
    btn.addEventListener('click', () => {
      main.querySelectorAll('[data-tab]').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      views[btn.dataset.tab]?.();
    }),
  );
  main.querySelector('[data-logout]').addEventListener('click', () => {
    userState.logout();
    showToast('از حساب خارج شدی.', { type: 'info' });
    setTimeout(() => (location.href = HOME_HREF), 600);
  });

  renderOrders();
}

function emptyBox(title, note) {
  return `
    <div class="empty-state" style="padding:2.5rem 1rem">
      <span class="empty-icon">${icon('package', 26)}</span>
      <h3 style="font-size:.98rem">${title}</h3>
      <p style="font-size:.82rem">${note}</p>
    </div>`;
}

/* API orders (snake_case, items with product_detail) and locally cached
   checkout orders (camelCase with totals/images) are both accepted. */
function normalizeOrder(o) {
  const items = (o.items ?? []).map((it) => {
    const p = it.product_detail ?? it.product ?? {};
    return {
      image: it.image ?? p.images?.[0] ?? '/images/fallback.svg',
      qty: it.qty ?? it.quantity ?? 1,
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

function orderCard(rawOrder) {
  const o = normalizeOrder(rawOrder);
  return `
    <article class="order-card">
      <div class="oc-row">
        <b class="num" style="color:var(--color-ink-900)">سفارش ${o.id}</b>
        ${statusBadge(o.status)}
      </div>
      <div class="oc-row">
        <span class="num">${o.dateLabel ?? ''}</span>
        <span class="num">${formatPrice(o.totals.total)}</span>
      </div>
      <div class="oc-row">
        <span class="order-thumb-row">
          ${o.items.slice(0, 4).map((it) => `<img src="${it.image}" alt="" loading="lazy"/>`).join('')}
        </span>
        <a href="${PAGE_HREF('orders.html')}?o=${o.id}" class="link-underline btn-text-danger" style="color:var(--color-cobalt-500)">جزئیات</a>
      </div>
    </article>`;
}

import { ORDER_STATUS } from '../data/constants.js';
import { formatPrice } from '../utils/format-price.js';
function statusBadge(status) {
  const s = ORDER_STATUS[status] ?? { fa: status, tone: 'muted' };
  return `<span class="badge badge-${s.tone}">${s.fa}</span>`;
}

function toLatinDigitsSafe(s) {
  return String(s)
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .trim();
}
