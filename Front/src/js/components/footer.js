/* ============================================================
   footer.js — premium site footer with newsletter
   ============================================================ */
import { categoryService } from '../services/categories.js';
import { icon } from '../utils/icons.js';
import { userState } from '../state/user-state.js';
import { showToast } from './toast.js';

const PAGE_HREF = (p) => `${location.pathname.includes('/pages/') ? '' : 'pages/'}${p}`;
const HOME_HREF = location.pathname.includes('/pages/') ? '../index.html' : 'index.html';

const GUIDE_LINKS = [
  ['راهنمای سایز', 'about.html#guide'],
  ['نحوه سفارش', 'about.html#order'],
  ['ارسال سفارش', 'about.html#shipping'],
  ['بازگشت کالا', 'about.html#return'],
  ['سوالات متداول', 'contact.html#faq'],
];

const ABOUT_LINKS = [
  ['داستان برند', 'about.html'],
  ['تماس با ما', 'contact.html'],
  ['فرصت‌های شغلی', 'about.html#careers'],
];

export function renderFooter(mount) {
  if (!mount) return;
  mount.className = 'site-footer';
  mount.innerHTML = `
    <div class="footer-main">
      <div class="footer-brand">
        <a href="${HOME_HREF}" class="brand" aria-label="مد استایل">
          <span class="brand-mark">مد استایل<span class="brand-dot">.</span></span>
        </a>
        <p>
          مد استایل یک بوتیک آنلاین مد است؛ انتخاب‌مان را ساده، صادقانه و با کیفیت
          می‌سازیم تا پوشیدن‌هایت لذت‌بخش باشد.
        </p>
        <div class="footer-social">
          <a href="#" aria-label="اینستاگرام">${icon('instagram', 18)}</a>
          <a href="#" aria-label="تلگرام">${icon('telegram', 18)}</a>
          <a href="#" aria-label="تماس تلفنی">${icon('phone', 18)}</a>
          <a href="#" aria-label="ایمیل">${icon('mail', 18)}</a>
        </div>
      </div>

      <nav class="footer-col" aria-label="فروشگاه">
        <h4>فروشگاه</h4>
        <ul data-footer-shop></ul>
      </nav>

      <nav class="footer-col" aria-label="راهنمای خرید">
        <h4>راهنمای خرید</h4>
        <ul data-footer-guide></ul>
      </nav>

      <div class="footer-col">
        <h4>پشتیبانی</h4>
        <ul data-footer-support></ul>
      </div>
    </div>

    <div class="footer-newsletter">
      <div class="newsletter-box">
        <div class="newsletter-copy">
          <h3>عضو باشگاه استایل ما شو</h3>
          <p>برای اطلاع از کالکشن‌های جدید و پیشنهادهای ویژه، ایمیلت را وارد کن.</p>
        </div>
        <form class="newsletter-form" novalidate>
          <input class="input" type="email" name="email"
            placeholder="ایمیل شما" aria-label="ایمیل شما" required />
          <button class="btn btn-primary" type="submit">عضویت</button>
        </form>
      </div>
    </div>

    <div class="footer-bar">
      <div class="footer-bar-inner">
        <span>© ۱۴۰۵ مد استایل — تمامی حقوق محفوظ است.</span>
        <span>ساخته‌شده با علاقه در تهران</span>
      </div>
    </div>`;

  /* dynamic columns */
  categoryService.getFooterLinks().then((links) => {
    const ul = mount.querySelector('[data-footer-shop]');
    ul.innerHTML = links
      .map((l) => `<li><a href="${l.href.replace('pages/', PAGE_HREF(''))}">${l.label}</a></li>`)
      .join('');
  });

  mount.querySelector('[data-footer-guide]').innerHTML = GUIDE_LINKS.map(
    ([label, href]) =>
      `<li><a href="${href.startsWith('pages/') ? href : PAGE_HREF(href)}">${label}</a></li>`,
  ).join('');

  mount.querySelector('[data-footer-support]').innerHTML = `
    <li><a href="${PAGE_HREF('contact.html')}">تماس با ما</a></li>
    <li><a href="${PAGE_HREF('contact.html')}#faq">سوالات متداول</a></li>
    <li><a href="${PAGE_HREF('orders.html')}">پیگیری سفارش</a></li>
    ${
      userState.isLoggedIn()
        ? `<li><a href="${PAGE_HREF('account.html')}">حساب کاربری من</a></li>`
        : ''
    }
    <li><span>${icon('clock', 14)} پاسخ‌گویی: ۹ تا ۲۱</span></li>`;

  /* newsletter validation */
  const form = mount.querySelector('.newsletter-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = form.querySelector('input');
    const value = input.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      showToast('لطفاً یک ایمیل معتبر وارد کن.', { type: 'error' });
      input.focus();
      return;
    }
    input.value = '';
    showToast('عضویت انجام شد! منتظر خبرهای خوب باش.', { type: 'success' });
  });
}
