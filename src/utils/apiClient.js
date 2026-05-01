// src/utils/apiClient.js
//
// In development: Vite proxy forwards /api and /auth to localhost:4000
// In production:  VITE_API_BASE points to the deployed Render backend URL

import axios from 'axios';

// Use env var in production, empty string in dev (proxy handles it)
const BASE = import.meta.env.VITE_API_BASE || '';

let _accessToken = null;
export function setAccessToken(token) { _accessToken = token; }
export function getAccessToken() { return _accessToken; }
export function clearAccessToken() { _accessToken = null; }

const apiClient = axios.create({
  baseURL: `${BASE}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'X-API-Version': '1',
  },
});

// Attach Bearer token
apiClient.interceptors.request.use((config) => {
  if (_accessToken) {
    config.headers['Authorization'] = `Bearer ${_accessToken}`;
  }
  return config;
});

// Auto-refresh on 401
let isRefreshing = false;
let queue = [];

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retried) {
      original._retried = true;

      if (isRefreshing) {
        return new Promise((resolve) => {
          queue.push((newToken) => {
            original.headers['Authorization'] = `Bearer ${newToken}`;
            resolve(apiClient(original));
          });
        });
      }

      isRefreshing = true;
      try {
        const res = await axios.post(`${BASE}/auth/refresh`, {}, { withCredentials: true });
        const newToken = res.data.access_token;
        setAccessToken(newToken);
        queue.forEach(cb => cb(newToken));
        queue = [];
        isRefreshing = false;
        original.headers['Authorization'] = `Bearer ${newToken}`;
        return apiClient(original);
      } catch {
        isRefreshing = false;
        queue = [];
        clearAccessToken();
        window.dispatchEvent(new CustomEvent('auth:sessionExpired'));
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;