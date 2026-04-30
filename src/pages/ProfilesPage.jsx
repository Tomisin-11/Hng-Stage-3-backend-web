// src/pages/ProfilesPage.jsx
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import apiClient from '../utils/apiClient.js';
import axios from 'axios';

export default function ProfilesPage() {
  const { isAdmin, user } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [filters, setFilters] = useState({ gender: '', country_id: '', age_group: '', min_age: '', max_age: '' });
  const [sortBy, setSortBy] = useState('created_at');
  const [order, setOrder] = useState('desc');
  const [page, setPage] = useState(1);

  // Create form (admin)
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const fetchProfiles = useCallback(async () => {
    setIsLoading(true); setError(null);
    try {
      const params = { page, limit: 10, sort_by: sortBy, order };
      Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
      const res = await apiClient.get('/profiles', { params });
      setProfiles(res.data.data);
      setPagination(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load profiles');
    } finally {
      setIsLoading(false);
    }
  }, [page, sortBy, order, filters]);

  useEffect(() => { fetchProfiles(); }, [fetchProfiles]);
  useEffect(() => { setPage(1); }, [filters, sortBy, order]);

  async function handleExport() {
    try {
      const params = { format: 'csv' };
      Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
      const { getAccessToken } = await import('../utils/apiClient.js');
      const res = await axios.get('/api/profiles/export', {
        params,
        responseType: 'blob',
        headers: { 'X-API-Version': '1', Authorization: `Bearer ${getAccessToken()}` },
        withCredentials: true,
      });
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `profiles_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Export failed: ' + (err.response?.data?.message || err.message));
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    setIsCreating(true);
    try {
      await apiClient.post('/profiles', { name: newName.trim() });
      setNewName(''); setShowCreate(false);
      fetchProfiles();
    } catch (err) {
      alert(err.response?.data?.message || 'Create failed');
    } finally {
      setIsCreating(false);
    }
  }

  const sortIcon = (col) => {
    if (sortBy !== col) return <span style={{ color: 'var(--text-dim)', marginLeft: '4px' }}>⇅</span>;
    return <span style={{ color: 'var(--accent)', marginLeft: '4px' }}>{order === 'asc' ? '↑' : '↓'}</span>;
  };

  const handleSort = (col) => {
    if (sortBy === col) setOrder(o => o === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setOrder('asc'); }
  };

  const input = (key, placeholder) => (
    <input
      value={filters[key]} placeholder={placeholder}
      onChange={e => setFilters(f => ({ ...f, [key]: e.target.value }))}
      style={{ padding: '6px 10px', fontSize: '0.8rem', background: 'var(--bg-raised)', border: '1px solid var(--bg-border)', borderRadius: '4px', color: 'var(--text-primary)', width: '100%' }}
    />
  );

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: 700 }}>Profiles</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
            {pagination ? `${pagination.total} total` : '...'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleExport} style={{ background: 'none', border: '1px solid var(--bg-border)', color: 'var(--text-secondary)', padding: '8px 16px', borderRadius: '4px', fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>
            ↓ Export CSV
          </button>
          {isAdmin() && (
            <button onClick={() => setShowCreate(s => !s)} style={{ background: 'var(--accent)', color: '#0a0a0f', border: 'none', padding: '8px 16px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}>
              + New Profile
            </button>
          )}
        </div>
      </div>

      {/* Create form (admin) */}
      {showCreate && (
        <form onSubmit={handleCreate} style={{ background: 'var(--bg-surface)', border: '1px solid var(--accent)', borderRadius: '8px', padding: '16px 20px', marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <input
            value={newName} onChange={e => setNewName(e.target.value)}
            placeholder="Enter a name (e.g. Harriet Tubman)"
            autoFocus
            style={{ flex: 1, padding: '8px 12px', background: 'var(--bg-raised)', border: '1px solid var(--bg-border)', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '0.9rem' }}
          />
          <button type="submit" disabled={isCreating} style={{ background: 'var(--accent)', color: '#0a0a0f', border: 'none', padding: '8px 20px', borderRadius: '4px', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem' }}>
            {isCreating ? 'Creating...' : 'Create'}
          </button>
          <button type="button" onClick={() => setShowCreate(false)} style={{ background: 'none', border: '1px solid var(--bg-border)', color: 'var(--text-secondary)', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.875rem' }}>
            Cancel
          </button>
        </form>
      )}

      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
        {/* Filters sidebar */}
        <aside style={{ width: '200px', flexShrink: 0, background: 'var(--bg-surface)', border: '1px solid var(--bg-border)', borderRadius: '8px', padding: '16px' }}>
          <p style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--text-secondary)', marginBottom: '16px' }}>FILTERS</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div><label style={{ fontSize: '0.73rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Gender</label>
              <select value={filters.gender} onChange={e => setFilters(f => ({ ...f, gender: e.target.value }))}
                style={{ width: '100%', padding: '6px 8px', fontSize: '0.8rem', background: 'var(--bg-raised)', border: '1px solid var(--bg-border)', borderRadius: '4px', color: 'var(--text-primary)' }}>
                <option value="">All</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div><label style={{ fontSize: '0.73rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Country</label>{input('country_id', 'e.g. NG, US')}</div>
            <div><label style={{ fontSize: '0.73rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Age Group</label>
              <select value={filters.age_group} onChange={e => setFilters(f => ({ ...f, age_group: e.target.value }))}
                style={{ width: '100%', padding: '6px 8px', fontSize: '0.8rem', background: 'var(--bg-raised)', border: '1px solid var(--bg-border)', borderRadius: '4px', color: 'var(--text-primary)' }}>
                <option value="">All</option>
                <option value="young-adult">Young Adult</option>
                <option value="adult">Adult</option>
                <option value="middle-aged">Middle Aged</option>
                <option value="senior">Senior</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <div style={{ flex: 1 }}><label style={{ fontSize: '0.73rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Min Age</label>{input('min_age', '18')}</div>
              <div style={{ flex: 1 }}><label style={{ fontSize: '0.73rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Max Age</label>{input('max_age', '65')}</div>
            </div>
          </div>
          {Object.values(filters).some(Boolean) && (
            <button onClick={() => setFilters({ gender: '', country_id: '', age_group: '', min_age: '', max_age: '' })}
              style={{ width: '100%', marginTop: '12px', background: 'none', border: '1px solid var(--bg-border)', color: 'var(--text-dim)', padding: '6px', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}>
              Clear filters
            </button>
          )}
        </aside>

        {/* Table */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {error && <div style={{ background: 'rgba(255,77,77,0.1)', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '10px 16px', borderRadius: '4px', fontSize: '0.875rem', marginBottom: '16px' }}>{error}</div>}

          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', padding: '60px', color: 'var(--text-secondary)' }}>
              <div className="spinner" /><span>Loading profiles...</span>
            </div>
          ) : profiles.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '12px' }}>◈</div>
              <p>No profiles found</p>
            </div>
          ) : (
            <>
              <table style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--bg-surface)', border: '1px solid var(--bg-border)', borderRadius: '8px', overflow: 'hidden', fontSize: '0.875rem' }}>
                <thead>
                  <tr>
                    {[['name', 'Name'], ['gender', 'Gender'], ['age', 'Age'], ['country_name', 'Country'], ['created_at', 'Created']].map(([col, label]) => (
                      <th key={col} onClick={() => handleSort(col)} style={{ textAlign: 'left', padding: '10px 16px', fontFamily: 'var(--font-mono)', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--text-secondary)', background: 'var(--bg-raised)', borderBottom: '1px solid var(--bg-border)', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
                        {label}{sortIcon(col)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {profiles.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--bg-border)' }}
                      onMouseOver={e => e.currentTarget.style.background = 'var(--bg-raised)'}
                      onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '12px 16px' }}>
                        <Link to={`/profiles/${p.id}`} style={{ color: 'var(--text-primary)', fontWeight: 600, textDecoration: 'none' }}
                          onMouseOver={e => e.currentTarget.style.color = 'var(--accent)'}
                          onMouseOut={e => e.currentTarget.style.color = 'var(--text-primary)'}>{p.name}</Link>
                      </td>
                      <td style={{ padding: '12px 16px', color: p.gender === 'male' ? 'var(--info)' : '#e879f9' }}>{p.gender ?? '—'}</td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{p.age ?? '—'} {p.age_group ? <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>({p.age_group})</span> : ''}</td>
                      <td style={{ padding: '12px 16px' }}>
                        {p.country_name
                          ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '0.75rem', padding: '1px 6px', background: 'var(--accent-dim)', border: '1px solid var(--accent)', borderRadius: '2px', color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>{p.country_id}</span>
                              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{p.country_name}</span>
                            </span>
                          : '—'}
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>{new Date(p.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {pagination?.total_pages > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginTop: '20px' }}>
                  <button onClick={() => setPage(p => p - 1)} disabled={!pagination.links?.prev}
                    style={{ background: 'none', border: '1px solid var(--bg-border)', color: 'var(--text-secondary)', padding: '6px 16px', borderRadius: '4px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', cursor: 'pointer', opacity: !pagination.links?.prev ? 0.3 : 1 }}>
                    ← Prev
                  </button>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {pagination.page} / {pagination.total_pages}
                  </span>
                  <button onClick={() => setPage(p => p + 1)} disabled={!pagination.links?.next}
                    style={{ background: 'none', border: '1px solid var(--bg-border)', color: 'var(--text-secondary)', padding: '6px 16px', borderRadius: '4px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', cursor: 'pointer', opacity: !pagination.links?.next ? 0.3 : 1 }}>
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
