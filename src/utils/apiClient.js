// src/utils/apiClient.js
//
// Axios instance for the web portal.
//
// KEY POINTS:
//   1. X-API-Version: 1 header attached to all requests (TRD requirement)
//   2. Authorization: Bearer <token> — token stored IN MEMORY (not localStorage)
//   3. withCredentials: true — browser sends HTTP-only refresh_token cookie
//   4. On 401: calls /auth/refresh (cookie sent automatically) → retries
//
// WHY NOT localStorage FOR THE ACCESS TOKEN?
//   localStorage is readable by any JS on the page.
//   XSS attack → attacker reads your token → impersonates you.
//   In-memory storage: lives only for the page session, not accessible by
//   scripts (they would need to hook into our module closure).

import axios from 'axios';

// In-memory token store (not localStorage, not sessionStorage)
let _accessToken = null;

export function setAccessToken(token) { _accessToken = token; }
export function getAccessToken() { return _accessToken; }
export function clearAccessToken() { _accessToken = null; }

const apiClient = axios.create({
  baseURL: '/api',          // proxied by Vite to backend /api
  withCredentials: true,    // send cookies (refresh_token HTTP-only cookie)
  headers: {
    'Content-Type': 'application/json',
    'X-API-Version': '1',  // TRD: required on all /api/* endpoints
  },
});

// ── REQUEST: attach Bearer token ──
apiClient.interceptors.request.use((config) => {
  if (_accessToken) {
    config.headers['Authorization'] = `Bearer ${_accessToken}`;
  }
  return config;
});

// ── RESPONSE: auto-refresh on 401 ──
let isRefreshing = false;
let queue = []; // requests waiting for new token

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retried) {
      original._retried = true;

      if (isRefreshing) {
        // Queue this request until refresh completes
        return new Promise((resolve) => {
          queue.push((newToken) => {
            original.headers['Authorization'] = `Bearer ${newToken}`;
            resolve(apiClient(original));
          });
        });
      }

      isRefreshing = true;
      try {
        // Browser auto-sends the HTTP-only cookie
        const res = await axios.post('/auth/refresh', {}, { withCredentials: true });
        const newToken = res.data.access_token;
        setAccessToken(newToken);

        // Flush queued requests
        queue.forEach(cb => cb(newToken));
        queue = [];
        isRefreshing = false;

        original.headers['Authorization'] = `Bearer ${newToken}`;
        return apiClient(original);
      } catch {
        isRefreshing = false;
        queue = [];
        clearAccessToken();
        // Dispatch event so AuthContext can react (clear user, redirect to login)
        window.dispatchEvent(new CustomEvent('auth:sessionExpired'));
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
