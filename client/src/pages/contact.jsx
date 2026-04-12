import { useEffect, useRef, useState } from 'react'
import { getContact } from '../services/api'

const STUDIO_PHOTO = 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1600&q=80'

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
        {icon ? (
          <div style={{
            width: 56, height: 56, flexShrink: 0,
            background: 'rgba(123,51,6,0.20)', borderRadius: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {icon}
          </div>
        ) : null}
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

function normalizeContact(data) {
  return {
    phone: data?.phone || '+1 (312) 555-0199',
    email: data?.email || 'info@primeleatherrepair.com',
    address: data?.address || '123 Craft Street, Chicago, IL 60614',
    workingHours: data?.working_hours || 'Mon - Fri: 9:00 AM - 6:00 PM',
    whatsapp: data?.messenger_whatsapp || '',
    telegram: data?.messenger_telegram || '',
  }
}

function getWeekdayHoursLabel(workingHours) {
  const raw = String(workingHours || '').trim()
  return raw.replace(/^(mon|monday)\s*[-–]\s*(fri|friday)\s*:?\s*/i, '').trim() || raw
}

export default function Contact() {
  const [contact, setContact] = useState(() => normalizeContact(null))

  useEffect(() => {
    let alive = true

    getContact()
      .then(({ data }) => {
        if (!alive) return
        setContact(normalizeContact(data))
      })
      .catch(() => {
        if (!alive) return
        setContact(normalizeContact(null))
      })

    return () => {
      alive = false
    }
  }, [])

  const addressLine1 = contact.address.split(',')[0] ?? '123 Craft Street'
  const addressLine2 = contact.address.split(',').slice(1).join(',').trim() ?? 'Chicago, IL 60614'
  const weekdayHours = getWeekdayHoursLabel(contact.workingHours)

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
        @keyframes fadeUp { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
        .contact-layout {
          display: grid;
          grid-template-columns: minmax(320px, 0.95fr) minmax(320px, 1.05fr);
          gap: 32px;
          align-items: stretch;
        }
        .contact-left {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }
        .contact-right {
          display: flex;
          height: 100%;
        }
        .contact-right-shell {
          flex: 1;
          height: 100%;
          background: #171717;
          border: 1.12px solid #262626;
          border-radius: 6px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .contact-split {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }
        @media (max-width: 960px) {
          .contact-layout { grid-template-columns: 1fr; }
          .contact-left { grid-template-columns: 1fr; }
        }
        @media (max-width: 680px) {
          .contact-split { grid-template-columns: 1fr; }
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
        <div className="contact-layout">

          {/* LEFT — contact cards */}
          <div className="contact-left">

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
                  {contact.phone}
                </div>
                <div style={{ fontFamily: 'var(--sans)', fontSize: 14, color: '#A1A1A1' }}>
                  {contact.workingHours}
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
                  {contact.email}
                </div>
                <div style={{ fontFamily: 'var(--sans)', fontSize: 14, color: '#A1A1A1' }}>
                  Response within 24 hours
                </div>
              </ContactCard>
            </Reveal>

            {/* Location & Hours */}
            <Reveal delay={160} style={{ gridColumn: '1 / -1' }}>
              <ContactCard
                title=""
                icon={null}
              >
                <div className="contact-split">
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
                      <div><span style={{ color: '#D4D4D4' }}>Mon - Fri: </span><span style={{ color: '#FFD230' }}>{weekdayHours}</span></div>
                      <div><span style={{ color: '#D4D4D4' }}>Sunday: </span><span style={{ color: '#A1A1A1' }}>Closed</span></div>
                      <div style={{ color: '#A1A1A1' }}>Appointments available by message</div>
                    </div>
                  </div>
                </div>
              </ContactCard>
            </Reveal>
          </div>

          {/* RIGHT — studio card */}
          <div className="contact-right">

            <Reveal delay={100} style={{ height: '100%' }}>
              <div className="contact-right-shell">
                <div style={{ height: 300, overflow: 'hidden' }}>
                  <img
                    src={STUDIO_PHOTO}
                    alt="Our Studio"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block', transition: 'transform 0.5s' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  />
                </div>
                <div style={{ padding: '32px 32px 36px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 500, color: '#F5F5F5', marginBottom: 12 }}>
                    Visit Our Studio
                  </div>
                  <p style={{ fontFamily: 'var(--sans)', fontSize: 14, color: '#A1A1A1', lineHeight: 1.7, marginBottom: 20 }}>
                    Stop by our Chicago workshop to discuss your leather restoration needs. We offer free consultations and are always happy to show you our craftsmanship firsthand.
                  </p>
                  <div style={{ marginTop: 'auto', width: 64, height: 2, background: '#E17100' }} />
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        <Reveal delay={220} style={{ marginTop: 40 }}>
          <div style={{ background: '#171717', border: '1.12px solid #262626', borderRadius: 6, overflow: 'hidden' }}>
            <div style={{ padding: '32px 32px 20px', borderBottom: '1.12px solid #262626', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 500, color: '#F5F5F5', marginBottom: 8 }}>
                Find Us
              </div>
              <div style={{ fontFamily: 'var(--sans)', fontSize: 16, color: '#A1A1A1' }}>
                {contact.address}
              </div>
            </div>
            <div style={{ height: 'min(56vw, 520px)', minHeight: 320 }}>
            <iframe
              title="Studio Location"
              width="100%"
              height="100%"
              style={{ border: 0, display: 'block', filter: 'grayscale(30%) invert(5%)' }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://maps.google.com/maps?q=${encodeURIComponent(contact.address)}&t=k&output=embed`}
            />
            </div>
          </div>
        </Reveal>
      </section>

    </div>
  )
}
