import React from "react";
import { Star, MessageSquare } from "lucide-react";

// Макет даних для майбутнього Google Maps API
const reviewsData = [
  {
    id: 1,
    name: "Michael Johnson",
    service: "Car Seat Restoration",
    rating: 5,
    date: "March 2026",
    text: "Absolutely incredible work! My BMW's leather seats looked brand new after Prime Leather Repair worked their magic. The color matching was perfect, and the craftsmanship is top-notch. Highly recommend!",
    verified: "Verified via WhatsApp"
  },
  {
    id: 2,
    name: "Sarah Williams",
    service: "Designer Handbag Repair",
    rating: 5,
    date: "February 2026",
    text: "I was devastated when my Hermès bag got scratched. Prime Leather Repair restored it beautifully - you can't even tell it was damaged. Their attention to detail is remarkable. Thank you!",
    verified: "Verified via WhatsApp"
  },
  {
    id: 3,
    name: "David Chen",
    service: "Luxury Sofa Restoration",
    rating: 5,
    date: "January 2026",
    text: "Our vintage leather sofa has been in the family for decades. Prime Leather Repair brought it back to life with such care and precision. The leather conditioning treatment made it feel brand new. Exceptional service!",
    verified: "Verified via WhatsApp"
  },
  {
    id: 4,
    name: "Emma Thompson",
    service: "Footwear Restoration",
    rating: 5,
    date: "January 2026",
    text: "My favorite designer boots were worn out and I thought I'd have to replace them. Prime Leather Repair did an amazing restoration job - the leather looks fantastic and feels even better. Will definitely use them again!",
    verified: "Verified via WhatsApp"
  }
];

const Reviews = () => {
  return (
    <div style={{ minHeight: '100vh', background: '#f6f2ea', color: '#121212' }}>
      <style>{`
        .reviews-shell {
          padding-left: clamp(24px, 6vw, 100px);
          padding-right: clamp(24px, 6vw, 100px);
        }
        .reviews-stats {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 48px;
          color: #fff;
          flex-wrap: wrap;
        }
        .reviews-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 28px;
        }
        .reviews-fab {
          position: fixed;
          right: 32px;
          bottom: 32px;
          z-index: 50;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .reviews-fab-link {
          width: 52px;
          height: 52px;
          border-radius: 999px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 28px rgba(0, 0, 0, 0.2);
          transition: transform 0.2s ease;
        }
        .reviews-fab-link:hover {
          transform: scale(1.08);
        }
        @media (max-width: 980px) {
          .reviews-grid {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 720px) {
          .reviews-shell {
            padding-left: 20px;
            padding-right: 20px;
          }
          .reviews-fab {
            right: 20px;
            bottom: 20px;
          }
        }
      `}</style>

      <section style={{ paddingTop: 132, paddingBottom: 72, background: '#121212', textAlign: 'center' }}>
        <div className="reviews-shell" style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(42px, 6vw, 68px)', color: '#fff', marginBottom: 16 }}>
            Client Reviews
          </h1>
          <p style={{ fontFamily: 'var(--sans)', color: '#9ca3af', maxWidth: 720, margin: '0 auto 44px', fontSize: 18, lineHeight: 1.6 }}>
            See what our satisfied customers say about our premium leather restoration services
          </p>

          <div className="reviews-stats">
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', gap: 4, marginBottom: 6, justifyContent: 'center' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={20} color="#f59e0b" fill="#f59e0b" />
                ))}
              </div>
              <p style={{ fontFamily: 'var(--sans)', fontSize: 30, fontWeight: 700 }}>5.0</p>
              <p style={{ fontFamily: 'var(--sans)', fontSize: 10, color: '#737373', textTransform: 'uppercase', letterSpacing: '0.28em', marginTop: 6 }}>
                Average Rating
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
                <MessageSquare size={40} color="#f59e0b" />
              </div>
              <p style={{ fontFamily: 'var(--sans)', fontSize: 30, fontWeight: 700 }}>200+</p>
              <p style={{ fontFamily: 'var(--sans)', fontSize: 10, color: '#737373', textTransform: 'uppercase', letterSpacing: '0.28em', marginTop: 6 }}>
                Happy Clients
              </p>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '80px 0 110px' }}>
        <div className="reviews-shell" style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="reviews-grid">
            {reviewsData.map((review) => (
              <div 
                key={review.id} 
                style={{
                  background: '#fff',
                  padding: 32,
                  borderRadius: 20,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                  border: '1px solid #f4efe7',
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: 280,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: '#fef3c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#92400e',
                    fontFamily: 'var(--sans)',
                    fontWeight: 700,
                    flexShrink: 0,
                  }}>
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <h3 style={{ fontFamily: 'var(--sans)', fontWeight: 700, color: '#171717', lineHeight: 1.2, marginBottom: 4 }}>{review.name}</h3>
                    <p style={{ fontFamily: 'var(--sans)', fontSize: 12, color: '#737373' }}>{review.service}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 12, flexWrap: 'wrap' }}>
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} size={16} color="#f59e0b" fill="#f59e0b" />
                  ))}
                  <span style={{ fontFamily: 'var(--sans)', fontSize: 12, color: '#9ca3af', marginLeft: 8 }}>{review.date}</span>
                </div>

                <p style={{ fontFamily: 'var(--sans)', color: '#404040', fontSize: 14, lineHeight: 1.75, marginBottom: 24, flexGrow: 1 }}>
                  "{review.text}"
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 16, borderTop: '1px solid #f3f4f6' }}>
                  <MessageSquare size={12} color="#9ca3af" />
                  <span style={{ fontFamily: 'var(--sans)', fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.18em' }}>
                    {review.verified}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="reviews-fab">
        <a href="https://wa.me/13125550199" target="_blank" rel="noreferrer" className="reviews-fab-link" style={{ background: '#25D366' }}>
          <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" style={{ width: 24, height: 24 }} alt="WhatsApp" />
        </a>
        <a href="https://t.me/primeleatherrepair" target="_blank" rel="noreferrer" className="reviews-fab-link" style={{ background: '#0088cc' }}>
          <img src="https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg" style={{ width: 24, height: 24 }} alt="Telegram" />
        </a>
      </div>
    </div>
  );
};

export default Reviews;
