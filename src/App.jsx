import React, { useEffect, useState } from 'react';
import { BrowserRouter, NavLink, Route, Routes, Link } from 'react-router-dom';
import Home from './pages/Home.jsx';
import PatientMode from './pages/PatientMode.jsx';
import StaffMode from './pages/StaffMode.jsx';
import Recorder from './pages/Recorder.jsx';
import About from './pages/About.jsx';
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
  const [settings, setSettings] = useState(() => ({
    size: 'normal',
    contrast: false,
    speech: true,
    language: 'en',
    motion: false
  }));
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.size = settings.size;
    document.documentElement.dataset.contrast = settings.contrast ? 'high' : 'normal';
    document.documentElement.dataset.motion = settings.motion ? 'reduce' : 'normal';
  }, [settings]);

  const update = (k, v) => setSettings((s) => ({ ...s, [k]: v }));

  return (
    <BrowserRouter>
      {/* Background Scanner Layer from React Bits */}
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

      <a className="skip" href="#main">
        Skip to main content
      </a>

      <Header />

      <main id="main" className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/patient" element={<PatientMode settings={settings} />} />
          <Route path="/staff" element={<StaffMode />} />
          <Route path="/recorder" element={<Recorder />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>

      <footer className="footer">
        <div className="container footer-inner">
          <span>
            ✳ SignBridge <span className="muted">· Built for accessible communication</span>
          </span>
          <div>
            <button className="footer-button" onClick={() => setShowSettings(true)}>
              Accessibility settings
            </button>
            <Link to="/about">Privacy & safety</Link>
          </div>
        </div>
      </footer>

      {showSettings && (
        <div className="modal-backdrop" onClick={() => setShowSettings(false)}>
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
                aria-label="Close settings"
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
              <option value="normal">Standard</option>
              <option value="large">Large</option>
              <option value="extra">Extra large</option>
            </select>

            <label className="small-check">
              <input
                type="checkbox"
                checked={settings.contrast}
                onChange={(e) => update('contrast', e.target.checked)}
              />{' '}
              High contrast
            </label>

            <label className="small-check">
              <input
                type="checkbox"
                checked={settings.motion}
                onChange={(e) => update('motion', e.target.checked)}
              />{' '}
              Reduce motion
            </label>

            <label className="small-check">
              <input
                type="checkbox"
                checked={settings.speech}
                onChange={(e) => update('speech', e.target.checked)}
              />{' '}
              Enable speech output after confirmation
            </label>

            <label htmlFor="speechLang">Speech voice preference (installed voices only)</label>
            <select
              id="speechLang"
              value={settings.language}
              onChange={(e) => update('language', e.target.value)}
            >
              <option value="en">English</option>
              <option value="hi">Hindi (if supported)</option>
            </select>

            <p className="hint">
              Interface text is currently English. All essential communication is visible as text. No speech is automatic before confirmation.
            </p>

            <button className="primary full" onClick={() => setShowSettings(false)}>
              Done
            </button>
          </section>
        </div>
      )}
    </BrowserRouter>
  );
}
