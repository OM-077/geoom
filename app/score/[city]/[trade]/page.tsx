// ============================================
// PUBLIC PREVIEW SCAN PAGE
// /score/[city]/[trade] — NO auth required
// Shows 3 partial score cards
// First card visible, next 2 blurred
// Below fold: email capture → triggers onboarding
// Used for: referral links, Google Ads, social sharing
// ============================================

import type { Metadata } from 'next'

interface Props {
  params: { city: string; trade: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const city = decodeURIComponent(params.city).replace(/-/g, ' ')
  const trade = decodeURIComponent(params.trade).replace(/-/g, ' ')

  return {
    title: `${trade} in ${city} — AI Visibility Score | GeoOm`,
    description: `Find out how visible ${trade} contractors in ${city} are on ChatGPT, Siri, and Google AI. Free AI visibility scan.`,
    openGraph: {
      title: `${trade} in ${city} — Are you showing up on AI?`,
      description: `See your AI Visibility Score. Free scan for ${trade} contractors in ${city}.`,
      images: [
        {
          url: `/api/social-card?name=${encodeURIComponent(city + ' ' + trade)}&score=0&trade=${encodeURIComponent(trade)}&city=${encodeURIComponent(city)}`,
          width: 1200,
          height: 630
        }
      ]
    }
  }
}

// ---- Preview score cards (static teaser data) ----
const PREVIEW_CARDS = [
  {
    id: 'citations',
    label: 'CITATION SCORE',
    description: 'How consistent is your NAP across Google, Foursquare, Yelp, and 5 other platforms AI engines check.',
    blurred: false,
    sampleScore: '?',
    maxScore: 20,
    icon: '📍'
  },
  {
    id: 'content',
    label: 'CONTENT SCORE',
    description: 'How many local service pages you have indexed for your trade and city combinations.',
    blurred: true,
    sampleScore: '?',
    maxScore: 20,
    icon: '📄'
  },
  {
    id: 'reviews',
    label: 'REVIEW SCORE',
    description: 'Your review velocity, quality, and how often customers mention your trade and city.',
    blurred: true,
    sampleScore: '?',
    maxScore: 15,
    icon: '⭐'
  }
]

export default function ScorePreviewPage({ params }: Props) {
  const city = decodeURIComponent(params.city).replace(/-/g, ' ')
  const rawTrade = decodeURIComponent(params.trade).replace(/-/g, ' ')
  const trade = rawTrade.charAt(0).toUpperCase() + rawTrade.slice(1)

  return (
    <main style={{
      minHeight: '100vh',
      background: '#07090C',
      color: '#F0F4F8',
      fontFamily: 'var(--font-inter), system-ui, sans-serif'
    }}>
      {/* Header */}
      <header style={{
        borderBottom: '1px solid #222A35',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <span style={{
          color: '#8A9BB0',
          fontSize: '12px',
          letterSpacing: '4px',
          textTransform: 'uppercase'
        }}>
          GEOOM
        </span>
        <a
          href="/signup"
          style={{
            background: '#FF7A00',
            color: '#07090C',
            padding: '8px 20px',
            textDecoration: 'none',
            fontSize: '13px',
            fontWeight: 700,
            borderRadius: '4px'
          }}
        >
          Get Your Free Score
        </a>
      </header>

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '48px 24px' }}>
        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <p style={{
            margin: '0 0 12px',
            color: '#FF7A00',
            fontSize: '11px',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            fontWeight: 600
          }}>
            FREE AI VISIBILITY SCAN
          </p>
          <h1 style={{
            margin: '0 0 16px',
            fontSize: 'clamp(28px, 5vw, 40px)',
            fontWeight: 700,
            lineHeight: 1.2,
            color: '#F0F4F8'
          }}>
            Are {trade} contractors<br />in {city} showing up on AI?
          </h1>
          <p style={{
            margin: '0 auto',
            color: '#8A9BB0',
            fontSize: '16px',
            lineHeight: 1.6,
            maxWidth: '480px'
          }}>
            When someone asks ChatGPT, Siri, or Google AI for a {trade.toLowerCase()} contractor in {city} — do you show up? Claim your free score below.
          </p>
        </div>

        {/* Score cards */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          marginBottom: '48px'
        }}>
          {PREVIEW_CARDS.map((card) => (
            <div
              key={card.id}
              style={{
                background: '#11151C',
                border: '1px solid #222A35',
                borderRadius: '8px',
                padding: '20px 24px',
                position: 'relative',
                overflow: 'hidden',
                ...(card.blurred ? {
                  filter: 'blur(4px)',
                  opacity: 0.5,
                  pointerEvents: 'none',
                  userSelect: 'none'
                } : {})
              }}
              aria-hidden={card.blurred}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{
                    margin: '0 0 4px',
                    color: '#8A9BB0',
                    fontSize: '10px',
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    fontWeight: 600
                  }}>
                    {card.icon} {card.label}
                  </p>
                  <p style={{
                    margin: 0,
                    color: '#F0F4F8',
                    fontSize: '14px',
                    lineHeight: 1.5,
                    maxWidth: '420px'
                  }}>
                    {card.description}
                  </p>
                </div>
                <div style={{
                  fontSize: '36px',
                  fontWeight: 700,
                  color: '#3A4759',
                  fontFamily: 'monospace',
                  minWidth: '60px',
                  textAlign: 'right'
                }}>
                  {card.sampleScore}
                  <span style={{ fontSize: '14px', color: '#3A4759' }}>/{card.maxScore}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Lock overlay over the blurred cards area */}
        <div style={{
          background: 'linear-gradient(to bottom, transparent 0%, #07090C 30%)',
          marginTop: '-160px',
          paddingTop: '80px',
          position: 'relative',
          zIndex: 1
        }}>
          {/* CTA Card */}
          <div style={{
            background: '#11151C',
            border: '1px solid #FF7A00',
            borderRadius: '8px',
            padding: '36px 32px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: 'rgba(255,122,0,0.1)',
              border: '1px solid rgba(255,122,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              fontSize: '22px'
            }}>
              ⚡
            </div>

            <h2 style={{
              margin: '0 0 8px',
              fontSize: '22px',
              fontWeight: 700,
              color: '#F0F4F8'
            }}>
              See your full {trade} AI score for {city}
            </h2>
            <p style={{
              margin: '0 0 24px',
              color: '#8A9BB0',
              fontSize: '15px',
              lineHeight: 1.6
            }}>
              Free scan. No credit card. See exactly why competitors are showing up above you on ChatGPT and Siri — and the exact fixes ranked by impact.
            </p>

            {/* Email capture form */}
            <form
              action="/api/auth/signup-from-scan"
              method="POST"
              style={{
                display: 'flex',
                gap: '12px',
                maxWidth: '440px',
                margin: '0 auto',
                flexDirection: 'column' as const
              }}
            >
              <input type="hidden" name="city" value={city} />
              <input type="hidden" name="trade" value={rawTrade} />
              <input type="hidden" name="source" value="score_preview" />

              <input
                type="text"
                name="businessName"
                placeholder="Business name"
                required
                style={{
                  background: '#07090C',
                  border: '1px solid #222A35',
                  color: '#F0F4F8',
                  padding: '13px 16px',
                  fontSize: '14px',
                  borderRadius: '4px',
                  outline: 'none',
                  width: '100%',
                  boxSizing: 'border-box' as const
                }}
              />
              <input
                type="email"
                name="email"
                placeholder="Your email"
                required
                style={{
                  background: '#07090C',
                  border: '1px solid #222A35',
                  color: '#F0F4F8',
                  padding: '13px 16px',
                  fontSize: '14px',
                  borderRadius: '4px',
                  outline: 'none',
                  width: '100%',
                  boxSizing: 'border-box' as const
                }}
              />
              <button
                type="submit"
                style={{
                  background: '#FF7A00',
                  color: '#07090C',
                  border: 'none',
                  padding: '14px 24px',
                  fontSize: '15px',
                  fontWeight: 700,
                  borderRadius: '4px',
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                Get My Free AI Visibility Score →
              </button>
            </form>

            <p style={{
              margin: '16px 0 0',
              color: '#3A4759',
              fontSize: '12px'
            }}>
              Free forever · No credit card · Results in 60 seconds
            </p>
          </div>
        </div>

        {/* Social proof */}
        <div style={{
          marginTop: '48px',
          textAlign: 'center',
          padding: '32px 24px',
          borderTop: '1px solid #222A35'
        }}>
          <p style={{ margin: '0 0 20px', color: '#8A9BB0', fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase' }}>
            WHAT CONTRACTORS SAY
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              {
                quote: 'My score went from 23 to 67 in 6 weeks. I now show up on ChatGPT for HVAC in Dallas.',
                name: 'Mike R.',
                trade: 'HVAC · Dallas TX'
              },
              {
                quote: 'Fixed my Foursquare listing in 3 minutes. Three days later I was getting calls from new AI referrals.',
                name: 'Carlos M.',
                trade: 'Plumber · Phoenix AZ'
              }
            ].map((review, i) => (
              <div
                key={i}
                style={{
                  background: '#11151C',
                  border: '1px solid #222A35',
                  borderRadius: '8px',
                  padding: '20px 24px',
                  textAlign: 'left'
                }}
              >
                <p style={{ margin: '0 0 12px', color: '#F0F4F8', fontSize: '14px', lineHeight: 1.6 }}>
                  &ldquo;{review.quote}&rdquo;
                </p>
                <p style={{ margin: 0, color: '#8A9BB0', fontSize: '12px' }}>
                  {review.name} · {review.trade}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
