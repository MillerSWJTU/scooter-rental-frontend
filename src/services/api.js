import axios from 'axios';
import { API_BASE_URL, AUTH_CONFIG, ERROR_MESSAGES } from '../config';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 标记是否正在刷新token
let isRefreshing = false;
// 等待token刷新的请求队列
let refreshSubscribers = [];

// 将请求添加到等待队列
const subscribeTokenRefresh = (cb) => refreshSubscribers.push(cb);

// 执行等待队列中的请求
const onRefreshed = (token) => {
  refreshSubscribers.map(cb => cb(token));
  refreshSubscribers = [];
};

// 检查token是否即将过期
const isTokenExpiringSoon = (token) => {
  if (!token) return false;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => 
      '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join(''));
    const { exp } = JSON.parse(jsonPayload);
    // 如果token将在5分钟内过期，返回true
    return Date.now() >= (exp * 1000 - 5 * 60 * 1000);
  } catch (e) {
    console.error('Error checking token expiration:', e);
    return false;
  }
};

// 刷新token的函数
const refreshTokenRequest = async () => {
  try {
    const refreshToken = localStorage.getItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);
    if (!refreshToken) throw new Error('No refresh token available');

    const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
      refreshToken
    });

    const { token } = response.data;
    localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, token);
    return token;
  } catch (error) {
    console.error('Token refresh failed:', error);
    throw error;
  }
};

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
    
    // 如果有token且即将过期，尝试刷新
    if (token && isTokenExpiringSoon(token) && !config.url.includes('/auth/refresh-token')) {
      try {
        if (!isRefreshing) {
          isRefreshing = true;
          const newToken = await refreshTokenRequest();
          isRefreshing = false;
          onRefreshed(newToken);
          config.headers.Authorization = `${AUTH_CONFIG.TOKEN_TYPE} ${newToken}`;
        } else {
          // 等待其他请求刷新token
          return new Promise((resolve) => {
            subscribeTokenRefresh((token) => {
              config.headers.Authorization = `${AUTH_CONFIG.TOKEN_TYPE} ${token}`;
              resolve(config);
            });
          });
        }
      } catch (error) {
        console.error('Token refresh failed in request interceptor:', error);
        // 继续使用旧token，让响应拦截器处理可能的401错误
      }
    } else if (token) {
      config.headers.Authorization = `${AUTH_CONFIG.TOKEN_TYPE} ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 处理特定错误情况
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error(ERROR_MESSAGES.NETWORK_ERROR));
    }

    // 处理401错误
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        if (!isRefreshing) {
          isRefreshing = true;
          const newToken = await refreshTokenRequest();
          isRefreshing = false;
          onRefreshed(newToken);
          
          // 使用新token重试原始请求
          originalRequest.headers.Authorization = `${AUTH_CONFIG.TOKEN_TYPE} ${newToken}`;
          return api(originalRequest);
        } else {
          // 等待其他请求刷新token
          return new Promise((resolve) => {
            subscribeTokenRefresh((token) => {
              originalRequest.headers.Authorization = `${AUTH_CONFIG.TOKEN_TYPE} ${token}`;
              resolve(api(originalRequest));
            });
          });
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // 清除认证信息
        localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
        localStorage.removeItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);
        localStorage.removeItem('user');
        
        // 保存当前路径用于登录后重定向
        if (window.location.pathname !== '/login') {
          sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
        }
        
        // 重定向到登录页面
        window.location.href = '/login';
        return Promise.reject(new Error(ERROR_MESSAGES.SESSION_EXPIRED));
      }
    }

    // 处理400错误
    if (error.response?.status === 400) {
      const errorMessage = error.response.data?.message || ERROR_MESSAGES.BAD_REQUEST;
      console.error('Bad Request:', errorMessage);
      return Promise.reject(new Error(errorMessage));
    }

    // 处理403错误
    if (error.response?.status === 403) {
      console.error('Access Denied:', error.response.data?.message || ERROR_MESSAGES.FORBIDDEN);
      return Promise.reject(new Error(ERROR_MESSAGES.FORBIDDEN));
    }

    // 处理其他错误
    if (error.response) {
      switch (error.response.status) {
        case 404:
          return Promise.reject(new Error(ERROR_MESSAGES.NOT_FOUND));
        case 500:
          return Promise.reject(new Error(ERROR_MESSAGES.SERVER_ERROR));
        default:
          return Promise.reject(new Error(error.response.data?.message || ERROR_MESSAGES.UNKNOWN_ERROR));
      }
    }

    return Promise.reject(error);
  }
);

// 初始化时恢复token
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

export const setRefreshToken = (token) => {
  if (token) {
    localStorage.setItem(AUTH_CONFIG.REFRESH_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);
  }
};

export default api;