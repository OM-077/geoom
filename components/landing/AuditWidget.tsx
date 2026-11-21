'use client'

import { useState } from 'react'

interface AuditWidgetProps {
  id: string
  prefillResult?: { score: number; businessName: string; city: string }
}

export default function AuditWidget({ id, prefillResult }: AuditWidgetProps) {
  const [businessName, setBusinessName] = useState(prefillResult?.businessName ?? '')
  const [city, setCity] = useState(prefillResult?.city ?? '')
  const [errors, setErrors] = useState<{ biz?: string; city?: string }>({})

  function handleSubmit() {
    const e: typeof errors = {}
    if (!businessName.trim()) e.biz = 'Enter your business name.'
    if (!city.trim()) e.city = 'Enter your city.'
    if (Object.keys(e).length) { setErrors(e); return }
    const params = new URLSearchParams({ business: businessName.trim(), city: city.trim() })
    window.location.href = `/audit?${params.toString()}`
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div>
      {/* Input row */}
      <div
        className="flex flex-col sm:flex-row gap-2 rounded-md p-1.5 transition-colors"
        style={{
          background: 'var(--lacquer-deep)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <input
          id={`${id}-business`}
          type="text"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          onKeyDown={handleKey}
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
          placeholder="e.g. Denver, CO"
          aria-label="City"
          autoComplete="address-level2"
          className="flex-1 bg-transparent border-none outline-none text-[15px] px-3 py-2.5 min-w-0"
          style={{ color: 'var(--champagne)', fontFamily: 'Inter, sans-serif' }}
        />
        <button
          onClick={handleSubmit}
          className="shrink-0 px-5 py-2.5 rounded text-sm font-semibold transition-colors flex items-center gap-2"
          style={{
            background: 'var(--lacquer-black)',
            color: 'var(--kinpaku-gold)',
            border: '1px solid var(--kinpaku-gold)',
            fontFamily: 'Inter, sans-serif',
          }}
          onMouseEnter={(e) => { (e.currentTarget).style.background = 'var(--kinpaku-gold)'; (e.currentTarget).style.color = 'var(--lacquer-black)' }}
          onMouseLeave={(e) => { (e.currentTarget).style.background = 'var(--lacquer-black)'; (e.currentTarget).style.color = 'var(--kinpaku-gold)' }}
        >
          Check my score →
        </button>
      </div>

      {/* Validation */}
      {(errors.biz || errors.city) && (
        <p className="text-xs mt-1.5" style={{ color: 'var(--score-red)' }}>
          {errors.biz || errors.city}
        </p>
      )}
    </div>
  )
}
