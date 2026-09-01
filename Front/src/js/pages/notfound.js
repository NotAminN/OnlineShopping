/* ============================================================
   notfound.js — 404 page
   ============================================================ */
import { icon } from '../utils/icons.js';

export function init() {
  document.title = 'صفحه پیدا نشد | مد استایل';
  const main = document.getElementById('main');
  const homeHref = location.pathname.includes('/pages/') ? '../index.html' : 'index.html';
  main.innerHTML = `
    <div class="container-x section">
      <div class="nf-wrap">
        <p class="nf-code num">۴۰۴</p>
        <h1>این صفحه در کمد استایل ما جایی ندارد.</h1>
        <p>ممکن است آدرس تغییر کرده باشد یا صفحه حذف شده باشد.</p>
        <div style="display:flex;gap:.7rem;justify-content:center;flex-wrap:wrap;margin-top:1.6rem">
          <a href="${homeHref}" class="btn btn-primary btn-lg">بازگشت به خانه</a>
          <a href="${homeHref.replace('index.html', 'pages/shop.html')}" class="btn btn-outline btn-lg">مشاهده محصولات</a>
        </div>
      </div>
    </div>`;
}
