import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCategories } from '../services/api'

const HERO_BG = 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=1600&q=80'
const CRAFT_PHOTO = 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=80'

function useReveal() {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.12 }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return [ref, visible]
}

function Reveal({ children, delay = 0, style = {}, className = '' }) {
  const [ref, visible] = useReveal()

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

function getCategoryVisual(name = '') {
  const key = String(name).toLowerCase()
  if (/(bag|wallet|accessor)/i.test(key)) {
    return 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=900&q=80'
  }
  if (/(small|goods|shoe|boot)/i.test(key)) {
    return 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=900&q=80'
  }
  return 'https://images.unsplash.com/photo-1614179689702-355944cd0918?auto=format&fit=crop&w=900&q=80'
}

function CategoryIcon({ name = '' }) {
  const key = String(name).toLowerCase()

  if (/(car|auto|seat)/i.test(key)) {
    return (
      <svg width="34" height="34" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M5 17h14l-1.3-5.2A2.4 2.4 0 0 0 15.4 10H8.6a2.4 2.4 0 0 0-2.3 1.8L5 17Z" />
        <path d="M7 17v2" />
        <path d="M17 17v2" />
        <path d="M8 14h.01" />
        <path d="M16 14h.01" />
      </svg>
    )
  }

  if (/(furniture|sofa|couch|chair)/i.test(key)) {
    return (
      <svg width="34" height="34" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M6 11V8a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v3" />
        <path d="M4 12h16a2 2 0 0 1 2 2v4H2v-4a2 2 0 0 1 2-2Z" />
        <path d="M5 18v2" />
        <path d="M19 18v2" />
      </svg>
    )
  }

  return (
    <svg width="34" height="34" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <rect x="5" y="7" width="14" height="13" rx="2" />
      <path d="M9 7V5a3 3 0 0 1 6 0v2" />
      <path d="M8 11h8" />
    </svg>
  )
}

export default function Home() {
  const [services, setServices] = useState([])
  const [servicesLoading, setServicesLoading] = useState(true)
  const visibleServices = services.slice(0, 3)

  useEffect(() => {
    let alive = true

    getCategories()
      .then(({ data }) => {
        if (!alive) return

        if (Array.isArray(data) && data.length) {
          setServices(
            data.slice(0, 3).map((item) => ({
              id: item.id || item.name,
              name: item.name,
              description: item.description || 'Thoughtful restoration for the leather pieces you use and love most.',
              imageUrl: item.img_categories || getCategoryVisual(item.name),
            }))
          )
        }
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setServicesLoading(false)
      })

    return () => {
      alive = false
    }
  }, [])

  return (
    <div className="site-shell">
      <style>{`
        .home-page {
          background:
            linear-gradient(180deg, rgba(239, 229, 217, 0.96), rgba(236, 224, 210, 0.98)),
            var(--bg-main);
        }
        .hero-shell {
          position: relative;
          overflow: hidden;
          min-height: 100svh;
          background:
            linear-gradient(90deg, rgba(17, 13, 11, 0.9) 0%, rgba(17, 13, 11, 0.74) 38%, rgba(17, 13, 11, 0.28) 68%, rgba(17, 13, 11, 0.04) 100%),
            url('${HERO_BG}') center/cover no-repeat;
          box-shadow: none;
        }
        .hero-grid {
          width: min(1160px, calc(100vw - 40px));
          min-height: 100svh;
          margin: 0 auto;
          padding-top: calc(78px + var(--safe-area-top, 0px));
          display: grid;
          grid-template-columns: minmax(0, 0.94fr) minmax(0, 1.06fr);
          align-items: center;
        }
        .hero-copy {
          padding: clamp(34px, 5vw, 58px);
          display: grid;
          gap: 22px;
          color: #f4eadf;
          max-width: 640px;
          padding-left: clamp(28px, 4vw, 44px);
          padding-right: clamp(24px, 3vw, 34px);
          border-radius: 0;
          background: linear-gradient(135deg, rgba(17, 13, 11, 0.7), rgba(17, 13, 11, 0.22));
          box-shadow: none;
          backdrop-filter: blur(10px);
        }
        .hero-copy .section-title {
          color: #fff8f1;
          max-width: 520px;
          text-shadow: 0 14px 34px rgba(0, 0, 0, 0.34);
          font-size: clamp(3.6rem, 5.2vw, 5.2rem);
        }
        .hero-copy .section-copy {
          color: rgba(255, 246, 236, 0.94);
          max-width: 540px;
          font-size: 1.08rem;
        }
        .hero-copy .premium-chip {
          background: rgba(198, 169, 107, 0.22);
          color: #f6e8d5;
          border: 1px solid rgba(198, 169, 107, 0.24);
        }
        .hero-actions {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
        }
        .hero-note {
          display: flex;
          align-items: center;
          gap: 12px;
          color: rgba(255, 246, 236, 0.9);
          font-size: 0.98rem;
        }
        .hero-note::before {
          content: '';
          width: 44px;
          height: 1px;
          background: linear-gradient(90deg, rgba(198, 169, 107, 0.9), transparent);
        }
        .services-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0;
          border-top: 1px solid rgba(198, 169, 107, 0.24);
          border-bottom: 1px solid rgba(198, 169, 107, 0.24);
        }
        .service-card {
          height: 100%;
          min-height: 188px;
          padding: 30px 34px;
          display: grid;
          align-content: center;
          gap: 14px;
          color: var(--text-primary);
          background: rgba(244, 234, 223, 0.44);
          border: 0;
          border-right: 1px solid rgba(198, 169, 107, 0.22);
          box-shadow: none;
          text-decoration: none;
          transition: background 0.22s ease, transform 0.22s ease;
        }
        .service-card:last-child {
          border-right: 0;
        }
        .service-card:hover {
          background: rgba(244, 234, 223, 0.72);
          transform: translateY(-2px);
        }
        .service-card__icon {
          color: #9a7126;
          display: inline-flex;
        }
        .service-card h3 {
          margin: 0;
          font-family: var(--font-display);
          font-size: 1.7rem;
          line-height: 1;
          color: var(--text-primary);
        }
        .service-card p {
          margin: 0;
          color: var(--text-secondary);
          line-height: 1.55;
        }
        .service-card__link {
          margin-top: 8px;
          color: #9a7126;
          font-size: 0.92rem;
          font-weight: 700;
        }
        .service-card--loading {
          pointer-events: none;
        }
        .service-skeleton {
          width: 100%;
          border-radius: 999px;
          background: linear-gradient(90deg, rgba(198, 169, 107, 0.12), rgba(244, 234, 223, 0.72), rgba(198, 169, 107, 0.12));
          background-size: 220% 100%;
          animation: serviceShimmer 1.25s ease-in-out infinite;
        }
        .service-skeleton--icon {
          width: 34px;
          height: 34px;
          border-radius: 8px;
        }
        .service-skeleton--title {
          height: 25px;
          max-width: 180px;
        }
        .service-skeleton--text {
          height: 14px;
          max-width: 260px;
        }
        .service-skeleton--link {
          height: 14px;
          max-width: 106px;
          margin-top: 8px;
        }
        .services-empty {
          grid-column: 1 / -1;
          padding: 30px 34px;
          color: var(--text-secondary);
          background: rgba(244, 234, 223, 0.44);
          text-align: center;
        }
        @keyframes serviceShimmer {
          0% { background-position: 100% 0; }
          100% { background-position: -100% 0; }
        }
        .craft-section {
          padding-top: 42px;
        }
        .craft-panel {
          display: grid;
          grid-template-columns: minmax(280px, 0.9fr) minmax(0, 1fr);
          gap: clamp(34px, 6vw, 72px);
          align-items: center;
        }
        .craft-image {
          overflow: hidden;
          aspect-ratio: 4 / 3;
          border-radius: 8px;
          border: 1px solid rgba(198, 169, 107, 0.2);
          box-shadow: 0 24px 54px rgba(56, 39, 26, 0.14);
        }
        .craft-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          filter: saturate(0.95) contrast(0.96);
        }
        .craft-copy {
          display: grid;
          gap: 18px;
        }
        .craft-copy .section-title {
          font-size: clamp(2.4rem, 5vw, 4.3rem);
          max-width: 680px;
        }
        .craft-copy .section-copy {
          max-width: 640px;
        }
        .cta-panel {
          padding: clamp(34px, 6vw, 64px) clamp(24px, 7vw, 72px);
          display: grid;
          justify-items: center;
          gap: 18px;
          text-align: center;
          background: rgba(244, 234, 223, 0.72);
          border-radius: 28px;
        }
        .cta-panel .section-kicker {
          justify-self: center;
        }
        .cta-panel .section-title {
          max-width: 760px;
          margin: 0 auto;
          font-size: clamp(2.6rem, 5.8vw, 5.1rem);
        }
        .cta-panel .section-copy {
          max-width: 700px;
          margin: 0 auto;
          text-align: center;
        }
        .cta-actions {
          display: flex;
          gap: 14px;
          justify-content: center;
          flex-wrap: wrap;
          margin-top: 4px;
        }
        @media (max-width: 980px) {
          .hero-grid,
          .services-grid,
          .craft-panel {
            grid-template-columns: 1fr;
          }
          .services-grid {
            gap: 0;
          }
          .service-card {
            min-height: 156px;
            border-right: 0;
            border-bottom: 1px solid rgba(198, 169, 107, 0.22);
            padding: 24px;
          }
          .service-card:last-child {
            border-bottom: 0;
          }
          .hero-shell {
            min-height: auto;
          }
          .hero-grid {
            min-height: auto;
            width: min(100%, calc(100vw - 32px));
            padding-top: calc(90px + var(--safe-area-top, 0px));
            padding-bottom: 42px;
          }
          .hero-copy {
            padding-left: clamp(24px, 5vw, 30px);
            padding-right: clamp(20px, 5vw, 26px);
            max-width: none;
          }
          .cta-panel .section-title {
            font-size: clamp(2.3rem, 11vw, 3.8rem);
          }
        }
      `}</style>

      <div className="home-page">
        <section className="hero-shell">
          <div className="hero-grid">
            <Reveal className="hero-copy">
              <div className="premium-chip">Leather Bags & Wallets</div>
              <h1 className="section-title">Professional leather restoration</h1>
              <p className="section-copy">
                We restore handbags, wallets, and favorite leather accessories with careful detail work, natural color balance, and a premium finish that feels elegant instead of overworked.
              </p>
              <div className="hero-actions">
                <a className="premium-button" href="/contact">Send Photo for Free Quote</a>
                <Link className="premium-button-outline" to="/portfolio">View Our Works</Link>
              </div>
              <div className="hero-note">Focused on handbags, wallets, and everyday leather favorites</div>
            </Reveal>
          </div>
        </section>

        <section className="section-block">
          <div className="site-container">
            <div className="section-heading">
              <div className="section-kicker">Categories</div>
              <h2 className="section-title" style={{ maxWidth: 760 }}>Choose the category you want restored</h2>
              <p className="section-copy">
                Start with the category that matches your piece, then go straight to our works and see real restoration examples.
              </p>
            </div>

            <div className="services-grid">
              {servicesLoading ? (
                [0, 1, 2].map((item) => (
                  <div key={item} className="service-card service-card--loading">
                    <span className="service-skeleton service-skeleton--icon" />
                    <span className="service-skeleton service-skeleton--title" />
                    <span className="service-skeleton service-skeleton--text" />
                    <span className="service-skeleton service-skeleton--text" style={{ maxWidth: 210 }} />
                    <span className="service-skeleton service-skeleton--link" />
                  </div>
                ))
              ) : visibleServices.length ? (
                visibleServices.map((service, index) => (
                <Reveal key={service.id || service.name} delay={index * 80}>
                  <Link
                    className="surface-card service-card"
                    to={`/portfolio?category=${encodeURIComponent(service.name)}`}
                  >
                    <span className="service-card__icon" aria-hidden="true">
                      <CategoryIcon name={service.name} />
                    </span>
                    <h3>{service.name}</h3>
                    <p>{service.description}</p>
                    <span className="service-card__link">Learn More -&gt;</span>
                  </Link>
                </Reveal>
                ))
              ) : (
                <div className="services-empty">Categories are not available yet.</div>
              )}
            </div>
          </div>
        </section>

        <section className="section-block craft-section">
          <div className="site-container">
            <div className="craft-panel">
              <Reveal>
                <div className="craft-image">
                  <img src={CRAFT_PHOTO} alt="Leather restoration detail" />
                </div>
              </Reveal>
              <Reveal delay={120} className="craft-copy">
                <div className="section-kicker">Craft</div>
                <h2 className="section-title">The Craft of Restoration</h2>
                <p className="section-copy">
                  At Prime Leather Repair, we treat every piece as a work of art. Our careful craftsmen bring dedicated experience to restore your valued leather items to their original character.
                </p>
                <p className="section-copy">
                  From color matching to texture restoration, we use premium materials and time-tested techniques to ensure lasting results.
                </p>
                <div>
                  <Link className="premium-button" to="/portfolio">See Our Portfolio</Link>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="section-block" style={{ paddingTop: 0 }}>
          <div className="site-container">
            <div className="surface-card cta-panel">
              <div className="section-kicker">Get Started</div>
              <h2 className="section-title">Send a photo and get a quote for your leather piece</h2>
              <p className="section-copy">
                Share a few pictures of your handbag, wallet, or accessory and we will guide you with a quick quote and the easiest next step.
              </p>
              <div className="cta-actions">
                <a className="premium-button" href="/contact">Get Your Free Quote</a>
                <Link className="premium-button-outline" to="/reviews">Read Reviews</Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
