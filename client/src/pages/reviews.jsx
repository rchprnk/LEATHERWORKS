import { MessageSquare, Star } from 'lucide-react'

const reviewsData = [
  {
    id: 1,
    name: 'Michael Johnson',
    service: 'Car Seat Restoration',
    rating: 5,
    date: 'March 2026',
    text: "Absolutely incredible work. My seats looked fresh again and the finish felt far more refined than I expected.",
    verified: 'Verified via WhatsApp',
  },
  {
    id: 2,
    name: 'Sarah Williams',
    service: 'Designer Handbag Repair',
    rating: 5,
    date: 'February 2026',
    text: "My handbag came back looking elegant and beautifully restored. The color work was subtle and premium.",
    verified: 'Verified via WhatsApp',
  },
  {
    id: 3,
    name: 'David Chen',
    service: 'Luxury Sofa Restoration',
    rating: 5,
    date: 'January 2026',
    text: 'Our family sofa looked refreshed without losing its character. It felt like the right mix of care and craftsmanship.',
    verified: 'Verified via WhatsApp',
  },
  {
    id: 4,
    name: 'Emma Thompson',
    service: 'Footwear Restoration',
    rating: 5,
    date: 'January 2026',
    text: 'I thought I had to replace my boots, but the repair made them feel stylish and wearable again.',
    verified: 'Verified via WhatsApp',
  },
]

export default function Reviews() {
  return (
    <div className="site-shell">
      <style>{`
        .reviews-page {
          background:
            radial-gradient(circle at top right, rgba(214, 209, 230, 0.16), transparent 28%),
            radial-gradient(circle at left center, rgba(232, 199, 200, 0.16), transparent 24%),
            var(--bg-main);
        }
        .reviews-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 24px;
        }
        .review-card {
          padding: 28px;
          display: grid;
          gap: 18px;
        }
        .review-top {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          align-items: flex-start;
        }
        .review-avatar {
          width: 52px;
          height: 52px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, rgba(232, 199, 200, 0.54), rgba(214, 209, 230, 0.58));
          font-weight: 700;
        }
        .review-name {
          margin: 0 0 4px;
          color: var(--text-primary);
          font-weight: 700;
        }
        .review-service,
        .review-text,
        .review-meta {
          margin: 0;
          color: var(--text-secondary);
          line-height: 1.74;
        }
        .review-stars {
          display: flex;
          gap: 4px;
          align-items: center;
        }
        .review-meta {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          padding-top: 16px;
          border-top: 1px solid rgba(26,26,26,0.08);
          font-size: 0.92rem;
        }
        @media (max-width: 900px) {
          .reviews-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="reviews-page">
        <section className="section-block" style={{ paddingTop: 148 }}>
          <div className="site-container" style={{ textAlign: 'center' }}>
            <div className="section-kicker">Reviews</div>
            <h1 className="section-title" style={{ maxWidth: 760, margin: '0 auto' }}>
              Clients love the cleaner, more elegant results they get back
            </h1>
            <p className="section-copy" style={{ maxWidth: 700, margin: '0 auto' }}>
              A few words from people who wanted their handbags, wallets, boots, and favorite leather pieces to look softer, fresher, and beautifully restored instead of simply “patched.”
            </p>
          </div>
        </section>

        <section className="section-block" style={{ paddingTop: 0 }}>
          <div className="site-container">
            <div className="reviews-grid">
              {reviewsData.map((review) => (
                <article key={review.id} className="surface-card review-card">
                  <div className="review-top">
                    <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                      <div className="review-avatar">{review.name.charAt(0)}</div>
                      <div>
                        <p className="review-name">{review.name}</p>
                        <p className="review-service">{review.service}</p>
                      </div>
                    </div>
                    <div className="premium-chip">{review.date}</div>
                  </div>

                  <div className="review-stars">
                    {[...Array(review.rating)].map((_, index) => (
                      <Star key={index} size={16} color="#C6A96B" fill="#C6A96B" />
                    ))}
                  </div>

                  <p className="review-text">"{review.text}"</p>

                  <div className="review-meta">
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <MessageSquare size={14} color="#C6A96B" />
                      {review.verified}
                    </span>
                    <span>{review.service}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
