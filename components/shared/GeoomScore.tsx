'use client'

import Link from 'next/link'
import { scoreColor, estimatedCalls, ctaText } from '@/lib/utils'

interface GeoomScoreProps {
  score: number
  businessName: string
  showCTA?: boolean
  className?: string
}

export default function GeoomScore({ score, businessName, showCTA = true, className = '' }: GeoomScoreProps) {
  const color = scoreColor(score)
  const calls = estimatedCalls(score)
  const futureCalls = estimatedCalls(70)
  const cta = ctaText(score)
  const label = score < 40 ? 'Below average' : score < 70 ? 'Average' : 'Above average'

  return (
    <div
      className={`flex gap-7 items-start rounded-lg p-6 ${className}`}
      style={{
        background: 'var(--raised-lacquer)',
        borderLeft: `3px solid ${color}`,
      }}
      role="status"
      aria-label={`Your Geoom Score is ${score} out of 100. ${label}.`}
    >
      {/* Score number */}
      <span
        className="font-barlow font-bold leading-none tracking-tight shrink-0"
        style={{ fontSize: '96px', color, letterSpacing: '-1px' }}
        aria-hidden="true"
      >
        {score}
      </span>

      {/* Right side */}
      <div className="pt-2">
        <p className="font-semibold text-lg mb-1.5" style={{ color: 'var(--champagne)' }}>
          {businessName} is getting ~{calls} AI calls/month.
        </p>
        <p className="text-base mb-3.5" style={{ color: 'var(--text-muted)' }}>
          {score < 70
            ? `At 70+, that jumps to ~${futureCalls} calls/month.`
            : `You're in the top tier. Keep your score above 70.`}
        </p>
        {showCTA && (
          <Link
            href={`/signup?score=${score}&business=${encodeURIComponent(businessName)}`}
            className="inline-block px-5 py-2.5 rounded text-sm font-bold"
            style={{ background: 'var(--kinpaku-gold)', color: 'var(--lacquer-black)' }}
          >
            Fix my score — $97/month →
          </Link>
        )}
      </div>
    </div>
  )
}
