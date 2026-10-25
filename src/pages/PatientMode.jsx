import React, { useEffect, useRef, useState, useCallback } from 'react';
import CameraView from '../components/CameraView.jsx';
import GestureGuide from '../components/GestureGuide.jsx';
import WarningBanner from '../components/WarningBanner.jsx';
import { vocabulary } from '../data/vocabulary.js';
import { SequenceBuffer } from '../services/sequenceBuffer.js';
import { Recognizer } from '../services/recognizer.js';
import { hasHands } from '../services/features.js';
import { speak, stopSpeech } from '../services/speech.js';
import './PatientMode.css';

const QUICK_PHRASES = [
  { id: 'pain', label: '🚨 I am in pain' },
  { id: 'help', label: '🆘 I need help' },
  { id: 'water', label: '💧 I need water' },
  { id: 'toilet', label: '🚻 Where is the toilet?' }
];

export default function PatientMode({ settings }) {
  const buffer = useRef(new SequenceBuffer());
  const recognizer = useRef(new Recognizer());
  const processing = useRef(false);
  const lastHands = useRef(0);

  const [model, setModel] = useState('development');
  const [status, setStatus] = useState('Camera off — select a message manually below');
  const [candidate, setCandidate] = useState(null);
  const [confirmed, setConfirmed] = useState(null);
  const [choice, setChoice] = useState('');
  const [audioStatus, setAudioStatus] = useState('');

  useEffect(() => {
    let mounted = true;
    recognizer.current.load().then(() => {
      // Regardless of prototype weights, automatic recognition is in development and unvalidated
      if (mounted) setModel('development');
    });
    return () => {
      mounted = false;
      recognizer.current.dispose();
      stopSpeech();
    };
  }, []);

  const selectCandidate = (item, source) => {
    if (!item) return;
    setCandidate({ ...item, source });
    setConfirmed(null);
    setAudioStatus('');
  };

  const onFrame = useCallback(
    async (frame) => {
      buffer.current.push(frame.timestamp, frame.features);

      if (!hasHands(frame.features)) {
        lastHands.current = 0;
        setStatus('No hands detected in frame — position hands clearly');
        return;
      }

      if (!lastHands.current) lastHands.current = frame.timestamp;

      setStatus(
        'Hand landmarks tracked (experimental) • Automatic recognition in development. Please select your phrase below or from the sample gestures.'
      );
    },
    []
  );

  const reset = () => {
    setCandidate(null);
    setConfirmed(null);
    setChoice('');
    setAudioStatus('');
    buffer.current.clear();
    recognizer.current.reset();
    stopSpeech();
    setStatus('Ready for another message');
  };

  const confirm = () => {
    if (!candidate) return;
    setConfirmed(candidate);
    setCandidate(null);
    const played = speak(candidate.text, settings.language, settings.speech);
    setAudioStatus(
      settings.speech
        ? played
          ? 'Message spoken'
          : 'Speech unavailable on this device — text is displayed above'
        : 'Speech is disabled in settings'
    );
  };

  const replay = () => {
    if (confirmed) {
      const ok = speak(confirmed.text, settings.language, settings.speech);
      setAudioStatus(ok ? 'Message spoken' : 'Speech is disabled or voice unavailable');
    }
  };

  return (
    <div className="patient-page">
      {/* Prominent High-Stakes Clinical Warning Banner */}
      <WarningBanner compact />

      {/* Page Header (Full Width) */}
      <header className="patient-header">
        <div className="patient-header-content">
          <div className="eyebrow">PATIENT COMMUNICATION PROTOTYPE</div>
          <h1>Let us know what you need.</h1>
          <p className="page-sub">
            Use the working manual phrase selector below to communicate immediately. Camera landmark tracking is available for experimental review; automatic sign recognition is in development.
          </p>
        </div>
        <div className="patient-header-meta">
          <span className="status-pill amber">
            ▲ Sign recognition in development
          </span>
        </div>
      </header>

      {/* Main Responsive Grid Layout */}
      <div className="patient-grid">
        {/* 1. Camera View Area */}
        <div className="area-camera">
          <CameraView
            onFrame={onFrame}
            onStop={() => {
              buffer.current.clear();
              lastHands.current = 0;
              setStatus('Camera off — select a message manually below');
            }}
          />
        </div>

        {/* 2. "Your message" Recognition Panel Area */}
        <div className="area-recognition panel recognition-panel">
          <div className="section-heading">
            <h2>Your message</h2>
            <span className="status-pill amber">
              Manual selection prototype
            </span>
          </div>

          {/* Live Camera/Recognition Status */}
          <div className="live-status-bar" role="status" aria-live="polite">
            <span
              className={`live-status-dot ${
                status.includes('tracked')
                  ? 'detecting'
                  : status.includes('off')
                  ? 'idle'
                  : ''
              }`}
            />
            <span>{status}</span>
          </div>

          <div className="notice" role="note">
            <strong>Prototype in development: Automatic sign recognition is not available yet.</strong>
            <p>
              SignBridge has not undergone independent Indian Sign Language (ISL) validation or clinical testing. You can use the working <strong>manual message selector</strong> below or click any gesture example to communicate immediately. Spoken audio will only play after you verify and confirm the message.
            </p>
          </div>

          {/* Candidate Review State */}
          {candidate ? (
            <div className="message-card">
              <small>
                {candidate.source === 'manual'
                  ? 'MANUALLY SELECTED MESSAGE · PLEASE VERIFY'
                  : 'PROTOTYPE CANDIDATE · PLEASE VERIFY'}
              </small>
              <h3>{candidate.text}</h3>
              <p>Is this the message you meant to communicate?</p>
              <div className="button-row">
                <button className="primary" onClick={confirm}>
                  ✓ Yes, confirm
                </button>
                <button className="secondary" onClick={reset}>
                  ✕ No, retry
                </button>
              </div>
            </div>
          ) : confirmed ? (
            /* Confirmed Message State */
            <div className="message-card confirmed">
              <small>CONFIRMED MESSAGE</small>
              <h3>{confirmed.text}</h3>
              <div className="button-row">
                <button className="primary" onClick={replay}>
                  🔊 Replay speech
                </button>
                <button className="secondary" onClick={reset}>
                  + New message
                </button>
              </div>
              <p role="status" className="hint">
                {audioStatus}
              </p>
            </div>
          ) : (
            /* Idle / Waiting State */
            <div className="empty-card">
              <span>✦</span>
              <h3>No message selected</h3>
              <p>Select a phrase manually below or from the sample gestures to communicate.</p>
            </div>
          )}
        </div>

        {/* 3. Visual Gesture Reference Guide Area */}
        <div className="area-guide">
          <GestureGuide
            onSelectGesture={(item) => {
              const matched = vocabulary.find((v) => v.id === item.id);
              if (matched) selectCandidate(matched, 'manual');
            }}
          />
        </div>

        {/* 4. "Choose a message manually" Panel Area */}
        <div className="area-manual panel manual-panel">
          <h2>Choose a message manually</h2>
          <p className="muted">
            Active prototype communication feature. Select any phrase to verify and speak.
          </p>

          {/* Quick 1-tap phrase chips */}
          <div className="quick-phrase-label">Quick select common needs</div>
          <div className="quick-phrase-grid">
            {QUICK_PHRASES.map((qp) => {
              const item = vocabulary.find((v) => v.id === qp.id);
              return (
                <button
                  key={qp.id}
                  type="button"
                  className={`quick-phrase-chip ${choice === qp.id ? 'active' : ''}`}
                  onClick={() => {
                    setChoice(qp.id);
                    if (item) selectCandidate(item, 'manual');
                  }}
                >
                  {qp.label}
                </button>
              );
            })}
          </div>

          {/* Full Vocabulary Dropdown */}
          <label htmlFor="manualPhrase">All phrases</label>
          <select
            id="manualPhrase"
            value={choice}
            onChange={(e) => setChoice(e.target.value)}
          >
            <option value="">Select a phrase from dictionary…</option>
            {vocabulary.map((item) => (
              <option value={item.id} key={item.id}>
                {item.text}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="primary full"
            disabled={!choice}
            onClick={() => {
              const matched = vocabulary.find((v) => v.id === choice);
              if (matched) selectCandidate(matched, 'manual');
            }}
          >
            Review message
          </button>
        </div>

        {/* 5. Privacy Badge Area */}
        <div className="area-privacy privacy-mini">
          ⌁ &nbsp; Local WebAssembly camera processing · No video recorded or transmitted · Explicit confirmation required before speech
        </div>
      </div>
    </div>
  );
}
