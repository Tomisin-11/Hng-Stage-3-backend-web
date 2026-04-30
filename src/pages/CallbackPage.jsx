// src/pages/CallbackPage.jsx
//
// Handles the OAuth redirect from the backend.
//
// FLOW:
//   1. Backend sets refresh_token as HTTP-only cookie
//   2. Backend redirects browser to /auth/callback?access_token=X&expires_in=180
//   3. This page reads the access_token from the URL
//   4. Stores it in memory (setAccessToken)
//   5. Fetches /auth/me to get the full user object
//   6. Strips the token from the URL bar (security hygiene)
//   7. Redirects to /dashboard

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { setAccessToken } from '../utils/apiClient.js';
import { useAuth } from '../hooks/useAuth.jsx';

export default function CallbackPage() {
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const { setUserFromCallback } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = searchParams.get('access_token');
    const oauthError = searchParams.get('error');

    if (oauthError) {
      setError(`GitHub denied access: ${oauthError}`);
      return;
    }

    if (!accessToken) {
      setError('No access token received');
      return;
    }

    // 1. Store access token in memory
    setAccessToken(accessToken);

    // 2. Strip token from URL immediately (don't leave it in browser history)
    window.history.replaceState({}, document.title, '/auth/callback');

    // 3. Fetch user profile
    axios.get('/auth/me', {
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
