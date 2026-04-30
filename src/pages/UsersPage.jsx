// src/pages/UsersPage.jsx — Admin only
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import apiClient from '../utils/apiClient.js';

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiClient.get('/users')
      .then(res => setUsers(res.data.data))
      .catch(() => setError('Failed to load users'))
      .finally(() => setIsLoading(false));
  }, []);

  async function changeRole(userId, role) {
    try {
      await apiClient.patch(`/users/${userId}/role`, { role });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
    } catch (err) { alert(err.response?.data?.message || 'Failed to update role'); }
  }

  async function toggleActive(userId, is_active) {
    try {
      await apiClient.patch(`/users/${userId}/status`, { is_active });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: is_active ? 1 : 0 } : u));
    } catch (err) { alert(err.response?.data?.message || 'Failed to update status'); }
  }

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: 700 }}>User Management</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '4px' }}>{users.length} registered users</p>
        </div>
        <span style={{ background: 'rgba(255,77,77,0.1)', border: '1px solid var(--danger)', color: 'var(--danger)', fontFamily: 'var(--font-mono)', fontSize: '0.68rem', letterSpacing: '2px', padding: '4px 10px', borderRadius: '2px' }}>
          ADMIN ONLY
        </span>
      </div>

      {error && <div style={{ background: 'rgba(255,77,77,0.1)', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '10px 16px', borderRadius: '4px', marginBottom: '16px' }}>{error}</div>}

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', padding: '60px', color: 'var(--text-secondary)' }}>
          <div className="spinner" /><span>Loading users...</span>
        </div>
      ) : (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-border)', borderRadius: '8px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr>
                {['User', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontFamily: 'var(--font-mono)', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--text-secondary)', background: 'var(--bg-raised)', borderBottom: '1px solid var(--bg-border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--bg-border)' }}
                  onMouseOver={e => e.currentTarget.style.background = 'var(--bg-raised)'}
                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                  {/* User */}
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img src={u.avatar_url || `https://github.com/${u.username}.png?size=32`} alt={u.username} style={{ width: '30px', height: '30px', borderRadius: '50%', border: '1px solid var(--bg-border)' }} />
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>@{u.username}</div>
                        {u.id === currentUser?.id && <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--accent)', background: 'var(--accent-dim)', border: '1px solid var(--accent)', borderRadius: '2px', padding: '0 4px' }}>you</span>}
                      </div>
                    </div>
                  </td>
                  {/* Email */}
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{u.email || '—'}</td>
                  {/* Role badge */}
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '1px', padding: '2px 8px', borderRadius: '2px', color: u.role === 'admin' ? 'var(--danger)' : 'var(--info)', background: u.role === 'admin' ? 'rgba(255,77,77,0.1)' : 'rgba(96,165,250,0.1)', border: `1px solid ${u.role === 'admin' ? 'rgba(255,77,77,0.3)' : 'rgba(96,165,250,0.3)'}` }}>
                      {u.role}
                    </span>
                  </td>
                  {/* Status */}
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: '0.78rem', color: u.is_active ? 'var(--success)' : 'var(--danger)' }}>
                      {u.is_active ? '✓ Active' : '✗ Inactive'}
                    </span>
                  </td>
                  {/* Joined */}
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  {/* Actions */}
                  <td style={{ padding: '12px 16px' }}>
                    {u.id === currentUser?.id ? (
                      <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>—</span>
                    ) : (
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <select
                          value={u.role}
                          onChange={e => changeRole(u.id, e.target.value)}
                          style={{ background: 'var(--bg-raised)', border: '1px solid var(--bg-border)', color: 'var(--text-primary)', borderRadius: '4px', padding: '4px 8px', fontSize: '0.78rem', fontFamily: 'var(--font-mono)', cursor: 'pointer' }}>
                          <option value="analyst">analyst</option>
                          <option value="admin">admin</option>
                        </select>
                        <button
                          onClick={() => toggleActive(u.id, !u.is_active)}
                          style={{ background: 'none', border: `1px solid ${u.is_active ? 'rgba(255,77,77,0.3)' : 'rgba(34,197,94,0.3)'}`, color: u.is_active ? 'var(--danger)' : 'var(--success)', borderRadius: '4px', padding: '4px 10px', fontSize: '0.75rem', cursor: 'pointer', transition: 'all 0.15s' }}>
                          {u.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
