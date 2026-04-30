// src/components/Layout.jsx
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: '▦' },
  { to: '/profiles',  label: 'Profiles',  icon: '◈' },
  { to: '/search',    label: 'Search',    icon: '⌕' },
  { to: '/account',   label: 'Account',   icon: '◉' },
];

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* ── Sidebar ── */}
      <aside style={{
        width: '220px', flexShrink: 0, background: 'var(--bg-surface)',
        borderRight: '1px solid var(--bg-border)', display: 'flex',
        flexDirection: 'column', padding: '24px 0', position: 'sticky',
        top: 0, height: '100vh',
      }}>
        {/* Logo */}
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 700,
          letterSpacing: '2px', padding: '0 20px', marginBottom: '32px',
        }}>
          <span style={{ color: 'var(--accent)' }}>[</span>
          IL+
          <span style={{ color: 'var(--accent)' }}>]</span>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px', padding: '0 12px' }}>
          {NAV.map(({ to, label, icon }) => (
            <NavLink key={to} to={to} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '8px 12px', borderRadius: '4px', textDecoration: 'none',
              fontSize: '0.9rem', fontWeight: 500, border: '1px solid transparent',
              color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
              background: isActive ? 'var(--accent-dim)' : 'transparent',
              borderColor: isActive ? 'var(--accent)' : 'transparent',
              transition: 'all 0.15s ease',
            })}>
              <span style={{ fontSize: '0.85rem', width: '16px', textAlign: 'center' }}>{icon}</span>
              {label}
            </NavLink>
          ))}

          {/* Admin-only Users link */}
          {isAdmin() && (
            <NavLink to="/users" style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '8px 12px', borderRadius: '4px', textDecoration: 'none',
              fontSize: '0.9rem', fontWeight: 500, border: '1px solid transparent',
              color: isActive ? 'var(--danger)' : 'var(--text-secondary)',
              background: isActive ? 'rgba(255,77,77,0.1)' : 'transparent',
              borderColor: isActive ? 'var(--danger)' : 'transparent',
              transition: 'all 0.15s ease',
            })}>
              <span style={{ fontSize: '0.85rem', width: '16px', textAlign: 'center' }}>⚙</span>
              Users
            </NavLink>
          )}
        </nav>

        {/* User section */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          margin: '0 12px', padding: '10px 12px',
          background: 'var(--bg-raised)', borderRadius: '4px',
          border: '1px solid var(--bg-border)',
        }}>
          <img
            src={user?.avatar_url || `https://github.com/${user?.username}.png?size=32`}
            alt={user?.username}
            style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid var(--bg-border)' }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.username}
            </div>
            <div style={{
              fontSize: '0.7rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase',
              letterSpacing: '1px', color: user?.role === 'admin' ? 'var(--danger)' : 'var(--info)',
            }}>
              {user?.role}
            </div>
          </div>
          <button onClick={handleLogout} title="Logout" style={{
            background: 'none', border: 'none', color: 'var(--text-dim)',
            cursor: 'pointer', fontSize: '1rem', padding: '2px',
          }}>⏻</button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '40px 48px', maxWidth: '1200px' }}>
        <Outlet />
      </main>
    </div>
  );
}
