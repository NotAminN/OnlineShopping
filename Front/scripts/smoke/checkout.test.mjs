/* Checkout flow integration test under jsdom */
import { JSDOM } from 'jsdom';

const dom = new JSDOM(
  `<!doctype html><html lang="fa" dir="rtl"><head></head>
   <body data-page="checkout">
     <div id="announcement-root"></div>
     <div id="header-root"></div>
     <main id="main"></main>
     <footer id="footer-root"></footer>
     <div id="overlay-root"></div>
   </body></html>`,
  { url: 'http://localhost:5173/pages/checkout.html', pretendToBeVisual: true },
);

globalThis.window = dom.window;
globalThis.document = dom.window.document;
global.fetch = async () => ({
    ok: true,
    status: 200,
    json: async () => ({ id: 'A-123456', created_at: new Date().toISOString() })
});
Object.defineProperty(globalThis, 'navigator', {
  value: dom.window.navigator,
  configurable: true,
});
globalThis.localStorage = dom.window.localStorage;
globalThis.HTMLElement = dom.window.HTMLElement;
globalThis.Element = dom.window.Element;
globalThis.Node = dom.window.Node;
globalThis.CustomEvent = dom.window.CustomEvent;
globalThis.MouseEvent = dom.window.MouseEvent;
globalThis.Event = dom.window.Event;
globalThis.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 16);
globalThis.cancelAnimationFrame = (id) => clearTimeout(id);
dom.window.requestAnimationFrame = globalThis.requestAnimationFrame;
dom.window.cancelAnimationFrame = globalThis.cancelAnimationFrame;
if (!dom.window.matchMedia) {
  dom.window.matchMedia = () => ({
    matches: false,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
  });
}
globalThis.matchMedia = dom.window.matchMedia;
globalThis.location = dom.window.location;
globalThis.history = dom.window.history;

const tick = (ms = 30) => new Promise((r) => setTimeout(r, ms));
const $ = (sel) => document.querySelector(sel);
const click = (el) =>
  el.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true, cancelable: true }));
const setInput = (sel, value) => {
  const el = $(sel);
  el.value = value;
  el.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
};
const stepInDom = () => {
  if ($('#fn') && $('[data-err-firstName]')) return 1;
  if ($('[name="province"]') && $('[name="city"]')) return 2;
  if ($('[name="shippingMethodId"]')) return 3;
  if ($('[name="paymentMethodId"]')) return 4;
  if ($('.review-grid')) return 5;
  return 0;
};

let failures = 0;
const check = (name, cond) => {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}`);
  if (!cond) failures++;
};

/* ---------- seed cart ---------- */
const { cartState } = await import('../../src/js/state/cart-state.js');
const { PRODUCTS } = await import('../../src/js/data/products.js');
cartState.clear();
cartState.add(PRODUCTS[0], { color: PRODUCTS[0].colors[0], size: PRODUCTS[0].sizes[1], qty: 1 });

/* clear any stale draft */
localStorage.removeItem('mod-style:checkout-draft');

/* ---------- boot page ---------- */
const checkoutPage = await import('../../src/js/pages/checkout.js');
await checkoutPage.init();
await tick(80); /* wait for shippingService promise */

check('boot renders step 1', stepInDom() === 1);

/* ---- step 1 ---- */
setInput('#fn', '\u0646\u06CC\u0644\u0648\u0641\u0631');           // نیلوفر
setInput('#ln', '\u0631\u0636\u0627\u06CC\u06CC');                 // رضایی
setInput('#ph', '09123456789');
click($('[data-next]'));
await tick();
check('advance to step 2', stepInDom() === 2);

/* ---- step 2 ---- */
const provSel = $('[name="province"]');
provSel.value = '\u062A\u0647\u0631\u0627\u0646';                   // تهران
provSel.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
provSel.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
setInput('[name="city"]', '\u062A\u0647\u0631\u0627\u0646');
setInput('[name="line"]', '\u0633\u0639\u0627\u062F\u062A \u0622\u0628\u0627\u062F\u060C \u0628\u0644\u0648\u0627\u0631 \u062F\u0631\u06CC\u0627\u060C \u067E\u0644\u0627\u06A9 \u06F1\u06F2'); // long enough address
setInput('[name="postalCode"]', '1998745631');
click($('[data-next]'));
await tick();
check('advance to step 3', stepInDom() === 3);

/* ---- step 3 ---- */
const postRadio = document.querySelector('input[name="shippingMethodId"][value="post"]');
postRadio.checked = true;
postRadio.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
await tick();
click($('[data-next]'));
await tick();
check('advance to step 4', stepInDom() === 4);

/* ---- step 4 : THE REPORTED BREAKAGE ---- */
const codRadio = document.querySelector('input[name="paymentMethodId"][value="cod"]');
codRadio.checked = true;
codRadio.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
await tick(); /* bindPayment triggers renderStep on change — let it settle */
check('still on payment step after selecting method', stepInDom() === 4);

console.log('      -> clicking [data-next] on step 4');
click($('[data-next]'));
await tick();
const landed = stepInDom();
check(`advance to step 5 (landed: ${landed})`, landed === 5);

/* capture any console errors during submit */
const errors = [];
const origErr = console.error;
console.error = (...a) => {
  errors.push(a.join(' '));
  origErr(...a);
};

/* ---- step 5 : submit ---- */
const { orderService } = await import('../../src/js/services/orders.js');
const ordersBefore = (await orderService.getOrders()).length;
click($('[data-next]'));
await tick(1100); /* submission has a 900ms simulated delay */

console.error = origErr;
/* jsdom cannot navigate documents; success == order persisted + cart emptied */
const ordersAfter = await orderService.getOrders();
check(
  'order created in storage',
  ordersAfter.length === ordersBefore + 1,
);
check('cart cleared after order', cartState.count() === 0);
check(
  'checkout draft reset',
  localStorage.getItem('mod-style:checkout-draft') === null,
);
const realErrors = errors.filter((e) => !e.includes('Not implemented'));
check('no runtime errors during flow', realErrors.length === 0);
if (realErrors.length) {
  console.log('\nConsole errors captured:');
  realErrors.slice(0, 5).forEach((e) => console.log('  ', e.slice(0, 300)));
}

console.log(failures ? `\n${failures} FAILURES` : '\nALL PASS');
process.exit(failures ? 1 : 0);
