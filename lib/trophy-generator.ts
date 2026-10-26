// ============================================
// TROPHY GENERATOR
// 1080x1080 shareable image — JSX for @vercel/og
// Contractor posts in HVAC Facebook groups
// "ChatGPT recommended me!" = free acquisition
// Each trophy shared = potential new user
// ============================================

export interface TrophyParams {
  businessName: string
  city: string
  trade: string
  scoreBefore: number
  scoreAfter: number
  aiEngine: string
  queryText: string
}

// Returns JSX-compatible element tree for ImageResponse
// Used in app/api/citation/trophy/route.ts
export function buildTrophyElement(params: TrophyParams) {
  const pointsGained = params.scoreAfter - params.scoreBefore

  return {
    type: 'div',
    props: {
      style: {
        width: '1080px',
        height: '1080px',
        background: '#07090C',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'sans-serif',
        padding: '80px',
        boxSizing: 'border-box',
        position: 'relative'
      },
      children: [
        // Background grid effect
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              inset: 0,
              backgroundImage: 'linear-gradient(rgba(0,230,118,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,230,118,0.03) 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }
          }
        },
        // Top label
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: '48px',
              left: '80px',
              color: '#3A4759',
              fontSize: '14px',
              letterSpacing: '4px',
              textTransform: 'uppercase',
              fontFamily: 'monospace'
            },
            children: 'GEOOM.SITE'
          }
        },
        // Main content
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '32px',
              position: 'relative',
              zIndex: 10
            },
            children: [
              { type: 'div', props: { style: { fontSize: '72px', lineHeight: '1' }, children: '⚡' } },
              {
                type: 'div',
                props: {
                  style: { color: '#00E676', fontSize: '18px', letterSpacing: '6px', textTransform: 'uppercase', fontWeight: '700', fontFamily: 'monospace' },
                  children: 'YOU ARE ON THE MAP'
                }
              },
              {
                type: 'div',
                props: {
                  style: { color: '#F0F4F8', fontSize: '52px', fontWeight: '800', textAlign: 'center', lineHeight: '1.1', letterSpacing: '-2px', maxWidth: '800px' },
                  children: params.businessName
                }
              },
              {
                type: 'div',
                props: {
                  style: { background: 'rgba(0,230,118,0.08)', border: '1px solid rgba(0,230,118,0.3)', padding: '24px 40px', textAlign: 'center', maxWidth: '800px' },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: { color: '#8A9BB0', fontSize: '16px', marginBottom: '8px' },
                        children: `${params.aiEngine} recommended us for:`
                      }
                    },
                    {
                      type: 'div',
                      props: {
                        style: { color: '#F0F4F8', fontSize: '24px', fontWeight: '600' },
                        children: `"${params.queryText}"`
                      }
                    }
                  ]
                }
              },
              {
                type: 'div',
                props: {
                  style: { display: 'flex', alignItems: 'center', gap: '24px' },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: { textAlign: 'center' },
                        children: [
                          { type: 'div', props: { style: { color: '#6B7280', fontSize: '14px', fontFamily: 'monospace' }, children: 'BEFORE' } },
                          { type: 'div', props: { style: { color: '#8A9BB0', fontSize: '56px', fontWeight: '700', fontFamily: 'monospace' }, children: `${params.scoreBefore}%` } }
                        ]
                      }
                    },
                    { type: 'div', props: { style: { color: '#00E676', fontSize: '48px' }, children: '→' } },
                    {
                      type: 'div',
                      props: {
                        style: { textAlign: 'center' },
                        children: [
                          { type: 'div', props: { style: { color: '#6B7280', fontSize: '14px', fontFamily: 'monospace' }, children: 'NOW' } },
                          { type: 'div', props: { style: { color: '#00E676', fontSize: '56px', fontWeight: '700', fontFamily: 'monospace' }, children: `${params.scoreAfter}%` } }
                        ]
                      }
                    },
                    {
                      type: 'div',
                      props: {
                        style: { background: 'rgba(0,230,118,0.15)', border: '1px solid #00E676', padding: '12px 20px', color: '#00E676', fontSize: '28px', fontWeight: '700', fontFamily: 'monospace' },
                        children: `+${pointsGained}%`
                      }
                    }
                  ]
                }
              }
            ]
          }
        },
        // Bottom watermark
        {
          type: 'div',
          props: {
            style: { position: 'absolute', bottom: '48px', color: '#3A4759', fontSize: '13px', fontFamily: 'monospace', letterSpacing: '2px' },
            children: 'AI VISIBILITY FOR HOME SERVICE CONTRACTORS'
          }
        }
      ]
    }
  }
}
