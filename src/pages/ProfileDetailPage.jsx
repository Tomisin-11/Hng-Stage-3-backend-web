// src/pages/ProfileDetailPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import apiClient from '../utils/apiClient.js';

export default function ProfileDetailPage() {
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiClient.get(`/profiles/${id}`)
      .then(res => setProfile(res.data.data))
      .catch(() => setError('Profile not found'))
      .finally(() => setIsLoading(false));
  }, [id]);

  async function handleDelete() {
    if (!window.confirm(`Delete "${profile.name}"? This cannot be undone.`)) return;
    try {
      await apiClient.delete(`/profiles/${id}`);
      navigate('/profiles', { replace: true });
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  }

  if (isLoading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', gap: '12px', color: 'var(--text-secondary)' }}>
      <div className="spinner" />
    </div>
  );

  if (error) return (
    <div style={{ textAlign: 'center', padding: '60px' }}>
      <p style={{ color: 'var(--danger)', marginBottom: '16px' }}>{error}</p>
      <Link to="/profiles" style={{ color: 'var(--accent)' }}>← Back to profiles</Link>
    </div>
  );

  const field = (label, value, mono = false) => (
    <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--bg-border)' }}>
      <p style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--text-secondary)', marginBottom: '6px' }}>{label}</p>
      <p style={{ color: 'var(--text-primary)', fontFamily: mono ? 'var(--font-mono)' : 'var(--font-sans)', fontSize: '0.9rem' }}>{value ?? '—'}</p>
    </div>
  );

  return (
    <div style={{ animation: 'fadeIn 0.3s ease', maxWidth: '700px' }}>
      <Link to="/profiles" style={{ display: 'inline-block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px', textDecoration: 'none' }}>← All Profiles</Link>

      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-border)', borderRadius: '12px', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '24px', background: 'var(--bg-raised)', borderBottom: '1px solid var(--bg-border)' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: 700, marginBottom: '4px' }}>{profile.name}</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              {profile.gender} · Age {profile.age ?? '?'} · {profile.country_name ?? 'Unknown country'}
            </p>
          </div>
          {isAdmin() && (
            <button onClick={handleDelete} style={{ background: 'none', border: '1px solid rgba(255,77,77,0.3)', color: 'var(--danger)', padding: '8px 16px', borderRadius: '4px', fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.15s' }}>
              Delete
            </button>
          )}
        </div>

        {/* Fields grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
          {field('Gender', profile.gender ? `${profile.gender} (${((profile.gender_probability ?? 0) * 100).toFixed(0)}% confidence)` : null)}
          {field('Age', profile.age ? `${profile.age} (${profile.age_group})` : null)}
          {field('Country', profile.country_name ? `${profile.country_name} [${profile.country_id}] — ${((profile.country_probability ?? 0) * 100).toFixed(0)}% confidence` : null)}
          {field('Profile ID', profile.id, true)}
          <div style={{ gridColumn: '1 / -1', padding: '16px 24px', borderBottom: '1px solid var(--bg-border)' }}>
            <p style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Created</p>
            <p style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{new Date(profile.created_at).toLocaleString()}</p>
          </div>
        </div>

        {/* Confidence bars */}
        <div style={{ padding: '24px' }}>
          <p style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--text-secondary)', marginBottom: '16px' }}>Confidence Scores</p>
          {[
            { label: 'Gender', value: profile.gender_probability, color: 'var(--info)' },
            { label: 'Country', value: profile.country_probability, color: 'var(--accent)' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{label}</span>
                <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color }}>{value ? `${(value * 100).toFixed(1)}%` : 'N/A'}</span>
              </div>
              <div style={{ height: '6px', background: 'var(--bg-border)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(value ?? 0) * 100}%`, background: color, borderRadius: '3px', transition: 'width 0.6s ease' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
