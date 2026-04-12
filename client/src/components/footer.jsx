import React, { useEffect, useMemo, useState } from 'react';
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
      { day: 'Mon - Fri', time: weekdayTime || '9:00AM - 6:00PM' },
      { day: 'Sunday', time: 'Closed' },
    ]
  }, [contact.workingHours])

  return (
    <footer id="contact" className="site-footer" style={{ 
      background: 'var(--bg3)', 
      borderTop: '1px solid var(--border)', 
      padding: 'clamp(56px,7vw,80px) clamp(24px,6vw,100px) 36px' 
    }}>
      <div className="site-footer__grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: '1.5fr 1fr 1fr', 
        gap: 48, 
        marginBottom: 52 
      }}>
        {/* Brand */}
        <div>
          <h3 style={{ fontFamily: 'var(--serif)', fontSize: 26, fontWeight: 400, color: 'var(--gold-pale)', marginBottom: 14 }}>
            Prime Leather Repair
          </h3>
          <p style={{ fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--text-dim)', lineHeight: 1.72, maxWidth: 280, marginBottom: 20 }}>
            Chicago's premier leather restoration specialists. Preserving craftsmanship and extending the life of your finest pieces.
          </p>
          <div style={{ width: 44, height: 2, background: 'var(--gold)' }} />
        </div>

        {/* Contact */}
        <div>
          <h4 style={{ fontFamily: 'var(--sans)', fontSize: 11, fontWeight: 600, color: 'var(--gold-light)', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: 24 }}>
            Contact
          </h4>
          {[
            {
              icon: <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.62 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
              text: contact.phone,
            },
            {
              icon: <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
              text: contact.email,
            },
            {
              icon: <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
              text: contact.address,
            },
          ].map((c, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'flex-start', color: 'var(--text-dim)' }}>
              <span style={{ marginTop: 2, flexShrink: 0 }}>{c.icon}</span>
              <span style={{ fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--text-mid)', lineHeight: 1.5 }}>{c.text}</span>
            </div>
          ))}
        </div>

        {/* Hours */}
        <div>
          <h4 style={{ fontFamily: 'var(--sans)', fontSize: 11, fontWeight: 600, color: 'var(--gold-light)', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: 24 }}>
            Hours
          </h4>
          {footerHours.map((item) => (
            <div key={item.day} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 14 }}>
              <span style={{ fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--text-dim)' }}>
                {item.day}
              </span>
              <span style={{ fontFamily: 'var(--sans)', fontSize: 14, fontWeight: 500, color: item.time === 'Closed' ? '#666' : 'var(--gold-pale)', textAlign: 'right' }}>
                {item.time}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 28, textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--sans)', fontSize: 13, color: '#444' }}>
          © Prime Leather Repair. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
