'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function AlertBanner() {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null
  return (
    <div className="flex items-start gap-3 rounded px-4 py-3 mb-6" style={{ background: 'var(--raised-lacquer)', borderLeft: '3px solid var(--score-amber)' }} role="alert" aria-live="polite">
      <p className="text-sm font-medium flex-1" style={{ color: 'var(--champagne)' }}>
        Your Google Business Profile is 40% complete. This is hurting your Siri and Google AI score.{' '}
        <Link href="/signals?tab=listings" className="text-sm font-medium ml-1" style={{ color: 'var(--kinpaku-gold)' }}>Fix this →</Link>
      </p>
      <button onClick={() => { setDismissed(true); /* POST /api/alerts/dismiss */ }} className="text-lg" style={{ color: 'var(--text-dim)', background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1 }} aria-label="Dismiss alert">×</button>
    </div>
  )
}
