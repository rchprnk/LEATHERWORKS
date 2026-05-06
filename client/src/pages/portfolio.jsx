import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getCategories, getPortfolio } from '../services/api'

function PortfolioCard({ item }) {
  return (
    <article className="surface-card portfolio-card">
      <div className="portfolio-card__pair">
        <div className="portfolio-card__panel">
          <img src={item.before_url} alt={`${item.title} before`} />
          <span className="portfolio-badge">Before</span>
        </div>
        <div className="portfolio-card__panel">
          <img src={item.after_url} alt={`${item.title} after`} />
          <span className="portfolio-badge portfolio-badge--after">After</span>
        </div>
      </div>
      <div className="portfolio-card__content">
        <div className="portfolio-card__meta">
          <span>{item.category || 'Leather Repair'}</span>
          <span>Before / After</span>
        </div>
        <h3>{item.title || 'Damaged to Restored'}</h3>
      </div>
    </article>
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

  const fetchItems = async (category, nextPage, append = false) => {
    append ? setLoadingMore(true) : setLoading(true)

    try {
      const params = { page: nextPage, limit: 9 }
      if (category !== 'All') params.category = category
      const { data: json } = await getPortfolio(params)
      const rows = json.data ?? json
      const pages = json.totalPages ?? 1
      setItems((prev) => (append ? [...prev, ...rows] : rows))
      setTotalPages(pages)
    } catch (error) {
      console.error('Failed to fetch portfolio:', error)
    } finally {
      append ? setLoadingMore(false) : setLoading(false)
    }
  }

  useEffect(() => {
    setPage(1)
    setItems([])
    fetchItems(activeCategory, 1, false)
  }, [activeCategory])

  const handleCategoryClick = (category) => {
    if (category === activeCategory) return
    setActiveCategory(category)
    if (category === 'All') setSearchParams({})
    else setSearchParams({ category })
  }

  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchItems(activeCategory, nextPage, true)
  }

  return (
    <div className="site-shell">
      <style>{`
        .portfolio-page {
          background:
            radial-gradient(circle at top left, rgba(214, 209, 230, 0.16), transparent 28%),
            radial-gradient(circle at top right, rgba(232, 199, 200, 0.16), transparent 28%),
            var(--bg-main);
        }
        .portfolio-filters {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          justify-content: center;
          margin-top: 28px;
        }
        .portfolio-filter {
          min-height: 44px;
          padding: 0 18px;
          border-radius: 999px;
          border: 1px solid rgba(198, 169, 107, 0.28);
          background: rgba(250,244,237,0.88);
          color: var(--text-primary);
          transition: transform 0.2s ease, background 0.2s ease, color 0.2s ease;
        }
        .portfolio-filter.is-active {
          background: var(--text-primary);
          color: #fff;
          border-color: var(--text-primary);
        }
        .portfolio-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 30px;
        }
        .portfolio-card {
          overflow: hidden;
          background: #d4c2aa;
          border: 1px solid rgba(111, 83, 49, 0.28);
          border-radius: 8px;
          box-shadow: 0 24px 48px rgba(56, 39, 26, 0.14);
        }
        .portfolio-card__pair {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
          padding: 0;
          background: #0f0b09;
        }
        .portfolio-card__panel {
          position: relative;
          aspect-ratio: 1 / 1.05;
          overflow: hidden;
          border-radius: 0;
        }
        .portfolio-card__panel:first-child {
          border-right: 2px solid rgba(111, 83, 49, 0.38);
        }
        .portfolio-card__panel img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transform: scale(1.01);
          filter: saturate(0.9) contrast(0.98);
        }
        .portfolio-badge {
          position: absolute;
          top: 16px;
          left: 16px;
          min-height: 34px;
          padding: 0 14px;
          border-radius: 7px;
          display: inline-flex;
          align-items: center;
          background: rgba(26, 20, 16, 0.9);
          color: #fff8ef;
          font-size: 0.78rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          box-shadow: 0 10px 22px rgba(0, 0, 0, 0.18);
        }
        .portfolio-badge--after {
          left: auto;
          right: 16px;
          background: #b58f3b;
          color: #fff;
        }
        .portfolio-card__content {
          padding: 24px 26px 28px;
          display: grid;
          gap: 14px;
          background: #d4c2aa;
        }
        .portfolio-card__meta {
          display: flex;
          justify-content: space-between;
          gap: 18px;
          align-items: center;
          color: rgba(77, 58, 40, 0.55);
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .portfolio-card__meta span:first-child {
          color: #8a6828;
        }
        .portfolio-card__content h3 {
          margin: 0;
          font-family: var(--font-display);
          font-size: 2rem;
          line-height: 1;
          color: var(--text-primary);
        }
        @media (max-width: 900px) {
          .portfolio-grid {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 640px) {
          .portfolio-card__pair {
            grid-template-columns: 1fr;
          }
          .portfolio-card__panel:first-child {
            border-right: 0;
            border-bottom: 2px solid rgba(111, 83, 49, 0.38);
          }
          .portfolio-card__meta {
            align-items: flex-start;
            flex-direction: column;
            gap: 6px;
          }
        }
      `}</style>

      <div className="portfolio-page">
        <section className="section-block" style={{ paddingTop: 148 }}>
          <div className="site-container" style={{ textAlign: 'center' }}>
            <div className="section-kicker">Portfolio</div>
            <h1 className="section-title" style={{ maxWidth: 760, margin: '0 auto' }}>
              Our works for handbags, wallets, and favorite leather accessories
            </h1>
            <p className="section-copy" style={{ maxWidth: 700, margin: '0 auto' }}>
              Explore recent repairs and see how worn leather can be refreshed in a way that looks polished, boutique, and naturally restored.
            </p>
            <div className="portfolio-filters">
              {filters.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  className={`portfolio-filter${filter === activeCategory ? ' is-active' : ''}`}
                  onClick={() => handleCategoryClick(filter)}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="section-block" style={{ paddingTop: 0 }}>
          <div className="site-container">
            <div className="portfolio-grid">
              {items.map((item, index) => (
                <PortfolioCard key={item.id || `${item.title}-${index}`} item={item} />
              ))}
            </div>
            {!loading && items.length === 0 ? (
              <div className="surface-card" style={{ padding: 42, textAlign: 'center', marginTop: 20 }}>
                <p className="section-copy" style={{ margin: '0 auto' }}>No works found in this category yet.</p>
              </div>
            ) : null}
            {page < totalPages ? (
              <div style={{ textAlign: 'center', marginTop: 32 }}>
                <button className="premium-button" type="button" onClick={handleLoadMore} disabled={loadingMore}>
                  {loadingMore ? 'Loading...' : 'Load More'}
                </button>
              </div>
            ) : null}
          </div>
        </section>

        <section className="section-block">
          <div className="site-container">
            <div className="surface-card" style={{ padding: 'clamp(32px, 5vw, 56px)', textAlign: 'center', background: 'linear-gradient(135deg, rgba(232, 199, 200, 0.24), rgba(214, 209, 230, 0.3), rgba(255,255,255,0.96))' }}>
              <div className="section-kicker" style={{ justifySelf: 'center' }}>Your Item Next</div>
              <h2 className="section-title" style={{ maxWidth: 720, margin: '0 auto 12px' }}>
                Want to know how your piece could look after restoration?
              </h2>
              <p className="section-copy" style={{ maxWidth: 620, margin: '0 auto 24px' }}>
                Send a few photos and we will help you understand what can be improved and how the final result may look.
              </p>
              <Link className="premium-button" to="/contact">Send Photos for Quote</Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
