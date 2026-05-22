import { useEffect, useMemo } from 'react'
import { Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { Navbar } from './components/navbar.jsx'
import { Footer } from './components/footer.jsx'
import Home from './pages/home.jsx'
import Portfolio from './pages/portfolio.jsx'
import Admin from './pages/admin.jsx'
import Contact from './pages/contact.jsx'
import Reviews from './pages/reviews.jsx'
import { SiteDataProvider, useSiteData } from './context/SiteDataContext.jsx'

function FloatingSocials() {
  const { contact } = useSiteData()

  const phoneDigits = useMemo(() => String(contact.phone || '').replace(/\D/g, ''), [contact.phone])
  const whatsappHref = contact.whatsapp || (phoneDigits ? `https://wa.me/${phoneDigits}` : '')
  const telegramHref = contact.telegram || ''

  return (
    <div
      className="floating-socials"
      style={{
        position: 'fixed',
        right: 20,
        bottom: 'calc(20px + var(--safe-area-bottom, 0px))',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      {whatsappHref ? (
        <a
          href={whatsappHref}
          target="_blank"
          rel="noreferrer"
          aria-label="WhatsApp"
          style={{
            width: 58,
            height: 58,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.96)',
            border: '1px solid rgba(232, 199, 200, 0.42)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 18px 34px rgba(26, 26, 26, 0.12)',
            backdropFilter: 'blur(14px)',
          }}
        >
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
            alt="WhatsApp"
            style={{ width: 28, height: 28 }}
          />
        </a>
      ) : null}
      {telegramHref ? (
        <a
          href={telegramHref}
          target="_blank"
          rel="noreferrer"
          aria-label="Telegram"
          style={{
            width: 58,
            height: 58,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.96)',
            border: '1px solid rgba(214, 209, 230, 0.52)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 18px 34px rgba(26, 26, 26, 0.12)',
            backdropFilter: 'blur(14px)',
          }}
        >
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg"
            alt="Telegram"
            style={{ width: 28, height: 28 }}
          />
        </a>
      ) : null}
    </div>
  )
}

function StickyMobileCta() {
  const { contact } = useSiteData()

  const phoneDigits = String(contact.phone || '').replace(/\D/g, '')
  const whatsappHref = contact.whatsapp || (phoneDigits ? `https://wa.me/${phoneDigits}` : '')

  return (
    <div className="sticky-mobile-cta">
      {whatsappHref ? (
        <a className="premium-button-outline" href={whatsappHref} target="_blank" rel="noreferrer">
          Text Us Now
        </a>
      ) : (
        <a className="premium-button-outline" href="/contact">
          Contact Us
        </a>
      )}
      <a className="premium-button" href="/contact">
        Free Quote
      </a>
    </div>
  )
}

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname])

  return null
}

function SiteLoadingScreen() {
  return (
    <main className="site-loading" aria-live="polite" aria-busy="true">
      <div className="site-loading__mark">
        <img src="/brand-logo-20260507.jpg" alt="" />
      </div>
      <div className="site-loading__bar">
        <span />
      </div>
    </main>
  )
}

function PublicLayoutContent() {
  const { ready } = useSiteData()

  return (
    <>
      <ScrollToTop />
      <Navbar />
      {ready ? (
        <>
          <Outlet />
          <FloatingSocials />
          <StickyMobileCta />
          <Footer />
        </>
      ) : (
        <SiteLoadingScreen />
      )}
    </>
  )
}

function PublicLayout() {
  return (
    <SiteDataProvider>
      <PublicLayoutContent />
    </SiteDataProvider>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/reviews" element={<Reviews />} />
      </Route>
      <Route path="/admin" element={<Admin />} />
    </Routes>
  )
}
