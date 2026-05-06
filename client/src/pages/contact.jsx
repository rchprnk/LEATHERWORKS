import { useEffect, useState } from 'react'
import { getContact } from '../services/api'

const STUDIO_PHOTO = 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1600&q=80'

function normalizeContact(data) {
  return {
    phone: data?.phone || '',
    email: data?.email || '',
    address: data?.address || '',
    workingHours: data?.working_hours || '',
    whatsapp: data?.messenger_whatsapp || '',
  }
}

function extractWhatsAppLink(value) {
  if (!value) return ''
  if (value.startsWith('http')) return value
  const digits = value.replace(/[^\d]/g, '')
  return digits ? `https://wa.me/${digits}` : ''
}

function getMapSrc(address) {
  return `https://www.google.com/maps?q=${encodeURIComponent(address)}&t=k&z=17&output=embed`
}

function getAddressLines(address) {
  const parts = String(address || '').split(',').map((part) => part.trim()).filter(Boolean)
  if (parts.length <= 1) return [address]
  return [parts[0], parts.slice(1).join(', ')]
}

function getWeekdayHours(workingHours) {
  return String(workingHours || '').replace(/^(mon|monday)\s*[-–]\s*(fri|friday)\s*:?\s*/i, '').trim() || workingHours
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

  const whatsappLink = extractWhatsAppLink(contact.whatsapp)
  const mapSrc = getMapSrc(contact.address)
  const addressLines = getAddressLines(contact.address)
  const weekdayHours = getWeekdayHours(contact.workingHours)

  return (
    <div className="site-shell">
      <style>{`
        .contact-page {
          background:
            radial-gradient(circle at top left, rgba(214, 209, 230, 0.16), transparent 28%),
            radial-gradient(circle at bottom right, rgba(232, 199, 200, 0.16), transparent 28%),
            var(--bg-main);
        }
        .contact-layout {
          display: grid;
          grid-template-columns: minmax(320px, 0.95fr) minmax(360px, 1.05fr);
          gap: 26px;
          align-items: stretch;
        }
        .contact-stack {
          display: grid;
          gap: 22px;
        }
        .contact-info-card,
        .contact-studio-card,
        .contact-find-card {
          overflow: hidden;
          background: rgba(244, 234, 223, 0.84);
          border: 1px solid rgba(198, 169, 107, 0.2);
          border-radius: 8px;
          box-shadow: 0 18px 42px rgba(56, 39, 26, 0.08);
        }
        .contact-info-card {
          min-height: 126px;
          padding: 30px;
          display: flex;
          align-items: center;
          gap: 22px;
        }
        .contact-icon {
          width: 58px;
          height: 58px;
          flex: 0 0 auto;
          border-radius: 8px;
          display: grid;
          place-items: center;
          background: rgba(198, 169, 107, 0.16);
          color: #9a7126;
        }
        .contact-info-card h3,
        .contact-detail h3,
        .contact-studio-copy h3,
        .contact-find-card h2 {
          margin: 0;
          font-family: var(--font-display);
          color: var(--text-primary);
          line-height: 1;
        }
        .contact-info-card h3,
        .contact-detail h3,
        .contact-studio-copy h3 {
          font-size: 1.6rem;
        }
        .contact-info-card a,
        .contact-accent {
          color: #9a7126;
          font-weight: 700;
          text-decoration: none;
        }
        .contact-info-card p,
        .contact-detail p,
        .contact-studio-copy p,
        .contact-find-card p {
          margin: 0;
          color: var(--text-secondary);
          line-height: 1.72;
        }
        .contact-info-card__body {
          display: grid;
          gap: 8px;
        }
        .contact-detail-card {
          min-height: 176px;
          padding: 30px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          align-items: center;
        }
        .contact-detail {
          display: grid;
          gap: 12px;
        }
        .contact-detail__heading {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .contact-detail__heading .contact-mini-icon {
          color: #9a7126;
          display: inline-flex;
        }
        .contact-studio-card {
          display: grid;
          grid-template-rows: minmax(300px, 0.98fr) auto;
          min-height: 100%;
        }
        .contact-studio-card img {
          width: 100%;
          height: 100%;
          min-height: 300px;
          object-fit: cover;
          display: block;
        }
        .contact-studio-copy {
          padding: 30px;
          display: grid;
          gap: 16px;
        }
        .contact-rule {
          width: 70px;
          height: 3px;
          background: #9a7126;
          margin-top: 4px;
        }
        .contact-actions {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
          margin-top: 4px;
        }
        .contact-actions .premium-button {
          color: #fff;
        }
        .contact-actions .premium-button-outline {
          color: var(--text-primary);
        }
        .contact-find-card {
          margin-top: 30px;
          display: grid;
          text-align: center;
        }
        .contact-find-card__head {
          padding: 30px 24px 24px;
          display: grid;
          gap: 10px;
          justify-items: center;
        }
        .contact-find-card h2 {
          font-size: clamp(2rem, 3.8vw, 3rem);
        }
        .contact-find-card__head p {
          font-size: 0.98rem;
        }
        .contact-find-card iframe {
          width: 100%;
          height: min(46vw, 420px);
          min-height: 300px;
          border: 0;
          display: block;
          filter: saturate(0.78) contrast(0.94);
        }
        @media (max-width: 980px) {
          .contact-layout {
            grid-template-columns: 1fr;
          }
          .contact-studio-card {
            min-height: auto;
          }
        }
        @media (max-width: 640px) {
          .contact-info-card {
            align-items: flex-start;
            padding: 24px;
          }
          .contact-detail-card {
            grid-template-columns: 1fr;
            padding: 24px;
          }
          .contact-studio-card {
            display: block;
            position: relative;
            background: rgba(224, 210, 190, 0.94);
          }
          .contact-studio-card img {
            height: 320px;
            min-height: 0;
            object-position: center;
            filter: saturate(0.86) contrast(0.94);
          }
          .contact-studio-copy {
            margin: 0;
            padding: 22px;
            border-radius: 0;
            background: rgba(244, 234, 223, 0.96);
            border: 0;
            box-shadow: none;
            backdrop-filter: none;
          }
          .contact-studio-copy h3 {
            color: var(--text-primary);
            font-size: 1.55rem;
          }
          .contact-studio-copy p {
            color: #3f3a34;
            font-size: 0.94rem;
            line-height: 1.48;
          }
          .contact-studio-copy .contact-rule {
            width: 52px;
            height: 2px;
          }
          .contact-studio-copy .premium-button {
            min-height: 48px;
          }
        }
      `}</style>

      <div className="contact-page">
        <section className="section-block" style={{ paddingTop: 148 }}>
          <div className="site-container" style={{ textAlign: 'center' }}>
            <div className="section-kicker">Contact</div>
            <h1 className="section-title" style={{ maxWidth: 760, margin: '0 auto' }}>
              Send us a photo and get a quote today
            </h1>
            <p className="section-copy" style={{ maxWidth: 700, margin: '0 auto' }}>
              The fastest way to start is simple: send a few photos of your handbag, wallet, or leather accessory and we will guide you with a clear next step.
            </p>
          </div>
        </section>

        <section className="section-block" style={{ paddingTop: 0 }}>
          <div className="site-container contact-layout">
            <div className="contact-stack">
              <div className="contact-info-card">
                <div className="contact-icon" aria-hidden="true">
                  <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.25h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11l-.94.94a16 16 0 0 0 6.06 6.06l.94-.94a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <div className="contact-info-card__body">
                  <h3>Phone</h3>
                  <a href={`tel:${contact.phone.replace(/[^\d+]/g, '')}`}>{contact.phone}</a>
                  <p>{weekdayHours}</p>
                </div>
              </div>

              <div className="contact-info-card">
                <div className="contact-icon" aria-hidden="true">
                  <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <path d="m22 6-10 7L2 6" />
                  </svg>
                </div>
                <div className="contact-info-card__body">
                  <h3>Email</h3>
                  <a href={`mailto:${contact.email}`}>{contact.email}</a>
                  <p>Response within 24 hours</p>
                </div>
              </div>

              <div className="contact-info-card contact-detail-card">
                <div className="contact-detail">
                  <div className="contact-detail__heading">
                    <span className="contact-mini-icon" aria-hidden="true">
                      <svg width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                    </span>
                    <h3>Location</h3>
                  </div>
                  <p>
                    {addressLines.map((line) => (
                      <span key={line}>{line}<br /></span>
                    ))}
                    United States
                  </p>
                </div>
                <div className="contact-detail">
                  <div className="contact-detail__heading">
                    <span className="contact-mini-icon" aria-hidden="true">
                      <svg width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 6v6l4 2" />
                      </svg>
                    </span>
                    <h3>Hours</h3>
                  </div>
                  <p>Mon - Fri: <span className="contact-accent">{weekdayHours}</span></p>
                  <p>Sunday: Closed</p>
                  <p>Appointments available by message</p>
                </div>
              </div>
            </div>

            <div className="contact-studio-card">
              <img src={STUDIO_PHOTO} alt="Studio consultation table" />
              <div className="contact-studio-copy">
                <h3>Visit Our Studio</h3>
                <p>Send a few photos of your leather item, or stop by to talk through the repair in person.</p>
                <div className="contact-rule" />
                <div className="contact-actions">
                  <a className="premium-button" href={`mailto:${contact.email}`}>Send Photos</a>
                  {whatsappLink ? (
                    <a className="premium-button-outline" href={whatsappLink} target="_blank" rel="noreferrer">WhatsApp</a>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className="site-container">
            <div className="contact-find-card">
              <div className="contact-find-card__head">
                <h2>Find Us</h2>
                <p>{contact.address}</p>
              </div>
              <iframe
                title={`Map for ${contact.address}`}
                src={mapSrc}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
