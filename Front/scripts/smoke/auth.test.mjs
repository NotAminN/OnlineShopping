/* Register flow integration test under jsdom:
   1) tab switch to ثبت‌نام shows a submit button labeled «ثبت‌نام»
   2) filling the form and submitting calls /auth/register/ then /auth/login/ */
import { JSDOM } from 'jsdom';

const dom = new JSDOM(
  `<!doctype html><html lang="fa" dir="rtl"><head></head>
   <body data-page="auth">
     <div id="announcement-root"></div>
     <div id="header-root"></div>
     <main id="main"></main>
     <footer id="footer-root"></footer>
     <div id="overlay-root"></div>
   </body></html>`,
  { url: 'http://localhost:5173/pages/auth.html', pretendToBeVisual: true },
);

globalThis.window = dom.window;
globalThis.document = dom.window.document;
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
dom.window.matchMedia ??= () => ({
  matches: true,
  addEventListener: () => {},
  removeEventListener: () => {},
});
dom.window.scrollTo = () => {};

globalThis.location = dom.window.location;
globalThis.history = dom.window.history;
globalThis.getComputedStyle = dom.window.getComputedStyle;
globalThis.scrollTo = () => {};

const calls = [];
global.fetch = async (url, options = {}) => {
  calls.push({ url: String(url), method: options.method ?? 'GET', body: options.body ?? null });
  if (String(url).includes('/auth/login/')) {
    return {
      ok: true,
      status: 200,
      json: async () => ({
        access: 'test-access-token',
        refresh: 'test-refresh-token',
        user: { id: 1, username: 'user09121111111', first_name: 'نیلوفر', last_name: 'رضایی' },
      }),
    };
  }
  return { ok: true, status: 201, json: async () => ({}) };
};

let pass = 0;
const ok = (cond, label) => {
  console.log(cond ? `PASS  ${label}` : `FAIL  ${label}`);
  if (!cond) process.exitCode = 1;
  else pass++;
};

const click = (el) => el.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));

/* --- Auth page flow --- */
const { init } = await import('../../src/js/pages/auth.js');
init();

const main = document.getElementById('main');
ok(Boolean(main.querySelector('.auth-box')), 'auth page renders');

const registerTab = [...main.querySelectorAll('[data-tab]')].find((t) => t.dataset.tab === 'register');
click(registerTab);

const host = main.querySelector('[data-form-host]');
const form = host.querySelector('form[data-mode="register"]');
ok(Boolean(form), 'register form shown after tab click');

const submitBtn = form.querySelector('[type="submit"]');
ok(Boolean(submitBtn), 'register submit button exists at the bottom');
ok(submitBtn.textContent.trim() === 'ثبت‌نام', 'submit button is labeled «ثبت‌نام»');

const setVal = (form, name, v) => (form.querySelector(`[name="${name}"]`).value = v);
setVal(form, 'firstName', 'نیلوفر');
setVal(form, 'lastName', 'رضایی');
setVal(form, 'mobile', '09121111111');
setVal(form, 'password', 'Test1234abc');
setVal(form, 'password2', 'Test1234abc');

form.dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true }));
await new Promise((r) => setTimeout(r, 50));

const regCall = calls.find((c) => c.url.includes('/auth/register/'));
console.log('DEBUG errs:', form.querySelector('[data-error-global]').textContent);
const loginCall = calls.find((c) => c.url.includes('/auth/login/'));
ok(Boolean(regCall), 'POST /auth/register/ sent on submit');
ok(Boolean(loginCall), 'auto login after register');
if (regCall) {
  const payload = JSON.parse(regCall.body);
  ok(payload.first_name === 'نیلوفر' && payload.mobile === '09121111111', 'register payload fields correct');
}
ok(dom.window.localStorage.getItem('mod-style:token') === 'test-access-token', 'token stored after login');

/* --- Auth modal flow --- */
const { openAuthModal } = await import('../../src/js/components/auth-modal.js');
openAuthModal('register');
const modalForm = document.querySelector('.modal-body form[data-mode="register"]');
ok(Boolean(modalForm), 'modal opens directly on register view');
ok(modalForm.querySelector('[type="submit"]').textContent.trim() === 'ثبت‌نام', 'modal register button labeled «ثبت‌نام»');

/* tab switch inside modal */
const loginTabBtn = modalForm.querySelector('[data-tab="login"]');
click(loginTabBtn);
const loginForm = document.querySelector('.modal-body form[data-mode="login"]');
ok(Boolean(loginForm), 'tab switch back to login works');
ok(loginForm.querySelector('[type="submit"]').textContent.trim() === 'ورود', 'login button labeled «ورود»');

console.log(`\n${pass > 0 && !process.exitCode ? 'ALL PASS' : 'FAILURES'} (${pass} passed)`);