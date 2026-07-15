import axios from 'axios';
import { API_BASE_URL, AUTH_CONFIG, ERROR_MESSAGES } from '../config';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor — 附加 Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `${AUTH_CONFIG.TOKEN_TYPE} ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — 401 退登
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error(ERROR_MESSAGES.NETWORK_ERROR));
    }

    if (error.response?.status === 401) {
      localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
      }
      window.location.href = '/login';
      return Promise.reject(new Error(ERROR_MESSAGES.SESSION_EXPIRED));
    }

    if (error.response?.status === 400) {
      return Promise.reject(new Error(error.response.data?.message || ERROR_MESSAGES.BAD_REQUEST));
    }

    if (error.response?.status === 403) {
      return Promise.reject(new Error(ERROR_MESSAGES.FORBIDDEN));
    }

    if (error.response) {
      switch (error.response.status) {
        case 404: return Promise.reject(new Error(ERROR_MESSAGES.NOT_FOUND));
        case 500: return Promise.reject(new Error(ERROR_MESSAGES.SERVER_ERROR));
        default:  return Promise.reject(new Error(error.response.data?.message || ERROR_MESSAGES.UNKNOWN_ERROR));
      }
    }

    return Promise.reject(error);
  }
);

// 初始化时恢复 token
const token = localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
if (token) {
  api.defaults.headers.common['Authorization'] = `${AUTH_CONFIG.TOKEN_TYPE} ${token}`;
}

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, token);
    api.defaults.headers.common['Authorization'] = `${AUTH_CONFIG.TOKEN_TYPE} ${token}`;
  } else {
    localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
    delete api.defaults.headers.common['Authorization'];
  }
};

export default api;
