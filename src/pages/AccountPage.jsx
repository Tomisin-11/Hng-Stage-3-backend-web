// src/pages/AccountPage.jsx
// TRD Required Page: Account / user profile view.
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';

export default function AccountPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  const field = (label, value, mono = false) => (
    <div style={{ padding: '14px 24px', borderBottom: '1px solid var(--bg-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{ color: 'var(--text-primary)', fontFamily: mono ? 'var(--font-mono)' : 'var(--font-sans)', fontSize: '0.875rem' }}>{value ?? '—'}</span>
    </div>
  );

  return (
    <div style={{ animation: 'fadeIn 0.3s ease', maxWidth: '600px' }}>
      <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: 700, marginBottom: '28px' }}>Account</h1>

      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-border)', borderRadius: '12px', overflow: 'hidden', marginBottom: '24px' }}>
        {/* Avatar + name header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '24px', background: 'var(--bg-raised)', borderBottom: '1px solid var(--bg-border)' }}>
          <img
            src={user?.avatar_url || `https://github.com/${user?.username}.png?size=80`}
            alt={user?.username}
            style={{ width: '56px', height: '56px', borderRadius: '50%', border: '2px solid var(--bg-border)' }}
          />
          <div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 700 }}>@{user?.username}</p>
            <span style={{
              display: 'inline-block', marginTop: '4px', padding: '2px 10px',
              background: user?.role === 'admin' ? 'rgba(255,77,77,0.1)' : 'rgba(96,165,250,0.1)',
              border: `1px solid ${user?.role === 'admin' ? 'var(--danger)' : 'var(--info)'}`,
              borderRadius: '2px', fontSize: '0.7rem', fontFamily: 'var(--font-mono)',
              textTransform: 'uppercase', letterSpacing: '1px',
              color: user?.role === 'admin' ? 'var(--danger)' : 'var(--info)',
            }}>
              {user?.role}
            </span>
          </div>
        </div>

        {field('Username', user?.username, true)}
        {field('Email', user?.email || 'Hidden by GitHub')}
        {field('Role', user?.role)}
        {field('Status', user?.is_active ? '✓ Active' : '✗ Deactivated')}
        {field('Member since', user?.created_at ? new Date(user.created_at).toLocaleDateString() : null)}
        {field('Last login', user?.last_login_at ? new Date(user.last_login_at).toLocaleString() : null)}
      </div>

      {/* Session info */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-border)', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
        <p style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
          Session Info
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            ['Access Token', '3-minute expiry, auto-refreshed', 'var(--info)'],
            ['Refresh Token', '5-minute expiry, HTTP-only cookie', 'var(--accent)'],
            ['CSRF Protection', 'SameSite=Strict cookie policy', 'var(--success)'],
          ].map(([label, desc, color]) => (
            <div key={label} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, marginTop: '5px', flexShrink: 0 }} />
              <div>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>{label}</span>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginLeft: '8px' }}>{desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Logout button */}
      <button onClick={handleLogout} style={{ padding: '10px 24px', background: 'none', border: '1px solid var(--danger)', color: 'var(--danger)', borderRadius: '4px', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}
        onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,77,77,0.1)'; }}
        onMouseOut={e => { e.currentTarget.style.background = 'none'; }}>
        Log out
      </button>
    </div>
  );
}
