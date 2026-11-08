'use client'

import Link from 'next/link'
import { scoreColor } from '@/lib/utils'

interface AuditPaywallProps {
  score: number
  businessName: string
  city: string
}

const lockedItems = [
  { label: 'Schema Markup gap',        blurred: 'No structured data found on site' },
  { label: 'Platform listings missing', blurred: 'Foursquare unclaimed, 3 inconsistencies' },
  { label: 'Review signal weak',        blurred: 'Response rate 12% — needs 80%+' },
]

export default function AuditPaywall({ score, businessName, city }: AuditPaywallProps) {
  const color = scoreColor(score)
  const href = `/signup?score=${score}&business=${encodeURIComponent(businessName)}&city=${encodeURIComponent(city)}`

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

      <p className="text-[15px] mb-5" style={{ color: 'var(--text-muted)' }}>
        Fix everything for $79/month. Cancel any time.
      </p>

      <Link
        href={href}
        className="block w-full text-center font-barlow font-bold py-3.5 rounded"
        style={{ background: 'var(--kinpaku-gold)', color: 'var(--lacquer-black)', fontSize: '20px' }}
      >
        See my full score and fix it →
      </Link>
      <p className="text-[13px] text-center mt-2.5" style={{ color: 'var(--text-dim)' }}>
        No free trial. Real fixes only.
      </p>
    </div>
  )
}
