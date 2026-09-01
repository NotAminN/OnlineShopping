/* ============================================================
   contact.js — contact page + FAQ (§59, footer links)
   ============================================================ */
import { icon } from '../utils/helpers.icons.js';
import { showToast } from '../components/toast.js';
import { reveal } from '../animations/gsap.js';

const HOME_HREF = location.pathname.includes('/pages/') ? '../index.html' : 'index.html';

const FAQ = [
  ['چطور سایز مناسب را انتخاب کنم؟', 'در صفحه‌ی هر محصول، جدول «راهنمای انتخاب سایز» را ببین؛ اندازه‌ها به سانتی‌متر و بر اساس مدل بدن استاندارد تنظیم شده‌اند.'],
  ['ارسال چند روز طول می‌کشد؟', 'تهران با پیک فوری همان روز و شهرستان‌ها ۲ تا ۴ روز کاری با پست پیشتاز.'],
  ['امکان بازگشت کالا هست؟', 'بله؛ تا ۷ روز پس از تحویل، بدون قید و شرط — فقط بسته‌بندی و برچسب سالم باشد.'],
  ['پرداخت اقساطی چطور انجام می‌شود؟', 'در مرحله پرداخت، گزینه‌ی «اقساط ۴ ماهه» از طریق درگاه بانک همکار فعال است.'],
];

export function init() {
  document.title = 'تماس با ما | مد استایل';
  const main = document.getElementById('main');

  main.innerHTML = `
    <div class="container-x section-sm" style="max-width:1080px">
      <nav class="breadcrumbs">
        <a href="${HOME_HREF}">خانه</a><span class="bc-sep">/</span><span aria-current="page">تماس با ما</span>
      </nav>
      <header style="margin-block:1rem 2rem">
        <span class="eyebrow">پشتیبانی مد استایل</span>
        <h1 class="display-1">خوشحال می‌شویم بشنویمت.</h1>
        <p style="color:var(--color-ink-500);max-width:520px;margin-top:.4rem">
          هر سوالی درباره‌ی محصول، سفارش یا همکاری داری، برایمان بنویس؛ معمولاً کمتر از یک روز کاری پاسخ می‌دهیم.
        </p>
      </header>

      <div class="contact-layout">
        <!-- info cards -->
        <aside class="contact-info">
          ${[
            ['phone', 'تلفن پشتیبانی', '<span class="num" dir="ltr">۰۲۱ - ۹۱۰۰ ۸۸۷۷</span>', 'هر روز ۹ تا ۲۱'],
            ['mail', 'ایمیل', '<span dir="ltr">hello@mod-style.example</span>', 'پاسخ حداکثر ۲۴ ساعته'],
            ['pin', 'فروشگاه حضوری', 'تهران، خیابان ولیعصر، گالری مد استایل', 'شنبه تا چهارشنبه ۱۱ تا ۲۰'],
          ]
            .map(
              ([ic, t, v, n]) => `
            <article class="value-card">
              <span class="vc-icon">${icon(ic, 20)}</span>
              <h3 style="font-size:.95rem">${t}</h3>
              <p style="font-size:.88rem">${v}</p>
              <p style="font-size:.75rem;color:var(--color-ink-400)">${n}</p>
            </article>`,
            )
            .join('')}
        </aside>

        <!-- form -->
        <form class="co-panel contact-form" novalidate>
          <h2>${icon('mail', 18)} پیام شما</h2>
          <div class="field"><label for="cname">نام و نام خانوادگی</label>
            <input id="cname" name="name" class="input" placeholder="نیلوفر رضایی"/></div>
          <div class="field" style="margin-top:.9rem"><label for="cmail">ایمیل یا شماره تماس</label>
            <input id="cmail" name="contact" class="input num" dir="ltr" style="text-align:right"/></div>
          <div class="field" style="margin-top:.9rem"><label for="cmsg">پیام</label>
            <textarea id="cmsg" name="message" class="textarea" rows="5"
              placeholder="سلام! درباره‌ی …"></textarea></div>
          <button type="submit" class="btn btn-primary btn-lg" style="margin-top:1.2rem">ارسال پیام</button>
          <p style="font-size:.72rem;color:var(--color-ink-400);margin-top:.7rem">
            نسخه نمایشی — پیام فقط در همین مرورگر شبیه‌سازی می‌شود.
          </p>
        </form>
      </div>

      <!-- FAQ -->
      <section id="faq" style="margin-top:3.5rem;max-width:820px">
        <h2 class="display-2" data-reveal>سوالات متداول</h2>
        <div class="accordion" style="margin-top:1.4rem;background:#fff;border:1px solid var(--color-ink-100);border-radius:18px;padding-inline:1.3rem" data-faq></div>
      </section>
    </div>`;

  /* FAQ accordion */
  const faq = main.querySelector('[data-faq]');
  FAQ.forEach(([q, a], i) => {
    const item = document.createElement('div');
    item.className = `accordion-item${i === 0 ? ' open' : ''}`;
    item.style.borderTop = i === 0 ? 'none' : '';
    item.innerHTML = `
      <button type="button" class="accordion-trigger" aria-expanded="${i === 0}">
        <span>${q}</span>${icon('chevron-down', 17, 'acc-chevron')}
      </button>
      <div class="accordion-panel"><div><div class="accordion-panel-inner">${a}</div></div></div>`;
    item.querySelector('.accordion-trigger').addEventListener('click', () => {
      const open = item.classList.contains('open');
      item.classList.toggle('open');
      item.querySelector('.accordion-trigger').setAttribute('aria-expanded', String(!open));
    });
    faq.appendChild(item);
  });

  /* fake submit */
  main.querySelector('.contact-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.target;
    if (!f.name.value.trim() || !f.contact.value.trim() || f.message.value.trim().length < 10) {
      showToast('نام، راه ارتباطی و متن پیام را کامل کن.', { type: 'error' });
      return;
    }
    f.reset();
    showToast('پیامت رسید! خیلی زود جواب می‌دهیم.', { type: 'success' });
  });

  reveal(main);
}
