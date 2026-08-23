import axios from 'axios';
import { clearSession, getToken } from './auth';
export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'https://macedofarias-backend.onrender.com' });
api.interceptors.request.use(config => { const token = getToken(); if (token) config.headers.Authorization = `Bearer ${token}`; return config; });
api.interceptors.response.use(r => r, error => { if ([401, 403].includes(error.response?.status)) { clearSession(); window.dispatchEvent(new Event('auth-expired')); } return Promise.reject(error); });
export const messageFromError = (error: unknown, fallback: string) => { if (axios.isAxiosError(error)) { const status = error.response?.status; if (status === 404) return 'Não encontramos este produto.'; if (status === 401) return 'Sua sessão expirou. Entre novamente.'; if (status === 403) return 'Você não tem permissão para esta ação.'; return error.response?.data?.message || fallback; } return fallback; };
