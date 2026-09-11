/* ============================================================
   collections.js — editorial collections
   ============================================================ */
const U = (id, w = 900, h = 1200) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

export const COLLECTIONS = Object.freeze([
  {
    id: 'minimal-spring',
    slug: 'minimal-spring',
    name: 'مینیمال اسپرینگ',
    latinName: 'Minimal Spring',
    image: '/images/collections/col-minimal.jpg',
    fallback: U('1490481651871-ab68de25d43d'),
    tone: '#A8A7D8',
    story:
      'پالت روشن، خطوط آرام و پارچه‌های طبیعی؛ مجموعه‌ای برای روزهایی که سادگی، قوی‌ترین جمله‌ی استایل توست.',
    productIds: ['p-001', 'p-002', 'p-003', 'p-010', 'p-015', 'p-017'],
  },
  {
    id: 'urban-essentials',
    slug: 'urban-essentials',
    name: 'اربن اسنشیالز',
    latinName: 'Urban Essentials',
    image: '/images/collections/col-urban.jpg',
    fallback: U('1551028719-00167b16eac5'),
    tone: '#3157D5',
    story:
      'قطعات کاربردی شهری که از صبح تا شب همراه‌اند؛ ترکیبی از راحتی حرکت و لبه‌ی تیز استایل خیابانی.',
    productIds: ['p-007', 'p-008', 'p-010', 'p-013', 'p-014', 'p-016'],
  },
  {
    id: 'classic-form',
    slug: 'classic-form',
    name: 'کلاسیک فرم',
    latinName: 'Classic Form',
    image: '/images/collections/col-classic.jpg',
    fallback: U('1594938298603-c8148c4dae35'),
    tone: '#172033',
    story:
      'فرم‌های ماندگار و دوخت‌های تمیز؛ برای جلسه‌ها، قرارهای مهم و هر جایی که باید مطمئن دیده شوی.',
    productIds: ['p-004', 'p-005', 'p-006', 'p-009', 'p-011', 'p-012'],
  },
  {
    id: 'weekend',
    slug: 'weekend',
    name: 'ویکند',
    latinName: 'Weekend',
    image: '/images/collections/col-weekend.jpg',
    fallback: U('1469334031218-e382a71b716b'),
    tone: '#E9897E',
    story:
      'حال‌وهوای آخر هفته؛ لباس‌های آزاد، پارچه‌های نفس‌کش و رنگ‌هایی که با نور آفتاب خوب می‌آیند.',
    productIds: ['p-002', 'p-008', 'p-013', 'p-018', 'p-019', 'p-020'],
  },
  {
    id: 'new-season',
    slug: 'new-season',
    name: 'سیزن جدید',
    latinName: 'New Season',
    image: '/images/collections/col-season.jpg',
    fallback: U('1539533018447-63fcce2678e3'),
    tone: '#55648F',
    story:
      'اولین انتخاب‌های فصل تازه؛ قطعاتی که همین حالا از اتلیه بیرون آمده‌اند و حال هوای امروز را دارند.',
    productIds: ['p-001', 'p-004', 'p-007', 'p-011', 'p-012', 'p-015'],
  },
]);
