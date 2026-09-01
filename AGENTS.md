# AGENTS.md — mod-style

## پروژه
فروشگاه مد پریمیوم فارسی/RTL — فرانت‌اند خالص (HTML5 + Tailwind v4 + Vanilla JS ES6 + Vite + GSAP + ScrollTrigger + Lenis).

## Commands
- `npm run dev` — سرور توسعه (http://localhost:5173)
- `npm run build` — بیلد تولیدی (multi-page، خروجی `dist/`)
- `npm run preview` — پیش‌نمایش بیلد
- `node scripts/smoke/logic.test.mjs` — تست منطق (فرمت قیمت/فیلترها/سبد/سفارش)
- `node scripts/smoke/checkout.test.mjs` — تست یکپارچه جریان تسویه‌حساب (jsdom)
- `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/download-images.ps1` — بازدانلود تصاویر

## Architecture notes
- صفحات در `pages/*.html` با `data-page` ؛ ماژول صفحه در `src/js/pages/<name>.js` با تابع `init()`.
- کروم مشترک (هدر/فوتر/تُست/اورلی‌ها) با JS داخل mount-pointهای `index.html` رندر می‌شود.
- UI → state (`src/js/state`) → services (`src/js/services`, API-ready) → داده mock در `src/js/data`.
- توکن‌های طراحی: `src/css/base.css` (Tailwind v4 `@theme`). لایه‌های دیگر CSS: components/ecommerce/animations/rtl/responsive.
- تصاویر سلف‌هاست در `public/images/**`؛ هر `<img>` از `guardImage()` عبور کند تا fallback برند داشته باشد.
- RTL: از logical properties استفاده شود؛ جهت «بعدی» اسلایدرها فیزیکی چپ است.

## Conventions
- بدون کامنت اضافه؛ نام‌گذاری فارسی برای محتوا، انگلیسی برای کد.
- هیچ کلید/رمز/اطلاعات پرداخت در localStorage ذخیره نمی‌شود (namespace: `mod-style:`).
