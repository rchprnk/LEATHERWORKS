import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCategories, getPortfolio } from '../services/api'

const HERO_BG = 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=1600&q=80'

const DEFAULT_SERVICES = [
  {
    id: 'bags',
    name: 'Bags & Wallets',
    description: 'Luxury handbags and wallets restored with careful color work and a clean boutique finish.',
    imageUrl: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'small-goods',
    name: 'Small Leather Goods',
    description: 'Scuffs, fading, edge wear, and daily damage repaired without losing the original feel.',
    imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'accessories',
    name: 'Accessories Care',
    description: 'Favorite leather pieces refreshed with careful detail work and a softer, more premium final look.',
    imageUrl: 'https://images.unsplash.com/photo-1614179689702-355944cd0918?auto=format&fit=crop&w=900&q=80',
  },
]

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

export default function Home() {
  const [services, setServices] = useState(DEFAULT_SERVICES)
  const [results, setResults] = useState([])
  const visibleServices = services.slice(0, 3)
  const serviceCount = Math.max(1, Math.min(visibleServices.length, 3))

  useEffect(() => {
    let alive = true

    Promise.allSettled([getCategories(), getPortfolio({ page: 1, limit: 6 })])
      .then(([categoriesResult, portfolioResult]) => {
        if (!alive) return

        const categories =
          categoriesResult.status === 'fulfilled' && Array.isArray(categoriesResult.value.data)
            ? categoriesResult.value.data
            : []

        const payload = portfolioResult.status === 'fulfilled' ? portfolioResult.value.data : null
        const items = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : []

        if (categories.length) {
          setServices(
            categories.slice(0, 3).map((item) => ({
              id: item.id || item.name,
              name: item.name,
              description: item.description || 'Thoughtful restoration for the leather pieces you use and love most.',
              imageUrl: item.img_categories || getCategoryVisual(item.name),
            }))
          )
        }

        if (items.length) {
          setResults(items.slice(0, 3))
        }
      })
      .catch(() => {})

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
        .services-grid,
        .results-grid {
          display: grid;
          gap: 22px;
          align-items: stretch;
        }
        .services-grid {
          grid-template-columns: repeat(var(--service-count, 3), minmax(0, 280px));
          justify-content: center;
        }
        .results-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
        .service-card,
        .result-card {
          height: 100%;
          overflow: hidden;
          background: #1d1713;
          border: 0 !important;
          outline: 0;
          box-shadow: 0 18px 34px rgba(42, 29, 20, 0.08);
        }
        .service-card {
          text-decoration: none;
          max-width: 280px;
          transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
        }
        .service-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 22px 40px rgba(42, 29, 20, 0.12);
        }
        .service-card__image,
        .result-panel {
          overflow: hidden;
          background: transparent;
          line-height: 0;
        }
        .service-card__image {
          aspect-ratio: 1 / 0.82;
        }
        .service-card__image img,
        .result-panel img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transform: scale(1.01);
          backface-visibility: hidden;
        }
        .service-card__content,
        .result-card__content {
          padding: 24px;
          display: grid;
          gap: 12px;
        }
        .service-card__content {
          padding: 16px;
          gap: 8px;
          background: linear-gradient(180deg, #201812 0%, #17110d 100%);
        }
        .service-card__content h3,
        .result-card__content h3 {
          margin: 0;
          font-family: var(--font-display);
          font-size: 1.95rem;
          line-height: 1;
          color: #fff7ef;
        }
        .service-card__content h3 {
          font-size: 1.35rem;
        }
        .service-card__content p,
        .result-card__content p {
          margin: 0;
          color: rgba(255, 244, 232, 0.82);
          line-height: 1.72;
        }
        .service-card__content p {
          font-size: 0.86rem;
          line-height: 1.48;
        }
        .service-card__content .premium-chip {
          min-height: 28px;
          padding: 0 10px;
          font-size: 0.68rem;
        }
        .service-card__content .premium-chip,
        .result-card__content .premium-chip {
          background: rgba(198, 169, 107, 0.14);
          color: #f7e6cd;
        }
        .result-pair {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
          padding: 0;
          background: transparent;
        }
        .result-panel {
          position: relative;
          aspect-ratio: 4 / 5;
          border-radius: 0;
        }
        .result-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          min-height: 30px;
          padding: 0 12px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          background: rgba(255, 247, 239, 0.88);
          color: #1a1410;
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .result-panel:last-child .result-badge {
          left: auto;
          right: 12px;
          background: rgba(198, 169, 107, 0.92);
          color: #fff;
        }
        .cta-panel {
          background: #201812;
          border: 1px solid rgba(198, 169, 107, 0.18);
          padding: clamp(30px, 5vw, 54px);
          text-align: center;
          display: grid;
          gap: 16px;
        }
        .cta-panel .section-title {
          color: #f4eadf;
        }
        .cta-panel .section-copy {
          color: rgba(244, 234, 223, 0.72);
          margin: 0 auto;
        }
        @media (max-width: 980px) {
          .hero-grid,
          .services-grid,
          .results-grid {
            grid-template-columns: 1fr;
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

            <div className="services-grid" style={{ '--service-count': serviceCount }}>
              {visibleServices.map((service, index) => (
                <Reveal key={service.id || service.name} delay={index * 80}>
                  <Link
                    className="surface-card service-card"
                    to={`/portfolio?category=${encodeURIComponent(service.name)}`}
                  >
                    <div className="service-card__image">
                      <img src={service.imageUrl || getCategoryVisual(service.name)} alt={service.name} />
                    </div>
                    <div className="service-card__content">
                      <div className="premium-chip">{service.name}</div>
                      <h3>{service.name}</h3>
                      <p>{service.description}</p>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="section-block">
          <div className="site-container">
            <div className="section-heading">
              <div className="section-kicker">Our Works</div>
              <h2 className="section-title" style={{ maxWidth: 760 }}>Real restoration results for bags, wallets, and leather accessories</h2>
              <p className="section-copy">
                A few recent examples that show how damaged leather can be brought back with a richer and more premium final look.
              </p>
            </div>

            <div className="results-grid">
              {results.map((item, index) => (
                <Reveal key={item.id || `${item.title}-${index}`} delay={index * 80}>
                  <article className="surface-card result-card">
                    <div className="result-pair">
                      <div className="result-panel">
                        <img src={item.before_url} alt={`${item.title} before`} />
                        <span className="result-badge">Before</span>
                      </div>
                      <div className="result-panel">
                        <img src={item.after_url} alt={`${item.title} after`} />
                        <span className="result-badge">After</span>
                      </div>
                    </div>
                    <div className="result-card__content">
                      <div className="premium-chip">{item.category || 'Leather Repair'}</div>
                      <h3>{item.title || 'Damaged -> Restored'}</h3>
                      <p>{item.description || 'Careful restoration with stronger color, cleaner finish, and a more premium result.'}</p>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>

            <div style={{ marginTop: 28, textAlign: 'center' }}>
              <Link className="premium-button-outline" to="/portfolio">See More Works</Link>
            </div>
          </div>
        </section>

        <section className="section-block" style={{ paddingTop: 0 }}>
          <div className="site-container">
            <div className="surface-card cta-panel">
              <div className="section-kicker" style={{ justifySelf: 'center' }}>Get Started</div>
              <h2 className="section-title" style={{ maxWidth: 720, margin: '0 auto' }}>Send a photo and get a quote for your leather piece</h2>
              <p className="section-copy" style={{ maxWidth: 640 }}>
                Share a few pictures of your handbag, wallet, or accessory and we will guide you with a quick quote and the easiest next step.
              </p>
              <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
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
