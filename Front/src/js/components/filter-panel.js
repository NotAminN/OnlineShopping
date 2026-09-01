/* ============================================================
   filter-panel.js — shop filtering UI (desktop sidebar +
   mobile bottom-sheet share the same instance)
   ============================================================ */
import { CATEGORIES } from '../data/categories.js';
import { BRANDS, COLORS, MATERIALS, SORT_OPTIONS } from '../data/constants.js';
const PRICE_BOUNDS = { min: 0, max: 50_000_000 };
import { formatPrice, toFaDigits } from '../utils/format-price.js';
import { icon } from '../utils/icons.js';

export function createFilterPanel(filterState, { onApply = null } = {}) {
  const panel = document.createElement('div');
  panel.className = 'filter-panel-content';

  const f = filterState.get();
  panel.innerHTML = `
    <div class="filter-head" data-filter-top>
      <h3>${icon('sliders', 18)} فیلترها</h3>
      <button type="button" class="link-underline btn-text-danger" data-clear-filters>حذف همه</button>
    </div>

    <div class="filter-group">
      <p class="filter-title">دسته‌بندی</p>
      <div class="filter-list">
        ${CATEGORIES.map(
          (c) => `
        <label class="checkbox">
          <input type="checkbox" name="categories" value="${c.id}" ${
            f.categories.includes(c.id) ? 'checked' : ''
          }/>
          <span>${c.name}</span>
        </label>`,
        ).join('')}
      </div>
    </div>

    <div class="filter-group">
      <p class="filter-title">قیمت</p>
      <div class="price-inputs">
        <input class="input num" inputmode="numeric" data-price-min aria-label="حداقل قیمت"
          value="${toFaDigits(f.priceMin.toLocaleString('en-US'))}"/>
        <span style="color:var(--color-ink-300)">—</span>
        <input class="input num" inputmode="numeric" data-price-max aria-label="حداکثر قیمت"
          value="${toFaDigits(f.priceMax.toLocaleString('en-US'))}"/>
      </div>
      <div class="price-range-wrap">
        <div class="range-track">
          <div class="range-fill" data-range-fill></div>
          <input type="range" class="range-dual" data-range-min
            min="${PRICE_BOUNDS.min}" max="${PRICE_BOUNDS.max}" step="50000" value="${f.priceMin}"
            aria-label="اسلایدر حداقل قیمت"/>
          <input type="range" class="range-dual" data-range-max
            min="${PRICE_BOUNDS.min}" max="${PRICE_BOUNDS.max}" step="50000" value="${f.priceMax}"
            aria-label="اسلایدر حداکثر قیمت"/>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:.7rem;color:var(--color-ink-400)">
          <span class="num">${formatPrice(PRICE_BOUNDS.min)}</span>
          <span class="num">${formatPrice(PRICE_BOUNDS.max)}</span>
        </div>
      </div>
    </div>

    <div class="filter-group">
      <p class="filter-title">برند</p>
      <div class="filter-list">
        ${Object.values(BRANDS)
          .map(
            (b) => `
        <label class="checkbox">
          <input type="checkbox" name="brands" value="${b}" ${f.brands.includes(b) ? 'checked' : ''}/>
          <span>${b}</span>
        </label>`,
          )
          .join('')}
      </div>
    </div>

    <div class="filter-group">
      <p class="filter-title">رنگ</p>
      <div class="swatch-row">
        ${Object.entries(COLORS)
          .map(
            ([k, c]) => `
          <button type="button" class="swatch ${f.colors.includes(k) ? 'selected' : ''}"
             style="background:${c.hex}" data-color-key="${k}"
             title="${c.fa}" aria-label="رنگ ${c.fa}" aria-pressed="${f.colors.includes(k)}"></button>`,
          )
          .join('')}
      </div>
    </div>

    <div class="filter-group">
      <p class="filter-title">سایز</p>
      <div class="size-row">
        ${['XS', 'S', 'M', 'L', 'XL', 'XXL', ...SHOE_RANGE]
          .map(
            (s) => `
          <label class="radio-pill"><input type="checkbox" name="sizes" value="${s}" ${
            f.sizes.includes(s) ? 'checked' : ''
          }/><span>${s}</span></label>`,
          )
          .join('')}
      </div>
    </div>

    <div class="filter-group">
      <p class="filter-title">جنس</p>
      <div class="filter-list">
        ${[...new Set(Object.values(MATERIALS))]
          .map(
            (m) => `
        <label class="checkbox">
          <input type="checkbox" name="materials" value="${m}" ${f.materials.includes(m) ? 'checked' : ''}/>
          <span>${m}</span>
        </label>`,
          )
          .join('')}
      </div>
    </div>

    <div class="filter-group">
      <p class="filter-title">سایر</p>
      <div style="display:grid;gap:.6rem">
        <label class="checkbox">
          <input type="checkbox" data-flag="onlyAvailable" ${f.onlyAvailable ? 'checked' : ''}/>
          <span>فقط کالاهای موجود</span>
        </label>
        <label class="checkbox">
          <input type="checkbox" data-flag="onlyDiscount" ${f.onlyDiscount ? 'checked' : ''}/>
          <span>فقط تخفیف‌دارها</span>
        </label>
      </div>
      <p class="filter-title" style="margin-top:.9rem">امتیاز</p>
      <div class="rating-row">
        ${[4.5, 4, 0]
          .map(
            (r) => `
          <label class="radio-pill"><input type="radio" name="minRating" value="${r}" ${
            f.minRating === r ? 'checked' : ''
          }/><span>${r === 0 ? 'همه' : `${toFaDigits(r)}★ و بالاتر`}</span></label>`,
          )
          .join('')}
      </div>
    </div>

    <button type="button" class="btn btn-dark btn-block mobile-only" data-apply-filters>
      نمایش نتایج
    </button>`;

  /* ---------- wiring ---------- */
  panel.addEventListener('change', (e) => {
    const input = e.target;
    if (input.name && ['categories', 'brands', 'sizes', 'materials'].includes(input.name)) {
      filterState.toggleIn(input.name, input.value);
      return;
    }
    if (input.name === 'minRating') {
      filterState.patch({ minRating: Number(input.value) });
      return;
    }
    if ('flag' in input.dataset) {
      filterState.patch({ [input.dataset.flag]: input.checked });
    }
  });

  panel.addEventListener('click', (e) => {
    const sw = e.target.closest('[data-color-key]');
    if (sw) {
      filterState.toggleIn('colors', sw.dataset.colorKey);
      syncSwatches();
      return;
    }
    if (e.target.closest('[data-clear-filters]')) {
      filterState.reset(true);
      refreshInputs();
    }
    if (e.target.closest('[data-apply-filters]')) {
      onApply?.();
    }
  });

  /* price inputs (debounced parse of Persian digits) */
  import('../utils/format-price.js').then(({ toLatinDigits }) => {
    const debounced = debouncePatch();
    function debouncePatch() {
      let t;
      return () => {
        clearTimeout(t);
        t = setTimeout(() => {
          const minEl = panel.querySelector('[data-price-min]');
          const maxEl = panel.querySelector('[data-price-max]');
          let mn = Number(toLatinDigits(minEl.value).replace(/[^\d]/g, '')) || PRICE_BOUNDS.min;
          let mx = Number(toLatinDigits(maxEl.value).replace(/[^\d]/g, '')) || PRICE_BOUNDS.max;
          mn = Math.min(Math.max(mn, PRICE_BOUNDS.min), PRICE_BOUNDS.max);
          mx = Math.min(Math.max(mx, mn + 50_000), PRICE_BOUNDS.max);
          filterState.patch({ priceMin: mn, priceMax: mx });
          syncRange();
        }, 600);
      };
    }
    panel.querySelector('[data-price-min]').addEventListener('input', debounced);
    panel.querySelector('[data-price-max]').addEventListener('input', debounced);
  });

  const fill = panel.querySelector('[data-range-fill]');
  function syncRange() {
    const cur = filterState.get();
    const minR = panel.querySelector('[data-range-min]');
    const maxR = panel.querySelector('[data-range-max]');
    if (document.activeElement !== minR) minR.value = cur.priceMin;
    if (document.activeElement !== maxR) maxR.value = cur.priceMax;
    const span = PRICE_BOUNDS.max - PRICE_BOUNDS.min;
    const startPct = ((cur.priceMin - PRICE_BOUNDS.min) / span) * 100;
    const endPct = ((cur.priceMax - PRICE_BOUNDS.min) / span) * 100;
    /* RTL track: min side is right */
    fill.style.right = `${startPct}%`;
    fill.style.left = `${100 - endPct}%`;
  }
  syncRange();

  panel.querySelector('[data-range-min]').addEventListener('input', (e) => {
    const v = Math.min(Number(e.target.value), filterState.get().priceMax - 50_000);
    filterState.patch({ priceMin: v });
    syncRange();
  });
  panel.querySelector('[data-range-max]').addEventListener('input', (e) => {
    const v = Math.max(Number(e.target.value), filterState.get().priceMin + 50_000);
    filterState.patch({ priceMax: v });
    syncRange();
  });

  function syncSwatches() {
    const cur = filterState.get();
    panel.querySelectorAll('[data-color-key]').forEach((s) => {
      s.classList.toggle('selected', cur.colors.includes(s.dataset.colorKey));
      s.setAttribute('aria-pressed', String(cur.colors.includes(s.dataset.colorKey)));
    });
  }

  function refreshInputs() {
    const cur = filterState.get();
    panel.querySelectorAll('input[type="checkbox"]').forEach((i) => {
      if (['categories', 'brands', 'sizes', 'materials'].includes(i.name))
        i.checked = cur[i.name].includes(i.value);
    });
    panel.querySelectorAll('[data-flag]').forEach((i) => {
      i.checked = Boolean(cur[i.dataset.flag]);
    });
    panel.querySelectorAll('[name="minRating"]').forEach((i) => {
      i.checked = Number(i.value) === cur.minRating;
    });
    panel.querySelector('[data-price-min]').value = toFaDigits(
      cur.priceMin.toLocaleString('en-US'),
    );
    panel.querySelector('[data-price-max]').value = toFaDigits(
      cur.priceMax.toLocaleString('en-US'),
    );
    syncSwatches();
    syncRange();
  }

  filterState.subscribe(() => {
    /* keep inputs consistent after external resets */
    syncRange();
    syncSwatches();
  });

  return panel;
}

const SHOE_RANGE = ['39', '40', '41', '42', '43', '44'];

/** Sort control used in toolbar & mobile sheet */
export function createSortControl(filterState, onChange = null) {
  const wrap = document.createElement('div');
  wrap.className = 'sort-select';
  const f = filterState.get();
  wrap.innerHTML = `
    <label class="sr-only" for="sort-select" style="position:absolute;width:1px;height:1px;overflow:hidden;clip-path:rect(0 0 0 0)">مرتب‌سازی</label>
    ${icon('rows', 16)}
    <select id="sort-select" class="select" style="padding-block:.45rem;width:auto">
      ${SORT_OPTIONS.map(
        (o) => `<option value="${o.value}" ${f.sort === o.value ? 'selected' : ''}>${o.label}</option>`,
      ).join('')}
    </select>`;
  wrap.querySelector('select').addEventListener('change', (e) => {
    filterState.patch({ sort: e.target.value });
    onChange?.(e.target.value);
  });
  filterState.subscribe((nf) => {
    wrap.querySelector('select').value = nf.sort;
  });
  return wrap;
}
