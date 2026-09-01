/* ============================================================
   collection.js — editorial collection pages (§41)
   ============================================================ */
import { COLLECTIONS } from '../data/collections.js';
import { productService } from '../services/products.js';
import { createProductCard } from '../components/product-card.js';
import { icon } from '../utils/helpers.icons.js';
import { reveal, parallax } from '../animations/gsap.js';

const PAGE_HREF = (p) => `${location.pathname.includes('/pages/') ? '' : 'pages/'}${p}`;
const HOME_HREF = location.pathname.includes('/pages/') ? '../index.html' : 'index.html';
const fa = (n) => new Intl.NumberFormat('fa-IR').format(n);

export async function init() {
  const main = document.getElementById('main');
  const slug = new URLSearchParams(location.search).get('c');
  const collection = slug && slug !== 'all'
    ? COLLECTIONS.find((c) => c.slug === slug)
    : null;

  if (!collection) return renderAllCollections(main);

  document.title = `کالکشن ${collection.name} | مد استایل`;
  const products = await productService.getMany(collection.productIds);

  main.innerHTML = `
    <section class="collection-hero">
      <img src="${collection.image}" alt="${collection.name}" fetchpriority="high"/>
      <div class="ch-scrim"></div>
      <div class="container-x ch-body">
        <span class="num ch-latin">${collection.latinName}</span>
        <h1>کالکشن ${collection.name}</h1>
        <p>${collection.story}</p>
        <a href="#col-products" class="btn btn-light">مشاهده محصولات ${icon('chevron-down', 16)}</a>
      </div>
    </section>

    <div class="container-x section-sm">
      <nav class="breadcrumbs" aria-label="مسیر صفحه">
        <a href="${HOME_HREF}">خانه</a><span class="bc-sep">/</span>
        <span aria-current="page">کالکشن ${collection.name}</span>
      </nav>

      <!-- editorial strip -->
      <div class="col-hero-strip" data-reveal style="--tone:${collection.tone}">
        <p class="ch-quote">«${collection.story}»</p>
      </div>

      <header class="section-head" style="margin-top:2rem">
        <h2 id="col-products" class="display-2">محصولات کالکشن
          <span class="badge badge-muted num">${fa(products.length)} محصول</span></h2>
        <a href="${PAGE_HREF('shop.html')}" class="link-underline" style="color:var(--color-cobalt-500)">همه محصولات</a>
      </header>

      <div class="product-grid" data-col-grid></div>
    </div>

    <!-- other collections -->
    <section class="container-x section" data-other-collections></section>`;

  /* grid */
  const grid = main.querySelector('[data-col-grid]');
  products.forEach((p) => grid.appendChild(createProductCard(p)));

  /* other collections */
  const others = COLLECTIONS.filter((c) => c.slug !== collection.slug);
  main.querySelector('[data-other-collections]').innerHTML = `
    <header class="section-head" data-reveal>
      <h2 class="display-2">کالکشن‌های دیگر</h2>
      <a href="${PAGE_HREF('collection.html')}?c=all" class="link-underline" style="color:var(--color-cobalt-500)">همه کالکشن‌ها</a>
    </header>
    <div class="all-cols-grid">
      ${others
        .map(
          (c) => `
        <a href="${PAGE_HREF('collection.html')}?c=${c.slug}" class="col-card" data-reveal>
          <span class="col-img img-frame grain">
            <img src="${c.image}" alt="${c.name}" loading="lazy"/>
            <span class="col-tone" style="background:${c.tone}"></span>
            <span class="col-scrim"></span>
          </span>
          <span class="col-body">
            <span class="col-latin num">${c.latinName}</span>
            <span class="col-name">${c.name}</span>
          </span>
        </a>`,
        )
        .join('')}
    </div>`;

  parallax(main.querySelector('.collection-hero'));
  reveal(main);
}

function renderAllCollections(main) {
  document.title = 'کالکشن‌ها | مد استایل';
  main.innerHTML = `
    <div class="container-x section-sm">
      <nav class="breadcrumbs"><a href="${HOME_HREF}">خانه</a><span class="bc-sep">/</span><span aria-current="page">کالکشن‌ها</span></nav>
      <header style="margin-block:1rem 2rem">
        <span class="eyebrow">جهان‌های استایل</span>
        <h1 class="display-1">کالکشن‌های مد استایل</h1>
        <p style="color:var(--color-ink-500);max-width:520px;margin-top:.4rem">
          هر کالکشن یک حال‌وهوا دارد؛ از مینیمال روزمره تا فرم‌های کلاسیک.
        </p>
      </header>

      <div class="all-cols-grid">
        ${COLLECTIONS.map(
          (c) => `
          <a href="${PAGE_HREF('collection.html')}?c=${c.slug}" class="col-card" data-reveal>
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
          </a>`,
        ).join('')}
      </div>
    </div>`;
}
