/* ============================================================
   home-sections.js — homepage composition (§86)
   ============================================================ */
import { categoryService } from '../services/categories.js';
import {
  productService,
} from '../services/products.js';
import { collectionService } from '../services/categories.js';
import { COLLECTIONS } from '../data/collections.js';
import { BANNER_SLIDES, EDITORIAL_SECTIONS, getSaleCountdownTarget } from '../data/home-content.js';
import { createProductSlider } from './product-slider.js';
import { icon, guardImage } from '../utils/helpers.icons.js';
import { gsap, reducedMotion, reveal, parallax } from '../animations/gsap.js';

const PAGE_HREF = (p) => `${location.pathname.includes('/pages/') ? '' : 'pages/'}${p}`;
const fa = (n) => new Intl.NumberFormat('fa-IR').format(n);

export async function renderHomeSections(mount) {
  if (!mount) return;

  /* ---------- 1. Category Showcase ---------- */
  const cats = await categoryService.getAll();
  const bySlug = (slug, fallbackIdx) =>
    cats.find((c) => (c.slug ?? c.id) === slug) ?? cats[fallbackIdx];
  const [women, men, shoes, bags, accessories] = ['women', 'men', 'shoes', 'bags', 'accessories']
    .map((slug, i) => bySlug(slug, i))
    .filter((c) => c && (c.slug ?? c.id) !== 'kids');
  if (!women || !men || !shoes || !bags || !accessories) {
    /* not enough categories to render the showcase grid */
  } else {
  const showcase = document.createElement('section');
  showcase.className = 'section';
  showcase.setAttribute('aria-label', 'دسته‌بندی‌ها');
  const [women, men, shoes, bags, accessories] = cats.filter((c) => c.id !== 'kids');
  showcase.innerHTML = `
    <div class="container-x">
      <div class="cat-grid">
        <a href="${PAGE_HREF('shop.html')}?cat=${women.slug}" class="cat-card cat-a" data-reveal>
          <img src="${women.image}" alt="زنانه" loading="lazy"/>
          <span class="cat-scrim"></span>
          <span class="cat-body"><h3>زنانه</h3><span>مشاهده محصولات ${icon('arrow-end', 15)}</span></span>
        </a>
        <a href="${PAGE_HREF('shop.html')}?cat=${men.slug}" class="cat-card cat-b" data-reveal>
          <img src="${men.image}" alt="مردانه" loading="lazy"/>
          <span class="cat-scrim"></span>
          <span class="cat-body"><h3>مردانه</h3><span>مشاهده محصولات ${icon('arrow-end', 15)}</span></span>
        </a>
        <a href="${PAGE_HREF('shop.html')}?cat=${shoes.slug}" class="cat-card cat-c" data-reveal data-reveal-delay=".08">
          <img src="${shoes.image}" alt="کفش" loading="lazy"/>
          <span class="cat-scrim"></span>
          <span class="cat-body"><h3>کفش</h3><span>${icon('arrow-end', 15)}</span></span>
        </a>
        <a href="${PAGE_HREF('shop.html')}?cat=${bags.slug}" class="cat-card cat-d" data-reveal data-reveal-delay=".12">
          <img src="${bags.image}" alt="کیف" loading="lazy"/>
          <span class="cat-scrim"></span>
          <span class="cat-body"><h3>کیف</h3><span>${icon('arrow-end', 15)}</span></span>
        </a>
        <a href="${PAGE_HREF('shop.html')}?cat=${accessories.slug}" class="cat-card cat-e" data-reveal data-reveal-delay=".16">
          <img src="${accessories.image}" alt="اکسسوری" loading="lazy"/>
          <span class="cat-scrim"></span>
          <span class="cat-body"><h3>اکسسوری</h3><span>${icon('arrow-end', 15)}</span></span>
        </a>
        <a href="${PAGE_HREF('shop.html')}" class="cat-banner" data-reveal data-reveal-delay=".2" aria-label="مشاهده همه دسته‌بندی‌ها">
          <img src="/images/banner-categories.jpg" alt="بنر دسته‌بندی‌ها" loading="lazy"/>
          <span class="cat-scrim"></span>
          <span class="cat-banner-body">
            <span class="cat-banner-eyebrow">دنیای مد</span>
            <span class="cat-banner-title">یک انتخاب برای هر لحظه</span>
            <span class="cat-banner-cta">مشاهده همه ${icon('arrow-end', 16)}</span>
          </span>
        </a>
      </div>
    </div>`;
  mount.appendChild(showcase);
  showcase.querySelectorAll('.cat-card img, .cat-banner img').forEach((i) => guardImage(i));
  }

  /* ---------- 2. New arrivals ---------- */
  const newArrivals = await productService.getNewArrivals(10);
  mount.appendChild(
    createProductSlider({
      id: 'new-arrivals',
      eyebrow: 'رسیدن‌های تازه',
      title: 'جدیدترین‌ها',
      linkLabel: 'خرید جدیدترین‌ها',
      href: `${PAGE_HREF('shop.html')}?sort=newest`,
      products: newArrivals,
    }),
  );

  /* ---------- 3. Editorial ---------- */
  mount.appendChild(buildEditorial(EDITORIAL_SECTIONS.main, 'editorial-main'));

  /* ---------- 4. Featured collection campaign slider ---------- */
  mount.appendChild(await buildCollectionSlider());

  /* ---------- 5. Trending ---------- */
  const trending = await productService.getTrending(10);
  mount.appendChild(
    createProductSlider({
      id: 'trending',
      eyebrow: 'پرطرفدارهای این روزها',
      title: 'ترندهای این هفته',
      linkLabel: 'محبوب‌ترین‌ها',
      href: `${PAGE_HREF('shop.html')}?sort=popular`,
      products: trending,
    }),
  );

  /* ---------- 6. Banner promo slider ---------- */
  mount.appendChild(buildBannerSlider());

  /* ---------- 7. Best sellers ---------- */
  const bestSellers = await productService.getBestSellers(10);
  mount.appendChild(
    createProductSlider({
      id: 'best-sellers',
      eyebrow: 'انتخاب اکثر مشتریان',
      title: 'پرفروش‌ترین‌ها',
      linkLabel: 'مشاهده همه',
      href: `${PAGE_HREF('shop.html')}?sort=best-selling`,
      products: bestSellers,
    }),
  );

  /* ---------- 8. Story ---------- */
  mount.appendChild(buildEditorial(EDITORIAL_SECTIONS.story, 'fashion-story'));

  /* ---------- 9. Sale ---------- */
  const saleProducts = await productService.getSaleProducts();
  mount.appendChild(buildSaleSection(saleProducts.slice(0, 10)));

  reveal(mount);
  parallax(document.querySelector('.editorial-media'));
}

/* ============================================================
   Section builders
   ============================================================ */
function buildEditorial(data, id) {
  const sec = document.createElement('section');
  sec.className = 'section editorial-section';
  if (id) sec.id = id;
  sec.innerHTML = `
    <div class="container-x editorial-layout">
      <figure class="editorial-media img-frame grain" data-reveal>
        <img src="${data.image}" alt="${data.title}" loading="lazy"/>
      </figure>
      <figcaption class="editorial-copy">
        <figure class="editorial-mini img-frame" data-reveal data-reveal-delay=".1">
          <img src="${data.secondary}" alt="" loading="lazy"/>
        </figure>
        <span class="eyebrow" data-reveal>${data.eyebrow}</span>
        <h2 class="display-1" data-reveal data-reveal-delay=".06">${data.title}</h2>
        <p class="text-body-lg" style="color:var(--color-ink-500)" data-reveal data-reveal-delay=".12">${data.text}</p>
        <a class="btn btn-dark btn-lg" href="${data.cta.href}" data-reveal data-reveal-delay=".18" style="margin-top:.5rem">
          ${data.cta.label}
        </a>
      </figcaption>
    </div>`;
  return sec;
}

async function buildCollectionSlider() {
  await collectionService.getAll();
  const sec = document.createElement('section');
  sec.className = 'section collection-slider-section';
  sec.innerHTML = `
    <div class="container-x">
      <div class="section-head" data-reveal>
        <div>
          <span class="eyebrow">کالکشن‌های ویژه</span>
          <h2 class="display-2">جهان‌هایی برای پوشیدن</h2>
        </div>
        <div class="section-actions" style="display:flex;align-items:center;gap:1rem">
          <a class="link-underline" href="${PAGE_HREF('collection.html')}?c=all" style="color:var(--color-cobalt-500)">همه کالکشن‌ها</a>
          <div class="p-slider-nav" data-col-nav></div>
        </div>
      </div>
    </div>
    <div class="container-x" data-reveal>
      <div class="col-track h-scroll" data-col-track>
        ${COLLECTIONS.map(
          (c) => `
          <article class="col-slide">
            <a href="${PAGE_HREF('collection.html')}?c=${c.slug}" class="col-card" aria-label="کالکشن ${c.name}">
              <span class="col-img img-frame grain">
                <img src="${c.image}" alt="${c.name}" loading="lazy"/>
                <span class="col-tone" style="background:${c.tone}"></span>
                <span class="col-scrim"></span>
              </span>
              <span class="col-body">
                <span class="col-latin num">${c.latinName}</span>
                <span class="col-name">${c.name}</span>
                <span class="col-story">${c.story.split('؛')[0]}.</span>
                <span class="link-underline col-link">مشاهده کالکشن ${icon('arrow-end', 14)}</span>
              </span>
            </a>
          </article>`,
        ).join('')}
      </div>
    </div>`;

  const track = sec.querySelector('[data-col-track]');
  guardAll(track);
  addSliderArrows(sec, '[data-col-nav]', track);

  /* drag-to-scroll desktop nicety */
  enableDragScroll(track);
  return sec;
}

function buildBannerSlider() {
  const sec = document.createElement('section');
  sec.className = 'section-sm';
  sec.setAttribute('aria-label','پیشنهادهای ویژه');
  sec.innerHTML = `
    <div class="container-x" data-reveal>
      <div class="banner-slider">
        ${BANNER_SLIDES.map(
          (b, i) => `
          <article class="banner-slide${i === 0 ? ' active' : ''}" style="--bn-bg:${b.tone};--bn-ac:${b.accent}"
            role="group" aria-label="${b.title}">
            <div class="banner-pattern" aria-hidden="true"></div>
            <div class="banner-copy">
              <span class="badge banner-kicker">${b.kicker}</span>
              <h3>${b.title}</h3>
              <p>${b.note}</p>
              <a class="btn btn-light btn-sm" href="${b.cta.href}">${b.cta.label}</a>
            </div>
            <span class="banner-big num">${fa(i + 1)}</span>
          </article>`,
        ).join('')}
        <div class="banner-dots" data-bn-dots>
          ${BANNER_SLIDES.map((_, i) => `<button type="button" class="bn-dot${i === 0 ? ' active' : ''}" data-bn-dot="${i}" aria-label="بنر ${fa(i + 1)}"></button>`).join('')}
        </div>
      </div>
    </div>`;

  /* rotation */
  const slides = [...sec.querySelectorAll('.banner-slide')];
  const dots = [...sec.querySelectorAll('[data-bn-dot]')];
  let idx = 0;
  let timer;
  const show = (n) => {
    idx = (n + slides.length) % slides.length;
    slides.forEach((s, i) => s.classList.toggle('active', i === idx));
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));
    if (!reducedMotion()) {
      gsap.fromTo(
        slides[idx].querySelector('.banner-copy'),
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
      );
    }
  };
  const schedule = () => {
    clearInterval(timer);
    timer = setInterval(() => show(idx + 1), 5200);
  };
  dots.forEach((d) =>
    d.addEventListener('click', () => {
      show(Number(d.dataset.bnDot));
      schedule();
    }),
  );
  if (!reducedMotion()) schedule();
  return sec;
}

function buildSaleSection(products) {
  const sec = document.createElement('section');
  sec.className = 'section sale-section';
  sec.innerHTML = `
    <div class="container-x">
      <div class="sale-head" data-reveal>
        <div>
          <span class="eyebrow" style="color:var(--color-coral-500)">فرصت محدود</span>
          <h2 class="display-2">فرصت‌های ویژه</h2>
          <p style="color:var(--color-ink-500);font-size:.92rem;margin-top:.4rem">
            تخفیف‌های واقعی روی قطعات منتخب؛ تا پایان هفته.
          </p>
        </div>
        <div class="countdown num" data-countdown aria-label="زمان باقی‌مانده فروش">
          ${['روز', 'ساعت', 'دقیقه', 'ثانیه']
            .map((l) => `<div class="cd-cell"><b data-cd-${l}>۰۰</b><span>${l}</span></div>`)
            .join('')}
        </div>
      </div>
      <div data-sale-slider></div>
    </div>`;

  /* countdown (demo target = end of week) */
  const target = getSaleCountdownTarget();
  const cells = {
    روز: sec.querySelector('[data-cd-روز]'),
    ساعت: sec.querySelector('[data-cd-ساعت]'),
    دقیقه: sec.querySelector('[data-cd-دقیقه]'),
    ثانیه: sec.querySelector('[data-cd-ثانیه]'),
  };
  const tick = () => {
    const diff = Math.max(0, target - Date.now());
    const d = Math.floor(diff / 86_400_000);
    const h = Math.floor((diff % 86_400_000) / 3_600_000);
    const m = Math.floor((diff % 3_600_000) / 60_000);
    const s = Math.floor((diff % 60_000) / 1000);
    const pad = (x) => String(x).padStart(2, '0').replace(/\d/g, (dg) => '۰۱۲۳۴۵۶۷۸۹'[dg]);
    cells['روز'].textContent = pad(d);
    cells['ساعت'].textContent = pad(h);
    cells['دقیقه'].textContent = pad(m);
    cells['ثانیه'].textContent = pad(s);
  };
  tick();
  setInterval(tick, 1000);

  sec.querySelector('[data-sale-slider]').replaceWith(
    createProductSlider({
      href: `${PAGE_HREF('shop.html')}?sale=1`,
      linkLabel: '',
      products,
      headless: true,
    }),
  );
  return sec;
}

/* ---------- helpers ---------- */
function guardAll(scopeEl) {
  scopeEl.querySelectorAll('img').forEach((i) => guardImage(i));
}

function addSliderArrows(scopeEl, navSelector, track) {
  const nav = scopeEl.querySelector(navSelector);
  if (!nav || !track) return;
  /* RTL: right-chevron = قبلی (back), left-chevron = بعدی (forward) */
  const prevBtn = document.createElement('button');
  prevBtn.type = 'button';
  prevBtn.className = 'ps-btn';
  prevBtn.setAttribute('aria-label', 'قبلی');
  prevBtn.innerHTML =
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>';
  const nextBtn = document.createElement('button');
  nextBtn.type = 'button';
  nextBtn.className = 'ps-btn';
  nextBtn.setAttribute('aria-label', 'بعدی');
  nextBtn.innerHTML =
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>';
  nav.append(prevBtn, nextBtn);
  const step = () => Math.max(track.clientWidth * 0.7, 280);
  prevBtn.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
  nextBtn.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
}

function enableDragScroll(track) {
  let isDown = false;
  let startX = 0;
  let startScroll = 0;
  track.addEventListener('pointerdown', (e) => {
    isDown = true;
    startX = e.clientX;
    startScroll = track.scrollLeft;
  });
  window.addEventListener('pointerup', () => (isDown = false));
  track.addEventListener(
    'pointermove',
    (e) => {
      if (!isDown) return;
      track.scrollLeft = startScroll - (e.clientX - startX);
    },
    { passive: true },
  );
}
