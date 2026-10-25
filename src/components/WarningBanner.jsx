import React from 'react';
import { Link } from 'react-router-dom';
import './WarningBanner.css';

export default function WarningBanner({ compact = false }) {
  return (
    <aside
      className={`warning-banner ${compact ? 'compact' : ''}`}
      role="region"
      aria-label="High-stakes clinical communication warning"
    >
      <div className="warning-banner-icon" aria-hidden="true">
        ⚠️
      </div>
      <div className="warning-banner-body">
        <strong className="warning-banner-title">
          Experimental Prototype · Not for Emergencies or High-Stakes Decisions
        </strong>
        <p className="warning-banner-text">
          SignBridge is an experimental prototype in active development and is <strong>not a certified medical device or a substitute for a qualified human sign language interpreter</strong>. Do not use this tool for emergency communication, informed consent, medical diagnosis, treatment decisions, or medication administration.
        </p>
        <div className="warning-banner-actions">
          <Link to="/interpreter" className="warning-banner-link">
            How to request a certified interpreter & emergency protocols →
          </Link>
        </div>
      </div>
    </aside>
  );
}
