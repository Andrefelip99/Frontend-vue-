import axios from 'axios';
import { clearSession, getToken } from './auth';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://macedofarias-backend.onrender.com',
  timeout: 15000
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use((response) => response, (error) => {
  if ([401, 403].includes(error.response?.status)) {
    clearSession();
    window.dispatchEvent(new Event('auth-expired'));
  }
  return Promise.reject(error);
});

export function messageFromError(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 404) return 'Produto nao encontrado.';
    if (error.response?.status === 401) return 'Sua sessao expirou. Entre novamente.';
    if (error.response?.status === 403) return 'Voce nao tem permissao para esta acao.';
    return error.response?.data?.message || fallback;
  }
  return fallback;
}
