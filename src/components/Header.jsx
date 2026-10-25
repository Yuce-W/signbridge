import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import './Header.css';

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu whenever route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Close mobile menu on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && mobileOpen) {
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen]);

  // Auto-close mobile menu on desktop resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 900 && mobileOpen) {
        setMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <header className="topbar">
      <div className="topbar-inner">
        {/* LEFT: Brand */}
        <div className="topbar-left">
          <Link to="/" className="brand" onClick={() => setMobileOpen(false)}>
            <span className="brand-symbol" aria-hidden="true">✳</span>
            <span className="brand-text">
              sign<span className="brand-light">bridge</span>
              <small>CARE COMMUNICATION</small>
            </span>
          </Link>
        </div>

        {/* CENTER: Desktop Navigation */}
        <nav className="topbar-nav" aria-label="Main navigation">
          <NavLink
            to="/patient"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            Patient
          </NavLink>
          <NavLink
            to="/staff"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            Healthcare staff
          </NavLink>
          <NavLink
            to="/recorder"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            Dataset studio
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            About & safety
          </NavLink>
        </nav>

        {/* RIGHT: CTA & Mobile Hamburger */}
        <div className="topbar-right">
          <Link to="/about" className="cta-interpreter">
            <span>Request interpreter</span>
            <span className="cta-arrow" aria-hidden="true">↗</span>
          </Link>

          <button
            type="button"
            className={`mobile-menu-btn ${mobileOpen ? 'open' : ''}`}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-panel"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <span className="hamburger-line" />
            <span className="hamburger-line" />
            <span className="hamburger-line" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileOpen && (
        <div
          className="mobile-nav-backdrop"
          onClick={() => setMobileOpen(false)}
        >
          <div
            id="mobile-nav-panel"
            className="mobile-nav-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="mobile-nav-links" aria-label="Mobile navigation links">
              <NavLink
                to="/patient"
                className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                Patient
              </NavLink>
              <NavLink
                to="/staff"
                className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                Healthcare staff
              </NavLink>
              <NavLink
                to="/recorder"
                className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                Dataset studio
              </NavLink>
              <NavLink
                to="/about"
                className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                About & safety
              </NavLink>
            </nav>

            <div className="mobile-nav-footer">
              <Link
                to="/about"
                className="cta-interpreter mobile-cta"
                onClick={() => setMobileOpen(false)}
              >
                <span>Request interpreter</span>
                <span className="cta-arrow" aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
