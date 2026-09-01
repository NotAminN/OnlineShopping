/* ============================================================
   size-guide.js — size guide modal (§91)
   ============================================================ */
import { createModal } from './modal.js';

const TABLE_ROWS = [
  ['XS', '۸۰ – ۸۴', '۶۰ – ۶۴', '۸۶ – ۹۰', '۹۰'],
  ['S', '۸۴ – ۸۸', '۶۴ – ۶۸', '۹۰ – ۹۴', '۹۲'],
  ['M', '۸۸ – ۹۴', '۶۸ – ۷۴', '۹۴ – ۱۰۰', '۹۴'],
  ['L', '۹۴ – ۱۰۰', '۷۴ – ۸۰', '۱۰۰ – ۱۰۶', '۹۶'],
  ['XL', '۱۰۰ – ۱۰۶', '۸۰ – ۸۶', '۱۰۶ – ۱۱۲', '۹۸'],
  ['XXL', '۱۰۶ – ۱۱۲', '۸۶ – ۹۲', '۱۱۲ – ۱۱۸', '۱۰۰'],
];

export function openSizeGuide() {
  const modal = createModal({ title: 'راهنمای انتخاب سایز', width: 560 });
  modal.body.innerHTML = `
    <table class="size-table">
      <thead>
        <tr><th>سایز</th><th>دور سینه (cm)</th><th>دور کمر (cm)</th><th>دور باسن (cm)</th><th>قد (cm)</th></tr>
      </thead>
      <tbody>
        ${TABLE_ROWS.map(
          (r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`,
        ).join('')}
      </tbody>
    </table>
    <p style="font-size:.8rem;color:var(--color-ink-400);margin-top:1.1rem;line-height:1.9">
      نکته: اندازه‌ها ممکن است بسته به مدل و جنس پارچه‌ی محصول، کمی متفاوت باشند.
      برای اطمینان بیشتر، جدول اندازه‌ی همان محصول را مبنا قرار بده.
    </p>`;
  modal.open();
}
