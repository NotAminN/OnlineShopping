/* ============================================================
   navbar.js — premium header: desktop nav + mega menu +
   mobile drawer navigation
   ============================================================ */
import { gsap, reducedMotion } from '../animations/gsap.js';
import { CATEGORIES, MEGA_MENU } from '../data/categories.js';
import { categoryService } from '../services/categories.js';
import { cartState } from '../state/cart-state.js';
import { wishlistState } from '../state/wishlist-state.js';
import { userState } from '../state/user-state.js';
import { bus, icon, guardImage } from '../utils/helpers.icons.js';

const PAGE_HREF = (p) => `${location.pathname.includes('/pages/') ? '' : 'pages/'}${p}`;
const HOME_HREF = location.pathname.includes('/pages/') ? '../index.html' : 'index.html';
const LOGO_HREF = location.pathname.includes('/pages/') ? '../logo-modstyle.svg' : '/logo-modstyle.svg';

let megaEl = null;
let openCatId = null;
let hideTimer = null;
let openTimer = null;
let lastPointerType = 'mouse';

/* ---------- Mega menu ---------- */
function buildMegaMenu(header) {
  megaEl = document.createElement('div');
  megaEl.className = 'mega-menu';
  megaEl.id = 'mega-menu';
  megaEl.innerHTML = `<div class="mega-panel" data-mega-panel></div>`;
  header.appendChild(megaEl);
}

function renderMegaContent(catId) {
  const data = MEGA_MENU[catId];
  const cat = CATEGORIES.find((c) => c.id === catId);
  if (!data || !cat || !megaEl) return false;
  const panel = megaEl.querySelector('[data-mega-panel]');
  panel.innerHTML = `
    ${data.columns
      .map(
        (col) => `
      <div class="mega-col">
        <h4>${col.title}</h4>
        <ul>
          ${col.links
            .map(
              (l) =>
                `<li><a href="${PAGE_HREF('shop.html')}?cat=${catId}&q=${encodeURIComponent(l)}">${l}</a></li>`,
            )
            .join('')}
        </ul>
      </div>`,
      )
      .join('')}
    <a class="mega-featured" href="${PAGE_HREF('collection.html')}?c=new-season">
      <img src="${cat.megaImage || cat.image}" alt="${data.featured.title}" loading="lazy"
        style="position:absolute">
      <span class="mf-scrim"></span>
      <span class="mf-body">
        <span class="mf-tag">${data.featured.tag}</span>
        <span class="mf-title">${data.featured.title}</span>
      </span>
    </a>`;
  guardImage(panel.querySelector('.mega-featured img'));
  return true;
}

const isDesktopNav = () => window.matchMedia('(min-width: 1024px)').matches;

function syncMegaAria(trigger) {
  document
    .querySelectorAll('.nav-link[data-mega]')
    .forEach((n) =>
      n.setAttribute(
        'aria-expanded',
        String(openCatId !== null && n.dataset.mega === openCatId),
      ),
    );
}

/** Open (or switch to) the panel of a category */
function showMega(catId, trigger) {
  if (!megaEl || !isDesktopNav()) return;
  clearTimeout(hideTimer);
  clearTimeout(openTimer);
  if (openCatId === catId) return;
  if (!renderMegaContent(catId)) return;
  openCatId = catId;
  megaEl.classList.add('open');
  syncMegaAria(trigger);
  const panel = megaEl.querySelector('[data-mega-panel]');
  if (!reducedMotion()) {
    gsap.fromTo(
      panel,
      { autoAlpha: 0, y: -14 },
      { autoAlpha: 1, y: 0, duration: 0.35, ease: 'power3.out' },
    );
  }
}

/** Close with graceful delay unless immediate */
function hideMega(immediate = false) {
  clearTimeout(openTimer);
  if (!megaEl || !openCatId) return;
  const doHide = () => {
    megaEl.classList.remove('open');
    openCatId = null;
    syncMegaAria(null);
  };
  if (immediate) {
    clearTimeout(hideTimer);
    doHide();
  } else {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(doHide, 220);
  }
}

/**
 * All mega-menu interaction — delegated & conflict-free.
 * hover → intent-open · click(mouse/keys) → toggle · tap(touch) → open-only
 */
function wireMegaEvents(header) {
  /* remember input type to prevent touch tap-close flashes */
  header.addEventListener(
    'pointerdown',
    (e) => {
      lastPointerType = e.pointerType || 'mouse';
    },
    { capture: true },
  );

  /* hover intent (delegated; survives any DOM rebuilds) */
  header.addEventListener('pointerover', (e) => {
    const trigger = e.target.closest('.nav-link[data-mega]');
    if (!trigger || lastPointerType === 'touch') return;
    clearTimeout(hideTimer);
    clearTimeout(openTimer);
    const catId = trigger.dataset.mega;
    openTimer = setTimeout(() => showMega(catId, trigger), 50);
  });
  header.addEventListener('pointerout', (e) => {
    if (e.target.closest('.nav-link[data-mega]')) hideMega();
  });

  /* staying on the panel keeps it alive */
  megaEl.addEventListener('pointerenter', () => clearTimeout(hideTimer));
  megaEl.addEventListener('pointerleave', () => hideMega());

  /* click / tap / keyboard Enter */
  header.addEventListener('click', (e) => {
    const trigger = e.target.closest('.nav-link[data-mega]');
    if (!trigger) return;
    const catId = trigger.dataset.mega;

    if (lastPointerType === 'touch') {
      /* touch has no hover:
         1st tap reveals the panel · 2nd tap navigates */
      if (openCatId === catId) return; /* let the link navigate naturally */
      e.preventDefault();
      showMega(catId, trigger);
      return;
    }
    e.preventDefault();
    openCatId === catId ? hideMega(true) : showMega(catId, trigger);
  });

  /* close: outside click, Escape, scroll-away, leaving desktop nav */
  document.addEventListener('click', (e) => {
    if (openCatId && !e.target.closest('.navbar')) hideMega(true);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && openCatId) hideMega(true);
  });
  window.addEventListener(
    'scroll',
    () => {
      if (openCatId) hideMega(true);
    },
    { passive: true },
  );
  window.addEventListener('resize', () => {
    if (!isDesktopNav()) hideMega(true);
  });
}

/* ---------- Mobile nav ---------- */
function openMobileNav() {
  let drawer = document.getElementById('mobile-nav');
  if (!drawer) {
    drawer = document.createElement('aside');
    drawer.className = 'drawer';
    drawer.id = 'mobile-nav';
    drawer.setAttribute('role', 'dialog');
    drawer.setAttribute('aria-modal', 'true');
    drawer.setAttribute('aria-label', 'منوی ناوبری');
    drawer.innerHTML = `
      <div class="drawer-head">
        <span class="brand drawer-brand">
          <img class="brand-logo" src="${LOGO_HREF}" alt="" width="30" height="30" />
          <span class="brand-mark">MODSTYLE</span>
        </span>
        <button class="btn btn-ghost btn-icon btn-sm" data-close-nav aria-label="بستن منو">${icon('close', 20)}</button>
      </div>
      <div class="mobile-nav-body">
        <nav class="mobile-nav-list" aria-label="دسته‌بندی‌ها"></nav>
        <div class="mn-footer">
          <button class="btn btn-dark btn-block" data-mn-account>
            ${icon('user', 18)} ورود / ثبت‌نام
          </button>
        </div>
      </div>`;
    document.body.appendChild(drawer);

    /* accordion categories */
    const list = drawer.querySelector('.mobile-nav-list');
    list.innerHTML = CATEGORIES.map(
      (c, i) => `
      <div class="mn-item" data-cat="${c.id}">
        <button class="mn-trigger" aria-expanded="false">
          <span>${c.name}</span>${icon('chevron-down', 18, 'acc-chevron')}
        </button>
        <div class="mn-links"><div class="mn-links-inner">
          ${
            MEGA_MENU[c.id]
              ? MEGA_MENU[c.id].columns
                  .map(
                    (col) => `
                <span style="font-size:.72rem;font-weight:700;color:var(--color-cobalt-500)">${col.title}</span>
                ${col.links
                  .map(
                    (l) =>
                      `<a href="${PAGE_HREF('shop.html')}?cat=${c.id}&q=${encodeURIComponent(l)}">${l}</a>`,
                  )
                  .join('')}`,
                  )
                  .join('')
              : `<a href="${PAGE_HREF('shop.html')}?cat=${c.id}">همه‌ی محصولات ${c.name}</a>`
          }
          <a href="${PAGE_HREF('shop.html')}?cat=${c.id}" style="color:var(--color-cobalt-500);font-weight:600">مشاهده همه</a>
        </div></div>
      </div>`,
    ).join('');

    list.addEventListener('click', (e) => {
      const trigger = e.target.closest('.mn-trigger');
      if (!trigger) return;
      const item = trigger.closest('.mn-item');
      const isOpen = item.classList.contains('open');
      list.querySelectorAll('.mn-item.open').forEach((n) => {
        n.classList.remove('open');
        n.querySelector('.mn-trigger').setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('open');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });

    drawer.querySelector('[data-close-nav]').addEventListener('click', closeMobileNav);
    drawer
      .querySelector('[data-mn-account]')
      .addEventListener('click', () => {
        closeMobileNav();
        bus.emit('ui:open-auth');
      });
  }

  const overlay = ensureNavOverlay();
  import('../animations/gsap.js').then(({ drawerOpen }) =>
    drawerOpen(drawer, overlay),
  );
}

function ensureNavOverlay() {
  let overlay = document.getElementById('mobile-nav-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'drawer-overlay';
    overlay.id = 'mobile-nav-overlay';
    overlay.addEventListener('click', closeMobileNav);
    document.body.appendChild(overlay);
  }
  return overlay;
}

function closeMobileNav() {
  const drawer = document.getElementById('mobile-nav');
  const overlay = document.getElementById('mobile-nav-overlay');
  if (!drawer) return;
  import('../animations/gsap.js').then(({ drawerClose }) =>
    drawerClose(drawer, overlay),
  );
}

/* ---------- Header render ---------- */
export async function renderHeader(mount) {
  if (!mount) return;
  mount.className = 'site-header-wrap';

  await categoryService.getCategories();
  const isHome = document.body.dataset.page === 'home';
  const catLinks = CATEGORIES.map((c) => c.id);

  const header = document.createElement('header');
  header.className = `navbar ${isHome ? 'is-transparent' : 'is-solid'}`;
  header.innerHTML = `
    <div class="navbar-inner">
      <button class="icon-action mobile-only" data-open-nav aria-label="باز کردن منو">
        ${icon('menu', 22)}
      </button>

      <a class="brand" href="${HOME_HREF}" aria-label="MODSTYLE — صفحه‌ی اصلی">
        <img class="brand-logo" src="${LOGO_HREF}" alt="" width="34" height="34" />
        <span class="brand-mark">MODSTYLE</span>
        <span class="brand-sub">فروشگاه مد</span>
      </a>

      <nav class="main-nav" aria-label="ناوبری اصلی">
        ${catLinks
          .map((id) => {
            const c = CATEGORIES.find((x) => x.id === id);
            const hasMega = Boolean(MEGA_MENU[id]);
            return `
            <a class="nav-link" href="${PAGE_HREF('shop.html')}?cat=${id}"
              ${hasMega ? `data-mega="${id}" aria-haspopup="true" aria-expanded="false"` : ''}>
              ${c.name}${hasMega ? icon('chevron-down', 15, 'nav-chevron') : ''}
            </a>`;
          })
          .join('')}
        <a class="nav-link" href="${PAGE_HREF('collection.html')}?c=all">کالکشن‌ها</a>
      </nav>

      <div class="header-actions">
        <button class="icon-action" data-action-search aria-label="جستجو">${icon('search', 21)}</button>
        <a class="icon-action desktop-only" href="${PAGE_HREF('wishlist.html')}" aria-label="علاقه‌مندی‌ها">
          ${icon('heart', 21)}
          <span class="action-badge wishlist-badge hidden" data-wishlist-badge>۰</span>
        </a>
        <button class="icon-action" data-action-cart aria-label="سبد خرید">
          ${icon('cart', 21)}
          <span class="action-badge hidden" data-cart-badge>۰</span>
        </button>
        <button class="icon-action desktop-only" data-action-account aria-label="حساب کاربری">
          ${icon('user', 21)}
        </button>
      </div>
    </div>`;

  mount.appendChild(header);
  buildMegaMenu(header);

  /* ---- badges ---- */
  const cartBadge = header.querySelector('[data-cart-badge]');
  const wishBadge = header.querySelector('[data-wishlist-badge]');
  const syncBadges = () => {
    const cc = cartState.count();
    cartBadge.textContent = new Intl.NumberFormat('fa-IR').format(cc);
    cartBadge.classList.toggle('hidden', cc === 0);
    if (wishBadge) {
      const wc = wishlistState.count();
      wishBadge.textContent = new Intl.NumberFormat('fa-IR').format(wc);
      wishBadge.classList.toggle('hidden', wc === 0);
    }
  };
  syncBadges();
  bus.on('cart:changed', syncBadges);
  bus.on('wishlist:changed', syncBadges);

  /* ---- actions ---- */
  header.querySelector('[data-action-search]').addEventListener('click', () =>
    bus.emit('ui:open-search'),
  );
  header.querySelector('[data-action-cart]').addEventListener('click', () =>
    bus.emit('ui:open-cart'),
  );
  header
    .querySelector('[data-open-nav]')
    ?.addEventListener('click', openMobileNav);

  header.querySelector('[data-action-account]').addEventListener('click', () => {
    if (userState.isLoggedIn()) location.href = PAGE_HREF('account.html');
    else bus.emit('ui:open-auth');
  });

  /* ---- mega menu (delegated, conflict-free) ---- */
  wireMegaEvents(header);

  /* ---- solid/transparent scroll behavior ---- */
  if (isHome) {
    const onScroll = () => header.classList.toggle('is-solid', window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
}
