// API configuration
export const API_BASE_URL = 'http://localhost:8080/api';

// Authentication configuration
export const AUTH_CONFIG = {
  TOKEN_KEY: 'auth_token',
  REFRESH_TOKEN_KEY: 'refresh_token',
  TOKEN_TYPE: 'Bearer'
};

// Other configuration constants can be added here
export const APP_VERSION = '2.0.0';
export const APP_NAME = 'ScooterRent';

// Feature flags
export const FEATURES = {
  ENABLE_MAPS: true,
  ENABLE_NOTIFICATIONS: true,
  ENABLE_DARK_MODE: false
};

// Rental configuration
export const RENTAL_CONFIG = {
  MAX_RENTAL_DURATION: {
    HOURLY: 8,
    DAILY: 7,
    WEEKLY: 4
  },
  DEFAULT_RENTAL_PLAN: 'hourly'
};

// Map configuration
export const MAP_CONFIG = {
  DEFAULT_CENTER: {
    lat: 39.9042,
    lng: 116.4074
  },
  DEFAULT_ZOOM: 13,
  CLUSTER_THRESHOLD: 10
};

// Cache configuration
export const CACHE_CONFIG = {
  SCOOTER_LIST_TTL: 5 * 60 * 1000, // 5 minutes
  USER_PROFILE_TTL: 30 * 60 * 1000 // 30 minutes
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
    ALL: '/scooters/all',
    DETAIL: (id) => `/scooters/${id}`,
    STATUS: (id) => `/scooters/${id}/status`,
    ISSUES: (id) => `/scooters/${id}/issues`
  },
  RENTALS: {
    CREATE: '/rentals',
    LIST: '/rentals',
    DETAIL: (id) => `/rentals/${id}`,
    CURRENT: '/rentals/current',
    HISTORY: '/rentals/history',
    CALCULATE_COST: '/rentals/calculate-cost'
  },
  USER: {
    PROFILE: '/users/profile',
    RENTALS: (username) => `/rentals/user/${username}`,
    PREFERENCES: '/users/preferences'
  },
  PAYMENTS: {
    RENTAL: (rentalId) => `/payments/rental/${rentalId}`,
    DETAIL: (id) => `/payments/${id}`,
    BY_RENTAL: (rentalId) => `/payments/rental/${rentalId}`,
    UPDATE_STATUS: (id) => `/payments/${id}/status`,
    SIMULATE: (id) => `/payments/${id}/simulate`,
    CALLBACK: '/payments/callback'
  }
}; 