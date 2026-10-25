import React, { useState } from 'react';
import './GestureGuide.css';

// Custom precision SVG illustrations for each supported gesture
function GestureIcon({ type }) {
  switch (type) {
    case 'pain':
      return (
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="gesture-svg">
          {/* Left finger pointing */}
          <path d="M6 24h13m0 0l-4-4m4 4l-4 4" stroke="#54E6D2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          {/* Right finger pointing */}
          <path d="M42 24H29m0 0l4-4m-4 4l4 4" stroke="#54E6D2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          {/* Pain center pulse/radial spark */}
          <circle cx="24" cy="24" r="3.5" fill="#f43f5e" />
          <path d="M24 14v3M24 31v3M14 24h3M31 24h3" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
          <path d="M17 17l2 2M29 29l2 2M17 31l2-2M29 17l2 2" stroke="#f43f5e" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        </svg>
      );
    case 'help':
      return (
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="gesture-svg">
          {/* Flat non-dominant palm base */}
          <rect x="8" y="34" width="32" height="6" rx="3" fill="rgba(84, 230, 210, 0.2)" stroke="#54E6D2" strokeWidth="2" />
          {/* Fist on palm with thumb up */}
          <rect x="15" y="18" width="18" height="16" rx="4" fill="#0d2c27" stroke="#54E6D2" strokeWidth="2" />
          {/* Thumb up */}
          <path d="M18 18V9a3 3 0 0 1 6 0v9" stroke="#54E6D2" strokeWidth="2.5" strokeLinecap="round" fill="rgba(84, 230, 210, 0.3)" />
          {/* Upward lift arrow */}
          <path d="M37 26V13m0 0l-3 3m3-3l3 3" stroke="#5eead4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'emergency':
      return (
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="gesture-svg">
          {/* Raised open palm */}
          <path d="M18 36V18a2.5 2.5 0 0 1 5 0v18" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" fill="rgba(239, 68, 68, 0.15)" />
          <path d="M23 18V13a2.5 2.5 0 0 1 5 0v23" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" fill="rgba(239, 68, 68, 0.15)" />
          <path d="M28 16v-2a2.5 2.5 0 0 1 5 0v22" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" fill="rgba(239, 68, 68, 0.15)" />
          <path d="M13 25v-3a2.5 2.5 0 0 1 5 0v14" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" fill="rgba(239, 68, 68, 0.15)" />
          {/* Urgent wave lines */}
          <path d="M8 12c2 2 2 4 0 6M40 12c-2 2-2 4 0 6M6 22c2 2 2 4 0 6M42 22c-2 2-2 4 0 6" stroke="#f87171" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'doctor':
      return (
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="gesture-svg">
          {/* Wrist / forearm contour */}
          <path d="M10 24h18c3 0 5 2 5 5v11" stroke="#8baea5" strokeWidth="2" strokeLinecap="round" fill="rgba(84, 230, 210, 0.08)" />
          {/* Tapping two fingers (Index & Middle) */}
          <path d="M22 8v12M27 10v10" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M17 12l5-4 5 2" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
          {/* Pulse target indicator on wrist */}
          <circle cx="24" cy="24" r="3" fill="#38bdf8" />
          <circle cx="24" cy="24" r="6" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 3" />
        </svg>
      );
    case 'water':
      return (
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="gesture-svg">
          {/* Cupped hand contour */}
          <path d="M14 18c0-4 3-8 8-8s8 4 8 8v10c0 6-4 10-10 10s-8-4-8-9" stroke="#5eead4" strokeWidth="2" strokeLinecap="round" fill="rgba(94, 234, 212, 0.12)" />
          {/* Drinking tilt motion */}
          <path d="M24 16c2 0 4 2 4 4M21 21c3 0 5 2 5 4" stroke="#5eead4" strokeWidth="1.8" strokeLinecap="round" />
          {/* Water droplet */}
          <path d="M24 30c-2 0-3.5 1.5-3.5 3s1.5 3 3.5 3 3.5-1.5 3.5-3-1.5-3-3.5-3z" fill="#38bdf8" />
        </svg>
      );
    case 'toilet':
      return (
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="gesture-svg">
          {/* T-handshape: fist with thumb between index and middle */}
          <rect x="14" y="16" width="20" height="22" rx="5" fill="#0d2c27" stroke="#a78bfa" strokeWidth="2" />
          {/* Thumb protruding through fingers */}
          <path d="M24 16v-6a3 3 0 0 1 6 0v6" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round" fill="rgba(167, 139, 250, 0.25)" />
          {/* Side-to-side shake motion arrows */}
          <path d="M8 26h4m-4 0l2-2m-2 2l2 2M40 26h-4m4 0l-2-2m2 2l-2 2" stroke="#c084fc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'wait':
      return (
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="gesture-svg">
          {/* Open palm held steady forward */}
          <path d="M14 24V14a2 2 0 0 1 4 0v10" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" fill="rgba(251, 191, 36, 0.12)" />
          <path d="M18 14V10a2 2 0 0 1 4 0v14" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" fill="rgba(251, 191, 36, 0.12)" />
          <path d="M22 10V8a2 2 0 0 1 4 0v16" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" fill="rgba(251, 191, 36, 0.12)" />
          <path d="M26 12v-2a2 2 0 0 1 4 0v14" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" fill="rgba(251, 191, 36, 0.12)" />
          <path d="M30 18v-2a2 2 0 0 1 4 0v12c0 8-5 12-11 12H19c-5 0-7-4-7-8V24" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="rgba(251, 191, 36, 0.12)" />
          {/* Steady hold indicator */}
          <line x1="10" y1="42" x2="38" y2="42" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 3" />
        </svg>
      );
    case 'thank_you':
      return (
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="gesture-svg">
          {/* Flat hand moving forward from chin */}
          <path d="M12 28c4-4 8-8 14-8h10c2 0 4 2 4 4s-2 4-4 4H26c-6 0-10 4-14 8" stroke="#34d399" strokeWidth="2" strokeLinecap="round" fill="rgba(52, 211, 153, 0.12)" />
          {/* Forward movement motion arc */}
          <path d="M18 16c6-4 14-4 20 0m0 0l-4-1m4 1l-1 4" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'yes':
      return (
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="gesture-svg">
          {/* Closed fist */}
          <rect x="15" y="16" width="18" height="20" rx="5" fill="#0d2c27" stroke="#54E6D2" strokeWidth="2" />
          <path d="M15 22h18M15 28h18" stroke="#54E6D2" strokeWidth="1.5" opacity="0.6" />
          {/* Vertical nodding arrows (up & down) */}
          <path d="M8 18v12m0 0l-3-3m3 3l3-3M40 30V18m0 0l-3 3m3-3l3 3" stroke="#5eead4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'no':
      return (
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="gesture-svg">
          {/* Open hand waving side-to-side / snapping fingers */}
          <path d="M16 34V16a2 2 0 0 1 4 0v18" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" fill="rgba(148, 163, 184, 0.15)" />
          <path d="M20 16V12a2 2 0 0 1 4 0v22" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" fill="rgba(148, 163, 184, 0.15)" />
          <path d="M24 16v-2a2 2 0 0 1 4 0v20" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" fill="rgba(148, 163, 184, 0.15)" />
          {/* Horizontal bilateral wave arcs */}
          <path d="M10 18c3-2 6-2 9 0M29 18c3-2 6-2 9 0" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}

export const SUPPORTED_GESTURES = [
  {
    id: 'pain',
    text: 'I am in pain',
    category: 'Urgent',
    badgeColor: 'rose',
    instruction: 'Point opposing index fingers toward pain area with gentle twisting motion',
    iconType: 'pain'
  },
  {
    id: 'help',
    text: 'I need help',
    category: 'Urgent',
    badgeColor: 'amber',
    instruction: 'Place thumbs-up fist on flat open palm, lift gently upward',
    iconType: 'help'
  },
  {
    id: 'doctor',
    text: 'I need a doctor',
    category: 'Medical',
    badgeColor: 'cyan',
    instruction: 'Tap index & middle fingers against your opposite wrist pulse point',
    iconType: 'doctor'
  },
  {
    id: 'emergency',
    text: 'I need urgent help',
    category: 'Urgent',
    badgeColor: 'red',
    instruction: 'Raise open hand across chest with urgent gentle waving motion',
    iconType: 'emergency'
  },
  {
    id: 'water',
    text: 'I need water',
    category: 'Daily Needs',
    badgeColor: 'teal',
    instruction: 'Form cup or C-shape with fingers and bring toward mouth',
    iconType: 'water'
  },
  {
    id: 'toilet',
    text: 'Where is the toilet?',
    category: 'Daily Needs',
    badgeColor: 'purple',
    instruction: 'Make T-handshape (thumb between fingers) and shake gently side-to-side',
    iconType: 'toilet'
  },
  {
    id: 'wait',
    text: 'Please wait',
    category: 'Responses',
    badgeColor: 'amber',
    instruction: 'Hold open flat palm facing forward at chest level, held steady',
    iconType: 'wait'
  },
  {
    id: 'thank_you',
    text: 'Thank you',
    category: 'Responses',
    badgeColor: 'emerald',
    instruction: 'Touch fingertips to chin or lips and move hand forward smoothly',
    iconType: 'thank_you'
  },
  {
    id: 'yes',
    text: 'Yes',
    category: 'Responses',
    badgeColor: 'teal',
    instruction: 'Hold closed fist at shoulder level and nod it up and down',
    iconType: 'yes'
  },
  {
    id: 'no',
    text: 'No',
    category: 'Responses',
    badgeColor: 'slate',
    instruction: 'Extend two fingers and snap against thumb or wave side-to-side',
    iconType: 'no'
  }
];

export default function GestureGuide({ onSelectGesture }) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = SUPPORTED_GESTURES.filter((item) => {
    const matchesCategory =
      filter === 'all' ||
      (filter === 'urgent' && (item.category === 'Urgent' || item.category === 'Medical')) ||
      (filter === 'needs' && item.category === 'Daily Needs') ||
      (filter === 'responses' && item.category === 'Responses');

    const matchesSearch =
      !search ||
      item.text.toLowerCase().includes(search.toLowerCase()) ||
      item.instruction.toLowerCase().includes(search.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <section className="gesture-guide-card" aria-label="Supported Sign Language Gestures">
      <div className="gesture-guide-header">
        <div>
          <h3>Supported Hand Gestures</h3>
          <p className="gesture-guide-sub">
            Perform any of these signs clearly in front of the camera for automatic recognition.
          </p>
        </div>
        <span className="gesture-count-pill">{SUPPORTED_GESTURES.length} Validated Signs</span>
      </div>

      {/* Filter Tabs */}
      <div className="gesture-filters">
        <button
          type="button"
          className={`gesture-filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Signs ({SUPPORTED_GESTURES.length})
        </button>
        <button
          type="button"
          className={`gesture-filter-btn ${filter === 'urgent' ? 'active' : ''}`}
          onClick={() => setFilter('urgent')}
        >
          🚨 Urgent & Medical
        </button>
        <button
          type="button"
          className={`gesture-filter-btn ${filter === 'needs' ? 'active' : ''}`}
          onClick={() => setFilter('needs')}
        >
          💧 Daily Needs
        </button>
        <button
          type="button"
          className={`gesture-filter-btn ${filter === 'responses' ? 'active' : ''}`}
          onClick={() => setFilter('responses')}
        >
          💬 Responses
        </button>
      </div>

      {/* Gesture Cards Grid */}
      <div className="gesture-grid" role="list">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="gesture-card"
            role="listitem"
            tabIndex={0}
            onClick={() => onSelectGesture?.(item)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectGesture?.(item);
              }
            }}
            title={`Click to review "${item.text}"`}
          >
            <div className="gesture-card-top">
              <div className="gesture-icon-box">
                <GestureIcon type={item.iconType} />
              </div>
              <span className={`gesture-badge ${item.badgeColor}`}>
                {item.category}
              </span>
            </div>

            <div className="gesture-card-body">
              <h4 className="gesture-phrase">{item.text}</h4>
              <p className="gesture-instruction">{item.instruction}</p>
            </div>

            <div className="gesture-card-footer">
              <span className="gesture-select-hint">Click to select manually ↗</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
