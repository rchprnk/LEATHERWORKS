import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const NAV_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'Our Works', path: '/portfolio' },
  { label: 'Reviews', path: '/reviews' },
  { label: 'Contact', path: '/contact' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  return (
    <>
      <header
        className="site-navbar"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          height: 'calc(78px + var(--safe-area-top, 0px))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--safe-area-top, 0px) clamp(20px, 5vw, 56px) 0',
          background: scrolled ? 'rgba(234, 223, 206, 0.94)' : 'rgba(228, 215, 198, 0.86)',
          borderBottom: '1px solid rgba(198, 169, 107, 0.18)',
          backdropFilter: 'blur(18px)',
          transition: 'background 0.25s ease, box-shadow 0.25s ease',
          boxShadow: scrolled ? '0 14px 30px rgba(26, 26, 26, 0.05)' : 'none',
        }}
      >
        <Link
          to="/"
          className="site-navbar__brand"
          style={{
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 12,
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.75rem, 2.4vw, 2.35rem)',
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.035em',
            position: 'relative',
            zIndex: 102,
          }}
        >
          <span
            className="site-navbar__logo"
            aria-hidden="true"
            style={{
              width: 38,
              height: 38,
              borderRadius: 13,
              display: 'inline-grid',
              placeItems: 'center',
              flex: '0 0 auto',
              overflow: 'hidden',
              padding: 2,
              background: '#f4eadf',
              boxShadow: '0 12px 26px rgba(56, 39, 26, 0.18)',
              border: '1px solid rgba(154, 113, 38, 0.28)',
            }}
          >
            <img
              src="/brand-logo.jpg"
              alt=""
              style={{
                width: '100%',
                height: '100%',
                display: 'block',
                borderRadius: 11,
                objectFit: 'contain',
              }}
            />
          </span>
          <span>Prime Leather Repair</span>
        </Link>

        <button
          type="button"
          className="site-navbar__toggle"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((value) => !value)}
        >
          <span className={`site-navbar__toggle-line${menuOpen ? ' is-open' : ''}`} />
          <span className={`site-navbar__toggle-line${menuOpen ? ' is-open' : ''}`} />
          <span className={`site-navbar__toggle-line${menuOpen ? ' is-open' : ''}`} />
        </button>

        <nav className={`site-navbar__links${menuOpen ? ' is-open' : ''}`} style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          {NAV_LINKS.map((link) => {
            const active = location.pathname === link.path

            return (
              <Link
                key={link.path}
                to={link.path}
                className="site-navbar__link"
                onClick={() => setMenuOpen(false)}
                style={{
                  textDecoration: 'none',
                  padding: '10px 14px',
                  borderRadius: 999,
                  color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontSize: '0.92rem',
                  fontWeight: 500,
                  background: active ? 'linear-gradient(135deg, rgba(198, 169, 107, 0.18), rgba(232, 199, 200, 0.14))' : 'transparent',
                  border: active ? '1px solid rgba(198, 169, 107, 0.22)' : '1px solid transparent',
                }}
              >
                {link.label}
              </Link>
            )
          })}

          <a
            href="/contact"
            className="premium-button"
            style={{ minHeight: 46, padding: '0 20px' }}
            onClick={() => setMenuOpen(false)}
          >
            Send Photo
          </a>
        </nav>
      </header>
      <div className={`site-navbar__backdrop${menuOpen ? ' is-open' : ''}`} onClick={() => setMenuOpen(false)} />
    </>
  )
}
