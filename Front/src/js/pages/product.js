/* ============================================================
   product.js — product details page
   ============================================================ */
import { productService, getMockReviews } from '../services/products.js';
import { CATEGORIES } from '../data/categories.js';
import { COLORS } from '../data/constants.js';
import { cartState } from '../state/cart-state.js';
import { wishlistState } from '../state/wishlist-state.js';
import { productState } from '../state/product-state.js';
import { createGallery } from '../components/gallery.js';
import { createProductSlider } from '../components/product-slider.js';
import { formatPrice, formatNumber } from '../utils/format-price.js';
import { icon } from '../utils/helpers.icons.js';
import { showToast } from '../components/toast.js';
import { reveal } from '../animations/gsap.js';

const fa = (n) => new Intl.NumberFormat('fa-IR').format(n);
const PAGE_HREF = (p) => `${location.pathname.includes('/pages/') ? '' : 'pages/'}${p}`;
const catName = (id) => CATEGORIES.find((c) => c.id === id)?.name ?? '';

function renderNotFound(main) {
  document.title = 'محصول یافت نشد | مد استایل';
  main.innerHTML = `
    <div class="container-x">
      <nav class="breadcrumbs" style="padding-block:1.4rem .2rem">
        <a href="index.html">خانه</a><span class="bc-sep">/</span>
        <a href="shop.html">فروشگاه</a><span class="bc-sep">/</span>
        <span aria-current="page">نامشخص</span>
      </nav>
      <div class="empty-state">
        <span class="empty-icon">${icon('package', 30)}</span>
        <h3>این محصول در دسترس نیست.</h3>
        <p>ممکن است حذف شده یا آدرس اشتباه باشد؛ از فروشگاه ما دیدن کن.</p>
        <a href="${PAGE_HREF('shop.html')}" class="btn btn-dark">مشاهده محصولات</a>
      </div>
    </div>`;
}

export async function init() {
  const main = document.getElementById('main');
  const slug = new URLSearchParams(location.search).get('p');
  const product = slug ? await productService.getProduct(slug) : null;
  if (!product) return renderNotFound(main);

  document.title = `${product.name} | مد استایل`;
  productState.pushRecentlyViewed(product.id);

  const sizeable = !product.sizes.includes('اندازه آزاد');
  let color = product.colors[0];
  let size = null;
  let qty = 1;

  main.innerHTML = `
    <div class="container-x" style="padding-block:1.4rem .2rem">
      <nav class="breadcrumbs" aria-label="مسیر صفحه">
        <a href="../index.html">خانه</a><span class="bc-sep">/</span>
        <a href="${PAGE_HREF('shop.html')}?cat=${product.category}">${catName(product.category)}</a>
        <span class="bc-sep">/</span>
        <span aria-current="page">${product.name}</span>
      </nav>
    </div>

    <section class="container-x pdp-layout">
      <!-- info column (visually right in RTL → first in DOM) -->
      <div class="pdp-info">
        <span class="pc-cat"><a href="${PAGE_HREF('shop.html')}?cat=${product.category}" style="color:var(--color-cobalt-500)">${catName(product.category)}</a> · ${product.brand}</span>
        <h1 style="font-size:clamp(1.4rem,2.4vw,2rem);font-weight:800;line-height:1.5;margin:.25rem 0 .5rem">
          ${product.name}
          ${product.newArrival ? '<span class="badge badge-new" style="vertical-align:middle;margin-inline-start:.5rem">جدید</span>' : ''}
        </h1>

        <div style="display:flex;align-items:center;gap:1.1rem;flex-wrap:wrap">
          <span class="pc-rating num" style="font-size:.85rem">${starsHtml(product.rating)} ${fa(product.rating)}
            <i style="opacity:.6">(${fa(product.reviews)} نظر)</i></span>
          ${
            product.stock > 0
              ? `<span class="badge badge-success">${icon('check', 12)} موجود در انبار</span>`
              : '<span class="badge badge-muted">ناموجود</span>'
          }
          ${product.stock > 0 && product.stock <= 6 ? `<span class="num badge badge-warning">تنها ${fa(product.stock)} عدد باقی مانده</span>` : ''}
        </div>

        <div class="pc-price-row" style="margin-top:1rem;gap:.8rem">
          <b class="num" style="font-size:1.7rem;font-weight:800;${product.discount ? 'color:var(--color-cobalt-600)' : ''}">${formatPrice(product.price)}</b>
          ${
            product.discount
              ? `<del class="pc-old-price num" style="font-size:1rem">${formatPrice(product.originalPrice, { unit: false })}</del>
                 <span class="badge badge-sale">${fa(product.discount)}٪ تخفیف</span>`
              : ''
          }
        </div>
        <p style="font-size:.78rem;color:var(--color-ink-400);margin-top:.3rem;display:flex;align-items:center;gap:.35rem">
          ${icon('card', 14)} امکان پرداخت اقساطی تا ۴ ماه بدون بهره (درگاه بانکی)
        </p>

        <div style="margin-top:1.4rem">
          <p class="variant-label">رنگ: <b data-color-name>${COLORS[color]?.fa ?? ''}</b></p>
          <div class="variant-row" data-colors>
            ${product.colors
              .map(
                (c, i) =>
                  `<button type="button" class="swatch swatch-lg ${i === 0 ? 'selected' : ''}"
                    style="background:${COLORS[c]?.hex}" data-color="${c}"
                    aria-label="${COLORS[c]?.fa}" aria-pressed="${i === 0}"></button>`,
              )
              .join('')}
          </div>
        </div>

        ${
          sizeable
            ? `<div style="margin-top:1.2rem">
                <p class="variant-label">
                  سایز: <span data-size-selected style="color:var(--color-ink-400)">انتخاب نشده</span>
                  <button type="button" class="link-underline" data-open-size-guide
                    style="color:var(--color-cobalt-500);font-size:.78rem;background:none;border:none;cursor:pointer">
                    ${icon('ruler', 13)} راهنمای انتخاب سایز
                  </button>
                </p>
                <div class="variant-row" data-sizes>
                  ${product.sizes.map((s) => `<button type="button" class="size-chip" data-size="${s}">${s}</button>`).join('')}
                </div>
              </div>`
            : ''
        }

        <div style="display:flex;gap:.7rem;align-items:center;margin-top:1.6rem;flex-wrap:wrap">
          <div class="qty-stepper" data-qty>
            <button type="button" data-inc aria-label="افزایش تعداد">${icon('plus', 15)}</button>
            <span class="qty-value num" data-value>۱</span>
            <button type="button" data-dec aria-label="کاهش تعداد">${icon('minus', 15)}</button>
          </div>
          <button type="button" class="btn btn-primary btn-lg" data-add-cart style="flex:1"
            ${product.stock <= 0 ? 'disabled' : ''}>
            ${icon('cart', 18)} افزودن به سبد خرید
          </button>
          <button type="button" class="btn btn-icon btn-outline btn-lg" data-pdp-wish
            aria-label="افزودن به علاقه‌مندی‌ها" aria-pressed="${wishlistState.has(product.id)}"
            style="${wishlistState.has(product.id) ? 'color:var(--color-coral-500)' : ''}">
            ${icon('heart', 20)}
          </button>
        </div>

        <ul class="pdp-perks">
          <li>${icon('truck', 17)} ارسال سریع سراسر کشور</li>
          <li>${icon('refresh', 16)} ۷ روز مهلت بازگشت کالا</li>
          <li>${icon('shield', 16)} ضمانت اصالت کالا</li>
        </ul>

        <div class="accordion" data-accordion style="margin-top:1.6rem"></div>
      </div>

      <!-- gallery column -->
      <div class="pdp-gallery-wrap" data-gallery></div>
    </section>

    <section class="container-x section-sm" id="reviews-section" data-reveal></section>
    <div id="related-root"></div>
    <div id="recent-root"></div>`;

  /* ---------- gallery ---------- */
  main.querySelector('[data-gallery]').appendChild(createGallery(product.images, product.name));

  /* ---------- accordions ---------- */
  const ACC = [
    ['توضیحات محصول', `<p>${product.description}</p>`],
    [
      'جزئیات',
      `<ul style="display:grid;gap:.35rem">
         <li>برند: ${product.brand}</li>
         <li>جنس: ${product.material}</li>
         <li>رنگ‌های موجود: ${product.colors.map((c) => COLORS[c]?.fa ?? c).join('، ')}</li>
         <li>کد کالا: <span class="num">${product.id.toUpperCase()}</span></li>
       </ul>`,
    ],
    ['جنس و متریال', `<p>این محصول از ${product.material} تهیه شده است؛ پارچه‌ای با کیفیت لمس عالی و دوخت تمیز که پس از شست‌وشو فرم خود را حفظ می‌کند.</p>`],
    [
      'نحوه شست‌وشو',
      `<ul style="display:grid;gap:.35rem">
        <li>شست‌وشو با آب سرد (حداکثر ۳۰ درجه)</li>
        <li>از سفیدکننده استفاده نکنید</li>
        <li>اتوی ملایم با حرارت کم</li>
        <li>خشک کردن در سایه، دور از نور مستقیم آفتاب</li>
      </ul>`,
    ],
    [
      'ارسال و بازگشت',
      `<p>ارسال تهران با پیک فوری همان روز؛ شهرستان ۲ تا ۴ روز کاری با پست پیشتاز. تا ۷ روز پس از تحویل می‌توانی بدون قید و شرط بازگشت دهی؛ فقط برچسب و بسته‌بندی سالم باشد.</p>`,
    ],
  ];
  const accRoot = main.querySelector('[data-accordion]');
  ACC.forEach(([title, body], i) => {
    const item = document.createElement('div');
    item.className = `accordion-item${i === 0 ? ' open' : ''}`;
    item.innerHTML = `
      <button type="button" class="accordion-trigger" aria-expanded="${i === 0}">
        <span>${title}</span>${icon('chevron-down', 17, 'acc-chevron')}
      </button>
      <div class="accordion-panel"><div><div class="accordion-panel-inner">${body}</div></div></div>`;
    item.querySelector('.accordion-trigger').addEventListener('click', () => {
      const open = item.classList.contains('open');
      item.classList.toggle('open');
      item.querySelector('.accordion-trigger').setAttribute('aria-expanded', String(!open));
    });
    accRoot.appendChild(item);
  });

  /* ---------- variant interactions ---------- */
  main.querySelector('[data-colors]').addEventListener('click', (e) => {
    const sw = e.target.closest('[data-color]');
    if (!sw) return;
    color = sw.dataset.color;
    main.querySelectorAll('[data-colors] .swatch').forEach((s) => {
      s.classList.toggle('selected', s === sw);
      s.setAttribute('aria-pressed', String(s === sw));
    });
    main.querySelector('[data-color-name]').textContent = COLORS[color]?.fa ?? '';
  });

  main.querySelector('[data-sizes]')?.addEventListener('click', (e) => {
    const chip = e.target.closest('[data-size]');
    if (!chip) return;
    size = chip.dataset.size;
    main.querySelectorAll('[data-sizes] .size-chip').forEach((c) =>
      c.classList.toggle('selected', c === chip),
    );
    const label = main.querySelector('[data-size-selected]');
    label.textContent = size;
    label.style.color = 'var(--color-ink-900)';
  });

  main.querySelector('[data-qty]').addEventListener('click', (e) => {
    if (e.target.closest('[data-inc]')) qty = Math.min(10, qty + 1);
    if (e.target.closest('[data-dec]')) qty = Math.max(1, qty - 1);
    main.querySelector('[data-value]').textContent = fa(qty);
  });

  main.querySelector('[data-add-cart]').addEventListener('click', () => {
    if (sizeable && !size) {
      showToast('لطفاً سایز را انتخاب کن.', { type: 'error' });
      main.querySelector('[data-sizes]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    cartState.add(product, { color, size: size ?? '', qty });
    showToast('به سبد خرید اضافه شد.', { type: 'cart' });
  });

  const wishBtn = main.querySelector('[data-pdp-wish]');
  wishBtn.addEventListener('click', () => {
    const added = wishlistState.toggle(product.id);
    wishBtn.setAttribute('aria-pressed', String(added));
    wishBtn.style.color = added ? 'var(--color-coral-500)' : '';
    showToast(added ? 'به علاقه‌مندی‌ها اضافه شد.' : 'از علاقه‌مندی‌ها حذف شد.', {
      type: added ? 'wishlist' : 'info',
    });
  });

  main.querySelector('[data-open-size-guide]')?.addEventListener('click', () => {
    import('../components/size-guide.js').then((m) => m.openSizeGuide());
  });

  /* ---------- reviews ---------- */
  const reviewsEl = main.querySelector('#reviews-section');
  const reviews = getMockReviews(product);
  reviewsEl.innerHTML = `
    <header class="section-head" style="margin-bottom:1.4rem">
      <h2 class="display-2">دیدگاه کاربران (${fa(product.reviews)})</h2>
    </header>
    <div class="reviews-layout">
      <aside class="review-summary num">
        <b style="font-size:2.4rem;font-weight:800">${fa(product.rating)}</b>
        <div style="display:grid;justify-items:center;gap:.2rem">
          ${starsHtml(product.rating, 18)}
          <span style="color:var(--color-ink-400);font-size:.78rem">از ${fa(product.reviews)} دیدگاه ثبت‌شده</span>
        </div>
      </aside>
      <div class="review-list">
        ${reviews
          .map(
            (r) => `
          <article class="review-card">
            <header style="display:flex;justify-content:space-between;gap:1rem;flex-wrap:wrap">
              <b style="font-size:.9rem">${r.author}</b>
              <span style="font-size:.76rem;color:var(--color-ink-400)" class="num">${r.date}</span>
            </header>
            ${starsHtml(r.rating, 13)}
            <p style="font-size:.88rem;color:var(--color-ink-600);line-height:2">${r.text}</p>
            <span style="font-size:.74rem;color:var(--color-ink-400)">${r.variant}</span>
          </article>`,
          )
          .join('')}
      </div>
    </div>
    <p style="font-size:.72rem;color:var(--color-ink-300);margin-top:1rem">
      * دیدگاه‌های نمایشی برای دمو هستند.
    </p>`;

  /* ---------- related + recently viewed ---------- */
  const [related] = await Promise.all([productService.getRelated(product, 10)]);
  document.getElementById('related-root').replaceWith(
    createProductSlider({
      eyebrow: 'پیشنهاد ما',
      title: 'شاید این‌ها را هم بپسندی',
      linkLabel: '',
      href: `${PAGE_HREF('shop.html')}?cat=${product.category}`,
      products: related,
    }),
  );

  const recentIds = productState.getRecentlyViewed(product.id);
  if (recentIds.length >= 2) {
    const recentProducts = await productService.getMany(recentIds);
    if (recentProducts.length >= 2) {
      document.getElementById('recent-root').replaceWith(
        createProductSlider({
          eyebrow: null,
          title: 'محصولاتی که اخیراً دیدی',
          linkLabel: '',
          href: `${PAGE_HREF('shop.html')}`,
          products: recentProducts,
        }),
      );
    }
  }

  reveal(main);
}

function starsHtml(rating, size = 15) {
  const full = Math.round(rating);
  let out = '<span class="stars">';
  for (let i = 1; i <= 5; i++) {
    out += `<span style="opacity:${i <= full ? 1 : 0.22};display:inline-flex">${icon('star', size)}</span>`;
  }
  return out + '</span>';
}
