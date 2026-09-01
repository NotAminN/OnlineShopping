/* ============================================================
   auth.js — standalone login/register page (Django JWT API)
   ============================================================ */
import { userState } from '../state/user-state.js';

const toLatin = (s) => String(s ?? '').replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));

const loginView = () => `
  <form data-mode="login" novalidate>
    <div class="field">
      <label for="pg-ident">شماره موبایل یا نام کاربری</label>
      <input id="pg-ident" name="identifier" class="input num" autocomplete="username"
        placeholder="۰۹۱۲ ··· ····"/>
      <span class="field-error" data-error-ident></span>
    </div>
    <div class="field" style="margin-top:.9rem">
      <label for="pg-pass">رمز عبور</label>
      <input id="pg-pass" name="password" type="password" class="input" autocomplete="current-password"/>
      <span class="field-error" data-error-pass></span>
    </div>
    <p class="field-error" data-error-global style="margin-top:.8rem"></p>
    <button type="submit" class="btn btn-primary btn-lg btn-block" style="margin-top:1.1rem">ورود</button>
  </form>`;

const registerView = () => `
  <form data-mode="register" novalidate>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:.8rem">
      <div class="field">
        <label for="pg-fn">نام</label>
        <input id="pg-fn" name="firstName" class="input" placeholder="نیلوفر"/>
        <span class="field-error" data-error-first></span>
      </div>
      <div class="field">
        <label for="pg-ln">نام خانوادگی</label>
        <input id="pg-ln" name="lastName" class="input" placeholder="رضایی"/>
        <span class="field-error" data-error-last></span>
      </div>
    </div>
    <div class="field" style="margin-top:.9rem">
      <label for="pg-mobile">شماره موبایل</label>
      <input id="pg-mobile" name="mobile" class="input num" inputmode="tel"
        placeholder="۰۹۱۲ ··· ····" autocomplete="tel"/>
      <span class="field-error" data-error-mobile></span>
    </div>
    <div class="field" style="margin-top:.9rem">
      <label for="pg-regpass">رمز عبور</label>
      <input id="pg-regpass" name="password" type="password" class="input" autocomplete="new-password"
        placeholder="حداقل ۸ کاراکتر، شامل حرف و عدد"/>
      <span class="field-error" data-error-pass></span>
    </div>
    <div class="field" style="margin-top:.9rem">
      <label for="pg-regpass2">تکرار رمز عبور</label>
      <input id="pg-regpass2" name="password2" type="password" class="input" autocomplete="new-password"/>
      <span class="field-error" data-error-pass2></span>
    </div>
    <p class="field-error" data-error-global style="margin-top:.8rem"></p>
    <button type="submit" class="btn btn-primary btn-lg btn-block" style="margin-top:1.1rem">
      ثبت‌نام
    </button>
  </form>`;

export function init() {
  document.title = 'ورود | مد استایل';
  const main = document.getElementById('main');
  const homeHref = location.pathname.includes('/pages/') ? '../index.html' : 'index.html';
  const accountHref = homeHref.replace('index.html', 'pages/account.html');

  if (userState.isLoggedIn()) {
    location.href = accountHref;
    return;
  }

  main.innerHTML = `
    <div class="container-x section">
      <div class="auth-page">
        <div class="auth-visual img-frame grain" aria-hidden="true">
          <img src="../images/editorial/ed-3.jpg" alt="" loading="lazy"/>
          <p class="av-quote">استایل تو، امضای توست.</p>
        </div>
        <div class="auth-box">
          <a href="${homeHref}" class="brand-mark" style="font-size:1.4rem">مد استایل<span class="brand-dot">.</span></a>
          <div class="tabs" style="margin:1.2rem 0">
            <button type="button" class="tab active" data-tab="login">ورود</button>
            <button type="button" class="tab" data-tab="register">ثبت‌نام</button>
          </div>
          <div data-form-host>${loginView()}</div>
          <p style="font-size:.72rem;color:var(--color-ink-400);margin-top:1.4rem;line-height:2;text-align:center">
            با ورود، قوانین مد استایل را می‌پذیرم.
          </p>
        </div>
      </div>
    </div>`;

  const host = main.querySelector('[data-form-host]');

  main.addEventListener('click', (e) => {
    const tab = e.target.closest('[data-tab]');
    if (!tab) return;
    main.querySelectorAll('.tab').forEach((t) => t.classList.toggle('active', t === tab));
    host.innerHTML = tab.dataset.tab === 'login' ? loginView() : registerView();
  });

  const setErr = (form, key, msg) => {
    const el = form.querySelector(`[data-error-${key}]`);
    if (el) el.textContent = msg ?? '';
    return Boolean(msg);
  };

  const field = (form, name) => form.querySelector(`[name="${name}"]`);

  main.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    form.querySelectorAll('.field-error').forEach((el) => (el.textContent = ''));
    const btn = form.querySelector('[type="submit"]');
    if (btn) {
      btn.disabled = true;
      btn.style.opacity = '.6';
    }

    try {
      if (form.dataset.mode === 'login') {
        const identifier = toLatin(field(form, 'identifier').value).trim();
        const password = field(form, 'password').value;
        if (!identifier) return setErr(form, 'ident', 'شماره موبایل یا نام کاربری را وارد کن.');
        if (!password) return setErr(form, 'pass', 'رمز عبور را وارد کن.');
        await userState.login(identifier, password);
        location.href = accountHref;
        return;
      }

      const digits = toLatin(field(form, 'mobile').value).replace(/\D/g, '');
      const fn = field(form, 'firstName').value.trim();
      const ln = field(form, 'lastName').value.trim();
      const password = field(form, 'password').value;

      let bad = false;
      if (!fn) bad = setErr(form, 'first', 'نام را وارد کن.') || true;
      if (!ln) bad = setErr(form, 'last', 'نام خانوادگی را وارد کن.') || true;
      if (!/^09\d{9}$/.test(digits))
        bad = setErr(form, 'mobile', 'شماره موبایل معتبر نیست. نمونه: 09123456789') || true;
      if (password.length < 8 || !/[a-zA-Z]/.test(password) || !/\d/.test(password))
        bad = setErr(form, 'pass', 'رمز عبور باید حداقل ۸ کاراکتر و شامل حرف و عدد باشد.') || true;
      if (password !== field(form, 'password2').value)
        bad = setErr(form, 'pass2', 'تکرار رمز عبور مطابقت ندارد.') || true;
      if (bad) return;

      await userState.register({
        username: `user${digits.slice(-10)}`,
        password,
        email: '',
        mobile: digits,
        first_name: fn,
        last_name: ln,
      });
      location.href = accountHref;
    } catch (err) {
      setErr(form, 'global', err?.message || 'خطا در انجام عملیات. دوباره تلاش کن.');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.style.opacity = '';
      }
    }
  });
}
