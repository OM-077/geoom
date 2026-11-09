'use client'

import Link from 'next/link'

const features = [
  'Geoom Score — updated every week across 6 signal buckets',
  'Weekly Monday fix plan — 1 task, 10 minutes, moves your score',
  'Job-to-page engine — every completed job becomes a local SEO page',
  'NAP Scanner — checks your listing on 8 platforms automatically',
  'FAQ Generator + llms.txt — tells every AI engine about your business',
  'Competitor Spy — track 3 rivals\' scores week by week',
  'Ask Geoom — AI coach answers any visibility question',
  'Review request engine — auto-SMS after every job',
  'Attribution Panel — shows exactly which fixes drove more calls',
  'Pipeline connect — Jobber, HouseCall Pro, Workiz, ServiceM8',
  'GBP sync — Google Business Profile insights in one place',
  'City Leaderboard rank + shareable score card',
]

export default function PricingSection() {
  return (
    <section id="pricing" className="py-24" style={{ background: 'var(--lacquer-deep)', borderTop: '1px solid var(--border-subtle)' }}>
      <div className="max-w-[1200px] mx-auto px-6">

        <h2 className="font-barlow font-semibold mb-2" style={{ fontSize: 'clamp(28px,3vw,36px)', color: 'var(--champagne)' }}>
          One plan. Everything included.
        </h2>
        <p className="text-lg mb-10" style={{ color: 'var(--text-muted)' }}>No feature gates. No tiers. Cancel any time.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-[860px]">

          {/* Monthly */}
          <div className="rounded-lg p-8" style={{ background: 'var(--raised-lacquer)', border: '1px solid var(--kinpaku-gold)' }}>
            <span className="inline-block text-[11px] font-medium uppercase tracking-[1px] px-2 py-0.5 rounded-sm mb-5" style={{ color: 'var(--kinpaku-gold)', border: '1px solid var(--kinpaku-gold)' }}>
              Full access
            </span>
            <div className="mb-1.5">
              <span className="font-barlow font-bold" style={{ fontSize: '64px', color: 'var(--champagne)', lineHeight: 1 }}>$97</span>
              <span className="text-lg ml-1" style={{ color: 'var(--text-muted)' }}>/month</span>
            </div>
            <p className="text-[15px] mb-6" style={{ color: 'var(--text-muted)' }}>Every engine. Every feature. Cancel any time.</p>
            <hr className="mb-6" style={{ border: 'none', borderTop: '1px solid var(--border-subtle)' }} />
            <ul className="mb-7 space-y-2">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm font-medium leading-relaxed" style={{ color: 'var(--text-warm)' }}>
                  <span style={{ color: 'var(--kinpaku-gold)', flexShrink: 0 }}>✓</span>{f}
                </li>
              ))}
            </ul>
            <Link href="/signup" className="block w-full text-center font-barlow font-bold text-lg py-4 rounded" style={{ background: 'var(--kinpaku-gold)', color: 'var(--lacquer-black)' }}>
              Start for $97/month →
            </Link>
            <p className="text-xs text-center mt-2" style={{ color: 'var(--text-dim)' }}>No setup fee · Cancel any time</p>
          </div>

          {/* Founding */}
          <div className="rounded-lg p-8 flex flex-col" style={{ background: 'var(--raised-lacquer)', border: '1px solid var(--border-subtle)' }}>
            <span className="inline-block text-[11px] font-medium uppercase tracking-[1px] px-2 py-0.5 rounded-sm mb-5" style={{ color: 'var(--verdigris)', border: '1px solid var(--verdigris)' }}>
              ⚡ 35 spots — Early access
            </span>
            <div className="mb-1.5">
              <span className="font-barlow font-bold" style={{ fontSize: '64px', color: 'var(--champagne)', lineHeight: 1 }}>$499</span>
              <span className="text-lg ml-1" style={{ color: 'var(--text-muted)' }}>/year</span>
            </div>
            <p className="text-[15px] mb-2" style={{ color: 'var(--text-muted)' }}>Everything in monthly — save $665</p>
            <p className="text-sm mb-6 font-medium" style={{ color: 'var(--verdigris)' }}>After your year: moves to $97/month</p>
            <hr className="mb-6" style={{ border: 'none', borderTop: '1px solid var(--border-subtle)' }} />
            <div className="mb-7 rounded-lg p-4" style={{ background: 'rgba(0,255,180,0.04)', border: '1px solid rgba(0,255,180,0.12)' }}>
              <p className="text-sm font-semibold mb-1" style={{ color: 'var(--verdigris)' }}>Founding member perks</p>
              <ul className="space-y-1.5">
                {[
                  'All features, forever — even new ones we add',
                  'Your name in the founding member wall',
                  'Direct line to us — suggest features, get them built',
                  'Locked in before price increases',
                ].map(p => (
                  <li key={p} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-warm)' }}>
                    <span style={{ color: 'var(--verdigris)', flexShrink: 0 }}>✓</span>{p}
                  </li>
                ))}
              </ul>
            </div>
            <Link href="/signup?plan=founding" className="block w-full text-center font-barlow font-bold text-lg py-4 rounded mt-auto" style={{ background: 'var(--raised-lacquer)', color: 'var(--champagne)', border: '1px solid var(--kinpaku-gold)' }}>
              Claim founding spot — $499/year →
            </Link>
            <p className="text-xs text-center mt-2" style={{ color: 'var(--text-dim)' }}>35 spots total · {'{remaining}'} left</p>
          </div>

        </div>

        {/* Bottom trust line */}
        <p className="text-sm mt-8" style={{ color: 'var(--text-dim)' }}>
          Used by HVAC, plumbing, electrical and roofing contractors across the US, UK, Canada and Australia.
          If Geoom doesn't move your score in 30 days, we'll refund you — no questions.
        </p>
      </div>
    </section>
  )
}
