import Link from 'next/link'

const coreFeatures = [
  'Geoom Score, updated every week',
  'See exactly what\'s broken (6 signal buckets)',
  'Platform Authority Score (Yelp, Foursquare, Angi + 5 more)',
  '12-week Fix Program, step by step',
  'FAQ Generator + llms.txt file',
  'NAP Scanner + PDF for your office',
  'Score alerts by email',
  'Your rank on the City Leaderboard',
]

const proFeatures = [
  'Everything in Core',
  'Ask Geoom — your AI coach (chat)',
  'Competitor Spy — watch 3 rivals\' scores over time',
  'Chunk Citability Grader',
  '30-day Progress Report (PDF)',
  'Attribution Panel — "Is it working?" answered with data',
  'Share Your Score (social card)',
  'Score alerts by SMS',
  'Google Business Profile insights sync',
]

export default function PricingSection() {
  return (
    <section id="pricing" className="py-24" style={{ background: 'var(--lacquer-deep)', borderTop: '1px solid var(--border-subtle)' }}>
      <div className="max-w-[1200px] mx-auto px-6">
        <h2 className="font-barlow font-semibold mb-2" style={{ fontSize: 'clamp(28px,3vw,36px)', color: 'var(--champagne)' }}>
          Simple pricing.
        </h2>
        <p className="text-lg mb-10" style={{ color: 'var(--text-muted)' }}>Two plans. No contracts. Cancel any time.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-[800px]">
          {/* Core */}
          <div className="rounded-lg p-8" style={{ background: 'var(--raised-lacquer)', border: '1px solid var(--border-subtle)' }}>
            <span className="inline-block text-[11px] font-medium uppercase tracking-[1px] px-2 py-0.5 rounded-sm mb-5" style={{ color: 'var(--kinpaku-gold)', border: '1px solid var(--kinpaku-gold)' }}>
              Most popular
            </span>
            <div className="mb-1.5">
              <span className="font-barlow font-bold" style={{ fontSize: '56px', color: 'var(--champagne)', lineHeight: 1 }}>$79</span>
              <span className="text-lg ml-1" style={{ color: 'var(--text-muted)' }}>/month</span>
            </div>
            <p className="text-[15px] mb-6" style={{ color: 'var(--text-muted)' }}>Fix your AI visibility yourself</p>
            <hr className="mb-6" style={{ border: 'none', borderTop: '1px solid var(--border-subtle)' }} />
            <ul className="mb-6 space-y-1">
              {coreFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm font-medium leading-relaxed" style={{ color: 'var(--text-warm)' }}>
                  <span style={{ color: 'var(--kinpaku-gold)' }}>✓</span>{f}
                </li>
              ))}
            </ul>
            <Link href="/signup" className="block w-full text-center font-barlow font-bold text-lg py-3.5 rounded transition-colors" style={{ background: 'var(--kinpaku-gold)', color: 'var(--lacquer-black)' }}>
              Start fixing — $79/month
            </Link>
            <p className="text-xs text-center mt-2" style={{ color: 'var(--text-dim)' }}>No setup fee · Cancel any time</p>
          </div>

          {/* Pro */}
          <div className="rounded-lg p-8" style={{ background: 'var(--raised-lacquer)', border: '1px solid var(--kinpaku-gold)' }}>
            <span className="inline-block text-[11px] font-medium uppercase tracking-[1px] px-2 py-0.5 rounded-sm mb-5" style={{ color: 'var(--kinpaku-gold)', border: '1px solid var(--kinpaku-gold)' }}>
              Best for growing businesses
            </span>
            <div className="mb-1.5">
              <span className="font-barlow font-bold" style={{ fontSize: '56px', color: 'var(--champagne)', lineHeight: 1 }}>$149</span>
              <span className="text-lg ml-1" style={{ color: 'var(--text-muted)' }}>/month</span>
            </div>
            <p className="text-[15px] mb-6" style={{ color: 'var(--text-muted)' }}>Beat your competitors, prove it&apos;s working</p>
            <hr className="mb-6" style={{ border: 'none', borderTop: '1px solid var(--border-subtle)' }} />
            <ul className="mb-6 space-y-1">
              {proFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm font-medium leading-relaxed" style={{ color: 'var(--text-warm)' }}>
                  <span style={{ color: 'var(--kinpaku-gold)' }}>✓</span>{f}
                </li>
              ))}
            </ul>
            <Link href="/signup?plan=pro" className="block w-full text-center font-barlow font-bold text-lg py-3.5 rounded transition-colors" style={{ background: 'var(--kinpaku-gold)', color: 'var(--lacquer-black)' }}>
              Get the full picture — $149/month
            </Link>
            <p className="text-xs text-center mt-2" style={{ color: 'var(--text-dim)' }}>No setup fee · Cancel any time</p>
          </div>
        </div>

        <p className="text-[13px] text-center mt-6" style={{ color: 'var(--verdigris)' }}>
          ⚡ Early access — First 35 seats get full Pro for $599/year. After your year ends, you move to $149/month.
        </p>
      </div>
    </section>
  )
}
