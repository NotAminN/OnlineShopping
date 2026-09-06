import { storage, STORAGE_KEYS } from '../utils/storage.js';
import { bus } from '../utils/helpers.js';
import { fetchApi, isBackendUnavailable } from '../api/client.js';

const USERS_KEY = 'demo-users';

let profile = storage.get(STORAGE_KEYS.profile, {}) ?? {};
let addresses = storage.get(STORAGE_KEYS.addresses, []) ?? [];
let loggedIn = Boolean(storage.get(STORAGE_KEYS.user, false));

function getLocalUsers() {
  return storage.get(USERS_KEY, []) ?? [];
}

function saveLocalUser(user) {
  const users = getLocalUsers().filter(
    (u) => u.username !== user.username && u.mobile !== user.mobile
  );
  users.push(user);
  storage.set(USERS_KEY, users);
}

function findLocalUser(identifier) {
  const clean = String(identifier ?? '').trim();
  if (!clean) return null;
  const users = getLocalUsers();
  return users.find((u) => u.username === clean || u.mobile === clean) || null;
}

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
  fullName: () => `${profile.first_name || profile.firstName || ''} ${profile.last_name || profile.lastName || ''}`.trim(),

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
    } catch (e) {
      if (e?.status === 401) {
        this.logout();
      }
      /* If backend is unavailable (e.g. static hosting on Vercel), keep local profile */
    }
  },

  async fetchAddresses() {
    if (!loggedIn) return;
    try {
      const data = await fetchApi('/auth/addresses/');
      addresses = (data.results ?? data ?? []).map(normalizeAddress);
      persist();
    } catch (e) {
      /* If backend is unavailable, keep local addresses */
    }
  },

  async updateProfile(partial) {
    profile = { ...profile, ...partial };
    if (partial.firstName) profile.first_name = partial.firstName;
    if (partial.lastName) profile.last_name = partial.lastName;
    persist();
    try {
      const data = await fetchApi('/auth/me/', {
        method: 'PATCH',
        body: JSON.stringify({
          first_name: partial.firstName ?? undefined,
          last_name: partial.lastName ?? undefined,
          email: partial.email ?? undefined,
        }),
      });
      profile = {
        ...profile,
        ...data,
        firstName: data.first_name,
        lastName: data.last_name,
      };
      persist();
    } catch (e) {
      if (e?.status === 401) this.logout();
      if (!isBackendUnavailable(e)) throw e;
    }
    return profile;
  },

  async login(identifier, password) {
    const cleanIdent = String(identifier ?? '').trim();
    try {
      const data = await fetchApi('/auth/login/', {
        method: 'POST',
        body: JSON.stringify({ username: cleanIdent, password }),
      });
      localStorage.setItem('mod-style:token', data.access);
      localStorage.setItem('mod-style:refresh', data.refresh);
      if (data.user) {
        profile = {
          ...profile,
          ...data.user,
          firstName: data.user.first_name,
          lastName: data.user.last_name,
        };
      }
      loggedIn = true;
      persist();

      await this.fetchMe();
      await this.fetchAddresses();
      bus.emit('auth:login', profile);
      return profile;
    } catch (e) {
      if (isBackendUnavailable(e)) {
        return this.loginOffline(cleanIdent, password);
      }
      throw e;
    }
  },

  async register(payload) {
    try {
      await fetchApi('/auth/register/', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      await this.login(payload.username, payload.password);
    } catch (e) {
      if (isBackendUnavailable(e)) {
        return this.registerOffline(payload);
      }
      throw e;
    }
  },

  /* Local offline registration when backend is not connected (e.g. Vercel) */
  registerOffline(payload) {
    const userRecord = {
      username: payload.username,
      mobile: payload.mobile,
      firstName: payload.first_name,
      lastName: payload.last_name,
      first_name: payload.first_name,
      last_name: payload.last_name,
      password: payload.password,
    };
    saveLocalUser(userRecord);

    profile = {
      username: userRecord.username,
      mobile: userRecord.mobile,
      first_name: userRecord.first_name,
      last_name: userRecord.last_name,
      firstName: userRecord.firstName,
      lastName: userRecord.lastName,
    };
    loggedIn = true;
    persist();
    bus.emit('auth:login', profile);
    return profile;
  },

  /* Local offline login when backend is not connected (e.g. Vercel) */
  loginOffline(identifier, password) {
    const matched = findLocalUser(identifier);
    if (matched) {
      if (matched.password && password && matched.password !== password) {
        throw new Error('رمز عبور وارد شده اشتباه است.');
      }
      profile = {
        username: matched.username,
        mobile: matched.mobile,
        first_name: matched.firstName || matched.first_name,
        last_name: matched.lastName || matched.last_name,
        firstName: matched.firstName || matched.first_name,
        lastName: matched.lastName || matched.last_name,
      };
    } else {
      const isMobile = /^09\d{9}$/.test(identifier);
      profile = {
        username: identifier || 'demo',
        mobile: isMobile ? identifier : '09120000000',
        first_name: isMobile ? 'کاربر' : 'کاربر',
        last_name: isMobile ? 'گرامی' : 'دمو',
        firstName: isMobile ? 'کاربر' : 'کاربر',
        lastName: isMobile ? 'گرامی' : 'دمو',
      };
    }
    loggedIn = true;
    persist();
    bus.emit('auth:login', profile);
    return profile;
  },

  /* Fallback demo login */
  loginDemo() {
    return this.loginOffline('demo', '');
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
    const isNew = !addr.id || typeof addr.id !== 'number';
    const localId = isNew
      ? (addresses.length ? Math.max(...addresses.map((a) => Number(a.id) || 0)) + 1 : 1)
      : addr.id;

    const localAddr = normalizeAddress({
      ...addr,
      id: localId,
      first_name: addr.receiver?.split(' ')?.[0] || '',
      last_name: addr.receiver?.split(' ')?.[1] || '',
    });

    const payload = {
      title: addr.title,
      province: addr.province,
      city: addr.city,
      line: addr.line,
      postal_code: addr.postalCode,
      receiver: addr.receiver,
      phone: addr.phone,
      is_default: addr.isDefault || false,
    };

    try {
      let saved;
      if (!isNew) {
        saved = await fetchApi(`/auth/addresses/${addr.id}/`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        saved = await fetchApi(`/auth/addresses/`, {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      await this.fetchAddresses();
      return saved ? normalizeAddress(saved) : saved;
    } catch (e) {
      if (isBackendUnavailable(e)) {
        if (localAddr.isDefault) {
          addresses.forEach((a) => (a.isDefault = false));
        }
        const existingIdx = addresses.findIndex((a) => a.id === localId);
        if (existingIdx >= 0) {
          addresses[existingIdx] = localAddr;
        } else {
          addresses.push(localAddr);
        }
        persist();
        return localAddr;
      }
      throw e;
    }
  },

  async removeAddress(id) {
    try {
      if (typeof id === 'number') {
        await fetchApi(`/auth/addresses/${id}/`, { method: 'DELETE' });
      }
      await this.fetchAddresses();
    } catch (e) {
      if (isBackendUnavailable(e)) {
        addresses = addresses.filter((a) => a.id !== id);
        persist();
        return;
      }
      throw e;
    }
  },
};

// Initial fetch if logged in
if (loggedIn) {
  userState.fetchMe();
  userState.fetchAddresses();
}
