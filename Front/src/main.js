/* ============================================================
   main.js — application entry
   Boot order: CSS → smooth scroll → shared chrome → page module
   ============================================================ */
import './css/main.css';

import { initLenis } from './js/animations/lenis.js';
import { reveal } from './js/animations/gsap.js';
import { renderAnnouncement } from './js/components/announcement-bar.js';
import { renderHeader } from './js/components/navbar.js';
import { renderFooter } from './js/components/footer.js';
import { initOverlays } from './js/components/overlays.js';

const pageModules = {
  home: () => import('./js/pages/home.js'),
  shop: () => import('./js/pages/shop.js'),
  product: () => import('./js/pages/product.js'),
  collection: () => import('./js/pages/collection.js'),
  cart: () => import('./js/pages/cart-page.js'),
  wishlist: () => import('./js/pages/wishlist-page.js'),
  checkout: () => import('./js/pages/checkout.js'),
  account: () => import('./js/pages/account.js'),
  orders: () => import('./js/pages/orders.js'),
  about: () => import('./js/pages/about.js'),
  contact: () => import('./js/pages/contact.js'),
  auth: () => import('./js/pages/auth.js'),
  notfound: () => import('./js/pages/notfound.js'),
};

async function boot() {
  initLenis();

  /* Shared chrome — JS-rendered components into mount points */
  try {
    renderAnnouncement(document.getElementById('announcement-root'));
    await renderHeader(document.getElementById('header-root'));
    renderFooter(document.getElementById('footer-root'));
    initOverlays(document.getElementById('overlay-root'));
  } catch (err) {
    console.error('[alpha] خطا در رندر اسکلت صفحه', err);
  }

  /* Page module */
  const pageName = document.body.dataset.page || 'home';
  const load = pageModules[pageName] ?? pageModules.home;
  try {
    const mod = await load();
    mod?.init?.();
  } catch (err) {
    console.error(`[alpha] خطا در بارگذاری صفحه «${pageName}»`, err);
  }

  reveal();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
