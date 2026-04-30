// src/pages/DashboardPage.jsx
//
// TRD Required Page: Dashboard with basic metrics.
// Shows: total profiles, gender distribution, top countries, recent profiles.

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import apiClient from '../utils/apiClient.js';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        // Fetch all profiles to derive stats (small dataset for demo)
        const [allRes, maleRes, femaleRes, recentRes] = await Promise.all([
          apiClient.get('/profiles', { params: { limit: 1 } }),
          apiClient.get('/profiles', { params: { limit: 1, gender: 'male' } }),
          apiClient.get('/profiles', { params: { limit: 1, gender: 'female' } }),
          apiClient.get('/profiles', { params: { limit: 5, sort_by: 'created_at', order: 'desc' } }),
        ]);

        setStats({
          total: allRes.data.total,
          male: maleRes.data.total,
          female: femaleRes.data.total,
        });
        setRecent(recentRes.data.data);
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const card = (label, value, sub, color = 'var(--accent)') => (
    <div style={{
      background: 'var(--bg-surface)', border: '1px solid var(--bg-border)',
      borderRadius: '8px', padding: '24px', flex: 1, minWidth: '160px',
    }}>
      <p style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
        {label}
      </p>
      <p style={{ fontSize: '2rem', fontWeight: 700, color, fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
        {isLoading ? '—' : value}
      </p>
      {sub && <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{sub}</p>}
    </div>
  );

  const malePercent = stats ? Math.round((stats.male / stats.total) * 100) : 0;
  const femalePercent = stats ? Math.round((stats.female / stats.total) * 100) : 0;

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: 700, marginBottom: '4px' }}>
          Dashboard
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Welcome back, <span style={{ color: 'var(--accent)' }}>@{user?.username}</span>
          {' '}· <span style={{ textTransform: 'capitalize' }}>{user?.role}</span>
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
        {card('Total Profiles', stats?.total ?? '—', 'Across all countries')}
        {card('Male', stats?.male ?? '—', `${malePercent}% of total`, 'var(--info)')}
        {card('Female', stats?.female ?? '—', `${femalePercent}% of total`, '#e879f9')}
      </div>

      {/* Gender bar */}
      {stats && stats.total > 0 && (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-border)', borderRadius: '8px', padding: '24px', marginBottom: '32px' }}>
          <p style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Gender Distribution
          </p>
          <div style={{ display: 'flex', height: '12px', borderRadius: '6px', overflow: 'hidden', background: 'var(--bg-border)' }}>
            <div style={{ width: `${malePercent}%`, background: 'var(--info)', transition: 'width 0.8s ease' }} />
            <div style={{ width: `${femalePercent}%`, background: '#e879f9', transition: 'width 0.8s ease' }} />
          </div>
          <div style={{ display: 'flex', gap: '24px', marginTop: '12px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--info)' }}>▪ Male {malePercent}%</span>
            <span style={{ fontSize: '0.8rem', color: '#e879f9' }}>▪ Female {femalePercent}%</span>
          </div>
        </div>
      )}

      {/* Recent profiles */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-border)', borderRadius: '8px', overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--bg-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--text-secondary)' }}>
            Recent Profiles
          </p>
          <Link to="/profiles" style={{ fontSize: '0.8rem', color: 'var(--accent)' }}>View all →</Link>
        </div>

        {isLoading ? (
          <div style={{ padding: '40px', display: 'flex', justifyContent: 'center', gap: '12px', color: 'var(--text-secondary)' }}>
            <div className="spinner" /><span>Loading...</span>
          </div>
        ) : recent.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No profiles yet.{' '}
            <Link to="/profiles" style={{ color: 'var(--accent)' }}>Create one →</Link>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr>
                {['Name', 'Gender', 'Age', 'Country', 'Created'].map(h => (
                  <th key={h} style={{
                    textAlign: 'left', padding: '10px 24px',
                    fontFamily: 'var(--font-mono)', fontSize: '0.68rem',
                    textTransform: 'uppercase', letterSpacing: '1.5px',
                    color: 'var(--text-secondary)', background: 'var(--bg-raised)',
                    borderBottom: '1px solid var(--bg-border)',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--bg-border)' }}>
                  <td style={{ padding: '12px 24px' }}>
                    <Link to={`/profiles/${p.id}`} style={{ color: 'var(--text-primary)', fontWeight: 600, textDecoration: 'none' }}
                      onMouseOver={e => e.currentTarget.style.color = 'var(--accent)'}
                      onMouseOut={e => e.currentTarget.style.color = 'var(--text-primary)'}>
                      {p.name}
                    </Link>
                  </td>
                  <td style={{ padding: '12px 24px', color: p.gender === 'male' ? 'var(--info)' : '#e879f9' }}>
                    {p.gender ?? '—'}
                  </td>
                  <td style={{ padding: '12px 24px', color: 'var(--text-secondary)' }}>{p.age ?? '—'}</td>
                  <td style={{ padding: '12px 24px' }}>
                    {p.country_name
                      ? <span style={{ fontSize: '0.78rem', padding: '2px 8px', background: 'var(--accent-dim)', border: '1px solid var(--accent)', borderRadius: '2px', color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
                          {p.country_id}
                        </span>
                      : '—'}
                  </td>
                  <td style={{ padding: '12px 24px', color: 'var(--text-secondary)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
                    {new Date(p.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Quick links */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '24px', flexWrap: 'wrap' }}>
        {[
          { to: '/profiles', label: '→ Browse Profiles' },
          { to: '/search', label: '→ Natural Language Search' },
        ].map(({ to, label }) => (
          <Link key={to} to={to} style={{
            padding: '10px 20px', background: 'none', border: '1px solid var(--bg-border)',
            borderRadius: '4px', color: 'var(--text-secondary)', fontSize: '0.85rem',
            textDecoration: 'none', transition: 'all 0.15s ease',
          }}
          onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
          onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--bg-border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
