import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import WarningBanner from '../components/WarningBanner.jsx';

export default function StaffMode() {
  const [phrases, setPhrases] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    fetch('/data/phrases.json')
      .then((r) => {
        if (!r.ok) throw Error('Phrase catalogue unavailable');
        return r.json();
      })
      .then(setPhrases)
      .catch((e) => setError(e.message));
  }, []);

  const categories = ['All', ...new Set(phrases.map((p) => p.category))];

  const filtered = phrases.filter(
    (p) =>
      (category === 'All' || p.category === category) &&
      `${p.text} ${p.category}`.toLowerCase().includes(search.toLowerCase())
  );

  const copyPhrase = (p) => {
    navigator.clipboard.writeText(p.text).then(() => {
      setCopiedId(p.id);
      setTimeout(() => setCopiedId(null), 2500);
    });
  };

  return (
    <div className="staff-page">
      {/* Prominent High-Stakes Clinical Warning Banner */}
      <WarningBanner compact />

      <header className="page-header">
        <div className="eyebrow">STAFF PHRASE CATALOGUE</div>
        <h1>Everyday Healthcare Phrases</h1>
        <p className="page-sub">
          Browse common healthcare phrases. <strong>Important:</strong> Verified Indian Sign Language (ISL) demonstration videos are not yet available. No recordings in this catalogue have been reviewed or approved by certified ISL interpreters.
        </p>
      </header>

      {/* Staff Guidance Box */}
      <div className="soft-note" style={{ margin: '20px 0 28px' }}>
        <strong>Clinical Notice:</strong> This catalogue contains written English reference phrases only. It does not provide automated sign translation. For consultations, medical history, clinical assessments, and informed consent, always arrange a qualified human sign language interpreter.{' '}
        <Link to="/interpreter" style={{ color: '#5eead4', fontWeight: 'bold', textDecoration: 'underline' }}>
          View Interpreter Request Protocols →
        </Link>
      </div>

      {/* Search and Category Filters */}
      <div className="search-bar" role="search">
        <input
          id="staffSearch"
          aria-label="Search phrases by text or category"
          placeholder="Search phrases (e.g. water, doctor, wait)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          id="staffCategory"
          aria-label="Filter phrases by category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c === 'All' ? 'All Categories' : c}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}

      {/* Phrase Cards Grid */}
      <div className="phrase-grid">
        {filtered.map((p) => (
          <article className="phrase-card" key={p.id}>
            <div className="phrase-category">{p.category}</div>
            <h2>{p.text}</h2>

            {/* Clear, honest unavailable state — no faux play button */}
            <div className="video-missing" role="status" aria-label={`No verified ISL video for ${p.text}`}>
              <span style={{ fontSize: '1.4rem', color: '#fbbf24', display: 'block', marginBottom: '4px' }} aria-hidden="true">
                ℹ
              </span>
              <strong>Verified ISL video not available</strong>
              <p>
                No verified recording has been supplied or validated by certified ISL interpreters.
              </p>
            </div>

            <p className="hint">{p.caption}</p>

            <div style={{ marginTop: 'auto', paddingTop: '10px' }}>
              <button
                type="button"
                className="secondary"
                style={{ width: '100%', fontSize: '0.82rem', padding: '8px 12px' }}
                onClick={() => copyPhrase(p)}
                aria-label={`Copy phrase: ${p.text}`}
              >
                {copiedId === p.id ? '✓ Text Copied to Clipboard' : '📋 Copy Phrase Text'}
              </button>
            </div>
          </article>
        ))}
      </div>

      {!error && filtered.length === 0 && (
        <div className="empty-card">
          <p>No matching phrases found for "{search}".</p>
        </div>
      )}

      <div className="soft-note" style={{ marginTop: '36px' }}>
        <strong>Publishing Guidelines:</strong> To publish sign language media, authentic recordings must be filmed with consenting Deaf signers, reviewed by certified ISL educators, annotated with complete captions, and placed in <code>public/signs/</code> with verified metadata.
      </div>
    </div>
  );
}
