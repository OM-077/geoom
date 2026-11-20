'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import GeoomScore from '@/components/shared/GeoomScore'
import AuditPaywall from '@/components/audit/AuditPaywall'
import SignalBreakdown from '@/components/audit/SignalBreakdown'
import CompetitorComparison from '@/components/audit/CompetitorComparison'
import CallProjection from '@/components/audit/CallProjection'

const LOADING_STEPS = [
  'Locating your Google Business Profile…',
  'Scanning NAP citations across 8 platforms…',
  'Checking schema markup and structured data…',
  'Analysing review signals and rating freshness…',
  'Running AI visibility test across ChatGPT, Perplexity, Gemini…',
  'Calculating your Geoom Score…',
]

const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

interface AuditResult {
  score: number
  businessName: string
  city: string
  trade?: string
  buckets?: Record<string, number>
  fixes?: Array<{ bucket: string; title: string; impactPoints: number; priority: string }>
  gbpFound?: boolean
  rating?: number
  reviewCount?: number
  dataSource?: string
}

function getCacheKey(business: string, city: string) {
  return `geoom_audit_${business.toLowerCase().trim()}_${city.toLowerCase().trim()}`
}

function readCache(key: string): AuditResult | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const { result, ts } = JSON.parse(raw) as { result: AuditResult; ts: number }
    if (Date.now() - ts > CACHE_TTL_MS) { localStorage.removeItem(key); return null }
    return result
  } catch { return null }
}

function writeCache(key: string, result: AuditResult) {
  try { localStorage.setItem(key, JSON.stringify({ result, ts: Date.now() })) } catch { /* noop */ }
}

export default function AuditPage() {
  const searchParams = useSearchParams()
  const businessName = searchParams.get('business') || 'Summit HVAC'
  const city = searchParams.get('city') || 'Denver, CO'

  const [status, setStatus] = useState<'loading' | 'done' | 'error'>('loading')
  const [stepIndex, setStepIndex] = useState(0)
  const [result, setResult] = useState<AuditResult | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const cacheKey = getCacheKey(businessName, city)
    const cached = readCache(cacheKey)
    if (cached) {
      setResult(cached)
      setStatus('done')
      return
    }

    // Advance loading steps every 1.2s while fetch is in flight
    const stepTimer = setInterval(() => {
      setStepIndex(i => Math.min(i + 1, LOADING_STEPS.length - 1))
    }, 1200)

    fetch('/api/audit/free', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessName, city }),
    })
      .then(async res => {
        clearInterval(stepTimer)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json() as AuditResult & { score: number }
        const r: AuditResult = {
          score: data.score ?? 34,
          businessName,
          city,
          trade: data.trade,
          buckets: data.buckets,
          fixes: data.fixes,
          gbpFound: data.gbpFound,
          rating: data.rating,
          reviewCount: data.reviewCount,
          dataSource: data.dataSource,
        }
        writeCache(cacheKey, r)
        setResult(r)
        setStatus('done')
      })
      .catch(err => {
        clearInterval(stepTimer)
        console.error('Audit failed:', err)
        setErrorMsg('Could not run audit. Please try again.')
        setStatus('error')
      })

    return () => clearInterval(stepTimer)
  }, [businessName, city])

  const score = result?.score ?? 0

  return (
    <div style={{ background: 'var(--lacquer-black)', minHeight: '100vh' }}>
      {/* Header */}
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

        {/* Loading state */}
        {status === 'loading' && (
          <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 32 }}>
            <div>
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Running AI visibility audit for</p>
              <p className="font-barlow font-bold text-2xl" style={{ color: 'var(--champagne)' }}>{businessName} · {city}</p>
            </div>
            <div style={{ width: 48, height: 48, border: '3px solid rgba(245,158,11,0.2)', borderTopColor: 'var(--kinpaku-gold)', borderRadius: '50%', animation: 'spin 0.9s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <div style={{ maxWidth: 400, textAlign: 'center' }}>
              {LOADING_STEPS.map((step, i) => (
                <p
                  key={step}
                  className="text-sm py-1.5 transition-all duration-300"
                  style={{
                    color: i === stepIndex ? 'var(--champagne)' : i < stepIndex ? 'var(--verdigris)' : 'var(--text-dim)',
                    fontWeight: i === stepIndex ? 600 : 400,
                  }}
                >
                  {i < stepIndex ? '✓ ' : i === stepIndex ? '→ ' : ''}{step}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Error state */}
        {status === 'error' && (
          <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <p style={{ color: '#ef4444', fontSize: 15 }}>{errorMsg}</p>
            <Link href="/" style={{ color: 'var(--kinpaku-gold)', fontSize: 14 }}>← Try again</Link>
          </div>
        )}

        {/* Result state */}
        {status === 'done' && result && (
          <>
            {/* Identity bar */}
            <div className="flex items-center gap-3 flex-wrap mb-6">
              <span className="text-[11px] font-medium uppercase tracking-[1px] px-2.5 py-1 rounded-sm" style={{ background: 'var(--raised-lacquer)', border: '1px solid var(--border-strong)', color: 'var(--text-muted)' }}>
                {result.trade?.toUpperCase() || 'HOME SERVICE'}
              </span>
              <span className="text-lg font-semibold" style={{ color: 'var(--champagne)' }}>{businessName}</span>
              <span style={{ color: 'var(--border-strong)' }}>·</span>
              <span className="text-base" style={{ color: 'var(--text-muted)' }}>{city}</span>
            </div>

            {/* Score */}
            <GeoomScore score={score} businessName={businessName} showCTA={false} />

            {/* Paywall */}
            <AuditPaywall score={score} businessName={businessName} city={city} />

            {/* Signal breakdown */}
            <SignalBreakdown score={score} />

            {/* Competitor comparison */}
            <CompetitorComparison score={score} businessName={businessName} city={city} trade={result.trade?.toUpperCase() || 'HVAC'} />

            {/* Call projection */}
            <CallProjection score={score} city={city} trade={result.trade?.toUpperCase() || 'HVAC'} />

            {/* Testimonials */}
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
                href={`/signup?score=${score}&business=${encodeURIComponent(businessName)}&city=${encodeURIComponent(city)}&plan=pro`}
                className="inline-block font-barlow font-bold text-xl px-8 py-4 rounded"
                style={{ background: 'var(--kinpaku-gold)', color: 'var(--lacquer-black)' }}
              >
                See my full score and fix it →
              </Link>
              <p className="text-xs mt-3" style={{ color: 'var(--text-dim)' }}>No free trial. Real fixes only.</p>
            </section>
          </>
        )}

      </main>
    </div>
  )
}
