'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import GeoomScore from '@/components/shared/GeoomScore'
import AuditPaywall from '@/components/audit/AuditPaywall'
import SignalBreakdown from '@/components/audit/SignalBreakdown'
import CompetitorComparison from '@/components/audit/CompetitorComparison'
import CallProjection from '@/components/audit/CallProjection'
import { estimatedCalls, scoreColor } from '@/lib/utils'

interface AuditPageProps {
  searchParams: { business?: string; city?: string; score?: string }
}

export default function AuditPage({ searchParams }: AuditPageProps) {
  const businessName = searchParams.business ?? 'Summit HVAC'
  const city = searchParams.city ?? 'Denver, CO'
  const score = parseInt(searchParams.score ?? '34', 10)
  const calls = estimatedCalls(score)

  return (
    <div style={{ background: 'var(--lacquer-black)', minHeight: '100vh' }}>
      {/* Header — logo only, no nav */}
      <header style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--lacquer-black)' }} className="sticky top-0 z-50 py-3.5">
        <div className="max-w-[900px] mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="font-barlow font-bold text-[22px] tracking-tight" style={{ color: 'var(--champagne)' }}>
            geo<span style={{ color: 'var(--kinpaku-gold)' }}>om</span>
          </Link>
          <span className="text-sm" style={{ color: 'var(--text-dim)' }}>
            Already a member? <Link href="/login" style={{ color: 'var(--verdigris)' }}>Sign in →</Link>
          </span>
        </div>
      </header>

      <main className="max-w-[900px] mx-auto px-6 py-10 pb-20">

        {/* Identity bar */}
        <div className="flex items-center gap-3 flex-wrap mb-6">
          <span className="text-[11px] font-medium uppercase tracking-[1px] px-2.5 py-1 rounded-sm" style={{ background: 'var(--raised-lacquer)', border: '1px solid var(--border-strong)', color: 'var(--text-muted)' }}>
            HVAC
          </span>
          <span className="text-lg font-semibold" style={{ color: 'var(--champagne)' }}>{businessName}</span>
          <span style={{ color: 'var(--border-strong)' }}>·</span>
          <span className="text-base" style={{ color: 'var(--text-muted)' }}>{city}</span>
        </div>

        {/* Score */}
        <GeoomScore score={score} businessName={businessName} showCTA={false} />

        {/* PAYWALL — replaces free step */}
        <AuditPaywall score={score} businessName={businessName} city={city} />

        {/* Signal breakdown */}
        <SignalBreakdown score={score} />

        {/* Competitor comparison */}
        <CompetitorComparison score={score} businessName={businessName} city={city} trade="HVAC" />

        {/* Call projection */}
        <CallProjection score={score} city={city} trade="HVAC" />

        {/* Trust log */}
        <section className="mt-14">
          <h2 className="font-barlow font-semibold text-2xl mb-5" style={{ color: 'var(--champagne)' }}>What contractors like you are seeing</h2>
          {[
            { meta: 'Wed 10/08 · Marcus T. — HVAC — Denver, CO', delta: '31 → 68', quote: 'Had my slowest January ever lined up. Started Geoom in October. February was different — got 4 calls from people who said ChatGPT sent them.' },
            { meta: 'Mon 09/22 · Julie R. — Plumbing — Austin, TX', delta: '44 → 71', quote: 'The Monday tasks are actually 10 minutes. I was skeptical. Did three of them. Score went from 44 to 71.' },
            { meta: 'Tue 09/09 · Dave K. — Electrical — Phoenix, AZ', delta: '29 → 55', quote: 'Saw my competitor was a 61 and I was a 29. That was enough.' },
          ].map((e) => (
            <div key={e.meta} className="py-5" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              <p className="text-[11px] font-medium uppercase tracking-[1px] mb-2" style={{ color: 'var(--text-muted)' }}>
                {e.meta} · Score: <span style={{ color: 'var(--verdigris)' }}>{e.delta}</span>
              </p>
              <p className="text-[15px] leading-relaxed pl-4" style={{ color: 'var(--text-warm)', borderLeft: '3px solid var(--border-subtle)' }}>
                &ldquo;{e.quote}&rdquo;
              </p>
            </div>
          ))}
        </section>

        {/* Final CTA */}
        <section className="mt-12 text-center">
          <h2 className="font-barlow font-bold text-4xl mb-3" style={{ color: 'var(--champagne)' }}>Fix your score.<br />One Monday at a time.</h2>
          <p className="text-base mb-6" style={{ color: 'var(--text-muted)' }}>Your first action plan is ready the moment you sign up.</p>
          <Link
            href={`/signup?score=${score}&business=${encodeURIComponent(businessName)}&city=${encodeURIComponent(city)}`}
            className="inline-block font-barlow font-bold text-xl px-8 py-4 rounded"
            style={{ background: 'var(--kinpaku-gold)', color: 'var(--lacquer-black)' }}
          >
            See my full score and fix it →
          </Link>
          <p className="text-xs mt-3" style={{ color: 'var(--text-dim)' }}>No free trial. Real fixes only.</p>
        </section>

      </main>
    </div>
  )
}
