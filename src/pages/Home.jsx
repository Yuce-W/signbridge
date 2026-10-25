import React from 'react';
import { Link } from 'react-router-dom';
import WarningBanner from '../components/WarningBanner.jsx';

export default function Home() {
  return (
    <div className="home-page">
      {/* Prominent High-Stakes Clinical Warning Banner */}
      <WarningBanner />

      <section className="hero">
        <div className="eyebrow">ACCESSIBLE HEALTHCARE COMMUNICATION PROTOTYPE</div>
        <h1>
          A clearer way to connect, <em>when it matters most.</em>
        </h1>
        <p>
          SignBridge is an exploratory prototype designed to investigate how visual communication and computer vision landmarks might one day assist basic hospital interactions.
        </p>

        {/* Global Prototype Readiness Callout */}
        <div className="soft-note" style={{ maxWidth: '820px', margin: '0 auto 36px', textAlign: 'left' }}>
          <strong>Prototype Status:</strong> Automatic sign recognition is currently <strong>in development</strong> and is not operational for clinical patient care. Manual phrase selection and bedside communication cards are functional for prototype demonstration. Verified Indian Sign Language (ISL) demonstration videos are not yet available.
        </div>

        {/* Primary Entry Cards */}
        <div className="entry-grid">
          <Link to="/patient" className="entry">
            <span className="entry-icon" aria-hidden="true">◉</span>
            <div>
              <h2>Patient communication</h2>
              <p>
                Use the working manual phrase selector or test experimental hand landmark tracking. Automatic recognition is in development.
              </p>
              <b>Open patient mode →</b>
            </div>
          </Link>

          <Link to="/staff" className="entry">
            <span className="entry-icon coral" aria-hidden="true">▣</span>
            <div>
              <h2>Healthcare staff catalogue</h2>
              <p>
                Browse everyday hospital phrases. Verified Indian Sign Language (ISL) demonstration videos are currently pending expert review.
              </p>
              <b>Open staff catalogue →</b>
            </div>
          </Link>
        </div>
      </section>

      {/* Auxiliary Resource Section */}
      <section className="info-strip" aria-label="Prototype architecture and clinical limitations">
        <div>
          <strong>Local browser processing</strong>
          <p>
            Camera frames are analyzed locally in your browser via WebAssembly. Raw video is neither recorded to disk nor streamed to external servers.
          </p>
        </div>
        <div>
          <strong>Mandatory confirmation</strong>
          <p>
            No text or synthesized speech is communicated automatically. Every message requires explicit review and confirmation by the user.
          </p>
        </div>
        <div>
          <strong>Not an interpreter substitute</strong>
          <p>
            This prototype cannot replace a certified human sign language interpreter for clinical triage, medical history, diagnosis, or consent.
          </p>
        </div>
      </section>

      {/* Emergency Interpreter Protocol Callout */}
      <section className="panel" style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h2 style={{ margin: '0 0 6px' }}>Need a certified sign language interpreter?</h2>
          <p className="muted" style={{ margin: 0, fontSize: '0.9rem' }}>
            Access hospital on-call protocols, national ISL directories, and the interactive bedside request card tool.
          </p>
        </div>
        <Link to="/interpreter" className="primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          Interpreter & Support Resources →
        </Link>
      </section>
    </div>
  );
}
