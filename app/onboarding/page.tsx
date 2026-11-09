'use client'
import OnboardingFlow from '@/components/onboarding/OnboardingFlow'
import Link from 'next/link'

export default function OnboardingPage() {
  return (
    <div style={{ background: 'var(--lacquer-black)', minHeight: '100vh' }}>
      <header style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--lacquer-black)' }} className="sticky top-0 z-50 py-3.5">
        <div className="max-w-[560px] mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="font-barlow font-bold text-[22px] tracking-tight" style={{ color: 'var(--champagne)' }}>
            geo<span style={{ color: 'var(--kinpaku-gold)' }}>om</span>
          </Link>
          <span id="step-count" className="text-sm font-medium" style={{ color: 'var(--text-muted)' }} />
        </div>
      </header>
      <OnboardingFlow />
    </div>
  )
}
