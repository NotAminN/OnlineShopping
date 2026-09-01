/* ============================================================
   checkout-state — multi-step checkout draft state
   ============================================================ */
import { storage } from '../utils/storage.js';

const KEY = 'checkout-draft';
const EMPTY = Object.freeze({
  step: 1,
  receiver: { firstName: '', lastName: '', phone: '' },
  address: { province: '', city: '', line: '', postalCode: '' },
  shippingMethodId: 'post',
  paymentMethodId: 'online',
  savedAddressId: null,
});

export const checkoutState = {
  loadDraft() {
    return { ...structuredClone(EMPTY), ...(storage.get(KEY, {}) ?? {}) };
  },
  saveDraft(draft) {
    storage.set(KEY, draft);
  },
  resetDraft() {
    storage.remove(KEY);
  },
};
