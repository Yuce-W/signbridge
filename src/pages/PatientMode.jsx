import React, { useEffect, useRef, useState, useCallback } from 'react';
import CameraView from '../components/CameraView.jsx';
import { vocabulary } from '../data/vocabulary.js';
import { SequenceBuffer } from '../services/sequenceBuffer.js';
import { Recognizer } from '../services/recognizer.js';
import { hasHands } from '../services/features.js';
import { speak, stopSpeech } from '../services/speech.js';

export default function PatientMode({ settings }) {
  const buffer = useRef(new SequenceBuffer());
  const recognizer = useRef(new Recognizer());
  const processing = useRef(false);
  const lastHands = useRef(0);

  const [model, setModel] = useState('loading');
  const [status, setStatus] = useState('Camera off');
  const [candidate, setCandidate] = useState(null);
  const [confirmed, setConfirmed] = useState(null);
  const [choice, setChoice] = useState('');
  const [audioStatus, setAudioStatus] = useState('');

  useEffect(() => {
    let mounted = true;
    recognizer.current.load().then((ok) => {
      if (mounted) setModel(ok ? 'ready' : 'setup');
    });
    return () => {
      mounted = false;
      recognizer.current.dispose();
      stopSpeech();
    };
  }, []);

  const selectCandidate = (item, source) => {
    setCandidate({ ...item, source });
    setConfirmed(null);
    setAudioStatus('');
  };

  const onFrame = useCallback(
    async (frame) => {
      buffer.current.push(frame.timestamp, frame.features);

      if (!hasHands(frame.features)) {
        lastHands.current = 0;
        setStatus('No sign detected');
        return;
      }

      if (!lastHands.current) lastHands.current = frame.timestamp;

      if (model !== 'ready') {
        setStatus('Hand landmarks detected • Recognition model in setup mode (use manual selection below)');
        return;
      }

      if (candidate || confirmed || processing.current) {
        return;
      }

      if (frame.timestamp - lastHands.current < 350) {
        setStatus('Position your hands inside the frame');
        return;
      }

      const seq = buffer.current.sample();
      if (!seq) {
        setStatus('Collecting sign movement…');
        return;
      }

      processing.current = true;
      try {
        const result = await recognizer.current.predict(seq, frame.timestamp);

        if (result.state === 'candidate') {
          const item = vocabulary.find((v) => v.id === result.label);
          if (item) selectCandidate(item, 'model');
          setStatus('Message awaiting confirmation');
        } else if (result.state === 'uncertain') {
          setStatus(
            `Prediction uncertain (${Math.round((result.score || 0) * 100)}%) — select manually or retry`
          );
        } else if (result.state === 'recognizing') {
          setStatus('Recognizing sign…');
        } else if (result.state === 'idle') {
          setStatus('No sign detected');
        } else if (result.state === 'cooldown') {
          setStatus('Ready for next message');
        }
      } catch (e) {
        setStatus('Recognition error: ' + e.message);
      } finally {
        processing.current = false;
      }
    },
    [model, candidate, confirmed]
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
          : 'Speech unavailable on this device — show text instead'
        : 'Speech is disabled'
    );
  };

  const replay = () => {
    if (confirmed) {
      const ok = speak(confirmed.text, settings.language, settings.speech);
      setAudioStatus(ok ? 'Message spoken' : 'Speech is disabled or voice unavailable');
    }
  };

  return (
    <div className="page-grid">
      <div>
        <div className="eyebrow">PATIENT COMMUNICATION</div>
        <h1>Let us know what you need.</h1>
        <p className="page-sub">
          Hold your hands clearly in the camera frame. You will always review a message before it is spoken.
        </p>
        <CameraView
          onFrame={onFrame}
          onStop={() => {
            buffer.current.clear();
            lastHands.current = 0;
            setStatus('Camera off');
          }}
        />
      </div>

      <aside className="right-panel">
        <div className="panel">
          <div className="section-heading">
            <h2>Your message</h2>
            <span className={'status-pill ' + (model === 'ready' ? 'ready' : 'amber')}>
              {model === 'loading' ? 'Checking model' : model === 'ready' ? 'Recognizer ready' : 'Setup mode'}
            </span>
          </div>
          <p className="muted" role="status" aria-live="polite">
            {status}
          </p>

          {model !== 'ready' && (
            <div className="notice">
              <strong>AI recognition in setup mode.</strong>
              <p>
                A trained model is being loaded or configured. You can select any message manually below to communicate immediately.
              </p>
            </div>
          )}

          {candidate ? (
            <div className="message-card">
              <small>
                {candidate.source === 'manual' ? 'MANUALLY SELECTED MESSAGE' : 'MODEL CANDIDATE · PLEASE VERIFY'}
              </small>
              <h3>{candidate.text}</h3>
              <p>Is this the message you meant?</p>
              <div className="button-row">
                <button className="primary" onClick={confirm}>
                  Yes, confirm
                </button>
                <button className="secondary" onClick={reset}>
                  No, retry
                </button>
              </div>
            </div>
          ) : confirmed ? (
            <div className="message-card confirmed">
              <small>CONFIRMED MESSAGE</small>
              <h3>{confirmed.text}</h3>
              <div className="button-row">
                <button className="primary" onClick={replay}>
                  Replay speech
                </button>
                <button className="secondary" onClick={reset}>
                  New message
                </button>
              </div>
              <p role="status" className="hint">
                {audioStatus}
              </p>
            </div>
          ) : (
            <div className="empty-card">
              <span>✦</span>
              <h3>No message yet</h3>
              <p>Perform a supported sign or choose a phrase below.</p>
            </div>
          )}
        </div>

        <div className="panel">
          <h2>Choose a message manually</h2>
          <p className="muted">A reliable fallback when sign recognition is unavailable or uncertain.</p>
          <label htmlFor="manualPhrase">Common messages</label>
          <select id="manualPhrase" value={choice} onChange={(e) => setChoice(e.target.value)}>
            <option value="">Select a message</option>
            {vocabulary.map((item) => (
              <option value={item.id} key={item.id}>
                {item.text}
              </option>
            ))}
          </select>
          <button
            className="primary full"
            disabled={!choice}
            onClick={() => selectCandidate(vocabulary.find((v) => v.id === choice), 'manual')}
          >
            Review message
          </button>
        </div>

        <div className="privacy-mini">
          ⌁ &nbsp; Local camera processing · No video recording · Your confirmation is required
        </div>
      </aside>
    </div>
  );
}
