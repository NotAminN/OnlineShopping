/* ============================================================
   checkout.js — 5-step checkout (frontend simulation)
   Steps: گیرنده → آدرس → ارسال → پرداخت → تأیید
   ============================================================ */
import { cartState } from '../state/cart-state.js';
import { checkoutState } from '../state/checkout-state.js';
import { userState } from '../state/user-state.js';
import { shippingService } from '../services/categories.js';
import { orderService } from '../services/orders.js';
import { SHIPPING_METHODS, FREE_SHIPPING_THRESHOLD } from '../data/constants.js';
import { COLORS } from '../data/constants.js';
import { formatPrice } from '../utils/format-price.js';
import { icon } from '../utils/helpers.icons.js';
import { showToast } from '../components/toast.js';

const fa = (n) => new Intl.NumberFormat('fa-IR').format(n);
const PAGE_HREF = (p) => `${location.pathname.includes('/pages/') ? '' : 'pages/'}${p}`;
const HOME_HREF = location.pathname.includes('/pages/') ? '../index.html' : 'index.html';
import { PROVINCES } from '../data/demo-user.js';

const STEP_TITLES = ['اطلاعات گیرنده', 'آدرس', 'روش ارسال', 'روش پرداخت', 'تأیید سفارش'];

let draft;
let shippingMethods;

export function init() {
  document.title = 'تکمیل سفارش | مد استایل';
  const main = document.getElementById('main');

  /* success view */
  const orderId = new URLSearchParams(location.search).get('success');
  if (orderId) return renderSuccess(main, orderId);

  if (cartState.count() === 0) {
    main.innerHTML = `
      <div class="container-x" style="padding-block:2rem">
        <nav class="breadcrumbs"><a href="${HOME_HREF}">خانه</a><span class="bc-sep">/</span><span aria-current="page">تسویه حساب</span></nav>
        <div class="empty-state">
          <span class="empty-icon">${icon('cart', 30)}</span>
          <h3>برای تسویه حساب، اول چیزی به سبد اضافه کن.</h3>
          <a href="${PAGE_HREF('shop.html')}" class="btn btn-dark">مشاهده محصولات</a>
        </div>
      </div>`;
    return;
  }

  draft = checkoutState.loadDraft();
  /* prefill from profile */
  if (!draft.receiver.firstName) {
    const prof = userState.getProfile();
    draft.receiver.firstName = prof.firstName;
    draft.receiver.lastName = prof.lastName;
    draft.receiver.phone = prof.mobile;
    const addr = userState.defaultAddress();
    if (addr) {
      draft.address.province = addr.province;
      draft.address.city = addr.city;
      draft.address.line = addr.line;
      draft.address.postalCode = addr.postalCode;
    }
  }

  shippingService.getMethods().then((m) => {
    shippingMethods = m;
    buildShell(main);
    renderStep();
  });
}

/* ---------------- shell ---------------- */
function buildShell(main) {
  main.innerHTML = `
    <div class="container-x" style="padding-block:1.4rem .2rem">
      <nav class="breadcrumbs"><a href="${HOME_HREF}">خانه</a><span class="bc-sep">/</span>
        <a href="${PAGE_HREF('cart.html')}">سبد خرید</a><span class="bc-sep">/</span>
        <span aria-current="page">تسویه حساب</span></nav>
    </div>
    <section class="container-x" style="padding-top:.6rem;padding-bottom:3rem">
      <h1 class="display-2" style="margin-bottom:1.8rem">تکمیل سفارش</h1>
      <ol class="checkout-steps num" data-steps></ol>
      <div class="checkout-layout">
        <div data-step-panel></div>
        <aside data-summary class="cart-summary"></aside>
      </div>
    </section>`;
}

function renderSteps(currentIdx) {
  const stepsEl = document.querySelector('[data-steps]');
  stepsEl.innerHTML = STEP_TITLES.map(
    (t, i) => `
    <li class="co-step ${i + 1 === currentIdx ? 'current' : i + 1 < currentIdx ? 'done' : ''}">
      <span class="co-dot">${i + 1 < currentIdx ? icon('check', 15) : fa(i + 1)}</span>
      <span>${t}</span>
    </li>`,
  ).join('');
}

function renderSummary() {
  const { subtotal } = cartState.totals();
  const method =
    shippingMethods.find((m) => m.id === draft.shippingMethodId) ?? SHIPPING_METHODS[0];
  const shipCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : method.cost;
  const total = subtotal + shipCost;
  document.querySelector('[data-summary]').innerHTML = `
    <h3>خلاصه سفارش</h3>
    <ul style="display:grid;gap:.7rem;margin-bottom:1rem;max-height:260px;overflow-y:auto">
      ${cartState
        .getItems()
        .map(
          (it) => `
        <li style="display:flex;gap:.7rem;align-items:center;font-size:.82rem">
          <img src="${it.image}" alt="" loading="lazy"
            style="width:44px;height:56px;border-radius:9px;object-fit:cover;background:var(--color-shell)"/>
          <span style="flex:1">${it.name}<br/>
            <i style="font-style:normal;color:var(--color-ink-400);font-size:.72rem">
              ${COLORS[it.color]?.fa ?? it.color}${it.size ? ` · ${it.size}` : ''} × ${fa(it.qty)}</i></span>
          <b class="num">${formatPrice(it.price * it.qty, { unit: false })}</b>
        </li>`,
        )
        .join('')}
    </ul>
    <div class="sum-row"><span>جمع کالاها</span><b class="num">${formatPrice(subtotal)}</b></div>
    <div class="sum-row">
      <span>ارسال (${method.title})</span>
      <b class="num">${shipCost === 0 ? 'رایگان' : formatPrice(shipCost)}</b>
    </div>
    <div class="sum-total"><span>مبلغ نهایی</span><b class="num">${formatPrice(total)}</b></div>`;
  return total;
}

function saveDraft() {
  checkoutState.saveDraft(draft);
}

/* ---------------- step renderer ---------------- */
function renderStep() {
  const idx = draft.step;
  renderSteps(idx);
  const panel = document.querySelector('[data-step-panel]');
  renderSummary();

  const navHtml = (nextLabel = 'ادامه') => `
    <div class="co-nav">
      ${
        idx > 1
          ? `<button type="button" class="btn btn-outline" data-prev>${icon('chevron-end', 16)} مرحله قبل</button>`
          : `<a href="${PAGE_HREF('cart.html')}" class="btn btn-outline">بازگشت به سبد</a>`
      }
      <button type="button" class="btn btn-primary btn-lg" data-next>${
        idx === 5 ? 'ثبت نهایی سفارش' : nextLabel
      } ${icon('chevron-start', 16)}</button>
    </div>`;

  if (idx === 1) {
    panel.innerHTML = receiverStep(navHtml);
    bindReceiver(panel);
  } else if (idx === 2) {
    panel.innerHTML = addressStep(navHtml);
    bindAddress(panel);
  } else if (idx === 3) {
    panel.innerHTML = shippingStep(navHtml);
    bindShipping(panel);
  } else if (idx === 4) {
    panel.innerHTML = paymentStep(navHtml);
    bindPayment(panel);
  } else {
    panel.innerHTML = reviewStep(navHtml);
    bindReview(panel);
  }

  panel.querySelector('[data-next]')?.addEventListener('click', () => {
    if (idx === 5) return; /* final step has its own handler */
    if (validateCurrent(idx)) {
      draft.step = Math.min(5, idx + 1);
      saveDraft();
      renderStep();
    }
  });
  panel.querySelector('[data-prev]')?.addEventListener('click', () => {
    draft.step = Math.max(1, idx - 1);
    saveDraft();
    renderStep();
  });
}

/* ---------- step 1: receiver ---------- */
function receiverStep(navHtml) {
  return `<section class="co-panel">
    <h2>${icon('user', 18)} اطلاعات گیرنده</h2>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem">
      <div class="field">
        <label for="fn">نام</label>
        <input id="fn" name="firstName" class="input" value="${draft.receiver.firstName}" placeholder="نیلوفر"/>
        <span class="field-error" data-err-firstName></span>
      </div>
      <div class="field">
        <label for="ln">نام خانوادگی</label>
        <input id="ln" name="lastName" class="input" value="${draft.receiver.lastName}" placeholder="رضایی"/>
        <span class="field-error" data-err-lastName></span>
      </div>
      <div class="field">
        <label for="ph">شماره موبایل</label>
        <input id="ph" name="phone" class="input num" inputmode="tel" value="${draft.receiver.phone}" placeholder="09123456789"/>
        <span class="field-error" data-err-phone></span>
      </div>
    </div>
    ${navHtml()}
  </section>`;
}

function validateCurrent(step) {
  clearErrors();
  let ok = true;
  if (step === 1) {
    ok = check('firstName', (v) => v.trim().length >= 2, 'نام را کامل وارد کن.') && ok;
    ok = check('lastName', (v) => v.trim().length >= 2, 'نام خانوادگی را کامل وارد کن.') && ok;
    ok =
      check('phone', (v) => /^09\d{9}$/.test(toLatin(v)), 'شماره موبایل معتبر نیست (مثل 09123456789).') && ok;
  }
  if (step === 2) {
    ok = checkSelect('province', 'استان را انتخاب کن.') && ok;
    ok = check('city', (v) => v.trim().length >= 2, 'شهر را وارد کن.') && ok;
    ok = check('line', (v) => v.trim().length >= 10, 'نشانی کامل را وارد کن.') && ok;
    ok =
      check('postalCode', (v) => /^\d{10}$/.test(toLatin(v)), 'کد پستی باید ۱۰ رقم باشد.') && ok;
  }
  return ok;
}

const toLatin = (s) =>
  String(s)
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));

function check(name, fn, msg) {
  const input = document.querySelector(`[name="${name}"]`);
  const err = document.querySelector(`[data-err-${name}]`);
  const valid = input && fn(input.value);
  if (!valid && err) err.textContent = msg;
  if (!valid && input) input.classList.add('has-error');
  return Boolean(valid);
}
function checkSelect(name, msg) {
  const sel = document.querySelector(`[name="${name}"]`);
  const err = document.querySelector(`[data-err-${name}]`);
  if (!sel?.value && err) err.textContent = msg;
  if (!sel?.value && sel) sel.classList.add('has-error');
  return Boolean(sel?.value);
}
function clearErrors() {
  document.querySelectorAll('.field-error').forEach((e) => (e.textContent = ''));
  document.querySelectorAll('.has-error').forEach((e) => e.classList.remove('has-error'));
}

function bindReceiver(panel) {
  panel.addEventListener('change', () => collect(panel));
  panel.addEventListener('input', debounceCollect(panel));
  function collect(p) {
    p.querySelectorAll('[name]').forEach((i) => {
      draft.receiver[i.name] = i.value;
    });
    saveDraft();
  }
  function debounceCollect(p) {
    let t;
    return () => {
      clearTimeout(t);
      t = setTimeout(() => collect(p), 400);
    };
  }
}

/* ---------- step 2: address ---------- */
function addressStep(navHtml) {
  const saved = userState.getAddresses();
  return `<section class="co-panel">
    <h2>${icon('pin', 18)} آدرس تحویل</h2>
    ${
      saved.length
        ? `<div style="display:grid;gap:.6rem;margin-bottom:1.4rem" data-saved-addrs>
            <p style="font-size:.8rem;color:var(--color-ink-500)">آدرس‌های ذخیره‌شده:</p>
            ${saved
              .map(
                (a) => `
              <label class="option-card" data-use-address="${a.id}">
                <span class="oc-radio"></span>
                <span><span class="oc-title">${a.title} — ${a.receiver}</span>
                  <span class="oc-note">${a.province}، ${a.city}، ${a.line}</span></span>
                <span></span>
              </label>`,
              )
              .join('')}
          </div>`
        : ''
    }
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:1rem">
      <div class="field">
        <label for="province">استان</label>
        <select id="province" name="province" class="select">
          <option value="">انتخاب استان…</option>
          ${PROVINCES.map(
            (p) => `<option ${draft.address.province === p ? 'selected' : ''}>${p}</option>`,
          ).join('')}
        </select>
        <span class="field-error" data-err-province></span>
      </div>
      <div class="field">
        <label for="city">شهر</label>
        <input id="city" name="city" class="input" value="${draft.address.city}" placeholder="تهران"/>
        <span class="field-error" data-err-city></span>
      </div>
    </div>
    <div class="field" style="margin-top:1rem">
      <label for="line">نشانی کامل</label>
      <textarea id="line" name="line" class="textarea" rows="2"
        placeholder="خیابان، کوچه، پلاک، واحد…">${draft.address.line}</textarea>
      <span class="field-error" data-err-line></span>
    </div>
    <div class="field" style="margin-top:1rem;max-width:240px">
      <label for="postalCode">کد پستی</label>
      <input id="postalCode" name="postalCode" class="input num" inputmode="numeric"
        value="${draft.address.postalCode}" placeholder="۱۹۹۸۷۴۵۶۳۱"/>
      <span class="field-error" data-err-postalCode></span>
    </div>
    <label class="checkbox" style="margin-top:1rem">
      <input type="checkbox" data-save-addr ${userState.isLoggedIn() ? 'checked' : 'disabled'}/>
      <span>ذخیره این آدرس در پروفایل من</span>
    </label>
    ${navHtml()}
  </section>`;
}

function bindAddress(panel) {
  panel.addEventListener('click', (e) => {
    const useBtn = e.target.closest('[data-use-address]');
    if (!useBtn) return;
    const a = userState.getAddress(useBtn.dataset.useAddress);
    Object.assign(draft.address, {
      province: a.province,
      city: a.city,
      line: a.line,
      postalCode: a.postalCode,
    });
    saveDraft();
    renderStep();
  });
  panel.addEventListener('input', () => {
    panel.querySelectorAll('[name]').forEach((i) => {
      draft.address[i.name] = i.value;
    });
  });
}

/* ---------- step 3: shipping ---------- */
function shippingStep(navHtml) {
  const { subtotal } = cartState.totals();
  return `<section class="co-panel">
    <h2>${icon('truck', 18)} روش ارسال</h2>
    <div style="display:grid;gap:.7rem" data-ship-options>
      ${SHIPPING_METHODS.map(
        (m) => `
        <label class="option-card ${draft.shippingMethodId === m.id ? 'selected' : ''}">
          <input type="radio" name="shippingMethodId" value="${m.id}"
            ${draft.shippingMethodId === m.id ? 'checked' : ''}/>
          <span class="oc-radio"></span>
          <span><span class="oc-title">${m.title}</span><span class="oc-note">${m.note}</span></span>
          <span class="oc-price num">${
            subtotal >= FREE_SHIPPING_THRESHOLD || m.cost === 0 ? 'رایگان' : formatPrice(m.cost)
          }</span>
        </label>`,
      )
      .join('')}
    </div>
    ${navHtml()}
  </section>`;
}

function bindShipping(panel) {
  panel.querySelectorAll('input[name="shippingMethodId"]').forEach((r) =>
    r.addEventListener('change', () => {
      draft.shippingMethodId = r.value;
      saveDraft();
      renderStep();
    }),
  );
}

/* ---------- step 4: payment ---------- */
const PAYMENTS = [
  { id: 'online', title: 'پرداخت آنلاین', note: 'انتقال به درگاه امن بانکی', icon: 'card' },
  { id: 'cod', title: 'پرداخت در محل', note: 'پرداخت هنگام دریافت کالا (تهران)', icon: 'wallet' },
  { id: 'wallet', title: 'کیف پول مد استایل', note: 'موجودی فعلی: صفر تومان (دمو)', icon: 'gift' },
];

function paymentStep(navHtml) {
  return `<section class="co-panel">
    <h2>${icon('card', 18)} روش پرداخت</h2>
    <div style="display:grid;gap:.7rem" data-pay-options>
      ${PAYMENTS.map(
        (p) => `
        <label class="option-card ${draft.paymentMethodId === p.id ? 'selected' : ''}">
          <input type="radio" name="paymentMethodId" value="${p.id}"
            ${draft.paymentMethodId === p.id ? 'checked' : ''}/>
          <span class="oc-radio"></span>
          <span style="display:flex;align-items:center;gap:.6rem">
            ${icon(p.icon, 20)}
            <span><span class="oc-title">${p.title}</span><span class="oc-note">${p.note}</span></span>
          </span>
          <span></span>
        </label>`,
      )
      .join('')}
    </div>
    <p style="font-size:.75rem;color:var(--color-ink-400);margin-top:1rem;line-height:1.9">
      ${icon('shield', 13)} این یک نسخه نمایشی است؛ هیچ پرداخت واقعی انجام نمی‌شود و ساختار برای اتصال به درگاه بانکی آماده است.
    </p>
    ${navHtml()}
  </section>`;
}

function bindPayment(panel) {
  panel.querySelectorAll('input[name="paymentMethodId"]').forEach((r) =>
    r.addEventListener('change', () => {
      draft.paymentMethodId = r.value;
      saveDraft();
      renderStep();
    }),
  );
}

/* ---------- step 5: review ---------- */
function reviewStep(navHtml) {
  const method = SHIPPING_METHODS.find((m) => m.id === draft.shippingMethodId);
  const pay = PAYMENTS.find((p) => p.id === draft.paymentMethodId);
  return `<section class="co-panel">
    <h2>${icon('check', 18)} بازبینی و تأیید</h2>
    <dl class="review-grid">
      <div><dt>گیرنده</dt><dd>${draft.receiver.firstName} ${draft.receiver.lastName} — ${draft.receiver.phone}</dd></div>
      <div><dt>آدرس</dt><dd>${draft.address.province}، ${draft.address.city}، ${draft.address.line} — کدپستی ${draft.address.postalCode}</dd></div>
      <div><dt>روش ارسال</dt><dd>${method.title} (${method.note})</dd></div>
      <div><dt>روش پرداخت</dt><dd>${pay.title}</dd></div>
    </dl>
    ${navHtml('ثبت نهایی سفارش')}
  </section>`;
}

function bindReview(panel) {
  const nextBtn = panel.querySelector('[data-next]');
  nextBtn.innerHTML = `${icon('sparkles', 17)} ثبت نهایی سفارش`;
  nextBtn.addEventListener('click', async () => {
    nextBtn.classList.add('is-loading');
    nextBtn.disabled = true;
    try {
      const method = SHIPPING_METHODS.find((m) => m.id === draft.shippingMethodId);
      const { subtotal, savings } = cartState.totals();
      const freeShip = subtotal >= FREE_SHIPPING_THRESHOLD;
      const totals = {
        subtotal,
        savings,
        shippingCost: freeShip ? 0 : method.cost,
        total: subtotal + (freeShip ? 0 : method.cost),
      };
      const order = await orderService.createOrder({
        items: cartState.getItems(),
        totals,
        address: { ...draft.address, receiver: `${draft.receiver.firstName} ${draft.receiver.lastName}`, phone: draft.receiver.phone },
        shippingMethodId: draft.shippingMethodId,
        paymentMethodId: draft.paymentMethodId,
      });

      if (panel.querySelector('[data-save-addr]')?.checked) {
        userState.saveAddress({
          title: 'آدرس جدید',
          province: draft.address.province,
          city: draft.address.city,
          line: draft.address.line,
          postalCode: draft.address.postalCode,
          receiver: `${draft.receiver.firstName} ${draft.receiver.lastName}`,
          phone: draft.receiver.phone,
          isDefault: false,
        }).catch(() => {});
      }

      cartState.clear();
      checkoutState.resetDraft();
      location.href = `${PAGE_HREF('checkout.html')}?success=${order.id}`;
    } catch (err) {
      showToast(err?.message || 'ثبت سفارش ناموفق بود. دوباره تلاش کن.', { type: 'error' });
      nextBtn.classList.remove('is-loading');
      nextBtn.disabled = false;
    }
  });
}

/* ---------- success ---------- */
async function renderSuccess(main, orderId) {
  const order = await orderService.getOrder(orderId);
  main.innerHTML = `
    <div class="container-x section">
      <div class="order-success">
        <span class="os-check">${icon('check', 40)}</span>
        <h1 class="display-2" style="margin-top:1.2rem">سفارش شما با موفقیت ثبت شد.</h1>
        <p style="color:var(--color-ink-500)">از خریدت ممنونیم! جزئیات سفارش برای پیگیری ذخیره شده است.</p>

        ${
          order
            ? `<div class="os-details">
                <div><span>شماره سفارش</span><b class="num">${order.id}</b></div>
                <div><span>مبلغ کل</span><b class="num">${formatPrice(order.total_price ?? order.totals?.total ?? 0)}</b></div>
                ${order.deliveryEstimate ? `<div><span>زمان تخمینی تحویل</span><b>${order.deliveryEstimate}</b></div>` : ''}
                ${order.address ? `<div><span>آدرس تحویل</span><b style="line-height:2">${order.address.province}، ${order.address.city}</b></div>` : ''}
               </div>`
            : ''
        }

        <div style="display:flex;gap:.7rem;justify-content:center;margin-top:1.8rem;flex-wrap:wrap">
          <a href="${PAGE_HREF('orders.html')}" class="btn btn-primary">مشاهده سفارش</a>
          <a href="${HOME_HREF}" class="btn btn-outline">بازگشت به خانه</a>
        </div>
      </div>
    </div>`;
}
