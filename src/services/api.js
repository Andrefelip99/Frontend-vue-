import axios from 'axios';
import { getAuthBasic } from './user';

const api = axios.create({
  baseURL: process.env.VUE_APP_API_URL || '/api/v1'
});

api.interceptors.request.use(config => {
  const auth = getAuthBasic();
  if (auth) {
    config.headers.Authorization = `Basic ${auth}`;
  }
  return config;
});

export default api;
