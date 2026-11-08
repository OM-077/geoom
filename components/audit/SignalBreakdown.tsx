'use client'

import { scoreColor } from '@/lib/utils'

interface Signal {
  name: string
  weight: number
  pts: number
  maxPts: number
  status: 'CRITICAL' | 'NEEDS_WORK' | 'GOOD'
  explanation: string
}

function getSignals(score: number): Signal[] {
  return [
    { name: 'Schema Markup',        weight: 30, pts: Math.round(score * 0.13), maxPts: 30, status: score < 40 ? 'CRITICAL' : score < 70 ? 'NEEDS_WORK' : 'GOOD', explanation: 'Your website has no structured data. When ChatGPT looks for an HVAC company, it reads schema markup to understand what you do and where. Without it, you don\'t exist to AI.' },
    { name: 'FAQ Content',          weight: 25, pts: Math.round(score * 0.08), maxPts: 25, status: score < 40 ? 'CRITICAL' : score < 70 ? 'NEEDS_WORK' : 'GOOD', explanation: 'FAQ blocks are cited by AI 2.7x more than regular content. AI has nothing to quote when recommending you.' },
    { name: 'GBP Completeness',     weight: 20, pts: Math.round(score * 0.25), maxPts: 20, status: score < 50 ? 'NEEDS_WORK' : 'GOOD', explanation: 'Your Google Business Profile is incomplete. Siri and Google AI Overview pull directly from GBP. Missing: business hours, service area, description.' },
    { name: 'Citation Consistency', weight: 15, pts: Math.round(score * 0.16), maxPts: 15, status: score < 60 ? 'NEEDS_WORK' : 'GOOD', explanation: 'Found conflicting business addresses across citation sources. Inconsistent data lowers AI trust.' },
    { name: 'Review Signals',       weight: 10, pts: Math.round(score * 0.24), maxPts: 10, status: 'GOOD', explanation: '' },
  ]
}

const statusStyles: Record<string, { color: string; bg: string; label: string }> = {
  CRITICAL:   { color: 'var(--score-red)',   bg: 'oklch(62% 0.21 25 / 0.15)',  label: 'Critical' },
  NEEDS_WORK: { color: 'var(--score-amber)', bg: 'oklch(75% 0.17 68 / 0.15)',  label: 'Needs Work' },
  GOOD:       { color: 'var(--score-green)', bg: 'oklch(72% 0.18 145 / 0.15)', label: 'Good' },
}

export default function SignalBreakdown({ score }: { score: number }) {
  const signals = getSignals(score)

  return (
    <section className="mt-12">
      <h2 className="font-barlow font-semibold text-[28px] mb-5" style={{ color: 'var(--champagne)' }}>
        Here&apos;s what&apos;s holding your score down
      </h2>
      <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
        {signals.map((sig, i) => {
          const st = statusStyles[sig.status]
          const fillPct = (sig.pts / sig.maxPts) * 100
          return (
            <div
              key={sig.name}
              className="px-5 py-4"
              style={{
                borderLeft: `3px solid ${st.color}`,
                borderBottom: i < signals.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                background: 'var(--raised-lacquer)',
              }}
            >
              <div className="flex items-center gap-2.5 mb-2.5">
                <span className="text-[10px] font-semibold uppercase tracking-[1px] px-2 py-0.5 rounded-sm" style={{ color: st.color, background: st.bg }}>
                  {st.label}
                </span>
                <span className="text-[15px] font-semibold flex-1" style={{ color: 'var(--champagne)' }}>{sig.name}</span>
                <span className="text-xs" style={{ color: 'var(--text-dim)' }}>{sig.weight}% weight</span>
              </div>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="flex-1 h-1 rounded-full" style={{ background: 'var(--lacquer-deep)' }}>
                  <div className="h-full rounded-full" style={{ width: `${fillPct}%`, background: st.color }} />
                </div>
                <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{sig.pts} / {sig.maxPts} pts</span>
              </div>
              {sig.explanation && (
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-warm)' }}>{sig.explanation}</p>
              )}
            </div>
          )
        })}
      </div>
      <p className="text-sm mt-4" style={{ color: 'var(--text-muted)' }}>Fix your biggest gap first. One action. 10 minutes on Monday.</p>
    </section>
  )
}
