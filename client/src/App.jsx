import { useEffect, useMemo, useState } from 'react'
import { Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { Navbar } from './components/navbar.jsx'
import { Footer } from './components/footer.jsx'
import Home from './pages/home.jsx'
import Portfolio from './pages/portfolio.jsx'
import Admin from './pages/admin.jsx'
import Contact from './pages/contact.jsx'
import Reviews from './pages/reviews.jsx'
import { getContact } from './services/api.js'

function FloatingSocials() {
  const [contact, setContact] = useState({
    phone: '',
    whatsapp: '',
    telegram: '',
  })

  useEffect(() => {
    let alive = true

    getContact()
      .then(({ data }) => {
        if (!alive) return
        setContact({
          phone: data?.phone || '',
          whatsapp: data?.messenger_whatsapp || '',
          telegram: data?.messenger_telegram || '',
        })
      })
      .catch(() => {})

    return () => {
      alive = false
    }
  }, [])

  const phoneDigits = useMemo(
    () => String(contact.phone || '').replace(/\D/g, ''),
    [contact.phone]
  )

  const whatsappHref = contact.whatsapp || (phoneDigits ? `https://wa.me/${phoneDigits}` : '')
  const telegramHref = contact.telegram || ''

  return (
    <div style={{
      position: 'fixed',
      right: 20,
      bottom: 'calc(20px + var(--safe-area-bottom, 0px))',
      zIndex: 60,
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    }}>
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
            background: '#06C755',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 28px rgba(0,0,0,0.25)',
          }}
        >
          <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" style={{ width: 28, height: 28 }} />
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
            background: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 28px rgba(0,0,0,0.25)',
          }}
        >
          <img src="https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg" alt="Telegram" style={{ width: 28, height: 28 }} />
        </a>
      ) : null}
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

function PublicLayout() {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <Outlet />
      <FloatingSocials />
      <Footer />
    </>
  )
}

function App() {
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

export default App
