import React, { useCallback, useEffect, useRef, useState } from 'react';
import CameraView from '../components/CameraView.jsx';
import WarningBanner from '../components/WarningBanner.jsx';
import { vocabulary } from '../data/vocabulary.js';
import { validateRecording, downloadJson } from '../services/recordings.js';
import { hasHands } from '../services/features.js';

export default function Recorder() {
  const [label, setLabel] = useState('help');
  const [signer, setSigner] = useState('');
  const [consent, setConsent] = useState(false);
  const [duration, setDuration] = useState(1.5);
  const [state, setState] = useState('idle');
  const [countdown, setCountdown] = useState(0);
  const [samples, setSamples] = useState([]);
  const [draft, setDraft] = useState(null);
  const [error, setError] = useState('');

  const frames = useRef([]);
  const phase = useRef('idle');
  const started = useRef(0);
  const timer = useRef(null);
  const metadata = useRef(null);

  useEffect(() => () => clearInterval(timer.current), []);

  const onFrame = useCallback(({ timestamp, features }) => {
    if (phase.current !== 'recording') return;
    frames.current.push({
      timestamp: Math.max(0, Math.round(timestamp - started.current)),
      features
    });

    if (timestamp - started.current >= metadata.current.duration) {
      phase.current = 'review';
      setState('review');
      const f = frames.current;
      const result = {
        schemaVersion: 1,
        signerId: metadata.current.signerId,
        label: metadata.current.label,
        consentConfirmed: true,
        recordedAt: new Date().toISOString(),
        frames: f
      };
      setDraft(result);
      if (!validateRecording(result)) {
        setError('This captured sequence is invalid. Please retry recording.');
      }
    }
  }, []);

  const record = () => {
    setError('');
    if (!consent) {
      setError('Explicit volunteer consent is required before recording.');
      return;
    }
    if (!/^[-_a-zA-Z0-9]{2,50}$/.test(signer)) {
      setError('Enter a pseudonymous ID (2–50 letters/numbers, e.g. volunteer_01). Do not enter patient names.');
      return;
    }

    frames.current = [];
    metadata.current = { label, signerId: signer, duration: duration * 1000 };
    phase.current = 'countdown';
    setState('countdown');
    let c = 3;
    setCountdown(c);

    timer.current = setInterval(() => {
      c--;
      setCountdown(c);
      if (c <= 0) {
        clearInterval(timer.current);
        started.current = performance.now();
        phase.current = 'recording';
        setState('recording');
      }
    }, 1000);
  };

  const reset = () => {
    clearInterval(timer.current);
    phase.current = 'idle';
    setState('idle');
    setDraft(null);
    setError('');
  };

  const accept = () => {
    if (!validateRecording(draft)) {
      setError('Invalid sample cannot be saved');
      return;
    }
    setSamples((s) => [...s, draft]);
    reset();
  };

  const clearAllSamples = () => {
    if (window.confirm(`Are you sure you want to clear all ${samples.length} recorded samples from this browser session?`)) {
      setSamples([]);
      reset();
    }
  };

  const importJson = async (e) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;
      const data = JSON.parse(await file.text());
      const records = Array.isArray(data) ? data : [data];
      if (!records.length || records.some((r) => !validateRecording(r))) {
        throw Error('Invalid schema or landmark sequence in imported JSON.');
      }
      setSamples((s) => [...s, ...records]);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      e.target.value = '';
    }
  };

  return (
    <div className="recorder-page">
      {/* Prominent High-Stakes Clinical Warning Banner */}
      <WarningBanner compact />

      <header className="page-header">
        <div className="eyebrow">RESEARCH & DATA COLLECTION TOOL</div>
        <h1>Record Landmark Samples for Research</h1>
        <p className="page-sub">
          <strong>Strictly for consenting research volunteers and qualified ISL reviewers.</strong> This tool is NOT for patient-care use. No patient identifiers, health information, or medical records may be collected.
        </p>
      </header>

      {/* Trust, Privacy & Data Storage Truth */}
      <div className="soft-note" style={{ margin: '20px 0 28px' }}>
        <strong>Data Flow & Storage Truth:</strong>
        <ul style={{ margin: '8px 0 0', paddingLeft: '20px', lineHeight: 1.5 }}>
          <li>
            <strong>What is collected:</strong> Numerical coordinates (x, y, z) for 21 hand joints from MediaPipe and shoulder reference points.
          </li>
          <li>
            <strong>Raw video:</strong> Web camera frames are analyzed in local browser memory and are <em>never</em> recorded or sent to any server.
          </li>
          <li>
            <strong>Storage:</strong> Samples are stored temporarily in your browser session RAM only. They will be deleted when you refresh or close this tab, or when you click "Clear all recordings".
          </li>
          <li>
            <strong>Export:</strong> Files are exported only when you explicitly select "Export JSON".
          </li>
        </ul>
      </div>

      <div className="page-grid">
        {/* Left Column: Camera and Review */}
        <div>
          <CameraView
            compact
            onFrame={onFrame}
            onStop={() => {
              if (phase.current !== 'idle') reset();
            }}
          />

          <div className="record-status" role="status" aria-live="polite">
            {state === 'countdown'
              ? `⏱ Starting recording in ${countdown}…`
              : state === 'recording'
              ? '● Recording landmark coordinates in browser memory…'
              : state === 'review'
              ? 'Capture complete — review captured sample below'
              : 'Camera ready. Select Start countdown when prepared.'}
          </div>

          {draft && (
            <div className="panel" style={{ marginTop: '16px' }}>
              <h2>Review captured sample</h2>
              <p>
                <strong>Label:</strong> {draft.label} &nbsp;·&nbsp;
                <strong>Frames:</strong> {draft.frames.length} &nbsp;·&nbsp;
                <strong>Signer ID:</strong> {draft.signerId}
              </p>
              <p className="muted" style={{ fontSize: '0.85rem' }}>
                Hand presence confirmed in {draft.frames.filter((f) => hasHands(f.features)).length} of {draft.frames.length} frames. No raw video was stored.
              </p>
              <div className="button-row">
                <button
                  type="button"
                  className="primary"
                  disabled={!validateRecording(draft)}
                  onClick={accept}
                >
                  ✓ Accept sample
                </button>
                <button
                  type="button"
                  className="secondary"
                  onClick={reset}
                >
                  ✕ Reject / retry
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Recording Controls & Session Management */}
        <aside className="right-panel">
          <div className="panel">
            <h2>Recording setup</h2>

            <label htmlFor="signLabel">Candidate sign label</label>
            <select
              id="signLabel"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              disabled={state !== 'idle'}
            >
              {[
                { id: 'idle', text: 'Idle / resting position' },
                ...vocabulary
              ].map((v) => (
                <option key={v.id} value={v.id}>
                  {v.id} — {v.text}
                </option>
              ))}
            </select>

            <label htmlFor="signerInput">Pseudonymous signer ID (no patient names)</label>
            <input
              id="signerInput"
              value={signer}
              onChange={(e) => setSigner(e.target.value)}
              placeholder="e.g. volunteer_01"
              disabled={state !== 'idle'}
            />
            <p className="hint" style={{ marginTop: '4px', fontSize: '0.78rem' }}>
              Use anonymous research pseudonyms only. Never enter patient names, hospital numbers, or MRNs.
            </p>

            <label htmlFor="durationSelect">Capture duration</label>
            <select
              id="durationSelect"
              value={duration}
              onChange={(e) => setDuration(+e.target.value)}
              disabled={state !== 'idle'}
            >
              <option value="1.5">1.5 seconds</option>
              <option value="2">2.0 seconds</option>
              <option value="3">3.0 seconds</option>
            </select>

            <label className="small-check consent" style={{ margin: '18px 0' }}>
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
              />{' '}
              I confirm the participant is a consenting research volunteer (not a patient receiving clinical care) and gives informed consent for numerical landmark collection and export.
            </label>

            <button
              type="button"
              className="primary full"
              disabled={state !== 'idle' || !consent || !signer.trim()}
              onClick={record}
            >
              Start 3-second countdown
            </button>

            {error && (
              <p className="error" role="alert" style={{ marginTop: '12px' }}>
                {error}
              </p>
            )}
          </div>

          <div className="panel">
            <div className="section-heading">
              <h2>Dataset session</h2>
              <span className="status-pill ready">
                {samples.length} accepted samples
              </span>
            </div>
            <p className="muted" style={{ fontSize: '0.84rem' }}>
              Stored in browser tab memory.
            </p>

            <div className="sample-list" style={{ maxHeight: '180px', overflowY: 'auto' }}>
              {vocabulary
                .filter((v) => samples.some((s) => s.label === v.id))
                .map((v) => (
                  <div key={v.id}>
                    <span>{v.id}</span>
                    <b>{samples.filter((s) => s.label === v.id).length} samples</b>
                  </div>
                ))}
            </div>

            <div className="button-row" style={{ marginTop: '16px' }}>
              <button
                type="button"
                className="secondary"
                disabled={!samples.length || !consent}
                onClick={() => downloadJson(samples, 'signbridge-landmarks.json')}
                title={!consent ? 'Consent must be confirmed to export' : ''}
              >
                💾 Export JSON ({samples.length})
              </button>

              <label className="import-btn">
                Import JSON
                <input
                  type="file"
                  accept="application/json,.json"
                  onChange={importJson}
                />
              </label>

              {samples.length > 0 && (
                <button
                  type="button"
                  className="secondary"
                  style={{ color: '#f87171' }}
                  onClick={clearAllSamples}
                >
                  🗑 Clear all
                </button>
              )}
            </div>

            <div className="sample-list" style={{ marginTop: '16px', maxHeight: '140px', overflowY: 'auto' }}>
              {samples.map((s, i) => (
                <div key={i}>
                  <span>
                    #{i + 1} {s.label} · {s.signerId}
                  </span>
                  <button
                    type="button"
                    className="text-button"
                    onClick={() => setSamples((a) => a.filter((_, j) => i !== j))}
                    aria-label={`Remove sample ${i + 1}: ${s.label}`}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <div className="soft-note" style={{ marginTop: '36px' }}>
        <strong>Linguistic & Ethical Mandate:</strong> Machine learning models trained on sign language must involve Deaf community co-design and independent validation by qualified ISL educators. Do not claim recognition accuracy or clinical utility without peer-reviewed held-out signer evaluation.
      </div>
    </div>
  );
}
