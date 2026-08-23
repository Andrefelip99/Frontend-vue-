import { api } from './api';
const KEY = 'mf_auth_token';
export const getToken = () => localStorage.getItem(KEY);
export const clearSession = () => localStorage.removeItem(KEY);
export async function login(email: string, password: string) { const { data } = await api.post<{ token: string }>('/auth/login', { email, password }); if (!data.token) throw new Error('Token não recebido.'); localStorage.setItem(KEY, data.token); return data.token; }
