// ============================================
// SOCIAL CARD — OG IMAGE GENERATOR
// @vercel/og — renders score card as PNG
// Used for: Monday email share, dashboard share, referral links
// Public — no auth required
// ============================================
/** @jsxImportSource react */
import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  const businessName = searchParams.get('name') || 'Your Business'
  const score = parseInt(searchParams.get('score') || '0', 10)
  const trade = searchParams.get('trade') || 'Home Services'
  const city = searchParams.get('city') || ''
  const share = parseFloat(searchParams.get('share') || '0')
  const change = parseFloat(searchParams.get('change') || '0')

  // Score color based on range
  const scoreColor = score >= 85 ? '#00E676'
    : score >= 70 ? '#7CDB8A'
    : score >= 50 ? '#F4C542'
    : score >= 30 ? '#FF7A00'
    : '#FF2A2A'

  const changeText = change > 0 ? `▲ +${change}%` : change < 0 ? `▼ ${change}%` : '→ No change'
  const changeColor = change > 0 ? '#00E676' : change < 0 ? '#FF2A2A' : '#8A9BB0'

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: '#07090C',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Background grid */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'linear-gradient(oklch(0.18 0.02 260) 1px, transparent 1px), linear-gradient(90deg, oklch(0.18 0.02 260) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          opacity: 0.3,
          display: 'flex'
        }} />

        {/* Glow behind score */}
        <div style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${scoreColor}22 0%, transparent 70%)`,
          display: 'flex'
        }} />

        {/* GEOOM badge */}
        <div style={{
          position: 'absolute',
          top: '40px',
          left: '60px',
          color: '#8A9BB0',
          fontSize: '13px',
          letterSpacing: '4px',
          textTransform: 'uppercase',
          display: 'flex'
        }}>
          GEOOM
        </div>

        {/* Main content */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0px',
          zIndex: 1
        }}>
          {/* Score */}
          <div style={{
            fontSize: '160px',
            fontWeight: '700',
            color: scoreColor,
            lineHeight: '1',
            fontVariantNumeric: 'tabular-nums',
            display: 'flex'
          }}>
            {score}
          </div>

          {/* /100 */}
          <div style={{
            fontSize: '32px',
            color: '#3A4759',
            marginTop: '-16px',
            display: 'flex'
          }}>
            / 100 AI VISIBILITY
          </div>

          {/* Business name */}
          <div style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#F0F4F8',
            marginTop: '24px',
            display: 'flex'
          }}>
            {businessName}
          </div>

          {/* Trade + city */}
          <div style={{
            fontSize: '18px',
            color: '#8A9BB0',
            marginTop: '6px',
            display: 'flex'
          }}>
            {trade}{city ? ` · ${city}` : ''}
          </div>

          {/* Stats row */}
          <div style={{
            display: 'flex',
            gap: '48px',
            marginTop: '36px',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '36px', fontWeight: '700', color: '#F0F4F8', display: 'flex' }}>
                {share}%
              </span>
              <span style={{ fontSize: '12px', color: '#8A9BB0', letterSpacing: '2px', display: 'flex' }}>
                AI MARKET SHARE
              </span>
            </div>
            <div style={{
              width: '1px',
              height: '48px',
              background: '#222A35',
              display: 'flex'
            }} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '36px', fontWeight: '700', color: changeColor, display: 'flex' }}>
                {changeText}
              </span>
              <span style={{ fontSize: '12px', color: '#8A9BB0', letterSpacing: '2px', display: 'flex' }}>
                THIS WEEK
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          position: 'absolute',
          bottom: '36px',
          color: '#3A4759',
          fontSize: '14px',
          display: 'flex'
        }}>
          geoom.site · AI Visibility for Home Service Contractors
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630
    }
  )
}
