import { storage, STORAGE_KEYS } from '../utils/storage.js';
import { bus } from '../utils/helpers.js';
import { fetchApi } from '../api/client.js';

let profile = storage.get(STORAGE_KEYS.profile, {}) ?? {};
let addresses = storage.get(STORAGE_KEYS.addresses, []) ?? [];
let loggedIn = Boolean(storage.get(STORAGE_KEYS.user, false));

const isNetworkError = (e) =>
  e instanceof TypeError || /fetch|Failed to fetch|NetworkError|Network error/i.test(e?.message ?? '');

/* API addresses are snake_case; the UI works with camelCase */
function normalizeAddress(a) {
  if (!a) return a;
  return {
    ...a,
    id: typeof a.id === 'number' ? a.id : Number(a.id),
    isDefault: a.isDefault ?? Boolean(a.is_default),
    postalCode: a.postalCode ?? a.postal_code ?? '',
  };
}

const persist = () => {
  storage.set(STORAGE_KEYS.profile, profile);
  storage.set(STORAGE_KEYS.addresses, addresses);
  storage.set(STORAGE_KEYS.user, loggedIn);
  bus.emit('user:changed', profile);
};

export const userState = {
  getProfile: () => ({ ...profile }),
  isLoggedIn: () => loggedIn,
  fullName: () => `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),

  async fetchMe() {
    if (!loggedIn) return;
    try {
        const data = await fetchApi('/auth/me/');
        profile = {
            ...profile,
            ...data,
            firstName: data.first_name,
            lastName: data.last_name,
        };
        persist();
    } catch(e) {
        if (e.status === 401) {
            this.logout();
        }
    }
  },

  async fetchAddresses() {
    if (!loggedIn) return;
    try {
        const data = await fetchApi('/auth/addresses/');
        addresses = (data.results ?? data ?? []).map(normalizeAddress);
        persist();
    } catch(e) {}
  },

  async updateProfile(partial) {
    profile = { ...profile, ...partial };
    persist();
    try {
        const data = await fetchApi('/auth/me/', {
            method: 'PATCH',
            body: JSON.stringify({
                first_name: partial.firstName ?? undefined,
                last_name: partial.lastName ?? undefined,
                email: partial.email ?? undefined,
            })
        });
        profile = {
            ...profile,
            ...data,
            firstName: data.first_name,
            lastName: data.last_name,
        };
        persist();
    } catch (e) {
        if (e.status === 401) this.logout();
        throw e;
    }
  },

  async login(identifier, password) {
    try {
        const data = await fetchApi('/auth/login/', {
            method: 'POST',
            body: JSON.stringify({ username: identifier, password })
        });
        localStorage.setItem('mod-style:token', data.access);
        localStorage.setItem('mod-style:refresh', data.refresh);
        if (data.user) {
            profile = { ...profile, ...data.user, firstName: data.user.first_name, lastName: data.user.last_name };
        }
        loggedIn = true;
        persist();

        await this.fetchMe();
        await this.fetchAddresses();
        bus.emit('auth:login', profile);
    } catch (e) {
        if (isNetworkError(e)) return this.loginDemo();
        throw e;
    }
  },

  async register(payload) {
    try {
        await fetchApi('/auth/register/', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    } catch (e) {
        if (!isNetworkError(e)) throw e;
    }
    // Auto login after register (falls back to local demo if backend is offline)
    await this.login(payload.username, payload.password);
  },

  /* Offline demo login — only when the backend is unreachable */
  loginDemo() {
    loggedIn = true;
    if (!profile.first_name) {
        profile = { ...profile, first_name: 'کاربر', last_name: 'دمو', username: 'demo' };
    }
    persist();
    bus.emit('auth:login', profile);
  },

  logout() {
    loggedIn = false;
    localStorage.removeItem('mod-style:token');
    localStorage.removeItem('mod-style:refresh');
    profile = {};
    addresses = [];
    persist();
    bus.emit('auth:logout');
  },

  getAddresses: () => structuredClone(addresses),
  getAddress: (id) =>
    structuredClone(addresses.find((a) => a.id === id) ?? null),
  defaultAddress: () =>
    structuredClone(addresses.find((a) => a.is_default) ?? addresses[0] ?? null),

  async saveAddress(addr) {
    const payload = {
        title: addr.title,
        province: addr.province,
        city: addr.city,
        line: addr.line,
        postal_code: addr.postalCode,
        receiver: addr.receiver,
        phone: addr.phone,
        is_default: addr.isDefault || false
    };

    let saved;
    if (addr.id && typeof addr.id === 'number') {
        saved = await fetchApi(`/auth/addresses/${addr.id}/`, {
            method: 'PUT',
            body: JSON.stringify(payload)
        });
    } else {
        saved = await fetchApi(`/auth/addresses/`, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    }

    await this.fetchAddresses();
    return saved ? normalizeAddress(saved) : saved;
  },

  async removeAddress(id) {
    if (typeof id === 'number') {
        await fetchApi(`/auth/addresses/${id}/`, { method: 'DELETE' });
    }
    await this.fetchAddresses();
  },
};

// Initial fetch if logged in
if (loggedIn) {
    userState.fetchMe();
    userState.fetchAddresses();
}
