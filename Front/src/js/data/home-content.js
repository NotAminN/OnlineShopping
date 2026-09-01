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
    id: 's1',
    image: '/images/banner-categories.jpg',
    fallback: U('1441984904996-e0b6ba687e04'),
    label: 'دسته‌بندی‌های مد استایل',
    title: 'هر استایل، یک دسته‌بندی',
    subtitle: 'از زنانه و مردانه تا کفش، کیف و اکسسوری — همه در یک‌جا.',
    cta: { label: 'مشاهده دسته‌بندی‌ها', href: 'pages/shop.html' },
  },
  {
    id: 's3',
    image: '/images/hero/hero-3.jpg',
    fallback: U('1469334031218-e382a71b716b'),
    label: 'مینیمال اسنشیالز',
    title: 'سادگی، اما متفاوت',
    subtitle: 'مینیمال بپوش؛ ماندگار بمان.',
    cta: { label: 'مشاهده مجموعه', href: 'pages/collection.html?c=urban-essentials' },
  },
  {
    id: 's4',
    image: '/images/hero/hero-4.jpg',
    fallback: U('1483985988355-763728e1935b'),
    label: 'انتخاب هفته',
    title: 'برای لحظه‌های خاص',
    subtitle: 'انتخاب‌های منتخب این هفته.',
    cta: { label: 'مشاهده محصولات', href: 'pages/shop.html?cat=women' },
  },
  {
    id: 's5',
    image: '/images/hero/hero-5.jpg',
    fallback: U('1485968579580-b6d095142e6e'),
    label: 'سیزن تازه',
    title: 'ظرافت دوخت، اصالت بافت',
    subtitle: 'طراحی‌های محدود آتلیه مد استایل.',
    cta: { label: 'کالکشن اختصاصی', href: 'pages/collection.html?c=new-season' },
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
