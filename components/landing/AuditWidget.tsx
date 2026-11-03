'use client'

import { useState } from 'react'
import GeoomScore from '@/components/shared/GeoomScore'
import { estimatedCalls } from '@/lib/utils'

interface AuditWidgetProps {
  id: string
  prefillResult?: { score: number; businessName: string; city: string }
}

type WidgetState = 'idle' | 'loading' | 'success' | 'error' | 'ratelimit'

export default function AuditWidget({ id, prefillResult }: AuditWidgetProps) {
  const [businessName, setBusinessName] = useState(prefillResult?.businessName ?? '')
  const [city, setCity] = useState(prefillResult?.city ?? '')
  const [state, setState] = useState<WidgetState>(prefillResult ? 'success' : 'idle')
  const [result, setResult] = useState<{ score: number; businessName: string } | null>(
    prefillResult ? { score: prefillResult.score, businessName: prefillResult.businessName } : null
  )
  const [errors, setErrors] = useState<{ biz?: string; city?: string; global?: string }>({})

  async function handleSubmit() {
    const e: typeof errors = {}
    if (!businessName.trim()) e.biz = 'Enter your business name.'
    if (!city.trim()) e.city = 'Enter your city.'
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({})
    setState('loading')

    try {
      const res = await fetch('/api/audit/free', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessName: businessName.trim(), city: city.trim() }),
      })
      if (res.status === 429) { setState('ratelimit'); return }
      if (!res.ok) throw new Error('Server error')
      const data = await res.json()
      setResult({ score: data.score, businessName: businessName.trim() })
      setState('success')
    } catch {
      setState('error')
      setErrors({ global: 'Something went wrong. Try again in a moment.' })
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div>
      {/* Input row */}
      <div
        className="flex gap-2 rounded-md p-1.5 transition-colors"
        style={{
          background: 'var(--lacquer-deep)',
          border: `1px solid var(--border-subtle)`,
        }}
      >
        <input
          id={`${id}-business`}
          type="text"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          onKeyDown={handleKey}
          disabled={state === 'loading'}
          placeholder="e.g. Summit HVAC"
          aria-label="Business name"
          autoComplete="organization"
          className="flex-1 bg-transparent border-none outline-none text-[15px] px-3 py-2.5 min-w-0"
          style={{ color: 'var(--champagne)', fontFamily: 'Inter, sans-serif' }}
        />
        <div className="w-px my-2" style={{ background: 'var(--border-subtle)' }} />
        <input
          id={`${id}-city`}
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyDown={handleKey}
          disabled={state === 'loading'}
          placeholder="e.g. Denver, CO"
          aria-label="City"
          autoComplete="address-level2"
          className="flex-1 bg-transparent border-none outline-none text-[15px] px-3 py-2.5 min-w-0"
          style={{ color: 'var(--champagne)', fontFamily: 'Inter, sans-serif' }}
        />
        <button
          onClick={handleSubmit}
          disabled={state === 'loading'}
          className="shrink-0 px-5 py-2.5 rounded text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          style={{
            background: 'var(--lacquer-black)',
            color: 'var(--kinpaku-gold)',
            border: '1px solid var(--kinpaku-gold)',
            fontFamily: 'Inter, sans-serif',
          }}
          onMouseEnter={(e) => { if (state !== 'loading') { (e.target as HTMLElement).style.background = 'var(--kinpaku-gold)'; (e.target as HTMLElement).style.color = 'var(--lacquer-black)' } }}
          onMouseLeave={(e) => { (e.target as HTMLElement).style.background = 'var(--lacquer-black)'; (e.target as HTMLElement).style.color = 'var(--kinpaku-gold)' }}
        >
          {state === 'loading' && <Spinner />}
          {state === 'loading' ? 'Checking…' : 'Check my score →'}
        </button>
      </div>

      {/* Validation */}
      {(errors.biz || errors.city) && (
        <p className="text-xs mt-1.5" style={{ color: 'var(--score-red)' }}>
          {errors.biz || errors.city}
        </p>
      )}
      {errors.global && (
        <p className="text-xs mt-1.5" style={{ color: 'var(--score-red)' }}>{errors.global}</p>
      )}
      {state === 'ratelimit' && (
        <p className="text-xs mt-1.5" style={{ color: 'var(--score-amber)' }}>
          You&apos;ve checked this business recently. Try again in 24 hours.
        </p>
      )}

      {/* Score result */}
      {state === 'success' && result && (
        <div className="mt-5 animate-fade-up">
          <GeoomScore
            score={result.score}
            businessName={result.businessName}
            showCTA
          />
        </div>
      )}
    </div>
  )
}

function Spinner() {
  return (
    <span
      className="inline-block w-3.5 h-3.5 rounded-full border-2 animate-spin"
      style={{ borderColor: 'var(--border-strong)', borderTopColor: 'var(--kinpaku-gold)' }}
      aria-hidden="true"
    />
  )
}
