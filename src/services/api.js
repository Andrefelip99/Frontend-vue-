import axios from 'axios';
import { getAuthToken } from './user';

const RENDER_BACKEND_FALLBACK = 'https://macedofarias-backend.onrender.com/api/v1';
const runtimeApiUrl =
  typeof window !== 'undefined' && window.__API_URL__ ? window.__API_URL__ : null;
const baseURL = runtimeApiUrl || process.env.VUE_APP_API_URL || RENDER_BACKEND_FALLBACK;

const api = axios.create({
  baseURL
});

api.interceptors.request.use(config => {
  const token = getAuthToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
