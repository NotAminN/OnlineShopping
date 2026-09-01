/* ============================================================
   auth-modal.js — login/register against the Django JWT API
   ============================================================ */
import { createModal } from './modal.js';
import { userState } from '../state/user-state.js';
import { showToast } from './toast.js';

const toLatin = (s) => String(s ?? '').replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));

export function openAuthModal(mode = 'login') {
  const modal = createModal({ title: 'ورود به مد استایل', width: 440 });

  const loginView = `
    <form class="auth-form" data-mode="login" novalidate>
      <div class="tabs" style="margin-bottom:1.5rem">
        <button type="button" class="tab active" data-tab="login">ورود</button>
        <button type="button" class="tab" data-tab="register">ثبت‌نام</button>
      </div>
      <div class="field">
        <label for="auth-ident">شماره موبایل یا نام کاربری</label>
        <input id="auth-ident" name="identifier" class="input num" autocomplete="username"
          placeholder="۰۹۱۲ ··· ····"/>
        <span class="field-error" data-error-ident></span>
      </div>
      <div class="field" style="margin-top:.8rem">
        <label for="auth-pass">رمز عبور</label>
        <input id="auth-pass" name="password" type="password" class="input" autocomplete="current-password"/>
        <span class="field-error" data-error-pass></span>
      </div>
      <p class="field-error" data-error-global style="margin-top:.8rem"></p>
      <button class="btn btn-primary btn-lg btn-block" type="submit" style="margin-top:1rem">ورود</button>
      <p class="auth-note">
        با ورود، <a href="#" class="link-underline">قوانین مد استایل</a> را می‌پذیرم.
      </p>
    </form>`;

  const registerView = `
    <form class="auth-form" data-mode="register" novalidate>
      <div class="tabs" style="margin-bottom:1.5rem">
        <button type="button" class="tab" data-tab="login">ورود</button>
        <button type="button" class="tab active" data-tab="register">ثبت‌نام</button>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:.8rem">
        <div class="field">
          <label for="reg-fn">نام</label>
          <input id="reg-fn" name="firstName" class="input" placeholder="نیلوفر"/>
          <span class="field-error" data-error-first></span>
        </div>
        <div class="field">
          <label for="reg-ln">نام خانوادگی</label>
          <input id="reg-ln" name="lastName" class="input" placeholder="رضایی"/>
          <span class="field-error" data-error-last></span>
        </div>
      </div>
      <div class="field" style="margin-top:.8rem">
        <label for="reg-mobile">شماره موبایل</label>
        <input id="reg-mobile" name="mobile" class="input num" inputmode="tel"
          placeholder="۰۹۱۲ ··· ····" autocomplete="tel"/>
        <span class="field-error" data-error-mobile></span>
      </div>
      <div class="field" style="margin-top:.8rem">
        <label for="reg-pass">رمز عبور</label>
        <input id="reg-pass" name="password" type="password" class="input" autocomplete="new-password"
          placeholder="حداقل ۸ کاراکتر، شامل حرف و عدد"/>
        <span class="field-error" data-error-pass></span>
      </div>
      <div class="field" style="margin-top:.8rem">
        <label for="reg-pass2">تکرار رمز عبور</label>
        <input id="reg-pass2" name="password2" type="password" class="input" autocomplete="new-password"/>
        <span class="field-error" data-error-pass2></span>
      </div>
      <p class="field-error" data-error-global style="margin-top:.8rem"></p>
      <button class="btn btn-primary btn-lg btn-block" type="submit" style="margin-top:1rem">
        ثبت‌نام
      </button>
      <p class="auth-note">پس از ثبت‌نام به‌صورت خودکار وارد حساب خود می‌شوید.</p>
    </form>`;

  modal.body.innerHTML = mode === 'register' ? registerView : loginView;

  /* tab switching */
  modal.body.addEventListener('click', (e) => {
    const tab = e.target.closest('[data-tab]');
    if (!tab) return;
    modal.body.innerHTML = tab.dataset.tab === 'login' ? loginView : registerView;
  });

  const field = (form, name) => form.querySelector(`[name="${name}"]`);

  const setErr = (form, key, msg) => {
    const el = form.querySelector(`[data-error-${key}]`);
    if (el) el.textContent = msg ?? '';
    return Boolean(msg);
  };

  const clearErrs = (form) =>
    form.querySelectorAll('.field-error').forEach((el) => (el.textContent = ''));

  const busy = (form, on) => {
    const btn = form.querySelector('[type="submit"]');
    if (btn) {
      btn.disabled = on;
      btn.style.opacity = on ? '.6' : '';
    }
  };

  const succeed = (name) => {
    modal.close();
    showToast(`خوش آمدی ${name || userState.fullName() || 'کاربر'}!`, { type: 'success' });
    setTimeout(() => (location.href = pageHref('account.html')), 700);
  };

  /* submit handling */
  modal.body.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    clearErrs(form);
    busy(form, true);

    try {
      if (form.dataset.mode === 'login') {
        const identifier = toLatin(field(form, 'identifier').value).trim();
        const password = field(form, 'password').value;
        if (!identifier) return setErr(form, 'ident', 'شماره موبایل یا نام کاربری را وارد کن.');
        if (!password) return setErr(form, 'pass', 'رمز عبور را وارد کن.');
        await userState.login(identifier, password);
        return succeed();
      }

      /* register */
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

      const payload = {
        username: `user${digits.slice(-10)}`,
        password,
        email: '',
        mobile: digits,
        first_name: fn,
        last_name: ln,
      };
      await userState.register(payload);
      return succeed(`${fn} ${ln}`);
    } catch (err) {
      const msg = err?.message || 'خطا در انجام عملیات. دوباره تلاش کن.';
      showToast(msg, { type: 'error' });
      setErr(form, 'global', msg);
    } finally {
      busy(form, false);
    }
  });

  modal.open();
}

const pageHref = (p) =>
  `${location.pathname.includes('/pages/') ? '' : 'pages/'}${p}`;

/* small shared style hook */
document.head.insertAdjacentHTML(
  'beforeend',
  `<style>
.auth-form .auth-note{margin-top:1rem;font-size:.78rem;color:var(--color-ink-400);line-height:2;text-align:center}
</style>`,
);
