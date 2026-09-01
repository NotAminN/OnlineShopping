/* ============================================================
   overlays.js — singleton overlay host wiring global UI events
   ============================================================ */
import { bus } from '../utils/helpers.js';
import { createCartDrawer } from './cart-drawer.js';
import { createSearchOverlay } from './search-overlay.js';
import { openAuthModal } from './auth-modal.js';

let initialized = false;

export function initOverlays(mount) {
  if (initialized || !mount) return;
  initialized = true;

  const cartDrawer = createCartDrawer();
  const searchOverlay = createSearchOverlay();

  bus.on('ui:open-cart', () => cartDrawer.open());
  bus.on('ui:open-search', () => searchOverlay.open());
  bus.on('ui:open-auth', () => openAuthModal());

  bus.on('ui:quick-view', async ({ productId }) => {
    const { openQuickView } = await import('./quick-view.js');
    openQuickView(productId);
  });
}
