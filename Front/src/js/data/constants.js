/* ============================================================
   constants.js — shared domain enums & palettes
   ============================================================ */

/** Color swatches (Persian label + hex) */
export const COLORS = Object.freeze({
  black: { fa: 'مشکی', hex: '#1c1c21' },
  white: { fa: 'سفید', hex: '#f2f1ec' },
  cream: { fa: 'کرم', hex: '#ece2cf' },
  beige: { fa: 'بژ', hex: '#d3bd9d' },
  brown: { fa: 'قهوه‌ای', hex: '#6b4a35' },
  navy: { fa: 'سرمه‌ای', hex: '#1b2742' },
  blue: { fa: 'آبی', hex: '#3157d5' },
  green: { fa: 'سبز', hex: '#3e6b4f' },
  gray: { fa: 'خاکستری', hex: '#98a0ac' },
  pink: { fa: 'صورتی', hex: '#e3b0b6' },
  burgundy: { fa: 'زرشکی', hex: '#742f3a' },
  lilac: { fa: 'بنفش کمرنگ', hex: '#a8a7d8' },
  silver: { fa: 'نقره‌ای', hex: '#c9ccd4' },
  goldish: { fa: 'طلایی', hex: '#c9a35f' },
});

/** Clothing sizes */
export const CLOTHING_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

/** Shoe sizes (EU) */
export const SHOE_SIZES = ['39', '40', '41', '42', '43', '44'];

/** One-size items */
export const FREE_SIZE = ['اندازه آزاد'];

/** In-house brand lines (demo store sub-brands) */
export const BRANDS = Object.freeze({
  atelier: 'اتلیه مد استایل',
  studio: 'مد استایل استودیو',
  basic: 'مد استایل بیسیک',
  sport: 'مد استایل اسپرت',
});

/** Materials */
export const MATERIALS = Object.freeze({
  linen: 'کتان',
  cotton: 'نخ پنبه',
  silk: 'ابریشم',
  crepe: 'کرپ',
  wool: 'پشم',
  denim: 'جین',
  leather: 'چرم طبیعی',
  knit: 'بافت',
  satin: 'ساتن',
  velvet: 'مخمل',
});

/** Sort options (shop) */
export const SORT_OPTIONS = Object.freeze([
  { value: 'newest', label: 'جدیدترین' },
  { value: 'popular', label: 'محبوب‌ترین' },
  { value: 'best-selling', label: 'پرفروش‌ترین' },
  { value: 'cheapest', label: 'ارزان‌ترین' },
  { value: 'expensive', label: 'گران‌ترین' },
  { value: 'most-discount', label: 'بیشترین تخفیف' },
]);

/** Order statuses */
export const ORDER_STATUS = Object.freeze({
  pending: { fa: 'در انتظار پرداخت', tone: 'warning' },
  pending_payment: { fa: 'در انتظار پرداخت', tone: 'warning' },
  processing: { fa: 'در حال پردازش', tone: 'info' },
  paid: { fa: 'پرداخت شده', tone: 'info' },
  shipped: { fa: 'ارسال شده', tone: 'info' },
  delivered: { fa: 'تحویل داده شده', tone: 'success' },
  canceled: { fa: 'لغو شده', tone: 'danger' },
  cancelled: { fa: 'لغو شده', tone: 'danger' },
});

/** Shipping methods (demo values) */
export const SHIPPING_METHODS = Object.freeze([
  {
    id: 'express',
    title: 'پیک فوری (تهران)',
    note: 'تحویل همان روز، بازه دو ساعته',
    cost: 180000,
  },
  {
    id: 'post',
    title: 'پست پیشتاز',
    note: '۲ تا ۴ روز کاری',
    cost: 65000,
  },
  {
    id: 'pickup',
    title: 'تحویل حضوری از فروشگاه',
    note: 'آماده‌سازی ۲۴ ساعته — ارسال رایگان',
    cost: 0,
  },
]);

export const FREE_SHIPPING_THRESHOLD = 2_000_000;
