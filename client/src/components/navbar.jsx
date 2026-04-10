import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const NAV_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'Our Works', path: '/portfolio' },
  { label: 'Reviews', path: '/reviews' },
  { label: 'Contacts', path: '/contact' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="site-navbar" style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? 'rgba(13,13,13,0.98)' : 'rgba(13,13,13,0.85)',
      borderBottom: '1px solid rgba(42,42,42,0.6)',
      backdropFilter: 'blur(14px)',
      padding: '0 clamp(24px, 6vw, 100px)', height: 68,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      transition: 'background 0.3s',
    }}>
      <Link to="/" className="site-navbar__brand" style={{ 
        fontFamily: 'var(--serif)', 
        fontSize: 21, 
        fontWeight: 400, 
        color: 'var(--gold-pale)', 
        textDecoration: 'none' 
      }}>
        Prime Leather Repair
      </Link>
      
      <nav className="site-navbar__links" style={{ display: 'flex', gap: 36 }}>
        {NAV_LINKS.map(l => (
          <Link 
            key={l.label} 
            to={l.path} 
            className="site-navbar__link"
            style={{
              fontFamily: 'var(--sans)', 
              fontSize: '13px', 
              fontWeight: 500,
              textTransform: 'uppercase', 
              letterSpacing: '2px',
              color: location.pathname === l.path ? 'var(--gold-light)' : 'var(--text-mid)', 
              textDecoration: 'none', 
              transition: 'color 0.2s'
            }}
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
