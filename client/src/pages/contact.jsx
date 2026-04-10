import { useEffect, useRef, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002'

function useReveal() {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); io.disconnect() } },
      { threshold: 0.1 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return [ref, visible]
}

function Reveal({ children, delay = 0, style: outerStyle = {} }) {
  const [ref, visible] = useReveal()
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(32px)',
      transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      ...outerStyle,
    }}>
      {children}
    </div>
  )
}

function ContactCard({ icon, title, children }) {
  return (
    <div style={{
      background: '#171717', border: '1.12px solid #262626', borderRadius: 6,
      padding: '33px 33px 28px',
      transition: 'border-color 0.25s',
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(225,113,0,0.4)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = '#262626'}
    >
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <div style={{
          width: 56, height: 56, flexShrink: 0,
          background: 'rgba(123,51,6,0.20)', borderRadius: 6,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 18, fontWeight: 500, color: '#F5F5F5', marginBottom: 10 }}>
            {title}
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}

export default function Contact() {
  const [contact, setContact] = useState(null)
  const [studioImg, setStudioImg] = useState(null)

  useEffect(() => {
    fetch(`${API_URL}/api/contact`)
      .then(r => r.json())
      .then(data => setContact(data))
      .catch(() => setContact({
        phone: '+1 (312) 555-0199',
        email: 'info@primeleatherrepair.com',
        address: '123 Craft Street, Chicago, IL 60614',
        hours: { mon_fri: '9:00 AM - 6:00 PM', saturday: '10:00 AM - 4:00 PM', sunday: 'Closed' },
        whatsapp: '#',
        telegram: '#',
      }))
  }, [])

  // Studio image — first portfolio item's after_url or fallback
  useEffect(() => {
    fetch(`${API_URL}/api/portfolio?limit=1`)
      .then(r => r.json())
      .then(json => {
        const items = json.data ?? json
        if (items[0]?.after_url) setStudioImg(items[0].after_url)
      })
      .catch(() => {})
  }, [])

  const addressLine1 = contact?.address?.split(',')[0] ?? '123 Craft Street'
  const addressLine2 = contact?.address?.split(',').slice(1).join(',').trim() ?? 'Chicago, IL 60614'

  return (
    <div style={{ background: '#121212', color: '#fff', fontFamily: 'Georgia, serif', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --gold: #E17100; --gold-light: #FFB900; --gold-pale: #FEF3C6;
          --bg: #121212; --bg2: #1A1A1A; --border: #262626;
          --text-dim: #A1A1A1; --text-mid: #D4D4D4;
          --serif: 'Cormorant Garamond', Georgia, serif;
          --sans: 'DM Sans', sans-serif;
        }
        html { scroll-behavior: smooth; }
        .msg-btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; border: none; border-radius: 6px; font-family: var(--sans); font-size: 14px; font-weight: 500; color: #fff; cursor: pointer; transition: opacity 0.2s, transform 0.15s; text-decoration: none; }
        .msg-btn:hover { opacity: 0.88; transform: translateY(-1px); }
        @keyframes fadeUp { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
        @media (max-width: 960px) {
          .contact-layout { flex-direction: column !important; }
        }
      `}</style>

      {/* HERO */}
      <section style={{
        paddingTop: 160, paddingBottom: 64,
        paddingLeft: 'clamp(24px, 7vw, 128px)', paddingRight: 'clamp(24px, 7vw, 128px)',
        background: 'linear-gradient(180deg, #121212 0%, #141414 25%, #161616 50%, #181818 75%, #1A1A1A 100%)',
        textAlign: 'center',
      }}>
        <div style={{ opacity: 0, animation: 'fadeUp 0.8s 0.2s forwards' }}>
          <p style={{ fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 300, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '5.5px', marginBottom: 24 }}>
            Get In Touch
          </p>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(42px, 6vw, 72px)', fontWeight: 500, color: '#fff', lineHeight: 1.1, marginBottom: 20 }}>
            Contact Us
          </h1>
          <div style={{ width: 96, height: 2, margin: '0 auto 28px', background: 'linear-gradient(90deg, transparent, #E17100, transparent)' }} />
          <p style={{ fontFamily: 'var(--sans)', fontSize: 18, fontWeight: 400, color: '#D4D4D4', maxWidth: 720, margin: '0 auto', lineHeight: 1.65 }}>
            Ready to restore your leather? Reach out for a consultation or quote. We're here to help preserve your valuable pieces.
          </p>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section style={{ padding: '96px clamp(24px, 7vw, 128px) 96px', background: '#121212' }}>
        <div className="contact-layout" style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>

          {/* LEFT — contact cards */}
          <div style={{ flex: '0 0 auto', width: 'min(480px, 100%)', display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Phone */}
            <Reveal delay={0}>
              <ContactCard
                title="Phone"
                icon={
                  <svg width="24" height="24" fill="none" stroke="#FE9A00" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.25h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6.06 6.06l.98-.98a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                }
              >
                <div style={{ fontFamily: 'var(--sans)', fontSize: 18, color: '#FFB900', marginBottom: 6 }}>
                  {contact?.phone ?? '+1 (312) 555-0199'}
                </div>
                <div style={{ fontFamily: 'var(--sans)', fontSize: 14, color: '#A1A1A1' }}>
                  Mon-Fri: {contact?.hours?.mon_fri ?? '9:00 AM - 6:00 PM'}
                </div>
              </ContactCard>
            </Reveal>

            {/* Email */}
            <Reveal delay={80}>
              <ContactCard
                title="Email"
                icon={
                  <svg width="24" height="24" fill="none" stroke="#FE9A00" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                }
              >
                <div style={{ fontFamily: 'var(--sans)', fontSize: 16, color: '#FFB900', marginBottom: 6 }}>
                  {contact?.email ?? 'info@primeleatherrepair.com'}
                </div>
                <div style={{ fontFamily: 'var(--sans)', fontSize: 14, color: '#A1A1A1' }}>
                  Response within 24 hours
                </div>
              </ContactCard>
            </Reveal>

            {/* Instant Messaging */}
            <Reveal delay={160}>
              <ContactCard
                title="Instant Messaging"
                icon={
                  <svg width="24" height="24" fill="none" stroke="#FE9A00" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                }
              >
                <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                  <a
                    href={contact?.whatsapp ?? `https://wa.me/${(contact?.phone ?? '').replace(/\D/g, '')}`}
                    target="_blank" rel="noreferrer"
                    className="msg-btn"
                    style={{ background: '#00A63E' }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
                    </svg>
                    WhatsApp
                  </a>
                  <a
                    href={contact?.telegram ?? '#'}
                    target="_blank" rel="noreferrer"
                    className="msg-btn"
                    style={{ background: '#155DFC' }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                    </svg>
                    Telegram
                  </a>
                </div>
              </ContactCard>
            </Reveal>

            {/* Location & Hours */}
            <Reveal delay={240}>
              <ContactCard
                title=""
                icon={null}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                  {/* Location */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                      <svg width="16" height="16" fill="none" stroke="#FE9A00" strokeWidth="1.8" viewBox="0 0 24 24">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <span style={{ fontFamily: 'var(--serif)', fontSize: 16, fontWeight: 500, color: '#F5F5F5' }}>Location</span>
                    </div>
                    <div style={{ fontFamily: 'var(--sans)', fontSize: 14, color: '#D4D4D4', lineHeight: 1.65 }}>
                      {addressLine1}<br />{addressLine2}<br />United States
                    </div>
                  </div>
                  {/* Hours */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                      <svg width="16" height="16" fill="none" stroke="#FE9A00" strokeWidth="1.8" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      <span style={{ fontFamily: 'var(--serif)', fontSize: 16, fontWeight: 500, color: '#F5F5F5' }}>Hours</span>
                    </div>
                    <div style={{ fontFamily: 'var(--sans)', fontSize: 14, lineHeight: 1.8 }}>
                      <div><span style={{ color: '#D4D4D4' }}>Mon-Fri: </span><span style={{ color: '#FFD230' }}>{contact?.hours?.mon_fri ?? '9AM-6PM'}</span></div>
                      <div><span style={{ color: '#D4D4D4' }}>Sat: </span><span style={{ color: '#FFD230' }}>{contact?.hours?.saturday ?? '10AM-4PM'}</span></div>
                      <div style={{ color: '#A1A1A1' }}>Sun: Closed</div>
                    </div>
                  </div>
                </div>
              </ContactCard>
            </Reveal>
          </div>

          {/* RIGHT — studio card + map */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Studio card */}
            <Reveal delay={100}>
              <div style={{
                background: '#171717', border: '1.12px solid #262626', borderRadius: 6,
                overflow: 'hidden',
                transition: 'border-color 0.25s',
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(225,113,0,0.4)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#262626'}
              >
                <div style={{ height: 300, overflow: 'hidden' }}>
                  <img
                    src={studioImg || 'https://placehold.co/608x300/171717/404040?text=Our+Studio'}
                    alt="Our Studio"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.5s' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    onError={e => { e.currentTarget.src = 'https://placehold.co/608x300/171717/404040?text=Our+Studio' }}
                  />
                </div>
                <div style={{ padding: '32px 32px 36px' }}>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 500, color: '#F5F5F5', marginBottom: 12 }}>
                    Visit Our Studio
                  </div>
                  <p style={{ fontFamily: 'var(--sans)', fontSize: 14, color: '#A1A1A1', lineHeight: 1.7, marginBottom: 20 }}>
                    Stop by our Chicago workshop to discuss your leather restoration needs. We offer free consultations and are always happy to show you our craftsmanship firsthand.
                  </p>
                  <div style={{ width: 64, height: 2, background: '#E17100' }} />
                </div>
              </div>
            </Reveal>

            {/* Map */}
            <Reveal delay={180}>
              <div style={{ background: '#171717', border: '1.12px solid #262626', borderRadius: 6, overflow: 'hidden' }}>
                <div style={{ padding: '32px 32px 20px', borderBottom: '1.12px solid #262626' }}>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 500, color: '#F5F5F5', marginBottom: 6 }}>
                    Find Us
                  </div>
                  <div style={{ fontFamily: 'var(--sans)', fontSize: 16, color: '#A1A1A1' }}>
                    {contact?.address ?? '123 Craft Street, Chicago, IL 60614'}
                  </div>
                </div>
                <div style={{ height: 380 }}>
                  <iframe
                    title="Studio Location"
                    width="100%"
                    height="100%"
                    style={{ border: 0, display: 'block', filter: 'grayscale(30%) invert(5%)' }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps?q=${encodeURIComponent(contact?.address ?? '123 Craft Street, Chicago, IL 60614')}&output=embed`}
                  />
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* FAB */}
      <a href="tel:+13125550199" style={{
        position: 'fixed', bottom: 32, right: 32, zIndex: 50,
        width: 52, height: 52, borderRadius: '50%', background: 'var(--gold)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 8px 30px rgba(0,0,0,0.4)', transition: 'transform 0.2s',
        textDecoration: 'none',
      }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        aria-label="Call us">
        <svg width="20" height="20" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.25h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6.06 6.06l.98-.98a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      </a>
    </div>
  )
}
