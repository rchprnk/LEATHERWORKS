import { useEffect, useMemo, useState } from 'react'
import { ExternalLink, MessageSquare, Star } from 'lucide-react'
import { getGoogleReviews } from '../services/api'

const GOOGLE_REVIEW_URL = 'https://www.google.com/maps/place/Prime+Leather+Repair/@42.144922,-87.9527227,757m/data=!3m1!1e3!4m10!1m2!2m1!1sPrime+Leather+Repair!3m6!1s0x880fbde48bc9a361:0x3e5c37c666de3ab4!8m2!3d42.1464913!4d-87.948899!15sChRQcmltZSBMZWF0aGVyIFJlcGFpcpIBFmxlYXRoZXJfcmVwYWlyX3NlcnZpY2XgAQA!16s%2Fg%2F11z73ttnyk?hl=en-us&entry=ttu'

function getReviewText(review) {
  if (typeof review?.text === 'string') return review.text
  if (typeof review?.text?.text === 'string') return review.text.text
  if (typeof review?.originalText?.text === 'string') return review.originalText.text
  return ''
}

function normalizeReview(review, index) {
  const name =
    review?.authorAttribution?.displayName ||
    review?.author_name ||
    review?.name ||
    'Google reviewer'
  const rating = Number(review?.rating)

  return {
    id: review?.name || review?.time || review?.publishTime || `google-${index}`,
    name,
    rating: Number.isFinite(rating) && rating > 0 ? Math.max(1, Math.min(5, Math.round(rating))) : null,
    date: review?.relativePublishTimeDescription || review?.relative_time_description || review?.date || 'Google review',
    text: getReviewText(review),
    verified: 'Google review',
    service: 'Prime Leather Repair',
    avatar: review?.authorAttribution?.photoUri || review?.profile_photo_url || '',
    url: review?.authorAttribution?.uri || review?.author_url || GOOGLE_REVIEW_URL,
  }
}

function normalizeGooglePayload(payload) {
  const data = payload?.data || payload || {}
  const rawReviews = Array.isArray(data.reviews) ? data.reviews : []
  const reviews = rawReviews.map(normalizeReview).filter((review) => review.text)

  return {
    reviews,
    rating: Number(data.rating || data.averageRating || 0),
    total: Number(data.userRatingCount || data.totalReviews || data.total || 0),
    placeUrl: data.googleMapsUri || data.url || GOOGLE_REVIEW_URL,
  }
}

function RatingStars({ rating, size = 16 }) {
  const count = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)))
  if (!count) return null

  return (
    <div className="review-stars" aria-label={`${count} star rating`}>
      {[...Array(count)].map((_, index) => (
        <Star key={index} size={size} color="#C6A96B" fill="#C6A96B" />
      ))}
    </div>
  )
}

export default function Reviews() {
  const [googleData, setGoogleData] = useState({ reviews: [], rating: 0, total: 0, placeUrl: GOOGLE_REVIEW_URL })
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let alive = true
    getGoogleReviews()
      .then((res) => {
        if (!alive) return
        const next = normalizeGooglePayload(res)
        setGoogleData(next)
        setStatus(next.reviews.length ? 'ready' : 'fallback')
      })
      .catch(() => {
        if (!alive) return
        setStatus('fallback')
      })

    return () => {
      alive = false
    }
  }, [])

  const reviews = useMemo(() => googleData.reviews, [googleData.reviews])

  const averageRating = googleData.rating || null
  const totalReviews = googleData.total || null
  const placeUrl = googleData.placeUrl || GOOGLE_REVIEW_URL

  return (
    <div className="site-shell">
      <style>{`
        .reviews-page {
          background:
            radial-gradient(circle at top right, rgba(214, 209, 230, 0.16), transparent 28%),
            radial-gradient(circle at left center, rgba(232, 199, 200, 0.16), transparent 24%),
            var(--bg-main);
        }
        .reviews-summary {
          max-width: 920px;
          margin: 28px auto 0;
          padding: 22px;
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: 18px;
          align-items: center;
          text-align: left;
        }
        .reviews-score {
          width: 84px;
          height: 84px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          background: rgba(198, 169, 107, 0.18);
          border: 1px solid rgba(198, 169, 107, 0.28);
          font-family: var(--font-display);
          font-size: 2.2rem;
          color: var(--text-primary);
          line-height: 1;
        }
        .reviews-score.is-empty {
          font-family: inherit;
          font-size: 0.92rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          text-align: center;
        }
        .reviews-summary h2 {
          margin: 0 0 8px;
          font-family: var(--font-display);
          font-size: clamp(1.55rem, 2.5vw, 2.2rem);
          color: var(--text-primary);
          line-height: 1.05;
        }
        .reviews-summary p {
          margin: 0;
          color: var(--text-secondary);
          line-height: 1.55;
        }
        .reviews-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
        }
        .review-card {
          min-height: 290px;
          padding: 24px;
          display: grid;
          gap: 16px;
          align-content: start;
        }
        .review-top {
          display: flex;
          justify-content: space-between;
          gap: 14px;
          align-items: flex-start;
        }
        .review-person {
          display: flex;
          gap: 12px;
          align-items: center;
          min-width: 0;
        }
        .review-avatar {
          width: 48px;
          height: 48px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, rgba(232, 199, 200, 0.54), rgba(214, 209, 230, 0.58));
          font-weight: 700;
          flex: 0 0 auto;
          overflow: hidden;
        }
        .review-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .review-name {
          margin: 0 0 4px;
          color: var(--text-primary);
          font-weight: 700;
          overflow-wrap: anywhere;
        }
        .review-service,
        .review-text,
        .review-meta {
          margin: 0;
          color: var(--text-secondary);
          line-height: 1.68;
        }
        .review-stars {
          display: flex;
          gap: 4px;
          align-items: center;
        }
        .review-text {
          font-size: 0.98rem;
        }
        .review-meta {
          display: flex;
          justify-content: space-between;
          gap: 14px;
          padding-top: 14px;
          border-top: 1px solid rgba(26,26,26,0.08);
          font-size: 0.9rem;
          align-self: end;
        }
        .review-link {
          color: inherit;
          text-decoration: none;
        }
        .review-status {
          margin: 18px auto 0;
          max-width: 720px;
          color: var(--text-secondary);
          font-size: 0.94rem;
          line-height: 1.55;
        }
        .reviews-empty {
          max-width: 760px;
          margin: 0 auto;
          padding: 34px;
          text-align: center;
          display: grid;
          justify-items: center;
          gap: 14px;
        }
        .reviews-empty h2 {
          margin: 0;
          font-family: var(--font-display);
          color: var(--text-primary);
          font-size: clamp(1.7rem, 3vw, 2.4rem);
          line-height: 1.08;
        }
        .reviews-empty p {
          margin: 0;
          max-width: 560px;
          color: var(--text-secondary);
          line-height: 1.65;
        }
        @media (max-width: 1060px) {
          .reviews-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        @media (max-width: 760px) {
          .reviews-summary {
            grid-template-columns: 1fr;
            text-align: center;
            justify-items: center;
            padding: 20px;
          }
          .reviews-score {
            width: 76px;
            height: 76px;
            font-size: 2rem;
          }
          .reviews-grid {
            grid-template-columns: 1fr;
            gap: 14px;
          }
          .review-card {
            min-height: auto;
            padding: 20px;
            border-radius: 8px;
          }
          .review-top {
            gap: 12px;
          }
          .premium-chip {
            white-space: nowrap;
            font-size: 0.78rem;
          }
          .review-meta {
            display: grid;
            justify-content: stretch;
            gap: 8px;
          }
        }
      `}</style>

      <div className="reviews-page">
        <section className="section-block" style={{ paddingTop: 148 }}>
          <div className="site-container" style={{ textAlign: 'center' }}>
            <div className="section-kicker">Google Reviews</div>
            <h1 className="section-title" style={{ maxWidth: 760, margin: '0 auto' }}>
              Real customer feedback from Google Maps
            </h1>
            <p className="section-copy" style={{ maxWidth: 700, margin: '0 auto' }}>
              Customer reviews for Prime Leather Repair will be available here soon.
            </p>

            <div className="surface-card reviews-summary">
              <div className={`reviews-score${averageRating ? '' : ' is-empty'}`}>
                {averageRating ? averageRating.toFixed(1) : 'Google'}
              </div>
              <div>
                <h2>Prime Leather Repair on Google</h2>
                {averageRating ? <RatingStars rating={averageRating} size={18} /> : null}
                <p style={{ marginTop: 10 }}>
                  {totalReviews
                    ? `${totalReviews} Google reviews`
                    : status === 'loading'
                      ? 'Loading reviews...'
                      : 'Reviews coming soon'}
                </p>
              </div>
              <a className="premium-button-outline" href={placeUrl} target="_blank" rel="noreferrer">
                View on Google
                <ExternalLink size={16} />
              </a>
            </div>

            {status === 'fallback' && (
              <p className="review-status">
                We are preparing our Google reviews section. In the meantime, you can visit our Google Maps page directly.
              </p>
            )}
          </div>
        </section>

        <section className="section-block" style={{ paddingTop: 0 }}>
          <div className="site-container">
            {reviews.length ? (
              <div className="reviews-grid">
                {reviews.map((review) => (
                <article key={review.id} className="surface-card review-card">
                  <div className="review-top">
                    <div className="review-person">
                      <div className="review-avatar">
                        {review.avatar ? <img src={review.avatar} alt="" loading="lazy" /> : review.name.charAt(0)}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p className="review-name">{review.name}</p>
                        <p className="review-service">{review.service}</p>
                      </div>
                    </div>
                    <div className="premium-chip">{review.date}</div>
                  </div>

                  {review.rating ? <RatingStars rating={review.rating} /> : null}

                  <p className="review-text">"{review.text}"</p>

                  <div className="review-meta">
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <MessageSquare size={14} color="#C6A96B" />
                      {review.verified}
                    </span>
                    <a className="review-link" href={review.url || placeUrl} target="_blank" rel="noreferrer">
                      Open review
                    </a>
                  </div>
                </article>
                ))}
              </div>
            ) : (
              <div className="surface-card reviews-empty">
                <h2>Reviews coming soon</h2>
                <p>
                  Customer reviews will be shown here shortly. You can also visit our Google Maps page for the latest business information.
                </p>
                <a className="premium-button" href={placeUrl} target="_blank" rel="noreferrer">
                  Open Google Maps
                  <ExternalLink size={16} />
                </a>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
