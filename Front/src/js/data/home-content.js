/* ============================================================
   home-content.js — hero slides, banners, editorial copy
   (presentation content, centralized for future CMS/API)
   ============================================================ */
const U = (id, w = 1920, h = 1080) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;
const UP = (id, w = 1000, h = 1250) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

export const HERO_SLIDES = Object.freeze([
  {
    id: 's0',
    image: '/images/hero/hero-beach.jpg',
    fallback: U('1441984904996-e0b6ba687e04'),
    label: 'کالکشن ساحلی',
    title: 'مد استایل، همره تو در هر استایل',
    subtitle: 'انتخابی تازه از مینیمال‌های رسمی و اسپرت برای روزهای روشن.',
    cta: { label: 'مشاهده محصولات', href: 'pages/shop.html' },
  },
  {
    id: 's0b',
    image: '/images/hero/hero-man.jpg',
    fallback: U('1487222478094-04180ec05410'),
    label: 'استایل رسمی مردانه',
    title: 'شکوه رنگ‌های خنثی در اتاقک روشن',
    subtitle: 'کت و شلوار کتان در پالت بژ و خاکستری، برای ظاهری آرام و مدرن.',
    cta: { label: 'خرید مجموعه مردانه', href: 'pages/shop.html?cat=men' },
  },
  {
    id: 's0c',
    image: '/images/hero/hero-duo.jpg',
    fallback: U('1445205170230-053b83016050'),
    label: 'ترند این فصل',
    title: 'دوئت استایل: بژ اسپرت برای زن و مرد',
    subtitle: 'رکاب و تاپ خط‌دار، با کیف چرمی نارنجی — جفت‌های هماهنگ این فصل.',
    cta: { label: 'دیدن ترندها', href: 'pages/shop.html' },
  },
  {
    id: 's1',
    image: '/images/hero/hero-flatlay.jpg',
    fallback: U('1441984904996-e0b6ba687e04'),
    label: 'اسنشیالز مردانه',
    title: 'همه‌چیز برای یک استایل کامل',
    subtitle: 'بوت چرم، کمربند، ساعت و اکسسوری — ست کامل مردانه در یک‌جا.',
    cta: { label: 'مشاهده دسته‌بندی‌ها', href: 'pages/shop.html?cat=men' },
  },
]);

export const BANNER_SLIDES = Object.freeze([
  {
    id: 'b1',
    tone: '#172033',
    accent: '#3157D5',
    kicker: 'فروش ویژه',
    title: 'تا ۳۰٪ تخفیف روی انتخاب‌های منتخب',
    note: 'تا پایان هفته',
    cta: { label: 'دیدن تخفیف‌ها', href: 'pages/shop.html?sale=1' },
  },
  {
    id: 'b2',
    tone: '#3157D5',
    accent: '#A8A7D8',
    kicker: 'پیش‌فروش',
    title: 'کالکشن جدید پاییز رسید',
    note: 'برای اعضای باشگاه استایل',
    cta: { label: 'مشاهده کالکشن', href: 'pages/collection.html?c=new-season' },
  },
  {
    id: 'b3',
    tone: '#E9897E',
    accent: '#172033',
    kicker: 'همیشه',
    title: 'ارسال رایگان سفارش‌های بالای ۲ میلیون',
    note: 'بدون کد تخفیف',
    cta: { label: 'شروع خرید', href: 'pages/shop.html' },
  },
]);

export const EDITORIAL_SECTIONS = Object.freeze({
  main: {
    image: '/images/editorial/ed-1.jpg',
    secondary: '/images/editorial/ed-2.jpg',
    fallback: UP('1558769132-cb1aea458c5e'),
    fallbackSecondary: UP('1551232864-3f0890e580d9'),
    eyebrow: 'دفترچه استایل',
    title: 'گاهی یک انتخاب ساده، تمام چیزی است که لازم داری.',
    text: 'استایل خوب درباره‌ی زیاد داشتن نیست؛ درباره‌ی درست انتخاب کردن است. ما در مد استایل هر قطعه را با همین نگاه انتخاب می‌کنیم.',
    cta: { label: 'کشف استایل', href: 'pages/collection.html?c=minimal-spring' },
  },
  story: {
    image: '/images/editorial/ed-3.jpg',
    fallback: UP('1517841905240-472988babdf9'),
    eyebrow: 'داستان ما',
    title: 'از اتلیه‌ای کوچک، برای کمدی که واقعاً می‌پوشی.',
    text: 'مد استایل با یک باور ساده شروع شد: لباس باید راحت باشد، ماندگار و صادق. هر فصل تعداد محدودی قطعه طراحی می‌کنیم؛ نه بیشتر.',
    cta: { label: 'بیشتر بخوانید', href: 'pages/about.html' },
  },
});

/** Simulated countdown target (rolling end of week, demo only) */
export function getSaleCountdownTarget() {
  const now = new Date();
  const end = new Date(now);
  end.setDate(now.getDate() + ((7 - now.getDay()) % 7 || 7));
  end.setHours(23, 59, 59, 0);
  return end.getTime();
}
