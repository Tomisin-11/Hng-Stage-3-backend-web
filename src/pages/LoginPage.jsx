// src/pages/LoginPage.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';

export default function LoginPage() {
  const { user, login, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && user) navigate('/dashboard', { replace: true });
  }, [user, isLoading, navigate]);

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--bg-base)', padding: '24px',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Ambient dot grid */}
      <div style={{
        position: 'fixed', inset: 0,
        backgroundImage: 'radial-gradient(circle, var(--bg-border) 1px, transparent 1px)',
        backgroundSize: '32px 32px', opacity: 0.35, pointerEvents: 'none',
      }} />

      {/* Amber glow */}
      <div style={{
        position: 'fixed', top: '40%', left: '50%', transform: 'translate(-50%,-50%)',
        width: '500px', height: '350px', pointerEvents: 'none',
        background: 'radial-gradient(ellipse, rgba(240,165,0,0.08) 0%, transparent 70%)',
      }} />

      {/* Card */}
      <div style={{
        position: 'relative', zIndex: 1, background: 'var(--bg-surface)',
        border: '1px solid var(--bg-border)', borderRadius: '12px',
        padding: '48px 40px', width: '100%', maxWidth: '400px',
        textAlign: 'center', animation: 'fadeIn 0.4s ease',
      }}>
        {/* Logo */}
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: 700, marginBottom: '12px' }}>
          <span style={{ color: 'var(--accent)' }}>[</span>
          IL+
          <span style={{ color: 'var(--accent)' }}>]</span>
        </div>

        <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', marginBottom: '8px' }}>
          Insighta Labs+
        </h1>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '32px' }}>
          Profile Intelligence Platform
        </p>

        <div style={{ height: '1px', background: 'var(--bg-border)', margin: '0 0 24px' }} />

        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '32px' }}>
          Secure access via GitHub OAuth 2.0 with PKCE.
          Sessions protected by short-lived tokens and HTTP-only cookies.
        </p>

        <button
          onClick={login}
          disabled={isLoading}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '10px', width: '100%', padding: '12px 20px',
            background: 'var(--accent)', color: '#0a0a0f', fontWeight: 700,
            fontSize: '0.95rem', border: 'none', borderRadius: '4px',
            cursor: 'pointer', transition: 'all 0.15s ease',
            fontFamily: 'var(--font-sans)',
          }}
          onMouseOver={e => e.currentTarget.style.background = 'var(--accent-hover)'}
          onMouseOut={e => e.currentTarget.style.background = 'var(--accent)'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          Continue with GitHub
        </button>

        <p style={{ marginTop: '16px', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
          Only authorised GitHub accounts can access this platform.
        </p>
      </div>
    </div>
  );
}
