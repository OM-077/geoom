'use client'

const signals = [
  {
    name: 'Schema Markup',
    weight: 30, pts: 4, max: 30,
    status: 'CRITICAL' as const,
    explain:
      "Your website has no structured data. When ChatGPT looks for an HVAC company in Denver, it reads schema markup to understand what you do and where. Without it, you don't exist to AI.",
  },
  {
    name: 'FAQ Content',
    weight: 25, pts: 2, max: 25,
    status: 'CRITICAL' as const,
    explain:
      'You have no FAQ section. FAQ blocks are cited by AI 2.7× more than regular content. AI has nothing to quote when recommending you.',
  },
  {
    name: 'GBP Completeness',
    weight: 20, pts: 12, max: 20,
    status: 'NEEDS_WORK' as const,
    explain:
      'Your Google Business Profile is 60% complete. Missing: business hours, service area, and business description. Siri and Google AI Overview pull directly from GBP.',
  },
  {
    name: 'Citation Consistency',
    weight: 15, pts: 8, max: 15,
    status: 'NEEDS_WORK' as const,
    explain:
      'Found 3 different versions of your address across citation sources. Inconsistent data lowers AI trust and leads to fewer recommendations.',
  },
  {
    name: 'Review Signals',
    weight: 10, pts: 8, max: 10,
    status: 'GOOD' as const,
    explain: '',
  },
]

type Status = 'CRITICAL' | 'NEEDS_WORK' | 'GOOD'

const st: Record<Status, { color: string; bg: string; label: string }> = {
  CRITICAL:   { color: 'var(--score-red)',   bg: 'oklch(62% 0.21 25 / 0.15)',   label: 'Critical' },
  NEEDS_WORK: { color: 'var(--score-amber)', bg: 'oklch(75% 0.17 68 / 0.15)',   label: 'Needs Work' },
  GOOD:       { color: 'var(--score-green)', bg: 'oklch(72% 0.18 145 / 0.15)',  label: 'Good' },
}

const faqs = [
  {
    q: 'Why does schema markup matter most?',
    a: 'AI assistants read structured data first. Schema tells them exactly what you do, where you do it, and who to call — in their language.',
  },
  {
    q: 'Why do FAQ blocks get cited 2.7× more?',
    a: "AI systems are trained to pull from well-structured question-and-answer content because it's easy to quote directly.",
  },
  {
    q: 'What does GBP completeness affect?',
    a: 'Siri and Google AI Overview pull directly from Google Business Profile. If your hours, service area, or description are missing, those platforms can't recommend you.',
  },
  {
    q: 'Why does citation consistency matter?',
    a: 'AI systems cross-reference your business data across multiple sources. If your name, address, or phone number differs, AI treats your data as unreliable.',
  },
]

export default function ScoreBreakdownTab() {
  return (
    <div>
      {/* Signal rows */}
      <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
        {signals.map((sig, i) => {
          const s = st[sig.status]
          return (
            <div
              key={sig.name}
              className="px-5 py-4"
              style={{
                borderLeft: `3px solid ${s.color}`,
                borderBottom: i < signals.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                background: 'var(--raised-lacquer)',
              }}
            >
              {/* Header row */}
              <div className="flex items-center gap-2.5 mb-2.5">
                <span
                  className="text-[10px] font-semibold uppercase tracking-[1px] px-2 py-0.5 rounded-sm"
                  style={{ color: s.color, background: s.bg }}
                >
                  {s.label}
                </span>
                <span
                  className="text-[15px] font-semibold flex-1"
                  style={{ color: 'var(--champagne)' }}
                >
                  {sig.name}
                </span>
                <span className="text-xs" style={{ color: 'var(--text-dim)' }}>
                  {sig.weight}% weight
                </span>
              </div>

              {/* Progress bar */}
              <div className="flex items-center gap-2.5 mb-2">
                <div
                  className="flex-1 h-1 rounded-full"
                  style={{ background: 'var(--lacquer-deep)' }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${(sig.pts / sig.max) * 100}%`, background: s.color }}
                  />
                </div>
                <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                  {sig.pts} / {sig.max} pts
                </span>
              </div>

              {/* Explanation */}
              {sig.explain && (
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-warm)' }}>
                  {sig.explain}
                </p>
              )}
            </div>
          )
        })}
      </div>

      <p className="text-sm mt-4" style={{ color: 'var(--text-muted)' }}>
        Fix your biggest gap first. One action. 10 minutes on Monday.
      </p>

      {/* FAQ section */}
      <div className="mt-9" itemScope itemType="https://schema.org/FAQPage">
        <h2
          className="font-barlow font-semibold text-[28px] mb-1.5"
          style={{ color: 'var(--champagne)' }}
        >
          Why each signal matters
        </h2>
        <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
          How AI systems actually use each signal to decide who to recommend.
        </p>

        {faqs.map((f) => (
          <details
            key={f.q}
            style={{ borderBottom: '1px solid var(--border-subtle)' }}
            itemScope
            itemProp="mainEntity"
            itemType="https://schema.org/Question"
          >
            <summary
              className="flex items-center justify-between py-4 cursor-pointer text-[15px] font-semibold"
              style={{ color: 'var(--champagne)' }}
              itemProp="name"
            >
              {f.q}
              <span className="chevron ml-3 shrink-0 text-sm" style={{ color: 'var(--text-dim)' }}>
                ▾
              </span>
            </summary>
            <p
              className="pb-4 text-sm leading-relaxed"
              style={{ color: 'var(--text-muted)' }}
              itemScope
              itemProp="acceptedAnswer"
              itemType="https://schema.org/Answer"
            >
              <span itemProp="text">{f.a}</span>
            </p>
          </details>
        ))}
      </div>
    </div>
  )
}
