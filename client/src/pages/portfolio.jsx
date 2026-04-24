import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getCategories, getPortfolio } from '../services/api'

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
    <div
      ref={ref}
      style={{ height: '100%', ...outerStyle }}
    >
      <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(32px)',
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
        height: '100%',
      }}
    >
      {children}
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div style={{
      background: '#171717', border: '1.2px solid #262626', borderRadius: 6, overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', aspectRatio: '8 / 5' }}>
        <div style={{ flex: 1, background: '#1e1e1e', animation: 'pulse 1.5s ease-in-out infinite' }} />
        <div style={{ flex: 1, background: '#1a1a1a', animation: 'pulse 1.5s ease-in-out infinite 0.3s' }} />
      </div>
      <div style={{ padding: '25px 24px', borderTop: '1.2px solid #262626' }}>
        <div style={{ width: 80, height: 12, background: '#262626', borderRadius: 4, marginBottom: 12, animation: 'pulse 1.5s ease-in-out infinite' }} />
        <div style={{ width: '70%', height: 24, background: '#222', borderRadius: 4, marginBottom: 10, animation: 'pulse 1.5s ease-in-out infinite 0.1s' }} />
        <div style={{ width: '90%', height: 16, background: '#1e1e1e', borderRadius: 4, animation: 'pulse 1.5s ease-in-out infinite 0.2s' }} />
      </div>
    </div>
  )
}

function PortfolioCard({ item }) {
  const [beforeErr, setBeforeErr] = useState(false)
  const [afterErr, setAfterErr] = useState(false)
  const placeholder = 'https://placehold.co/363x363/171717/404040?text=No+Image'

  return (
    <div style={{
      background: '#171717', border: '1.2px solid #262626', borderRadius: 6,
      overflow: 'hidden', transition: 'border-color 0.25s, transform 0.25s',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    }}
      className="portfolio-card"
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(225,113,0,0.4)'; e.currentTarget.style.transform = 'translateY(-4px)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#262626'; e.currentTarget.style.transform = 'translateY(0)' }}
    >
      {/* Images */}
      <div className="portfolio-card__media" style={{ display: 'flex', position: 'relative', aspectRatio: '8 / 5', minHeight: 320 }}>
        {/* BEFORE */}
        <div className="portfolio-card__panel" style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <img
            src={beforeErr ? placeholder : item.before_url}
            alt="before"
            onError={() => setBeforeErr(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          <div style={{
            position: 'absolute', top: 16, left: 16,
            background: 'rgba(130,24,26,0.80)', border: '1.12px solid #C10007',
            borderRadius: 6, padding: '7px 13px',
            fontFamily: 'var(--sans)', fontSize: 12, fontWeight: 600,
            color: '#fff', letterSpacing: '0.6px',
          }}>BEFORE</div>
        </div>

        {/* AFTER */}
        <div className="portfolio-card__panel" style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <img
            src={afterErr ? placeholder : item.after_url}
            alt="after"
            onError={() => setAfterErr(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          <div style={{
            position: 'absolute', top: 16, right: 16,
            background: 'rgba(13,84,43,0.80)', border: '1.12px solid #008236',
            borderRadius: 6, padding: '7px 13px',
            fontFamily: 'var(--sans)', fontSize: 12, fontWeight: 600,
            color: '#fff', letterSpacing: '0.6px',
          }}>AFTER</div>
        </div>
      </div>

      {/* Info */}
      <div className="portfolio-card__content" style={{
        padding: '25px 24px', borderTop: '1.12px solid #262626',
        background: 'rgba(23,23,23,0.95)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flex: 1,
      }}>
        <div style={{ flex: 1 }}>
          <div className="portfolio-card__category" style={{
            fontFamily: 'var(--sans)', fontSize: 12, fontWeight: 500,
            color: '#FE9A00', textTransform: 'uppercase', letterSpacing: '0.6px',
            marginBottom: 6,
          }}>{item.category}</div>
          <div className="portfolio-card__title" style={{
            fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 500,
            color: '#fff', lineHeight: 1.3, marginBottom: 6,
          }}>{item.title}</div>
          <div className="portfolio-card__description" style={{
            fontFamily: 'var(--sans)', fontSize: 14, color: '#A1A1A1', lineHeight: 1.5,
          }}>{item.description}</div>
        </div>
        <div className="portfolio-card__accent" style={{ width: 2, height: 48, background: '#E17100', marginLeft: 24, flexShrink: 0 }} />
      </div>
    </div>
  )
}

export default function Portfolio() {
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedCategory = searchParams.get('category')
  const [categories, setCategories] = useState([])
  const [activeCategory, setActiveCategory] = useState(requestedCategory || 'All')
  const [items, setItems] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const filters = ['All', ...categories.map((category) => category.name)]

  useEffect(() => {
    let alive = true

    getCategories()
      .then(({ data }) => {
        if (!alive || !Array.isArray(data)) return
        setCategories(data)
      })
      .catch(() => {})

    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    if (!requestedCategory) {
      setActiveCategory('All')
      return
    }

    setActiveCategory(requestedCategory)
  }, [requestedCategory])

  const fetchPortfolio = async (cat, pg, append = false) => {
    append ? setLoadingMore(true) : setLoading(true)
    try {
      const params = { page: pg, limit: 12 }
      if (cat !== 'All') params.category = cat
      const { data: json } = await getPortfolio(params)
      const data = json.data ?? json
      const tp = json.totalPages ?? 1
      setItems(prev => append ? [...prev, ...data] : data)
      setTotalPages(tp)
    } catch (err) {
      console.error('Failed to fetch portfolio:', err)
    } finally {
      append ? setLoadingMore(false) : setLoading(false)
    }
  }

  useEffect(() => {
    setPage(1)
    setItems([])
    fetchPortfolio(activeCategory, 1, false)
  }, [activeCategory])

  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchPortfolio(activeCategory, nextPage, true)
  }

  const handleCategoryClick = (cat) => {
    if (cat === activeCategory) return
    setActiveCategory(cat)
    if (cat === 'All') setSearchParams({})
    else setSearchParams({ category: cat })
  }

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
        .filter-btn { font-family: var(--sans); font-size: 13px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.7px; border: none; border-radius: 6px; padding: 13px 22px; cursor: pointer; transition: background 0.2s, color 0.2s, transform 0.15s; }
        .filter-btn:hover { transform: translateY(-1px); }
        .load-more-btn { font-family: var(--sans); font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.7px; padding: 15px 48px; background: var(--gold); color: #fff; border: none; border-radius: 6px; cursor: pointer; box-shadow: 0 10px 30px -6px rgba(123,51,6,0.45); transition: background 0.2s, transform 0.15s; }
        .load-more-btn:hover { background: #c96500; transform: translateY(-2px); }
        .load-more-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
        .portfolio-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 32px;
          align-items: stretch;
          transition: opacity 0.2s ease;
        }
        .portfolio-card {
          animation: cardFadeIn 0.28s ease;
        }
        .portfolio-card__category,
        .portfolio-card__title,
        .portfolio-card__description {
          overflow-wrap: anywhere;
          word-break: break-word;
        }
        .portfolio-card__title {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .portfolio-card__description {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .filter-bar {
          display: flex;
          gap: 10px;
          overflow-x: auto;
          scrollbar-width: none;
          width: 100%;
          justify-content: center;
          padding: 2px 10px;
        }
        .filter-bar::-webkit-scrollbar { display: none; }
        @keyframes cardFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 900px) {
          .portfolio-grid { grid-template-columns: 1fr !important; }
          .filter-bar { justify-content: flex-start; }
        }
        @media (max-width: 640px) {
          .portfolio-grid {
            gap: 14px;
          }
          .filter-bar {
            justify-content: center !important;
            flex-wrap: wrap;
            overflow: visible;
            padding: 2px 0;
          }
          .filter-btn {
            white-space: nowrap;
            font-size: 12px !important;
            padding: 11px 16px !important;
          }
          .portfolio-card__content {
            padding: 14px 12px !important;
          }
          .portfolio-card__accent {
            height: 28px !important;
            margin-left: 10px !important;
          }
          .portfolio-card__media {
            flex-direction: row;
            aspect-ratio: 8 / 5 !important;
            min-height: 0 !important;
          }
          .portfolio-card__panel {
            aspect-ratio: auto;
            min-height: 0;
          }
          .portfolio-card__panel > div {
            top: 10px !important;
            left: 10px !important;
            right: auto !important;
            padding: 5px 10px !important;
            font-size: 10px !important;
          }
          .portfolio-card__panel:last-child > div {
            left: auto !important;
            right: 10px !important;
          }
          .portfolio-card:hover {
            transform: none !important;
          }
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
            Our Works
          </p>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(42px, 6vw, 72px)', fontWeight: 500, color: '#fff', lineHeight: 1.1, marginBottom: 20 }}>
            Before &amp; After Gallery
          </h1>
          <div style={{ width: 96, height: 2, margin: '0 auto 28px', background: 'linear-gradient(90deg, transparent, #E17100, transparent)' }} />
          <p style={{ fontFamily: 'var(--sans)', fontSize: 18, fontWeight: 400, color: '#D4D4D4', maxWidth: 680, margin: '0 auto', lineHeight: 1.65 }}>
            Every piece tells a story of transformation. Browse our portfolio to see the remarkable restorations we've completed with meticulous craftsmanship.
          </p>
        </div>
      </section>

      {/* FILTER BAR */}
      <div style={{
        position: 'sticky', top: 68, zIndex: 90,
        background: 'rgba(18,18,18,0.97)', backdropFilter: 'blur(12px)',
        borderTop: '1.12px solid #262626', borderBottom: '1.12px solid #262626',
        padding: '18px clamp(14px, 4vw, 128px)',
        display: 'flex', justifyContent: 'center',
      }}>
        <div className="filter-bar">
          {filters.map(cat => (
            <button
              key={cat}
              className="filter-btn"
              onClick={() => handleCategoryClick(cat)}
              style={{
                background: activeCategory === cat ? '#E17100' : '#171717',
                color: activeCategory === cat ? '#fff' : '#D4D4D4',
                outline: activeCategory === cat ? 'none' : '1.12px solid #262626',
                boxShadow: activeCategory === cat ? '0 4px 15px -4px rgba(123,51,6,0.5)' : 'none',
              }}
            >{cat}</button>
          ))}
        </div>
      </div>

      {/* GRID */}
      <section style={{ padding: '80px clamp(24px, 7vw, 128px) 96px', background: '#121212' }}>
        {loading ? (
          <div className="portfolio-grid">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ fontFamily: 'var(--sans)', fontSize: 18, color: '#A1A1A1' }}>
              No works found in this category
            </p>
          </div>
        ) : (
          <>
            <div className="portfolio-grid">
              {items.map((item) => (
                <PortfolioCard key={item.id} item={item} />
              ))}
            </div>

            {/* Load More */}
            {page < totalPages && (
              <div style={{ textAlign: 'center', marginTop: 64 }}>
                <button
                  className="load-more-btn"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? 'Loading...' : 'Load More Projects'}
                </button>
              </div>
            )}
          </>
        )}
      </section>

    </div>
  )
}
