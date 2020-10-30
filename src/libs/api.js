import axios from 'axios';
import { getToken } from './auth';

axios.interceptors.request.use(
  config => {
    const prefix = window.blocklet ? window.blocklet.prefix : window.env.apiPrefix;
    config.baseURL = prefix || '';
    config.timeout = 200000;

    const token = getToken();
    if (token) {
      config.headers.authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

export default axios;
