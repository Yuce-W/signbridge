import React, { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes, Link } from 'react-router-dom';
import Home from './pages/Home.jsx';
import PatientMode from './pages/PatientMode.jsx';
import StaffMode from './pages/StaffMode.jsx';
import Recorder from './pages/Recorder.jsx';
import About from './pages/About.jsx';
import InterpreterHelp from './pages/InterpreterHelp.jsx';
import Scanner from './components/Scanner.jsx';
import Header from './components/Header.jsx';

class ScannerErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.warn('Scanner background fallback:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

export default function App() {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('signbridge_settings');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not read settings from localStorage', e);
    }
    return {
      size: 'normal',
      contrast: false,
      speech: true,
      language: 'en',
      motion: false
    };
  });

  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('signbridge_settings', JSON.stringify(settings));
    } catch (e) {
      console.warn('Could not save settings to localStorage', e);
    }
    document.documentElement.dataset.size = settings.size;
    document.documentElement.dataset.contrast = settings.contrast ? 'high' : 'normal';
    document.documentElement.dataset.motion = settings.motion ? 'reduce' : 'normal';
  }, [settings]);

  // Close accessibility settings on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showSettings) {
        setShowSettings(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSettings]);

  const update = (k, v) => setSettings((s) => ({ ...s, [k]: v }));

  return (
    <BrowserRouter>
      {/* Background Scanner Layer from React Bits (paused if motion reduced) */}
      {!settings.motion && (
        <div
          className="app-background-scanner"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 0,
            pointerEvents: 'none',
            overflow: 'hidden'
          }}
          aria-hidden="true"
        >
          <ScannerErrorBoundary>
            <Scanner
              color1="#1b5a50"
              color2="#54E6D2"
              color3="#8eeddc"
              speed={0.38}
              sweepSpeed={0.22}
              sweepWidth={1.7}
              trail={0.45}
              ripple={0.22}
              bandDensity={9.5}
              lineWidth={1.0}
              glow={0.25}
              brightness={0.85}
              scanDirection="diagonal"
              colorSpread={0.35}
              scanline
              scanlineIntensity={0.25}
              opacity={0.92}
              mouseInteraction
              clickEffect="ping"
            />
          </ScannerErrorBoundary>
        </div>
      )}

      <a className="skip" href="#main">
        Skip to main content
      </a>

      <Header />

      <main id="main" className="container" tabIndex="-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/patient" element={<PatientMode settings={settings} />} />
          <Route path="/staff" element={<StaffMode />} />
          <Route path="/recorder" element={<Recorder />} />
          <Route path="/about" element={<About />} />
          <Route path="/interpreter" element={<InterpreterHelp />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>

      <footer className="footer" role="contentinfo">
        <div className="container footer-inner">
          <span>
            ✳ SignBridge <span className="muted">· Accessible communication prototype</span>
          </span>
          <div className="footer-links">
            <button
              type="button"
              className="footer-button"
              onClick={() => setShowSettings(true)}
            >
              Accessibility settings
            </button>
            <Link to="/interpreter">Request interpreter</Link>
            <Link to="/about">About & safety</Link>
          </div>
        </div>
      </footer>

      {showSettings && (
        <div
          className="modal-backdrop"
          onClick={() => setShowSettings(false)}
          role="presentation"
        >
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="section-heading">
              <h2 id="settings-title">Accessibility settings</h2>
              <button
                type="button"
                aria-label="Close accessibility settings"
                className="text-button"
                onClick={() => setShowSettings(false)}
              >
                ✕ Close
              </button>
            </div>

            <label htmlFor="textSize">Text size</label>
            <select
              id="textSize"
              value={settings.size}
              onChange={(e) => update('size', e.target.value)}
            >
              <option value="normal">Standard (16px base)</option>
              <option value="large">Large (19px base)</option>
              <option value="extra">Extra large (22px base)</option>
            </select>

            <label className="small-check">
              <input
                type="checkbox"
                checked={settings.contrast}
                onChange={(e) => update('contrast', e.target.checked)}
              />{' '}
              High contrast mode (enhanced borders and pure black background)
            </label>

            <label className="small-check">
              <input
                type="checkbox"
                checked={settings.motion}
                onChange={(e) => update('motion', e.target.checked)}
              />{' '}
              Reduce motion (pause background animations and disable transitions)
            </label>

            <label className="small-check">
              <input
                type="checkbox"
                checked={settings.speech}
                onChange={(e) => update('speech', e.target.checked)}
              />{' '}
              Enable speech synthesis after explicit confirmation
            </label>

            <label htmlFor="speechLang">Speech synthesis voice preference</label>
            <select
              id="speechLang"
              value={settings.language}
              onChange={(e) => update('language', e.target.value)}
            >
              <option value="en">English (browser voice)</option>
              <option value="hi">Hindi (if installed on device)</option>
            </select>

            <p className="hint">
              Preferences are saved automatically in your browser. All communication is always displayed as text; audio will never play before explicit user confirmation.
            </p>

            <button
              type="button"
              className="primary full"
              onClick={() => setShowSettings(false)}
            >
              Save & Close
            </button>
          </section>
        </div>
      )}
    </BrowserRouter>
  );
}
