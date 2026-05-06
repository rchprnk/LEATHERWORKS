import { useEffect, useMemo, useState } from 'react'
import { getContact } from '../services/api'

export function Footer() {
  const [contact, setContact] = useState({
    phone: '+1 (312) 555-0199',
    email: 'info@primeleatherrepair.com',
    address: '123 Craft Street, Chicago, IL 60614',
    workingHours: 'Mon - Fri: 9:00 AM - 6:00 PM',
  })

  useEffect(() => {
    let alive = true

    getContact()
      .then(({ data }) => {
        if (!alive) return
        setContact({
          phone: data?.phone || '+1 (312) 555-0199',
          email: data?.email || 'info@primeleatherrepair.com',
          address: data?.address || '123 Craft Street, Chicago, IL 60614',
          workingHours: data?.working_hours || 'Mon - Fri: 9:00 AM - 6:00 PM',
        })
      })
      .catch(() => {})

    return () => {
      alive = false
    }
  }, [])

  const footerHours = useMemo(() => {
    const raw = String(contact.workingHours || '').trim()
    const weekdayTime =
      raw.replace(/^(mon|monday)\s*[-–]\s*(fri|friday)\s*:?\s*/i, '').trim() || raw

    return [
      { day: 'Mon - Fri', time: weekdayTime || '9:00 AM - 6:00 PM' },
      { day: 'Sunday', time: 'Closed' },
    ]
  }, [contact.workingHours])

  return (
    <footer
      className="site-footer"
      style={{
        background: 'linear-gradient(180deg, rgba(234,223,206,0.96), rgba(228,215,198,0.98))',
        borderTop: '1px solid rgba(198, 169, 107, 0.18)',
        padding: '72px 0 28px',
      }}
    >
      <div className="site-container">
        <div className="site-footer__grid" style={{ marginBottom: 40 }}>
          <div style={{ padding: 12 }}>
            <div className="section-kicker">Prime Leather Repair</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.75rem, 3vw, 2.15rem)', lineHeight: 1.05, margin: '12px 0 10px', color: 'var(--text-primary)' }}>
              Prime Leather Repair
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', lineHeight: 1.62, margin: 0 }}>
              Chicago’s premium leather restoration service for handbags, wallets, and favorite accessories. Careful craftsmanship and elegant results.
            </p>
            <div style={{ width: 48, height: 2, background: 'var(--accent-gold)', marginTop: 18 }} />
          </div>

          <div style={{ padding: 12 }}>
            <div className="section-kicker">Contact</div>
            <div style={{ display: 'grid', gap: 14, marginTop: 18 }}>
              <a href={`tel:${contact.phone.replace(/[^\d+]/g, '')}`} style={{ color: 'var(--text-primary)', textDecoration: 'none', fontSize: '0.98rem', fontWeight: 600 }}>
                {contact.phone}
              </a>
              <a href={`mailto:${contact.email}`} style={{ color: 'var(--text-primary)', textDecoration: 'none', fontSize: '0.98rem', fontWeight: 600 }}>
                {contact.email}
              </a>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.96rem', lineHeight: 1.62 }}>{contact.address}</span>
            </div>
          </div>

          <div style={{ padding: 12 }}>
            <div className="section-kicker">Hours</div>
            <div style={{ display: 'grid', gap: 12, marginTop: 18 }}>
              {footerHours.map((item) => (
                <div key={item.day} style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{item.day}</span>
                  <span style={{ color: item.time === 'Closed' ? 'var(--text-secondary)' : 'var(--text-primary)', fontWeight: 600 }}>
                    {item.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ paddingTop: 20, borderTop: '1px solid rgba(26, 26, 26, 0.08)', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
          Leather repair Chicago • Mobile leather repair • Couch repair near me
        </div>
      </div>
    </footer>
  )
}
