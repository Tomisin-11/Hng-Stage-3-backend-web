// src/pages/CallbackPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { setAccessToken } from '../utils/apiClient.js';
import { useAuth } from '../hooks/useAuth.jsx';

const BASE = import.meta.env.VITE_API_BASE || '';

export default function CallbackPage() {
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const { setUserFromCallback } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = searchParams.get('access_token');
    const oauthError = searchParams.get('error');

    if (oauthError) { setError(`GitHub denied access: ${oauthError}`); return; }
    if (!accessToken) { setError('No access token received'); return; }

    setAccessToken(accessToken);
    window.history.replaceState({}, document.title, '/auth/callback');

    axios.get(`${BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      withCredentials: true,
    })
      .then(res => {
        setUserFromCallback(res.data.data);
        navigate('/dashboard', { replace: true });
      })
      .catch(err => setError(err.response?.data?.message || err.message));
  }, []);

  if (error) return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', height: '100vh', gap: '16px', background: 'var(--bg-base)',
    }}>
      <p style={{ color: 'var(--danger)', fontFamily: 'var(--font-mono)' }}>Authentication failed</p>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{error}</p>
      <a href="/login" style={{ color: 'var(--accent)' }}>← Back to login</a>
    </div>
  );

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', gap: '12px', color: 'var(--text-secondary)', background: 'var(--bg-base)',
    }}>
      <div className="spinner" />
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
        Completing authentication...
      </span>
    </div>
  );
}
