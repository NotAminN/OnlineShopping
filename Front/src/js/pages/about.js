/* ============================================================
   about.js — brand story (§59) — editorial, not corporate
   ============================================================ */
import { icon } from '../utils/helpers.icons.js';
import { reveal, parallax } from '../animations/gsap.js';

const HOME_HREF = location.pathname.includes('/pages/') ? '../index.html' : 'index.html';

const VALUES = [
  {
    icon: 'sparkles',
    title: 'طراحی با قصد',
    text: 'هر قطعه با یک سؤال شروع می‌شود: «چه مدت واقعاً پوشیده می‌شود؟» اگر جواب کمتر از یک فصل باشد، طراحی نمی‌کنیم.',
  },
  {
    icon: 'shield',
    title: 'جنس صادق',
    text: 'کتان، نخ پنبه، پشم و چرم طبیعی؛ متریالی که با گذر زمان بهتر دیده می‌شود، نه کهنه‌تر.',
  },
  {
    icon: 'ruler',
    title: 'دوخت تمیز',
    text: 'با دو اتلیه‌ی کوچک در تهران همکاری می‌کنیم؛ تیراژ محدود تا کیفیت هر دوخت قابل بازبینی باشد.',
  },
  {
    icon: 'refresh',
    title: 'عمر طولانی',
    text: 'قطعات ما برای سال‌ها طراحی شده‌اند. راهنمای مراقبت همراه هر محصول، عمرش را بیشتر می‌کند.',
  },
];

export function init() {
  document.title = 'داستان برند | مد استایل';
  const main = document.getElementById('main');

  main.innerHTML = `
    <!-- Hero -->
    <section class="about-hero">
      <img src="../images/editorial/ed-2.jpg" alt="اتلیه طراحی مد استایل" fetchpriority="high"/>
      <div class="about-scrim"></div>
      <div class="container-x about-hero-body">
        <span class="eyebrow" style="color:#fff">داستان برند</span>
        <h1>از یک اتلیه‌ی کوچک،<br/>برای کمدی که واقعاً می‌پوشی.</h1>
      </div>
    </section>

    <!-- Philosophy -->
    <section class="container-x section">
      <div style="max-width:720px">
        <h2 class="display-1" data-reveal>ما لباس نمی‌فروشیم؛ انتخاب می‌فروشیم.</h2>
        <p class="text-body-lg" style="color:var(--color-ink-500);margin-top:1rem" data-reveal data-reveal-delay=".08">
          مد استایل با این باور شروع شد که کمد پر، یعنی استایل خوب نیست. هر فصل تعداد محدودی قطعه
          طراحی می‌کنیم که با هم ترکیب شوند؛ نه لباس‌هایی که فقط یک بار مهمانی ببینند.
          سادگی برای ما یک سبک نیست؛ نتیجه‌ی تصمیم‌های سخت در طراحی است.
        </p>
      </div>
    </section>

    <!-- Numbers strip -->
    <section class="container-x section-sm" style="padding-top:0">
      <div class="values-grid" data-reveal>
        ${VALUES.map(
          (v) => `
        <article class="value-card">
          <span class="vc-icon">${icon(v.icon, 22)}</span>
          <h3>${v.title}</h3>
          <p>${v.text}</p>
        </article>`,
        ).join('')}
      </div>
    </section>

    <!-- Craft story split -->
    <section class="container-x section">
      <div class="craft-layout">
        <figure class="img-frame grain craft-img" data-reveal>
          <img src="../images/editorial/ed-4.jpg" alt="جزئیات دوخت و پارچه" loading="lazy"/>
        </figure>
        <div class="craft-copy">
          <span class="eyebrow" data-reveal>صنعتگری</span>
          <h2 class="display-2" data-reveal data-reveal-delay=".06">جزئیاتی که از نزدیک معنا پیدا می‌کنند.</h2>
          <p style="color:var(--color-ink-500);line-height:2.1" data-reveal data-reveal-delay=".12">
            دکمه‌های صدفی، سوزره‌های دولایه، آستر نیمه‌سراپا و برش‌هایی که روی بدن می‌نشینند نه
            روی مانکن. تفاوت یک قطعه‌ی معمولی و یک قطعه‌ی خوب، در همین جزئیات است.
          </p>
          <a href="${HOME_HREF}" class="btn btn-dark" data-reveal data-reveal-delay=".18">دیدن کالکشن‌ها</a>
        </div>
      </div>
    </section>

    <!-- Guide anchors -->
    <section class="container-x section-sm" id="guide">
      <header class="section-head"><h2 class="display-2">راهنمای خرید</h2></header>
      <div class="guide-grid">
        ${[
          ['ruler', 'راهنمای سایز', 'جدول اندازه‌ها برای انتخاب دقیق', 'guide'],
          ['cart', 'نحوه سفارش', 'از انتخاب تا ثبت سفارش در چند دقیقه', 'order'],
          ['truck', 'ارسال سفارش', 'روش‌ها، زمان تقریبی و هزینه‌ها', 'shipping'],
          ['refresh', 'بازگشت کالا', '۷ روز مهلت، بدون قید و شرط', 'return'],
        ]
          .map(
            ([ic, t, d, anchor]) => `
          <article class="value-card" id="${anchor}">
            <span class="vc-icon">${icon(ic, 20)}</span>
            <h3 style="font-size:1rem">${t}</h3>
            <p style="font-size:.85rem">${d}</p>
          </article>`,
          )
          .join('')}
      </div>
      <p style="font-size:.78rem;color:var(--color-ink-400);margin-top:1.2rem">
        * مقادیر ارسال و بازگشت نمایشی هستند و در نسخه‌ی نهایی مطابق سیاست فروشگاه تنظیم می‌شوند.
      </p>
    </section>

    <section class="container-x section-sm" id="careers" style="padding-bottom:4rem">
      <div class="col-hero-strip" style="--tone:#3157D5">
        <p class="ch-quote">فرصت‌های شغلی: به تیم کوچک ما در حوزه‌ی طراحی، دیجیتال مارکتینگ و پشتیبانی خوش می‌آید — از طریق صفحه‌ی تماس پیام بده.</p>
      </div>
    </section>`;

  parallax(main.querySelector('.craft-img'));
  reveal(main);
}
