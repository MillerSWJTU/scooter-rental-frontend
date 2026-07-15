// API configuration
export const API_BASE_URL = 'http://localhost:8080/api';

// Authentication configuration
export const AUTH_CONFIG = {
  TOKEN_KEY: 'auth_token',
  REFRESH_TOKEN_KEY: 'refresh_token',
  TOKEN_TYPE: 'Bearer'
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error, please check your connection and try again.',
  SERVER_ERROR: 'Server error, please try again later.',
  NOT_FOUND: 'Requested resource not found.',
  UNAUTHORIZED: 'Please log in first.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  BAD_REQUEST: 'Invalid request parameters, please check your input.',
  UNKNOWN_ERROR: 'An unknown error occurred, please try again later.',
  SESSION_EXPIRED: 'Session expired, please log in again.',
  TOKEN_REFRESH_FAILED: 'Failed to refresh login status, please log in again.'
};

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh-token',
    VALIDATE: '/auth/validate'
  },
  SCOOTERS: {
    LIST: '/scooters',
    DETAIL: (id) => `/scooters/${id}`,
  },
  RENTALS: {
    CREATE: '/rentals',
    DETAIL: (id) => `/rentals/${id}`,
  },
  USER: {
    RENTALS: (username) => `/rentals/user/${username}`,
  },
  PAYMENTS: {
    RENTAL: (rentalId) => `/payments/rental/${rentalId}`,
    DETAIL: (id) => `/payments/${id}`,
    BY_RENTAL: (rentalId) => `/payments/rental/${rentalId}`,
    UPDATE_STATUS: (id) => `/payments/${id}/status`,
    SIMULATE: (id) => `/payments/${id}/simulate`,
  }
};
