// src/pages/SearchPage.jsx
//
// TRD Required Page: Natural language search.
// Users type free-form queries like "young females from Nigeria"
// and get structured results.

import { useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../utils/apiClient.js';

const EXAMPLES = [
  'young males from Nigeria',
  'adult females',
  'people aged 25 to 35',
  'women older than 40',
  'males from Germany',
  'young adults from South Korea',
];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  async function handleSearch(q = query, p = 1) {
    if (!q.trim()) return;
    setIsLoading(true); setError(null); setPage(p);
    try {
      const res = await apiClient.get('/profiles/search', { params: { q, page: p, limit: 10 } });
      setResults(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Search failed');
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div style={{ animation: 'fadeIn 0.3s ease', maxWidth: '800px' }}>
      <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px' }}>Search</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '28px' }}>
        Ask in plain English. The system extracts gender, age, country, and more.
      </p>

      {/* Search input */}
      <div style={{ position: 'relative', marginBottom: '16px' }}>
        <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', fontSize: '1.1rem', pointerEvents: 'none' }}>⌕</span>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder='e.g. "young males from Nigeria" or "women aged 25 to 40"'
          autoFocus
          style={{
            width: '100%', padding: '14px 50px 14px 44px',
            background: 'var(--bg-surface)', border: '1px solid var(--bg-border)',
            borderRadius: '6px', color: 'var(--text-primary)', fontSize: '0.95rem',
            transition: 'border-color 0.15s',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
          onBlur={e => e.target.style.borderColor = 'var(--bg-border)'}
        />
        {query && (
          <button onClick={() => { setQuery(''); setResults(null); }}
            style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: '0.85rem' }}>✕</button>
        )}
      </div>

      <button onClick={() => handleSearch()} disabled={!query.trim() || isLoading}
        style={{ padding: '10px 28px', background: 'var(--accent)', color: '#0a0a0f', border: 'none', borderRadius: '4px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', marginBottom: '24px', opacity: !query.trim() ? 0.5 : 1 }}>
        {isLoading ? 'Searching...' : 'Search'}
      </button>

      {/* Example queries */}
      {!results && !isLoading && (
        <div>
          <p style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
            Try an example
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {EXAMPLES.map(ex => (
              <button key={ex} onClick={() => { setQuery(ex); handleSearch(ex); }}
                style={{ background: 'none', border: '1px solid var(--bg-border)', color: 'var(--text-secondary)', padding: '6px 14px', borderRadius: '20px', fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.15s' }}
                onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--bg-border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
                {ex}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && <div style={{ background: 'rgba(255,77,77,0.1)', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '10px 16px', borderRadius: '4px', fontSize: '0.875rem' }}>{error}</div>}

      {/* Loading */}
      {isLoading && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', padding: '40px', color: 'var(--text-secondary)' }}>
          <div className="spinner" /><span>Searching...</span>
        </div>
      )}

      {/* Results */}
      {results && !isLoading && (
        <div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '16px', fontFamily: 'var(--font-mono)' }}>
            {results.total} result{results.total !== 1 ? 's' : ''} for <span style={{ color: 'var(--accent)' }}>"{query}"</span>
          </p>

          {results.data.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '12px' }}>◈</div>
              <p>No profiles matched your query.</p>
              <p style={{ fontSize: '0.82rem', marginTop: '8px', color: 'var(--text-dim)' }}>Try different terms or check spelling.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {results.data.map(p => (
                <Link key={p.id} to={`/profiles/${p.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-border)', borderRadius: '6px', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.15s' }}
                    onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'var(--bg-raised)'; }}
                    onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--bg-border)'; e.currentTarget.style.background = 'var(--bg-surface)'; }}>
                    <div>
                      <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>{p.name}</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {[
                          p.gender,
                          p.age ? `Age ${p.age}` : null,
                          p.age_group,
                          p.country_name,
                        ].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                    <span style={{ color: 'var(--accent)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>{p.country_id ?? ''}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {results.total_pages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginTop: '20px' }}>
              <button onClick={() => handleSearch(query, page - 1)} disabled={!results.links?.prev}
                style={{ background: 'none', border: '1px solid var(--bg-border)', color: 'var(--text-secondary)', padding: '6px 16px', borderRadius: '4px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', cursor: 'pointer', opacity: !results.links?.prev ? 0.3 : 1 }}>
                ← Prev
              </button>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {results.page} / {results.total_pages}
              </span>
              <button onClick={() => handleSearch(query, page + 1)} disabled={!results.links?.next}
                style={{ background: 'none', border: '1px solid var(--bg-border)', color: 'var(--text-secondary)', padding: '6px 16px', borderRadius: '4px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', cursor: 'pointer', opacity: !results.links?.next ? 0.3 : 1 }}>
                Next →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
