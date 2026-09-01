/* ============================================================
   categories.js — storefront categories + mega-menu structure
   ============================================================ */

/* Fallback categories (also the initial shape; API data replaces it at runtime) */
const U = (id, w = 900, h = 1200) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

export const DEFAULT_CATEGORIES = Object.freeze([
  { id: 'women', slug: 'women', name: 'زنانه', image: '/images/categories/cat-women.jpg', fallback: U('1509631179647-0177331693ae'), description: 'قطعات برای هر لحظه‌ی روزت' },
  { id: 'men', slug: 'men', name: 'مردانه', image: '/images/categories/cat-men.jpg', fallback: U('1520975954732-35dd22299614'), description: 'کلاسیک، مدرن و بی‌دردسر' },
  { id: 'kids', slug: 'kids', name: 'بچگانه', image: '/images/categories/cat-kids.jpg', megaImage: '/images/categories/mega-kids.jpg', fallback: U('1503919545889-aef636e10ad4'), description: 'راحت، مقاوم و رنگارنگ' },
  { id: 'shoes', slug: 'shoes', name: 'کفش', image: '/images/categories/cat-shoes.jpg', fallback: U('1543163521-1bf539c55dd2'), description: 'قدم‌هایی با اعتماد به نفس' },
  { id: 'bags', slug: 'bags', name: 'کیف', image: '/images/categories/cat-bags.jpg', fallback: U('1548036328-c9fa89d128fa'), description: 'همراه شیک روزمره' },
  { id: 'accessories', slug: 'accessories', name: 'اکسسوری', image: '/images/categories/cat-accessories.jpg', fallback: U('1511499767150-a48a237f0083'), description: 'جزئیاتی که استایل را کامل می‌کنند' },
]);

export const CATEGORIES = [...DEFAULT_CATEGORIES];

/** Mega-menu tree (desktop hover panel) */
export const MEGA_MENU = Object.freeze({
  women: {
    columns: [
      { title: 'لباس', links: ['پیراهن', 'شومیز', 'مانتو', 'کت', 'تاپ', 'شلوار', 'دامن'] },
      { title: 'بالاتنه', links: ['بلوز', 'ژاکت', 'پالتو', 'کاپشن'] },
      { title: 'اکسسوری', links: ['کیف', 'عینک', 'کمربند', 'شال'] },
    ],
    featured: { title: 'انتخاب سردبیر', tag: 'کالکشن پاییز' },
  },
  men: {
    columns: [
      { title: 'لباس', links: ['پیراهن', 'تی‌شرت', 'کت‌وشلوار', 'هودی', 'شلوار'] },
      { title: 'کاپشن و کت', links: ['بومبر', 'چرم', 'جین', 'بافت'] },
      { title: 'اکسسوری', links: ['کمربند', 'ساعت', 'کیف'] },
    ],
    featured: { title: 'استایل شهری', tag: 'پرفروش' },
  },
  kids: {
    columns: [
      { title: 'دخترانه', links: ['پیراهن', 'ست راه‌راه', 'کاپشن'] },
      { title: 'پسرانه', links: ['تی‌شرت', 'شلوارک', 'کتانی'] },
    ],
    featured: { title: 'دنیای رنگ‌ها', tag: 'جدید' },
  },
});

/** Footer shop links */
export const FOOTER_SHOP_LINKS = [
  { label: 'زنانه', href: 'pages/shop.html?cat=women' },
  { label: 'مردانه', href: 'pages/shop.html?cat=men' },
  { label: 'بچگانه', href: 'pages/shop.html?cat=kids' },
  { label: 'کفش', href: 'pages/shop.html?cat=shoes' },
  { label: 'کیف', href: 'pages/shop.html?cat=bags' },
  { label: 'اکسسوری', href: 'pages/shop.html?cat=accessories' },
  { label: 'تخفیف‌ها', href: 'pages/shop.html?sale=1' },
];
