'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { scoreColor } from '@/lib/utils'

interface AuditPaywallProps {
  score: number
  businessName: string
  city: string
}

const lockedItems = [
  { label: 'Schema Markup gap',         blurred: 'No structured data found on site' },
  { label: 'Platform listings missing',  blurred: 'Foursquare unclaimed, 3 inconsistencies' },
  { label: 'Review signal weak',         blurred: 'Response rate 12% — needs 80%+' },
]

export default function AuditPaywall({ score, businessName, city }: AuditPaywallProps) {
  const color = scoreColor(score)
  const router = useRouter()
  const [showPlans, setShowPlans] = useState(false)

  function goToSignup(plan: 'pro' | 'founding') {
    const params = new URLSearchParams({
      plan,
      score: String(score),
      business: businessName,
      city,
    })
    router.push(`/signup?${params.toString()}`)
  }

  return (
    <div className="mt-7 rounded-lg p-7" style={{ background: 'var(--raised-lacquer)', border: '1px solid var(--border-strong)' }}>
      <p className="text-[15px] font-medium mb-5" style={{ color: 'var(--champagne)' }}>
        Your score is{' '}
        <span style={{ color }}>{score}</span>. Here&apos;s what&apos;s keeping it there:
      </p>

      <div className="flex flex-col gap-2.5 mb-6">
        {lockedItems.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-3 rounded-md px-4 py-3"
            style={{ background: 'var(--lacquer-deep)', border: '1px solid var(--border-subtle)' }}
          >
            <span className="text-base shrink-0" style={{ color: 'var(--text-dim)' }}>🔒</span>
            <span className="text-sm font-medium flex-1" style={{ color: 'var(--champagne)' }}>{item.label}</span>
            <span className="text-[13px] select-none" style={{ color: 'var(--text-dim)', filter: 'blur(3px)' }}>
              {item.blurred}
            </span>
          </div>
        ))}
      </div>

      {!showPlans ? (
        <>
          <p className="text-[15px] mb-5" style={{ color: 'var(--text-muted)' }}>
            Fix everything. Cancel any time.
          </p>
          <button
            onClick={() => setShowPlans(true)}
            className="block w-full text-center font-barlow font-bold py-3.5 rounded"
            style={{ background: 'var(--kinpaku-gold)', color: 'var(--lacquer-black)', fontSize: '20px', border: 'none', cursor: 'pointer' }}
          >
            See my full score and fix it →
          </button>
          <p className="text-[13px] text-center mt-2.5" style={{ color: 'var(--text-dim)' }}>
            No free trial. Real fixes only.
          </p>
        </>
      ) : (
        /* Plan picker — shown inline after clicking CTA */
        <div>
          <p className="text-[15px] font-semibold mb-4" style={{ color: 'var(--champagne)' }}>
            Choose your plan:
          </p>
          <div className="flex flex-col gap-3">

            {/* Founding — shown first as best deal */}
            <button
              onClick={() => goToSignup('founding')}
              style={{
                background: 'var(--lacquer-deep)',
                border: '2px solid var(--verdigris)',
                borderRadius: '8px',
                padding: '16px 20px',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{
                    display: 'inline-block',
                    fontSize: '10px',
                    fontWeight: 700,
                    letterSpacing: '1.5px',
                    textTransform: 'uppercase',
                    color: 'var(--verdigris)',
                    border: '1px solid var(--verdigris)',
                    borderRadius: '3px',
                    padding: '2px 7px',
                    marginBottom: '8px',
                  }}>
                    ⚡ Founding · Limited spots
                  </span>
                  <p style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: 'var(--champagne)', lineHeight: 1 }}>
                    $499 <span style={{ fontSize: '14px', fontWeight: 400, color: 'var(--text-muted)' }}>/year</span>
                  </p>
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--verdigris)' }}>
                    Save $665 vs monthly · After year → $97/mo
                  </p>
                </div>
                <span style={{ fontSize: '20px' }}>→</span>
              </div>
            </button>

            {/* Monthly */}
            <button
              onClick={() => goToSignup('pro')}
              style={{
                background: 'var(--lacquer-deep)',
                border: '1px solid var(--kinpaku-gold)',
                borderRadius: '8px',
                padding: '16px 20px',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: 'var(--champagne)', lineHeight: 1 }}>
                    $97 <span style={{ fontSize: '14px', fontWeight: 400, color: 'var(--text-muted)' }}>/month</span>
                  </p>
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                    Full access · Cancel any time
                  </p>
                </div>
                <span style={{ fontSize: '20px', color: 'var(--champagne)' }}>→</span>
              </div>
            </button>

          </div>
          <p className="text-[12px] text-center mt-3" style={{ color: 'var(--text-dim)' }}>
            30-day money back if your score doesn&apos;t move
          </p>
        </div>
      )}
    </div>
  )
}
