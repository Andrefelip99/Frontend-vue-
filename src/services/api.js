import axios from 'axios';
import { getAuthToken } from './user';

const api = axios.create({
  baseURL: process.env.VUE_APP_API_URL || '/api/v1'
});

api.interceptors.request.use(config => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
