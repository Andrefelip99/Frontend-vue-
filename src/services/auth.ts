import { api } from './api';

const TOKEN_KEY = 'macedo-farias-auth-token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
  window.dispatchEvent(new Event('auth-changed'));
};
export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  window.dispatchEvent(new Event('auth-changed'));
};

export async function login(email: string, password: string) {
  const { data } = await api.post<{ token: string }>('/auth/login', { email, password });
  if (!data.token) throw new Error('Token nao recebido.');
  setToken(data.token);
}
