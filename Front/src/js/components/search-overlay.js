/* ============================================================
   search-overlay.js — global search experience
   Shortcut: Ctrl+K or «/»
   ============================================================ */
import { productService } from '../services/products.js';
import { categoryService } from '../services/categories.js';
import { formatPrice } from '../utils/format-price.js';
import { icon, guardImage, debounce } from '../utils/helpers.icons.js';
import { gsap, lockBody, unlockBody } from '../animations/gsap.js';

const POPULAR = ['مانتو', 'کتانی', 'کیف چرم', 'هودی', 'پیراهن مجلسی', 'لوفر'];

const PAGE_HREF = (p) => `${location.pathname.includes('/pages/') ? '' : 'pages/'}${p}`;

export function createSearchOverlay() {
  const root = document.createElement('div');
  root.className = 'search-overlay';
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');
  root.setAttribute('aria-label', 'جستجو');
  root.hidden = true;
  root.innerHTML = `
    <div class="search-backdrop" data-search-close></div>
    <div class="search-panel">
      <div class="container-x">
        <form class="search-bar" role="search" data-search-form>
          ${icon('search', 22)}
          <input type="search" class="search-input" placeholder="دنبال چی می‌گردی؟ نام محصول، برند یا دسته‌بندی…"
            aria-label="عبارت جستجو" autocomplete="off" />
          <button type="button" class="btn btn-ghost btn-icon btn-sm" data-search-close aria-label="بستن جستجو">
            ${icon('close', 20)}
          </button>
        </form>

        <div class="search-results" data-search-results>
          <section class="search-section">
            <h3>پیشنهادهای جستجو</h3>
            <div class="search-chips">
              ${POPULAR.map((t) => `<button type="button" class="chip" data-chip="${t}">${t}</button>`).join('')}
            </div>
          </section>
          <section class="search-section">
            <h3>دسته‌بندی‌ها</h3>
            <div class="search-cats" data-search-cats></div>
          </section>
        </div>
      </div>
    </div>`;
  document.body.appendChild(root);

  const input = root.querySelector('.search-input');
  const resultsBox = root.querySelector('[data-search-results]');
  let isOpen = false;

  /* default category tiles */
  categoryService.getAll().then((cats) => {
    root.querySelector('[data-search-cats]').innerHTML =
      cats
        .map(
          (c) => `
        <a href="${PAGE_HREF('shop.html')}?cat=${c.slug}" class="search-cat">
          <img src="${c.image}" alt="" loading="lazy" />
          <span>${c.name}</span>
        </a>`,
        )
        .join('');
  });

  function open(prefill = '') {
    if (isOpen) return;
    isOpen = true;
    root.hidden = false;
    lockBody();
    input.value = prefill;
    if (prefill) runSearch(prefill);
    gsap
      .timeline()
      .fromTo(
        root.querySelector('.search-backdrop'),
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.25 },
      )
      .fromTo(
        root.querySelector('.search-panel'),
        { yPercent: -100 },
        { yPercent: 0, duration: 0.5, ease: 'power4.out' },
        '<',
      );
    requestAnimationFrame(() => input.focus());
  }

  function close() {
    if (!isOpen) return;
    isOpen = false;
    gsap
      .timeline({ onComplete: () => {
        root.hidden = true;
        unlockBody();
      } })
      .to(root.querySelector('.search-panel'), { yPercent: -100, duration: 0.35, ease: 'power3.in' })
      .to(root.querySelector('.search-backdrop'), { autoAlpha: 0, duration: 0.25 }, '<0.05');
  }

  /* ---------- live search ---------- */
  async function renderResults(q, products, cats) {
    if (!q.trim()) {
      resultsBox.innerHTML = `
        <section class="search-section">
          <h3>پیشنهادهای جستجو</h3>
          <div class="search-chips">
            ${POPULAR.map((t) => `<button type="button" class="chip" data-chip="${t}">${t}</button>`).join('')}
          </div>
        </section>
        <section class="search-section">
          <h3>دسته‌بندی‌ها</h3>
          <div class="search-cats" data-search-cats>
            ${cats
              .map(
                (c) => `
              <a href="${PAGE_HREF('shop.html')}?cat=${c.slug}" class="search-cat">
                <img src="${c.image}" alt="" loading="lazy" />
                <span>${c.name}</span>
              </a>`,
              )
              .join('')}
          </div>
        </section>`;
      return;
    }

    if (!products.length) {
      resultsBox.innerHTML = `
        <div class="empty-state">
          <span class="empty-icon">${icon('search', 30)}</span>
          <h3>محصولی مطابق جستجوی شما پیدا نشد.</h3>
          <p>بررسی املای کلمات را امتحان کن یا فیلترها را حذف کن.</p>
          <div style="display:flex;gap:.6rem;flex-wrap:wrap;justify-content:center">
            <button class="btn btn-outline btn-sm" data-chip="مانتو">مشاهده مانتو</button>
            <a class="btn btn-dark btn-sm" href="${PAGE_HREF('shop.html')}">مشاهده جدیدترین محصولات</a>
          </div>
        </div>`;
      return;
    }

    resultsBox.innerHTML = `
      <section class="search-section">
        <h3>محصولات مرتبط <span class="num" style="color:var(--color-ink-400)">(${new Intl.NumberFormat('fa-IR').format(products.length)})</span></h3>
        <div class="search-grid">
          ${products
            .slice(0, 8)
            .map(
              (p) => `
            <a class="search-item" href="${PAGE_HREF('product.html')}?p=${p.slug}">
              <span class="si-img"><img src="${p.images[0]}" alt="${p.name}" loading="lazy"/></span>
              <span class="si-body">
                <span class="si-name">${p.name}</span>
                <span class="si-price num">${formatPrice(p.price)}</span>
              </span>
            </a>`,
            )
            .join('')}
        </div>
      </section>
      ${
        products.length > 8
          ? `<a class="link-underline" style="color:var(--color-cobalt-500)" href="${PAGE_HREF('shop.html')}?q=${encodeURIComponent(q)}">مشاهده همه‌ی نتایج</a>`
          : ''
      }`;
  }

  async function runSearch(q) {
    const [products, cats] = await Promise.all([
      productService.search(q),
      categoryService.getAll(),
    ]);
    const matchedCats = q.trim()
      ? cats.filter((c) => c.name.includes(q.trim()))
      : cats;
    await renderResults(q, products, matchedCats);
    guardAllImages(resultsBox);
  }
  const debouncedSearch = debounce((v) => runSearch(v), 260);

  function guardAllImages(scopeEl) {
    scopeEl.querySelectorAll('img').forEach((im) =>
      guardImage(im, 'تصویر محصول'),
    );
  }

  input.addEventListener('input', () => debouncedSearch(input.value));

  root.addEventListener('click', (e) => {
    if (e.target.closest('[data-search-close]')) close();
    const chip = e.target.closest('[data-chip]');
    if (chip) {
      input.value = chip.dataset.chip;
      runSearch(chip.dataset.chip);
      input.focus();
    }
  });
  root.querySelector('[data-search-form]').addEventListener('submit', (e) => {
    e.preventDefault();
    location.href = `${PAGE_HREF('shop.html')}?q=${encodeURIComponent(input.value.trim())}`;
  });

  /* global shortcuts */
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      isOpen ? close() : open();
    } else if (e.key === '/' && !isOpen && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName ?? '')) {
      e.preventDefault();
      open();
    } else if (e.key === 'Escape' && isOpen) {
      close();
    }
  });

  return { open, close };
}
