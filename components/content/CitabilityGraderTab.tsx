'use client'

'use client'
import { useState } from 'react'
import Link from 'next/link'

const IS_PRO = false // replace with real auth check

interface GradeResult {
  grade: 'CITABLE' | 'NEEDS_WORK' | 'TOO_LONG'
  wordCount: number
  standalone: boolean
  underLimit: boolean
  specificClaim: boolean
  rewrite?: string
}

function gradeText(text: string): GradeResult {
  const words = text.trim().split(/\s+/).length
  const standalone = text.length > 40
  const underLimit = words <= 150
  const specificClaim = /\$|\d+|cost|price|year|hour|minute|same.day|24\/7|licensed|certified/i.test(text)
  const grade = standalone && underLimit && specificClaim ? 'CITABLE' : !underLimit ? 'TOO_LONG' : 'NEEDS_WORK'
  return { grade, wordCount: words, standalone, underLimit, specificClaim,
    rewrite: grade !== 'CITABLE' ? `Summit HVAC provides emergency HVAC service in Denver, CO. We respond within 2–4 hours and are available 24/7. Call (720) 555-0100 for same-day service.` : undefined }
}

const gradeColor: Record<string, string> = {
  CITABLE: 'var(--score-green)', NEEDS_WORK: 'var(--score-amber)', TOO_LONG: 'var(--score-red)'
}

export default function CitabilityGraderTab() {
  const [text, setText] = useState('')
  const [result, setResult] = useState<GradeResult | null>(null)
  const [loading, setLoading] = useState(false)

  function grade() {
    setLoading(true)
    setTimeout(() => { setResult(gradeText(text)); setLoading(false) }, 600)
  }

  if (!IS_PRO) {
    return (
      <div className="relative">
        <div style={{ filter: 'blur(4px)', pointerEvents: 'none', userSelect: 'none' }}>
          <h2 className="font-barlow font-semibold text-[28px] mb-1.5" style={{ color: 'var(--champagne)' }}>Is your website content citable by AI?</h2>
          <p className="text-[15px] mb-5" style={{ color: 'var(--text-muted)' }}>AI pulls specific sections from websites. Paste a paragraph to see if it qualifies.</p>
          <textarea className="w-full rounded-md p-4 text-[15px]" style={{ background: 'var(--lacquer-deep)', border: '1px solid var(--border-subtle)', color: 'var(--text-warm)', fontFamily: 'Inter,sans-serif', minHeight: '140px', resize: 'vertical' }} placeholder="Paste a FAQ answer, service description, or any paragraph from your website..." readOnly />
          <button className="mt-3 font-barlow font-bold text-lg py-3 px-8 rounded" style={{ background: 'var(--kinpaku-gold)', color: 'var(--lacquer-black)', border: 'none' }}>Grade this chunk →</button>
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-lg" style={{ background: 'oklch(7% 0.006 95 / 0.82)' }}>
          <span className="text-2xl">🔒</span>
          <span className="text-xs font-semibold uppercase tracking-[1px]" style={{ color: 'var(--kinpaku-gold)' }}>Pro feature</span>
          <span className="text-sm text-center max-w-[240px]" style={{ color: 'var(--text-muted)' }}>Find out which parts of your website AI can actually quote — and get a rewrite if it can&apos;t.</span>
          <Link href="/signup?plan=pro" className="px-5 py-2.5 rounded text-sm font-semibold" style={{ background: 'var(--kinpaku-gold)', color: 'var(--lacquer-black)', textDecoration: 'none' }}>
            Upgrade to Geoom — $97/mo
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="font-barlow font-semibold text-[28px] mb-1.5" style={{ color: 'var(--champagne)' }}>Is your website content citable by AI?</h2>
      <p className="text-[15px] mb-5" style={{ color: 'var(--text-muted)' }}>AI pulls specific sections from websites. Paste a paragraph to see if it qualifies.</p>
      <textarea value={text} onChange={e => setText(e.target.value)}
        className="w-full rounded-md p-4 text-[15px] mb-3" style={{ background: 'var(--lacquer-deep)', border: '1px solid var(--border-subtle)', color: 'var(--text-warm)', fontFamily: 'Inter,sans-serif', minHeight: '140px', resize: 'vertical' }}
        placeholder="Paste a FAQ answer, service description, or any paragraph from your website..." />
      <button onClick={grade} disabled={!text.trim() || loading}
        className="font-barlow font-bold text-lg py-3 px-8 rounded disabled:opacity-40"
        style={{ background: 'var(--kinpaku-gold)', color: 'var(--lacquer-black)', border: 'none', cursor: 'pointer' }}>
        {loading ? 'Grading…' : 'Grade this chunk →'}
      </button>

      {result && (
        <div className="mt-5 rounded-lg p-6" style={{ background: 'var(--raised-lacquer)', border: '1px solid var(--border-subtle)', animation: 'fadeUp 200ms ease both' }}>
          <div className="font-barlow font-bold text-[32px] mb-4" style={{ color: gradeColor[result.grade] }}>{result.grade}</div>
          <div className="flex flex-col gap-2 mb-4">
            {[
              { ok: result.standalone,   label: `Standalone — makes sense without reading the whole page` },
              { ok: result.underLimit,   label: `Under 150 words — ${result.wordCount} words` },
              { ok: result.specificClaim,label: `Contains a specific claim — not vague, not general` },
            ].map((c, i) => (
              <div key={i} className="flex items-center gap-2.5 text-sm font-medium py-2" style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-warm)' }}>
                <span>{c.ok ? '✅' : '❌'}</span>{c.label}
              </div>
            ))}
          </div>
          {result.rewrite && (
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[1px] mb-2" style={{ color: 'var(--text-muted)' }}>Suggested rewrite</div>
              <div className="rounded-md p-4 text-[15px] leading-relaxed" style={{ background: 'var(--lacquer-deep)', color: 'var(--text-warm)' }}>{result.rewrite}</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
