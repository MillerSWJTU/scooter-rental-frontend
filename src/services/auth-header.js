import { AUTH_CONFIG } from '../config';

export default function authHeader() {
  const token = localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);

  if (token) {
    return { Authorization: `${AUTH_CONFIG.TOKEN_TYPE} ${token}` };
  } else {
    return {};
  }
} 