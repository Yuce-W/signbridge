import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './InterpreterHelp.css';

export default function InterpreterHelp() {
  const [room, setRoom] = useState('');
  const [preferredLang, setPreferredLang] = useState('Indian Sign Language (ISL)');
  const [urgency, setUrgency] = useState('Urgent');
  const [copied, setCopied] = useState(false);
  const [showCard, setShowCard] = useState(false);

  const requestSummary = `INTERPRETER REQUEST FOR CLINICAL CARE:
• Room / Location: ${room.trim() || 'Bedside'}
• Communication Modality: ${preferredLang}
• Urgency Level: ${urgency}
• Critical Medical Notice: Patient communicates via sign language. A certified human interpreter (in-person or VRI) is required for clinical history, diagnosis, informed consent, and treatment decisions. SignBridge prototype software is not an authorized substitute.`;

  const handleCopy = () => {
    navigator.clipboard.writeText(requestSummary).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  return (
    <div className="interpreter-page">
      <header className="page-header">
        <div className="eyebrow">INTERPRETER & ACCESSIBLE COMMUNICATION</div>
        <h1>Request a Certified Sign Language Interpreter</h1>
        <p className="page-sub">
          Official protocols, directories, and bedside assistance for patients, families, and healthcare providers.
        </p>
      </header>

      {/* Primary Safety Alert */}
      <section className="interpreter-notice" role="region" aria-label="Mandatory interpreter notice">
        <div className="interpreter-notice-badge">MANDATORY CLINICAL POLICY</div>
        <h2>SignBridge is an experimental prototype — NOT an interpreter substitute.</h2>
        <p>
          Under healthcare accessibility standards and clinical governance guidelines, automated prototype software must <strong>never</strong> be used to obtain informed consent, deliver diagnoses, discuss surgical procedures, adjust medication dosages, or conduct critical triage. A qualified, certified human sign language interpreter must be arranged.
        </p>
      </section>

      <div className="interpreter-grid">
        {/* Left Column: Interactive Bedside Request Tool */}
        <section className="panel interpreter-tool-panel" aria-labelledby="tool-heading">
          <div className="section-heading">
            <h2 id="tool-heading">Bedside Interpreter Request Tool</h2>
            <span className="status-pill ready">Active Prototype Tool</span>
          </div>
          <p className="muted">
            Generate an immediate, high-visibility request card for nursing staff or copy standardized text for hospital charts and messaging.
          </p>

          <form onSubmit={(e) => e.preventDefault()} className="interpreter-form">
            <label htmlFor="bedLocation">Room or Bed Location</label>
            <input
              id="bedLocation"
              type="text"
              placeholder="e.g. Ward 4B, Bed 12"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
            />

            <label htmlFor="prefLang">Preferred Communication Modality</label>
            <select
              id="prefLang"
              value={preferredLang}
              onChange={(e) => setPreferredLang(e.target.value)}
            >
              <option value="Indian Sign Language (ISL)">Indian Sign Language (ISL)</option>
              <option value="Tactile Sign Language (Deafblind)">Tactile Sign Language (Deafblind)</option>
              <option value="Written English / Hindi">Written English / Hindi</option>
              <option value="Visual Communication Board / PECS">Visual Communication Board / PECS</option>
            </select>

            <label htmlFor="urgencyLevel">Clinical Urgency</label>
            <select
              id="urgencyLevel"
              value={urgency}
              onChange={(e) => setUrgency(e.target.value)}
            >
              <option value="Routine (Scheduled rounds / discharge)">Routine (Scheduled rounds / discharge)</option>
              <option value="Urgent (Doctor consultation / assessment)">Urgent (Doctor consultation / assessment)</option>
              <option value="Emergency (Immediate clinical intervention)">Emergency (Immediate clinical intervention)</option>
            </select>

            <div className="button-row" style={{ marginTop: '20px' }}>
              <button
                type="button"
                className="primary"
                onClick={() => setShowCard(true)}
              >
                🪧 Display Bedside Screen Card
              </button>
              <button
                type="button"
                className="secondary"
                onClick={handleCopy}
              >
                {copied ? '✓ Request Copied to Clipboard' : '📋 Copy Request for Chart / SMS'}
              </button>
            </div>
          </form>

          {/* Full Screen Bedside Visual Display Modal */}
          {showCard && (
            <div className="modal-backdrop" onClick={() => setShowCard(false)}>
              <div
                className="modal bedside-modal"
                role="dialog"
                aria-modal="true"
                aria-label="High-visibility interpreter card"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bedside-card-header">
                  <span className="bedside-badge">DEAF PATIENT COMMUNICATION</span>
                  <button
                    type="button"
                    className="text-button"
                    onClick={() => setShowCard(false)}
                    aria-label="Close card"
                  >
                    ✕ Close Card
                  </button>
                </div>
                <div className="bedside-card-body">
                  <div className="bedside-symbol" aria-hidden="true">
                    🤟
                  </div>
                  <h3>I COMMUNICATE IN SIGN LANGUAGE</h3>
                  <p className="bedside-main-text">
                    Please arrange a certified <strong>{preferredLang}</strong> interpreter for all medical conversations.
                  </p>
                  <div className="bedside-details">
                    <div>
                      <span>Location</span>
                      <strong>{room || 'Bedside'}</strong>
                    </div>
                    <div>
                      <span>Urgency</span>
                      <strong>{urgency}</strong>
                    </div>
                  </div>
                  <p className="bedside-subtext">
                    For emergency clinical decisions, do not rely on prototype AI. Provide a certified human interpreter (in-person or Video Remote Interpreting).
                  </p>
                </div>
                <button
                  type="button"
                  className="primary full"
                  onClick={() => setShowCard(false)}
                >
                  Done / Close
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Right Column: Protocols & Directories */}
        <section className="panel interpreter-info-panel" aria-labelledby="protocol-heading">
          <h2 id="protocol-heading">Protocol for Healthcare Teams</h2>
          <ol className="protocol-steps">
            <li>
              <strong>Contact Hospital On-Call Service:</strong> Immediately check your facility’s registered medical interpreter roster or contracted Video Remote Interpreting (VRI) provider.
            </li>
            <li>
              <strong>Verify Patient's Primary Modality:</strong> Confirm whether the patient uses Indian Sign Language (ISL), regional sign variations, written language, or lipreading. Never assume lipreading is sufficient for complex clinical explanations.
            </li>
            <li>
              <strong>Set Up Video Remote Interpreting (VRI):</strong> If an in-person interpreter is en route, arrange a hospital-dedicated tablet with an active VRI session, ensuring high-speed Wi-Fi, clear lighting, and unobstructed visibility.
            </li>
            <li>
              <strong>Direct Communication:</strong> Look at and speak directly to the patient, not to the interpreter or accompanying family members.
            </li>
          </ol>

          <h3 style={{ marginTop: '28px' }}>Official ISL Directories & Resources (India)</h3>
          <ul className="directory-list">
            <li>
              <strong>ISLRTC (Indian Sign Language Research and Training Centre)</strong>
              <p>Autonomous body under MSJE, Government of India. Maintains registered ISL interpreter directories and educational resources.</p>
              <a href="https://islrtc.nic.in" target="_blank" rel="noopener noreferrer" className="external-link">
                Visit ISLRTC Official Portal ↗
              </a>
            </li>
            <li>
              <strong>National Association of the Deaf (NAD) India</strong>
              <p>Advocacy organization facilitating Deaf community support, emergency assistance, and interpreter coordination across Indian states.</p>
              <a href="https://nadindia.org" target="_blank" rel="noopener noreferrer" className="external-link">
                Visit NAD India Portal ↗
              </a>
            </li>
            <li>
              <strong>AYJNISHD (Ali Yavar Jung National Institute)</strong>
              <p>National institute for speech and hearing disabilities providing clinical guidance and communication accessibility standards.</p>
              <a href="http://ayjnihh.nic.in" target="_blank" rel="noopener noreferrer" className="external-link">
                Visit AYJNISHD Portal ↗
              </a>
            </li>
          </ul>

          <h3 style={{ marginTop: '28px' }}>Low-Tech Accessible Alternatives While Waiting</h3>
          <p className="muted" style={{ fontSize: '0.88rem' }}>
            While waiting for an interpreter to arrive, use reliable, low-tech alternatives:
          </p>
          <ul className="alternatives-list">
            <li>Bedside dry-erase whiteboards or clean pen and paper for simple questions.</li>
            <li>Standardized hospital pictorial communication charts (e.g. Pain scale 0–10, body location chart).</li>
            <li>Smartphone notes application with large text display.</li>
          </ul>
        </section>
      </div>

      <div className="soft-note" style={{ marginTop: '40px' }}>
        <strong>Healthcare Provider Responsibility:</strong> Providing qualified sign language interpretation is a fundamental patient rights and accessibility requirement. SignBridge encourages every healthcare system to establish 24/7 on-call certified ISL interpretation services.
      </div>
    </div>
  );
}
