import React, { useState, useEffect, useRef } from 'react';
import { Search, X, FileText, CornerDownLeft } from 'lucide-react';

export default function SearchModal({ isOpen, onClose, onSelectFile }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data.success) {
          setResults(data.results);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="search-modal-backdrop" onClick={onClose}>
      <div className="search-modal" onClick={(e) => e.stopPropagation()}>
        <div className="search-input-header">
          <Search size={20} className="text-muted" />
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            placeholder="Type to search all documentation..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
          )}
        </div>

        <div className="search-results-list">
          {loading && (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Searching documentation...
            </div>
          )}

          {!loading && query.trim() !== '' && results.length === 0 && (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No matches found for "{query}"
            </div>
          )}

          {!loading && results.map((result) => (
            <div
              key={result.path}
              className="search-result-item"
              onClick={() => {
                onSelectFile(result.path);
                onClose();
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div className="search-result-title">{result.title}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>{result.matchCount} match{result.matchCount > 1 ? 'es' : ''}</span>
                  <CornerDownLeft size={12} />
                </div>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '4px' }}>
                {result.path}
              </div>
              {result.matches.map((m, idx) => (
                <div key={idx} className="search-snippet">
                  <span style={{ color: 'var(--accent-primary)', marginRight: '6px' }}>L{m.lineNumber}:</span>
                  {m.lineText}
                </div>
              ))}
            </div>
          ))}

          {!query.trim() && (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.875rem' }}>
              Search across all SRS chapters and markdown files
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
