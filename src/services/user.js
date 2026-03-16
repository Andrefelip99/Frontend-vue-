const USER_KEY = 'user';
const AUTH_KEY = 'auth_basic';

export function getUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function setUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('user-updated'));
  }
}

export function clearUser() {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(AUTH_KEY);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('user-updated'));
  }
}

export function setAuthBasic(value) {
  localStorage.setItem(AUTH_KEY, value);
}

export function getAuthBasic() {
  return localStorage.getItem(AUTH_KEY);
}
