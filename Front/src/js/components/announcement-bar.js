/* ============================================================
   announcement-bar.js — dismissible top bar (persisted)
   ============================================================ */
import { storage, STORAGE_KEYS } from '../utils/storage.js';
import { icon } from '../utils/icons.js';

const MESSAGES = [
  'ارسال رایگان برای سفارش‌های بالای ۲ میلیون تومان',
  '۷ روز ضمانت بازگشت کالا بدون قید و شرط',
  'کالکشن جدید فصل، همین حالا در مد استایل',
];

export function renderAnnouncement(mount) {
  if (!mount) return;
  const dismissedAt = storage.get(STORAGE_KEYS.announcementDismissed, null);
  /* re-show after 3 days or on new message rotation */
  const dayIndex = Math.floor(Date.now() / 86_400_000);
  if (dismissedAt === dayIndex) {
    mount.remove();
    return;
  }
  const message = MESSAGES[dayIndex % MESSAGES.length];

  mount.className = 'announce';
  mount.innerHTML = `
    <div class="announce-inner">
      <p>${message}</p>
      <button type="button" class="announce-close" aria-label="بستن نوار اعلان">
        ${icon('close', 14)}
      </button>
    </div>`;

  mount.querySelector('.announce-close').addEventListener('click', () => {
    storage.set(STORAGE_KEYS.announcementDismissed, dayIndex);
    mount.style.height = `${mount.offsetHeight}px`;
    requestAnimationFrame(() => {
      mount.classList.add('closing');
      mount.addEventListener('transitionend', () => mount.remove(), { once: true });
    });
  });
}
