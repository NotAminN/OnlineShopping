/* ============================================================
   shop.js — product listing page: filters, sort, grid, pagination
   ============================================================ */
import { CATEGORIES } from '../data/categories.js';
import {
  createFilterState,
  applyFilters,
  DEFAULT_FILTERS,
} from '../state/filter-state.js';
import { createFilterPanel, createSortControl } from '../components/filter-panel.js';
import { createProductCard } from '../components/product-card.js';
import { icon } from '../utils/helpers.icons.js';
import { toFaDigits } from '../utils/format-price.js';
import { drawerOpen, drawerClose, reveal } from '../animations/gsap.js';
import { productService } from '../services/products.js';

let PRODUCTS = [];

const fa = (n) => new Intl.NumberFormat('fa-IR').format(n);

/* ---------- URL param helpers ---------- */
function stateFromParams() {
  const p = new URLSearchParams(location.search);
  const st = {};
  const cat = p.get('cat');
  // We can't rely on CATEGORIES array for verification anymore if it's empty, 
  // but let's assume valid for now or fetch categories
  if (cat) st.categories = [cat];
  if (p.get('q')) st.query = p.get('q');
  if (p.get('sale') === '1') st.onlyDiscount = true;
  if (p.get('sort')) st.sort = p.get('sort');
  return st;
}

function syncUrl(filters) {
  const p = new URLSearchParams();
  const singleCat =
    filters.categories.length === 1 ? filters.categories[0] : null;
  if (singleCat) p.set('cat', singleCat);
  if (filters.query) p.set('q', filters.query);
  if (filters.onlyDiscount) p.set('sale', '1');
  if (filters.sort !== DEFAULT_FILTERS.sort) p.set('sort', filters.sort);
  const qs = p.toString();
  history.replaceState(null, '', `${location.pathname}${qs ? `?${qs}` : ''}`);
}

export async function init() {
  // Fetch all products for client-side filtering (to preserve existing UI logic)
  const data = await productService.getProducts({ limit: 1000 });
  PRODUCTS = data.items;

  const main = document.getElementById('main');

  /* ---------- static shell ---------- */
  const initial = stateFromParams();
  const filterState = createFilterState(initial);
  const catLabel = initial.categories?.[0]
    ? (await import('../services/categories.js')).categoryService.getCategories().then(cats => cats.find((c) => c.slug === initial.categories[0])?.name)
    : initial.onlyDiscount
      ? 'تخفیف‌ها'
      : 'همه محصولات';

  document.title = `${await catLabel || 'محصولات'} | مد استایل`;

  main.innerHTML = `
    <div class="container-x" style="padding-block:1.4rem .2rem">
      <nav class="breadcrumbs" aria-label="مسیر صفحه">
        <a href="index.html">خانه</a>
        <span class="bc-sep">/</span>
        <span aria-current="page">${await catLabel || 'محصولات'}</span>
      </nav>
    </div>

    <div class="container-x">
      <header style="margin-bottom:1.8rem">
        <h1 class="display-1">${await catLabel || 'محصولات'}</h1>
        <p data-result-count style="color:var(--color-ink-500);font-size:.9rem;margin-top:.3rem"></p>
      </header>

      <div class="shop-layout">
        <aside class="filter-panel" aria-label="فیلتر محصولات" data-filter-mount></aside>

        <div>
          <div class="shop-toolbar">
            <button type="button" class="btn btn-outline btn-sm desktop-hidden" data-open-filters>
              ${icon('filter', 16)} فیلترها
              <span class="badge badge-info num hidden" data-filter-count>۰</span>
            </button>
            <div data-sort-mount></div>
          </div>

          <div class="active-filters" data-active-filters></div>

          <div class="product-grid" data-grid></div>

          <div data-pagination-wrap style="margin-top:2.5rem"></div>
        </div>
      </div>
    </div>

    <!-- mobile sticky bar -->
    <div class="mobile-filter-bar container-x">
      <button type="button" class="btn btn-dark btn-sm" data-open-filters style="flex:1">
        ${icon('filter', 16)} فیلترها
      </button>
      <button type="button" class="btn btn-outline btn-sm" data-open-sort style="flex:1">
        ${icon('rows', 16)} مرتب‌سازی
      </button>
    </div>`;

  /* ---------- mounts ---------- */
  const grid = main.querySelector('[data-grid]');
  const countEl = main.querySelector('[data-result-count]');
  const pagWrap = main.querySelector('[data-pagination-wrap]');
  const activeWrap = main.querySelector('[data-active-filters]');

  main.querySelector('[data-filter-mount]').appendChild(
    createFilterPanel(filterState),
  );
  main.querySelector('[data-sort-mount]').appendChild(
    createSortControl(filterState),
  );

  function skeletons(count = 10) {
    grid.innerHTML = Array.from({ length: count })
      .map(() => `<div><div class="skeleton" style="aspect-ratio:3/4;border-radius:18px"></div>
        <div class="skeleton" style="height:.9rem;width:70%;margin-top:.7rem"></div>
        <div class="skeleton" style="height:.8rem;width:45%;margin-top:.45rem"></div></div>`)
      .join('');
  }

  /* ---------- render pipeline ---------- */
  let firstRender = true;
  function render() {
    const f = filterState.get();
    syncUrl(f);

    const filtered = applyFilters(PRODUCTS, f);
    const perPage = f.perPage;
    const pages = Math.max(1, Math.ceil(filtered.length / perPage));
    const page = Math.min(f.page, pages);
    const slice = filtered.slice((page - 1) * perPage, page * perPage);

    countEl.textContent =
      filtered.length > 0
        ? `${fa(filtered.length)} محصول`
        : '';

    /* grid */
    grid.innerHTML = '';
    if (!slice.length) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1">
          <span class="empty-icon">${icon('search', 30)}</span>
          <h3>محصولی پیدا نشد.</h3>
          <p>می‌توانی فیلترها را تغییر بدهی یا همه‌ی محصولات را ببینی.</p>
          <button type="button" class="btn btn-dark btn-sm" data-reset-all>حذف فیلترها</button>
        </div>`;
      grid.querySelector('[data-reset-all]')?.addEventListener('click', () => {
        filterState.reset(false);
      });
    } else {
      slice.forEach((p) => grid.appendChild(createProductCard(p)));
      if (firstRender || !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        import('../animations/gsap.js').then(({ stagger }) => stagger(grid.children));
      }
    }

    renderPagination(page, pages);
    renderActivePills(f);
    updateFilterCountBadge();

    firstRender = false;
  }

  function renderPagination(page, pages) {
    if (pages <= 1) {
      pagWrap.innerHTML = '';
      return;
    }
    const btn = (label, opts = {}) =>
      `<button type="button" class="page-btn ${opts.active ? 'active' : ''}" ${opts.disabled ? 'disabled' : ''}
         ${opts.go !== undefined ? `data-go="${opts.go}"` : ''} aria-label="${opts.label ?? ''}">
         ${label}
       </button>`;
    const chev = (dir) =>
      `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
         stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${
           dir === 'back'
             ? '<polyline points="9 18 15 12 9 6"/>'
             : '<polyline points="15 18 9 12 15 6"/>'
         }</svg>`;
    /* RTL: back = → , forward = ← */
    cells.push(btn(chev('fwd'), { go: page - 1, disabled: page === 1, label: 'صفحه قبل' }));
    for (let i = 1; i <= pages; i++) {
      cells.push(btn(i, { active: i === page, go: i }));
    }
    cells.push(btn(chev('back'), { go: page + 1, disabled: page === pages, label: 'صفحه بعد' }));
    pagWrap.innerHTML = `<nav class="pagination" aria-label="صفحه‌بندی">${cells.join('')}</nav>`;

    pagWrap.querySelectorAll('[data-go]').forEach((b) =>
      b.addEventListener('click', () => {
        filterState.setPage(Number(b.dataset.go));
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }),
    );
  }

  function renderActivePills(f) {
    const pills = [];
    const pushPill = (label, action) => pills.push(pill(label, action));
    f.categories.forEach((c) =>
      pushPill(CATEGORIES.find((x) => x.id === c)?.name ?? c, () =>
        filterState.toggleIn('categories', c),
      ),
    );
    f.brands.forEach((b) => pushPill(b, () => filterState.toggleIn('brands', b)));
    f.colors.forEach((c) => pushPill(COLOR_FA(c), () => filterState.toggleIn('colors', c)));
    f.sizes.forEach((s) => pushPill(`سایز ${s}`, () => filterState.toggleIn('sizes', s)));
    f.materials.forEach((m) => pushPill(m, () => filterState.toggleIn('materials', m)));
    if (f.onlyDiscount) pushPill('تخفیف‌دار', () => filterState.patch({ onlyDiscount: false }));
    if (f.onlyAvailable)
      pushPill('فقط موجود', () => filterState.patch({ onlyAvailable: false }));
    if (f.minRating)
      pushPill(`${toFaDigits(f.minRating)}★+`, () => filterState.patch({ minRating: 0 }));
    if (
      f.priceMin !== DEFAULT_FILTERS.priceMin ||
      f.priceMax !== DEFAULT_FILTERS.priceMax
    )
      pushPill('بازه قیمت', () =>
        filterState.patch({
          priceMin: DEFAULT_FILTERS.priceMin,
          priceMax: DEFAULT_FILTERS.priceMax,
        }),
      );
    if (f.query) pushPill(`«${f.query}»`, () => filterState.patch({ query: '' }));

    activeWrap.innerHTML =
      pills.length > 1 ? '<button type="button" class="link-underline" data-clear-all style="color:var(--color-coral-500)">حذف همه‌ی فیلترها</button>' : '';
    pills.forEach((p) => activeWrap.appendChild(p));
    activeWrap.querySelector('[data-clear-all]')?.addEventListener('click', () =>
      filterState.reset(false),
    );
  }

  function pill(label, action) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'af-pill';
    b.innerHTML = `${label} ${icon('close', 12)}`;
    b.addEventListener('click', action);
    return b;
  }
  const COLOR_FA_MAP = {
    black: 'مشکی', white: 'سفید', cream: 'کرم', beige: 'بژ', brown: 'قهوه‌ای',
    navy: 'سرمه‌ای', blue: 'آبی', green: 'سبز', gray: 'خاکستری', pink: 'صورتی',
    burgundy: 'زرشکی', lilac: 'بنفش کمرنگ', silver: 'نقره‌ای', goldish: 'طلایی',
  };
  function COLOR_FA(k) {
    return COLOR_FA_MAP[k] ?? k;
  }

  function updateFilterCountBadge() {
    const n = filterState.activeCount();
    main.querySelectorAll('[data-filter-count]').forEach((el) => {
      el.textContent = fa(n);
      el.classList.toggle('hidden', n === 0);
    });
  }

  /* ---------- mobile filter drawer & sort sheet ---------- */
  function openFiltersDrawer() {
    let d = document.getElementById('filters-drawer');
    if (!d) {
      d = document.createElement('aside');
      d.className = 'drawer';
      d.id = 'filters-drawer';
      d.setAttribute('role', 'dialog');
      d.setAttribute('aria-modal', 'true');
      d.setAttribute('aria-label', 'فیلترها');
      d.style.insetInlineEnd = '0';
      d.innerHTML = `<div class="drawer-head">
          <b>فیلترها</b>
          <button class="btn btn-ghost btn-icon btn-sm" data-close-filters aria-label="بستن">${icon('close', 20)}</button>
        </div>
        <div class="drawer-body" style="padding:1.2rem 1.4rem" data-filters-body></div>`;
      document.body.appendChild(d);
      d.querySelector('[data-filters-body]').appendChild(
        createFilterPanel(filterState, { onApply: closeFiltersDrawer }),
      );
      d.querySelector('[data-close-filters]').addEventListener('click', closeFiltersDrawer);
      d.querySelector('[data-apply-filters]')?.addEventListener('click', closeFiltersDrawer);
    }
    const ov = ensureOverlay('filters-drawer-overlay', closeFiltersDrawer);
    drawerOpen(d, ov);
  }
  function closeFiltersDrawer() {
    drawerClose(
      document.getElementById('filters-drawer'),
      document.getElementById('filters-drawer-overlay'),
      () => document.getElementById('filters-drawer-overlay')?.remove(),
    );
  }

  function openSortSheet() {
    let s = document.getElementById('sort-sheet');
    if (s) return showSheet(s);
    s = document.createElement('div');
    s.className = 'bottom-sheet';
    s.id = 'sort-sheet';
    s.setAttribute('role', 'dialog');
    s.setAttribute('aria-modal', 'true');
    s.setAttribute('aria-label', 'مرتب‌سازی');
    s.innerHTML = `
      <div class="bs-handle" aria-hidden="true"></div>
      <h3 style="font-weight:700;padding:0 1.4rem">مرتب‌سازی بر اساس</h3>
      <div class="bs-options" data-bs-options></div>`;
    const opts = s.querySelector('[data-bs-options]');
    [
      ['newest', 'جدیدترین'],
      ['popular', 'محبوب‌ترین'],
      ['best-selling', 'پرفروش‌ترین'],
      ['cheapest', 'ارزان‌ترین'],
      ['expensive', 'گران‌ترین'],
      ['most-discount', 'بیشترین تخفیف'],
    ].forEach(([v, l]) => {
      const row = document.createElement('label');
      row.className = 'bs-option';
      row.innerHTML = `<span>${l}</span>${icon('check', 17, 'bs-check')}<input type="radio" name="sort-m" value="${v}"/>`;
      const input = row.querySelector('input');
      input.addEventListener('change', () => {
        filterState.patch({ sort: v });
        hideSheet(s);
      });
      opts.appendChild(row);
    });
    document.body.appendChild(s);
    showSheet(s);
  }
  function showSheet(el) {
    const ov = ensureOverlay('sheet-overlay', () => hideSheet(el));
    ov.hidden = false;
    el.classList.add('open');
    requestAnimationFrame(() => el.classList.add('shown'));
  }
  function hideSheet(el) {
    document.getElementById('sheet-overlay')?.classList.remove('visible');
    setTimeout(() => document.getElementById('sheet-overlay')?.remove(), 250);
    el.classList.remove('shown');
    setTimeout(() => el.classList.remove('open'), 300);
  }

  main.querySelectorAll('[data-open-filters]').forEach((b) =>
    b.addEventListener('click', openFiltersDrawer),
  );
  main
    .querySelectorAll('[data-open-sort]')
    .forEach((b) => b.addEventListener('click', openSortSheet));

  function ensureOverlay(id, onClick) {
    let ov = document.getElementById(id);
    if (!ov) {
      ov = document.createElement('div');
      ov.className = 'drawer-overlay visible';
      ov.id = id;
      ov.addEventListener('click', onClick);
      document.body.appendChild(ov);
    }
    return ov;
  }

  filterState.subscribe(render);
  skeletons();
  setTimeout(render, 120); /* brief skeleton flash for perceived smoothness */

  reveal(main);
}
