// src/hooks/useAuth.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { setAccessToken, clearAccessToken } from '../utils/apiClient.js';

const AuthContext = createContext(null);

// Use env var in production, empty string in dev (Vite proxy handles it)
const BASE = import.meta.env.VITE_API_BASE || '';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    restoreSession();
    const onExpired = () => { setUser(null); clearAccessToken(); };
    window.addEventListener('auth:sessionExpired', onExpired);
    return () => window.removeEventListener('auth:sessionExpired', onExpired);
  }, []);

  async function restoreSession() {
    try {
      const res = await axios.post(`${BASE}/auth/refresh`, {}, { withCredentials: true });
      setAccessToken(res.data.access_token);
      const meRes = await axios.get(`${BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${res.data.access_token}` },
        withCredentials: true,
      });
      setUser(meRes.data.data);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  function setUserFromCallback(userData) {
    setUser(userData);
  }

  async function login() {
    const res = await axios.get(`${BASE}/auth/github?source=web`);
    window.location.href = res.data.url;
  }

  async function logout() {
    try {
      await axios.post(`${BASE}/auth/logout`, {}, { withCredentials: true });
    } catch { /* best-effort */ }
    clearAccessToken();
    setUser(null);
  }

  const isAdmin = useCallback(() => user?.role === 'admin', [user]);

  return (
    <AuthContext.Provider value={{ user, setUser, isLoading, login, logout, setUserFromCallback, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
