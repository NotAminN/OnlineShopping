export const API_URL = import.meta.env?.VITE_API_URL || '/api';

const FA_ERROR_MAP = [
    [/Enter a valid username/i, 'نام کاربری معتبر نیست.'],
    [/A user with that username already exists/i, 'این نام کاربری قبلاً ثبت شده است.'],
    [/A user is already registered with this e-mail/i, 'این ایمیل قبلاً ثبت شده است.'],
    [/user with this mobile/i, 'این شماره موبایل قبلاً ثبت شده است.'],
    [/This password is entirely numeric/i, 'رمز عبور نمی‌تواند فقط عدد باشد.'],
    [/This password is too short/i, 'رمز عبور خیلی کوتاه است (حداقل ۸ کاراکتر).'],
    [/This password is too common/i, 'رمز عبور بسیار رایج و قابل حدس است.'],
    [/The password is too similar to the/i, 'رمز عبور شبیه اطلاعات شخصی شماست.'],
    [/No active account found with the given credentials/i, 'نام کاربری یا رمز عبور اشتباه است.'],
    [/No active account/i, 'نام کاربری یا رمز عبور اشتباه است.'],
    [/Given token not valid/i, 'نشست شما منقضی شده است. دوباره وارد شوید.'],
    [/Authentication credentials were not provided/i, 'برای این عملیات باید وارد حساب شوید.'],
    [/Enter a valid e-mail/i, 'ایمیل معتبر نیست.'],
    [/this field is required/i, 'این فیلد الزامی است.'],
    [/detail.*not found|Not found/i, 'موردی پیدا نشد.'],
];

function translateError(message) {
    for (const [pattern, fa] of FA_ERROR_MAP) {
        if (pattern.test(message)) return fa;
    }
    return message;
}

function buildErrorMessage(errorData) {
    const fieldErrors = [];
    for (const [key, val] of Object.entries(errorData)) {
        if (key === 'detail' && typeof val === 'string') { fieldErrors.push(translateError(val)); continue; }
        const joined = Array.isArray(val) ? val.map((m) => translateError(String(m))).join(' — ') : translateError(String(val));
        fieldErrors.push(joined);
    }
    return fieldErrors.join(' · ');
}

export async function fetchApi(endpoint, options = {}) {
    const token = localStorage.getItem('mod-style:token');

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        let errorData;
        try {
            errorData = await response.json();
        } catch(e) {
            errorData = { detail: response.statusText };
        }
        const message = buildErrorMessage(errorData) || 'خطا در ارتباط با سرور';
        const error = new Error(message);
        error.status = response.status;
        throw error;
    }

    if (response.status === 204) {
        return null; // No content
    }

    return response.json();
}
