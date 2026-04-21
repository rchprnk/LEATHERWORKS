import heroImg from '../assets/hero.png'
import crafterImg from '../assets/crafter.png'
import commercial1Img from '../assets/commercial-1.png'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCategories, getPortfolio } from '../services/api'

// Функція для анімації появи (залишаємо її тут)
function useReveal() {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); io.disconnect() } },
      { threshold: 0.12 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return [ref, visible]
}

function Reveal({ children, delay = 0, style: outerStyle = {}, className = '' }) {
  const [ref, visible] = useReveal()
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
        ...outerStyle,
      }}
    >
      {children}
    </div>
  )
}

// Константи для контенту (залишаємо)
const WHY_ITEMS = [
  { num: '1', title: 'Preserving Value', desc: 'Professional leather repair is a craft that restores value, durability, and character to worn items.' },
  { num: '2', title: 'Expert Solutions', desc: 'We provide restoration for furniture, automotive interiors, handbags, and apparel, extending the life of leather while preserving its original feel.' },
  { num: '3', title: 'Precision Craft', desc: 'Using industry-proven techniques and precise color matching to bring damaged leather back to life.' },
  { num: '4', title: 'Sustainable Quality', desc: 'Instead of replacing expensive items, we offer a practical, cost-effective, and eco-friendly alternative.' },
]

const DEFAULT_SERVICES = [
  { id: 'bags-wallets', name: 'Bags, Wallets', description: 'Luxury accessories restoration' },
  { id: 'car-seats', name: 'Car Seats', description: 'Automotive interior repair' },
  { id: 'furniture', name: 'Furniture', description: 'Premium furniture restoration' },
]

const SERVICE_VISUALS = {
  accessories: {
    img: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80',
    icon: (
      <svg width="32" height="32" fill="none" stroke="var(--gold)" strokeWidth="1.6" viewBox="0 0 24 24">
        <rect x="2" y="7" width="20" height="14" rx="2"/>
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
        <line x1="12" y1="12" x2="12" y2="16"/>
        <line x1="10" y1="14" x2="14" y2="14"/>
      </svg>
    ),
  },
  automotive: {
    img: 'https://images.unsplash.com/photo-1679945747285-26f0e6569958?w=800&q=80',
    icon: (
      <svg width="32" height="32" fill="none" stroke="var(--gold)" strokeWidth="1.6" viewBox="0 0 24 24">
        <path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h2"/>
        <path d="M19 17h2a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2"/>
        <rect x="5" y="5" width="14" height="14" rx="2"/>
        <circle cx="7.5" cy="17.5" r="1.5"/>
        <circle cx="16.5" cy="17.5" r="1.5"/>
      </svg>
    ),
  },
  furniture: {
    img: 'https://images.unsplash.com/photo-1708869979139-6d4137a12684?w=800&q=80',
    icon: (
      <svg width="32" height="32" fill="none" stroke="var(--gold)" strokeWidth="1.6" viewBox="0 0 24 24">
        <path d="M2 9V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v3"/>
        <path d="M2 11a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v3H2v-3z"/>
        <path d="M4 14v4M20 14v4M4 18h16"/>
      </svg>
    ),
  },
  default: {
    img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
    icon: (
      <svg width="32" height="32" fill="none" stroke="var(--gold)" strokeWidth="1.6" viewBox="0 0 24 24">
        <path d="M7 7h10l2 4-2 6H7l-2-6 2-4z"/>
        <path d="M9 7V5a3 3 0 0 1 6 0v2"/>
      </svg>
    ),
  },
}

function normalizeCategoryKey(name = '') {
  return String(name).trim().toLowerCase()
}

function getServiceVisual(name) {
  const key = normalizeCategoryKey(name)
  const visual = SERVICE_VISUALS[key] || SERVICE_VISUALS.default

  return {
    ...visual,
    icon: SERVICE_VISUALS.default.icon,
  }
}

export default function Home() {
  const [services, setServices] = useState([])
  const [servicesReady, setServicesReady] = useState(false)

  useEffect(() => {
    let alive = true

    Promise.allSettled([getCategories(), getPortfolio({ page: 1, limit: 100 })])
      .then(([categoriesResult, portfolioResult]) => {
        if (!alive) return
        const categoriesData =
          categoriesResult.status === 'fulfilled' && Array.isArray(categoriesResult.value.data)
            ? categoriesResult.value.data
            : []
        const portfolioJson =
          portfolioResult.status === 'fulfilled'
            ? portfolioResult.value.data
            : []
        const works = Array.isArray(portfolioJson?.data)
          ? portfolioJson.data
          : Array.isArray(portfolioJson)
            ? portfolioJson
            : []
        const sourceCategories = categoriesData.length > 0 ? categoriesData : DEFAULT_SERVICES

        setServices(
          sourceCategories.map((category) => {
            const match = works.find(
              (item) => normalizeCategoryKey(item.category) === normalizeCategoryKey(category.name)
            )

            return {
              ...category,
              imageUrl: category.img_categories || match?.after_url || match?.before_url || null,
            }
          })
        )
        setServicesReady(true)
      })
      .catch(() => {
        if (!alive) return
        setServices(DEFAULT_SERVICES)
        setServicesReady(true)
      })

    return () => {
      alive = false
    }
  }, [])

  return (
    <div style={{ background: '#121212', color: '#fff', fontFamily: 'Georgia, serif', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --gold: #E17100;
          --gold-light: #FFB900;
          --gold-pale: #FEF3C6;
          --bg: #121212;
          --bg2: #1A1A1A;
          --bg3: #0D0D0D;
          --border: #2a2a2a;
          --text-dim: #888;
          --text-mid: #ccc;
          --serif: 'Cormorant Garamond', Georgia, serif;
          --sans: 'DM Sans', sans-serif;
        }
        html { scroll-behavior: smooth; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .btn-primary {
          display: inline-flex; align-items: center; gap: 10px;
          padding: 16px 36px;
          background: var(--gold); color: #fff;
          font-family: var(--sans); font-size: 13px; font-weight: 600;
          text-transform: uppercase; letter-spacing: 1.5px;
          border: none; border-radius: 4px; cursor: pointer; text-decoration: none;
          transition: background 0.2s, transform 0.15s;
          box-shadow: 0 8px 28px -6px rgba(200,100,0,0.5);
        }
        .btn-primary:hover { background: #c96000; transform: translateY(-1px); }
        .btn-outline {
          display: inline-flex; align-items: center; gap: 10px;
          padding: 15px 36px;
          background: transparent; color: var(--gold-light);
          font-family: var(--sans); font-size: 13px; font-weight: 600;
          text-transform: uppercase; letter-spacing: 1.5px;
          border: 1.5px solid var(--gold); border-radius: 4px; cursor: pointer; text-decoration: none;
          transition: background 0.2s;
        }
        .btn-outline:hover { background: rgba(225,113,0,0.1); }

        .svc-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        }
        .svc-card {
          position: relative; overflow: hidden; flex: 1;
          min-height: 188px;
          border-right: 1px solid var(--border);
          padding: 18px 22px 14px;
          transition: background 0.3s;
        }
        .svc-card:last-child { border-right: none; }
        .svc-bg {
          position: absolute; inset: 0;
          background-size: cover; background-position: center;
          opacity: 0; transition: opacity 0.5s ease;
        }
        .svc-card:hover .svc-bg { opacity: 0.18; }
        .svc-content { position: relative; z-index: 1; }
        .svc-card--placeholder .svc-content {
          opacity: 0.55;
        }
        .svc-skeleton {
          background: linear-gradient(90deg, rgba(42,42,42,0.9) 0%, rgba(62,62,62,0.95) 50%, rgba(42,42,42,0.9) 100%);
          background-size: 220% 100%;
          animation: shimmer 1.4s ease-in-out infinite;
        }
        @keyframes shimmer {
          0% { background-position: 100% 0; }
          100% { background-position: -100% 0; }
        }
        .svc-title {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-wrap: balance;
          overflow-wrap: anywhere;
          font-size: clamp(24px, 1.5vw, 28px) !important;
          line-height: 1.16 !important;
        }
        .svc-desc {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          overflow-wrap: anywhere;
          word-break: break-word;
          font-size: 15px !important;
          line-height: 1.5 !important;
        }
        .learn-link {
          display: inline-flex; align-items: center; gap: 6px;
          width: 100%;
          justify-content: flex-end;
          font-family: var(--sans); font-size: 14px; font-weight: 500;
          color: var(--gold-light); text-decoration: none; transition: gap 0.2s;
        }
        .svc-card:hover .learn-link { gap: 10px; }
        .home-hero__title {
          overflow-wrap: normal;
          word-break: normal;
        }
        .home-hero__title-line {
          display: block;
          white-space: nowrap;
        }

        .why-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0;
          max-width: 1160px;
          margin: 0 auto;
        }
        .why-col {
          padding: 0 32px;
          border-right: 1px solid var(--border);
        }
        .why-col:first-child { padding-left: 0; }
        .why-col:last-child { border-right: none; padding-right: 0; }

        .bullet-list { list-style: none; }
        .bullet-list li {
          display: flex; align-items: flex-start; gap: 14px;
          padding: 13px 0;
          font-family: var(--sans); font-size: 15px; color: var(--text-mid);
          border-bottom: 1px solid var(--border);
        }
        .bullet-list li:last-child { border-bottom: none; }
        .bullet-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: var(--gold); flex-shrink: 0; margin-top: 6px;
        }

        @media (max-width: 960px) {
          .why-grid { grid-template-columns: 1fr 1fr; }
          .why-col { border-right: none !important; border-bottom: 1px solid var(--border); padding: 0 0 32px 0 !important; margin-bottom: 32px; }
          .why-col:nth-child(2n) { padding-left: 20px !important; }
          .craft-flex, .commercial-flex { flex-direction: column !important; }
          .svc-row { grid-template-columns: 1fr !important; }
          .svc-card { border-right: none; border-bottom: 1px solid var(--border); min-height: 156px; padding: 12px 16px 10px; }
          .svc-card:last-child { border-bottom: none; }
          .svc-content h3 { font-size: 20px !important; }
          .svc-content p { font-size: 14px !important; margin-bottom: 8px !important; }
        }
        @media (min-width: 601px) and (max-width: 1100px) {
          .home-hero {
            height: min(860px, 88vh) !important;
          }
          .home-hero__content {
            top: 61%;
            bottom: auto !important;
            transform: translateY(-50%);
            padding: 0 clamp(34px, 5vw, 56px) !important;
          }
          .home-hero__inner {
            max-width: 560px !important;
          }
          .home-hero__title {
            font-size: clamp(66px, 8.5vw, 82px) !important;
            line-height: 0.98 !important;
            margin-bottom: 20px !important;
          }
          .home-hero__text {
            font-size: 18px !important;
            line-height: 1.6 !important;
            max-width: 440px !important;
            margin-bottom: 30px !important;
          }
          .home-hero__actions {
            margin-top: 10px;
          }
        }
        @media (min-width: 821px) and (max-width: 1280px) {
          .home-hero__inner {
            max-width: 860px !important;
          }
          .home-hero__title {
            font-size: clamp(54px, 6vw, 74px) !important;
            line-height: 1.04 !important;
          }
        }
        @media (max-width: 600px) {
          .home-hero {
            height: 64vh !important;
            min-height: 520px;
          }
          .home-hero__content {
            top: 58%;
            bottom: auto !important;
            transform: translateY(-50%);
            padding: 0 20px !important;
            text-align: center;
          }
          .home-hero__inner {
            max-width: 100% !important;
            margin: 0 auto;
            text-align: center;
          }
          .home-hero__title {
            font-size: clamp(35px, 9vw, 42px) !important;
            line-height: 1.02 !important;
            margin-bottom: 14px !important;
            margin-left: auto;
            margin-right: auto;
          }
          .home-hero__text {
            font-size: 13px !important;
            line-height: 1.55 !important;
            margin: 0 auto 20px !important;
            max-width: 290px !important;
          }
          .home-hero__actions {
            flex-direction: column;
            align-items: center;
            gap: 10px !important;
          }
          .btn-primary,
          .btn-outline {
            width: min(100%, 220px);
            justify-content: center;
            padding: 12px 16px !important;
            font-size: 12px !important;
          }
          .why-grid { grid-template-columns: 1fr; }
          .svc-row { grid-template-columns: 1fr !important; }
          .svc-card {
            min-height: 142px;
            padding: 10px 14px 8px;
            border-bottom: 1px solid var(--border);
          }
          .svc-bg { display: none; }
          .svc-content svg { width: 20px; height: 20px; margin-bottom: 8px; }
          .svc-content h3 { font-size: 19px !important; line-height: 1.16 !important; margin-bottom: 4px !important; }
          .svc-content p { font-size: 13px !important; line-height: 1.45 !important; margin-bottom: 10px !important; }
          .learn-link {
            width: 100%;
            justify-content: flex-end;
            font-size: 11px !important;
            letter-spacing: 0.04em;
          }
        }
      `}</style>

      {/* ── HERO ── */}
      <section className="home-hero" style={{ position: 'relative', height: 'min(920px, 93vh)', overflow: 'hidden' }}>
        <img
          src={heroImg}
          alt="leather craftsman"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(13,13,13,0.88) 0%, rgba(13,13,13,0.45) 60%, rgba(13,13,13,0.1) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(13,13,13,0.5) 0%, transparent 40%, rgba(13,13,13,0.8) 100%)' }} />

        <div className="home-hero__content" style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: '0 clamp(24px, 6vw, 100px) clamp(120px, 12vw, 170px)',
        }}>
          <div className="home-hero__inner" style={{ maxWidth: 680 }}>
            <h1 className="home-hero__title" style={{
              opacity: 0, animation: 'fadeUp 0.8s 0.3s forwards',
              fontFamily: 'var(--serif)', fontSize: 'clamp(44px, 6vw, 82px)',
              fontWeight: 500, lineHeight: 1.12, color: '#fff', marginBottom: 20,
            }}>
              <span className="home-hero__title-line">The Master Art of</span>
              <span className="home-hero__title-line">Leather Restoration</span>
            </h1>
            <p className="home-hero__text" style={{
              opacity: 0, animation: 'fadeUp 0.8s 0.5s forwards',
              fontFamily: 'var(--sans)', fontSize: 16, fontWeight: 300,
              color: 'rgba(220,220,220,0.85)', lineHeight: 1.65, marginBottom: 40, maxWidth: 500,
            }}>
              Premium craftsmanship meets timeless elegance. We restore luxury leather goods with precision and care.
            </p>
            <div className="home-hero__actions" style={{ opacity: 0, animation: 'fadeUp 0.8s 0.65s forwards', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <Link to="/portfolio" className="btn-primary">
                View Our Works →
              </Link>
              <a href="https://wa.me/13125550199" target="_blank" rel="noopener noreferrer" className="btn-outline">
                Contact Expert
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICES ROW ── */}
      <section style={{ background: 'var(--bg2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="svc-row">
          {!servicesReady ? [...Array(3)].map((_, index) => (
            <div key={index} className="svc-card svc-card--placeholder" style={{ pointerEvents: 'none' }}>
              <div className="svc-content">
                <div className="svc-skeleton" style={{ width: 32, height: 32, borderRadius: 6, marginBottom: 14 }} />
                <div className="svc-skeleton" style={{ width: '68%', height: 24, borderRadius: 4, marginBottom: 8 }} />
                <div className="svc-skeleton" style={{ width: '86%', height: 15, borderRadius: 4, marginBottom: 8 }} />
                <div className="svc-skeleton" style={{ width: '58%', height: 15, borderRadius: 4, marginBottom: 26 }} />
                <div className="svc-skeleton" style={{ width: 108, height: 14, borderRadius: 4 }} />
              </div>
            </div>
          )) : services.map((service) => {
            const visual = getServiceVisual(service.name)
            const categoryQuery = encodeURIComponent(service.name)
            const backgroundImage = service.imageUrl || visual.img

            return (
            <div key={service.id ?? service.name} className="svc-card">
              <div className="svc-bg" style={{ backgroundImage: `url(${backgroundImage})` }} />
              <div className="svc-content">
                <div style={{ marginBottom: 14 }}>{visual.icon}</div>
                <h3 className="svc-title" style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 500, color: '#fff', marginBottom: 6 }}>
                  {service.name}
                </h3>
                <p className="svc-desc" style={{ fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--text-dim)', marginBottom: 10, lineHeight: 1.45 }}>
                  {service.description || 'Premium leather restoration tailored to your category.'}
                </p>
                <Link to={`/portfolio?category=${categoryQuery}`} className="learn-link">
                  Learn More →
                </Link>
              </div>
            </div>
          )})}
        </div>
      </section>

      {/* ── CRAFT OF RESTORATION ── */}
      <section style={{ background: 'var(--bg)', padding: 'clamp(80px,10vw,120px) clamp(24px,6vw,100px)' }}>
        <div className="craft-flex" style={{ display: 'flex', gap: 80, alignItems: 'center', maxWidth: 1160, margin: '0 auto' }}>
          <Reveal style={{ flex: '0 0 auto', width: 'min(520px, 100%)' }}>
            <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)', aspectRatio: '4/3' }}>
              <img
                src={crafterImg}
                alt="leather restoration"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.6s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              />
            </div>
          </Reveal>
          <Reveal delay={120} style={{ flex: 1 }}>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(32px,4vw,52px)', fontWeight: 500, color: '#fff', lineHeight: 1.15, marginBottom: 28 }}>
              The Craft of Restoration
            </h2>
            <p style={{ fontFamily: 'var(--sans)', fontSize: 16, color: 'var(--text-mid)', lineHeight: 1.78, marginBottom: 20 }}>
              At Prime Leather Repair, we treat every piece as a work of art. Our master craftsmen bring decades of combined experience to restore your valued leather items to their original glory.
            </p>
            <p style={{ fontFamily: 'var(--sans)', fontSize: 16, color: 'var(--text-dim)', lineHeight: 1.78, marginBottom: 40 }}>
              From color matching to texture restoration, we use only premium materials and time-tested techniques to ensure lasting results.
            </p>
            <Link to="/portfolio" className="btn-primary">See Our Portfolio</Link>
          </Reveal>
        </div>
      </section>

      {/* ── COMMERCIAL SERVICES ── */}
      <section style={{ background: 'var(--bg2)', borderTop: '1px solid var(--border)', padding: 'clamp(80px,10vw,120px) clamp(24px,6vw,100px)' }}>
        <div className="commercial-flex" style={{ display: 'flex', gap: 80, alignItems: 'center', maxWidth: 1160, margin: '0 auto' }}>
          <Reveal style={{ flex: 1 }}>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(32px,4vw,52px)', fontWeight: 500, color: '#fff', lineHeight: 1.15, marginBottom: 28 }}>
              Commercial Services
            </h2>
            <p style={{ fontFamily: 'var(--sans)', fontSize: 16, color: 'var(--text-mid)', lineHeight: 1.78, marginBottom: 32 }}>
              We partner with luxury hotels, car dealerships, and furniture retailers to maintain their premium leather inventory. Our commercial services ensure your business assets always look their best.
            </p>
            <ul className="bullet-list" style={{ marginBottom: 44 }}>
              {['Fleet vehicle interior restoration', 'Hotel and restaurant furniture maintenance', 'Retail inventory touch-ups'].map(item => (
                <li key={item}>
                  <span className="bullet-dot" />
                  {item}
                </li>
              ))}
            </ul>
            <Link to="/contact" className="btn-outline">Request Quote</Link>
          </Reveal>

          <Reveal delay={120} style={{ flex: '0 0 auto', width: 'min(520px, 100%)' }}>
            <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)', aspectRatio: '4/3' }}>
              <img
                src={commercial1Img}
                alt="commercial leather service"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.6s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── WHY CHOOSE US ── */}
      <section style={{ background: 'var(--bg)', borderTop: '1px solid var(--border)', padding: 'clamp(80px,10vw,120px) clamp(24px,6vw,100px)' }}>
        <Reveal style={{ textAlign: 'center', marginBottom: 72 }}>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(30px,4vw,50px)', fontWeight: 500, color: '#fff', marginBottom: 16 }}>
            Why Choose Prime Leather Repair
          </h2>
          <p style={{ fontFamily: 'var(--sans)', fontSize: 15, color: 'var(--text-dim)' }}>
            Excellence in every stitch, dedication in every detail
          </p>
        </Reveal>

<div className="why-grid">
  {WHY_ITEMS.map((item, i) => (
    <Reveal key={item.num} delay={i * 80}>
      
      <div className="why-col" style={{
        position: 'relative',
        paddingLeft: 60
      }}>

        {/* Велика цифра */}
        <div style={{
          position: 'absolute',
          left: 0,
          top: 0,
          fontFamily: 'var(--serif)',
          fontSize: 90,
          color: 'rgba(225,113,0,0.15)',
          lineHeight: 1
        }}>
          {item.num}
        </div>

        {/* Заголовок */}
        <h3 style={{ 
          fontFamily: 'var(--serif)',
          fontSize: 22,
          fontWeight: 500, 
          color: 'var(--gold-light)',
          marginBottom: 14,
          lineHeight: 1.3 
        }}>
          {item.title}
        </h3>

        {/* Текст */}
        <p style={{ 
          fontFamily: 'var(--sans)',
          fontSize: 14,
          color: 'var(--text-dim)', 
          lineHeight: 1.75
        }}>
          {item.desc}
        </p>

      </div>

    </Reveal>
  ))}
</div>
      </section>

    </div>
  )
}
