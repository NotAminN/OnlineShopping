import { JSDOM } from 'jsdom';

const dom = new JSDOM(
  `<!doctype html><html lang="fa" dir="rtl"><head></head>
   <body data-page="auth">
     <div id="announcement-root"></div>
     <div id="header-root"></div>
     <main id="main"></main>
     <footer id="footer-root"></footer>
   </body></html>`,
  { url: 'http://localhost:5173/pages/auth.html', pretendToBeVisual: true }
);

globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.localStorage = dom.window.localStorage;
Object.defineProperty(globalThis, 'navigator', {
  value: dom.window.navigator,
  configurable: true,
});
globalThis.location = dom.window.location;

/* Simulate Vercel static 404 response for any /api call */
global.fetch = async () => ({
  ok: false,
  status: 404,
  statusText: '',
  json: async () => {
    throw new Error('Unexpected token < in JSON at position 0');
  },
  text: async () => '404: NOT_FOUND'
});

const { userState } = await import('../../src/js/state/user-state.js');
const { init: initAuthPage } = await import('../../src/js/pages/auth.js');

let failures = 0;
const check = (name, cond) => {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}`);
  if (!cond) failures++;
};

// 1. Initial state
userState.logout();
check('initial state not logged in', !userState.isLoggedIn());

// 2. Offline registration test
await userState.register({
  username: 'user09121112233',
  password: 'Password123',
  email: '',
  mobile: '09121112233',
  first_name: 'سارا',
  last_name: 'محمدی'
});

check('registered and logged in', userState.isLoggedIn());
check('registered profile has first_name', userState.getProfile().first_name === 'سارا');
check('registered profile has last_name', userState.getProfile().last_name === 'محمدی');
check('registered fullName matches', userState.fullName() === 'سارا محمدی');

// 3. Logout
userState.logout();
check('logged out', !userState.isLoggedIn());

// 4. Offline login with correct password
await userState.login('09121112233', 'Password123');
check('logged in with mobile and password', userState.isLoggedIn());
check('profile restored correctly', userState.fullName() === 'سارا محمدی');

// 5. Offline login with wrong password throws error
userState.logout();
let threwWrongPass = false;
try {
  await userState.login('09121112233', 'WrongPass999');
} catch (e) {
  threwWrongPass = /رمز عبور/i.test(e.message);
}
check('wrong password throws appropriate error', threwWrongPass);

// 6. Test form in auth.js directly
userState.logout();
initAuthPage();

const main = document.getElementById('main');
const registerTab = main.querySelector('[data-tab="register"]');
registerTab.click();

const regForm = main.querySelector('form[data-mode="register"]');
check('register form rendered', Boolean(regForm));

regForm.querySelector('[name="firstName"]').value = 'علی';
regForm.querySelector('[name="lastName"]').value = 'کریمی';
regForm.querySelector('[name="mobile"]').value = '09351234567';
regForm.querySelector('[name="password"]').value = 'Ali123456';
regForm.querySelector('[name="password2"]').value = 'Ali123456';

regForm.dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true }));

// Wait for async handler
await new Promise((r) => setTimeout(r, 100));

const globalErr = regForm.querySelector('[data-error-global]').textContent;
check('no server error on register form submit', !globalErr);
check('user is logged in after register form submit', userState.isLoggedIn());
check('user has registered name', userState.getProfile().first_name === 'علی');

console.log(failures ? `\n${failures} FAILURES` : '\nALL PASS');
process.exit(failures ? 1 : 0);