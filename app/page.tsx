
import Link from 'next/link'
import AuditWidget from '@/components/landing/AuditWidget'
import DispatchBoard from '@/components/landing/DispatchBoard'
import PricingSection from '@/components/landing/PricingSection'
import FAQSection from '@/components/landing/FAQSection'

export default function LandingPage() {
  return (
    <div style={{ background: 'var(--lacquer-black)', minHeight: '100vh' }}>
      {/* NAV */}
      <nav style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--lacquer-black)' }} className="sticky top-0 z-50 py-4">
        <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="font-barlow font-bold text-[22px] tracking-tight" style={{ color: 'var(--champagne)' }}>
            geo<span style={{ color: 'var(--kinpaku-gold)' }}>om</span>
          </Link>
          <div className="flex items-center gap-6">
            <a href="#how-it-works" className="text-sm font-medium hidden md:block" style={{ color: 'var(--text-muted)' }}>How it works</a>
            <a href="#pricing" className="text-sm font-medium hidden md:block" style={{ color: 'var(--text-muted)' }}>Pricing</a>
            <Link href="/leaderboard" className="text-sm font-medium hidden md:block" style={{ color: 'var(--text-muted)' }}>Leaderboard</Link>
            <a href="#hero" className="text-sm font-semibold px-4 py-2 rounded" style={{ color: 'var(--kinpaku-gold)', border: '1px solid var(--kinpaku-gold)' }}>
              Free audit →
            </a>
          </div>
        </div>
      </nav>

      {/* SECTION 1 — HERO */}
      <section id="hero" className="min-h-screen flex items-center py-20">
        <div className="max-w-[1200px] mx-auto px-6 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-12 items-center">
            {/* Left */}
            <div>
              <p className="text-xs font-medium uppercase tracking-[2px] mb-5" style={{ color: 'var(--text-muted)' }}>
                GEO for Home Services
              </p>
              <h1 className="font-barlow font-bold leading-[1.05] tracking-tight mb-6" style={{ fontSize: 'clamp(36px,5vw,56px)', color: 'var(--champagne)' }}>
                When a homeowner asks ChatGPT<br />
                &ldquo;best HVAC near me&rdquo; —<br />
                do you come up?
              </h1>
              <p className="text-lg mb-8 max-w-[520px] leading-relaxed" style={{ color: 'var(--text-warm)' }}>
                Most contractors don&apos;t. AI assistants pull from a different map than Google. Geoom shows you exactly why you&apos;re invisible — and fixes it in 12 weeks. ChatGPT, Perplexity, Google AI, Gemini, Copilot, and Siri all covered.
              </p>
              <AuditWidget id="hero" />
              <p className="text-[13px] text-center mt-2.5" style={{ color: 'var(--text-dim)' }}>
                412 contractors fixed their AI score this week · 4.9★ from 318 reviews
              </p>
              <p className="text-[12px] mt-3.5" style={{ color: 'var(--text-dim)' }}>
                Works with: <span style={{ color: 'var(--text-muted)' }}>Jobber · ServiceTitan · Housecall Pro</span>
              </p>
            </div>
            {/* Right — dispatch board */}
            <div className="hidden lg:block">
              <DispatchBoard />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 — PROBLEM */}
      <section style={{ background: 'var(--raised-lacquer)', borderTop: '1px solid var(--border-subtle)' }} className="py-16">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="font-barlow font-semibold leading-tight mb-5 max-w-[640px]" style={{ fontSize: 'clamp(28px,3vw,36px)', color: 'var(--champagne)' }}>
            Google gets one map.<br />AI gets another.<br />You&apos;re not on it.
          </h2>
          <p className="text-base max-w-[600px] leading-relaxed mb-12" style={{ color: 'var(--text-warm)' }}>
            When ChatGPT answers &ldquo;best plumber in Austin,&rdquo; it doesn&apos;t search Google. It pulls from Foursquare business data, Yelp citations, schema markup, and structured content it can quote. Contractors with high Geoom Scores appear in that answer. Everyone else doesn&apos;t.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x" style={{ borderColor: 'var(--border-subtle)', border: '1px solid var(--border-subtle)', borderRadius: '8px', overflow: 'hidden' }}>
            {[
              { stat: '~70%', desc: 'of ChatGPT local results pull from Foursquare' },
              { stat: '41% vs 15%', desc: 'citation rate with FAQ blocks vs without' },
              { stat: '6 platforms', desc: 'one weekly action plan covers all of them' },
            ].map((item) => (
              <div key={item.stat} className="px-8 py-7">
                <div className="font-barlow font-bold text-[28px] mb-1.5" style={{ color: 'var(--kinpaku-gold)' }}>{item.stat}</div>
                <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3 — HOW IT WORKS */}
      <section id="how-it-works" className="py-24" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="font-barlow font-semibold mb-3" style={{ fontSize: 'clamp(28px,3vw,36px)', color: 'var(--champagne)' }}>Your weekly job board</h2>
          <p className="text-lg mb-10" style={{ color: 'var(--text-muted)' }}>Every Monday, Geoom audits your AI visibility and delivers one high-priority action.</p>
          <div className="max-w-[760px]">
            {[
              { time: 'Mon 8am',  detail: 'Your Geoom Score updates across all 6 platforms.' },
              { time: 'Mon 9am',  detail: 'Biggest visibility gap ranked: schema, FAQ, citations, or GBP.' },
              { time: 'Mon 9am',  detail: 'One task. Exact copy to paste. Done in 8 minutes.' },
              { time: 'Setup 2 min', detail: 'Auto-import from Jobber. Your trade, city, service area. Nothing to fill out.' },
              { time: 'Ongoing', detail: 'Score history, platform coverage, competitor benchmark.' },
            ].map((row, i) => (
              <div key={i} className="flex items-center gap-5 min-h-[64px]" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: 'var(--kinpaku-gold)' }} />
                <div className="w-[110px] shrink-0 text-[11px] font-medium uppercase tracking-[1px]" style={{ color: 'var(--text-muted)' }}>{row.time}</div>
                <div className="text-[15px]" style={{ color: 'var(--text-warm)' }}>{row.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4 — SCORE BREAKDOWN */}
      <section className="py-24" style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--raised-lacquer)' }}>
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-16">
            <div>
              <h2 className="font-barlow font-semibold mb-9" style={{ fontSize: 'clamp(28px,3vw,36px)', color: 'var(--champagne)' }}>
                Your Geoom Score<br />is built from 5 signals
              </h2>
              {[
                { label: 'Schema Markup',        pct: 30, fill: 30 },
                { label: 'FAQ Content',          pct: 25, fill: 25 },
                { label: 'GBP Completeness',     pct: 20, fill: 20 },
                { label: 'Citation Consistency', pct: 15, fill: 15 },
                { label: 'Review Signals',       pct: 10, fill: 10 },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-3 mb-4">
                  <span className="text-sm font-medium w-44 shrink-0" style={{ color: 'var(--text-warm)' }}>{s.label}</span>
                  <div className="flex-1 h-1 rounded-full" style={{ background: 'var(--border-strong)' }}>
                    <div className="h-full rounded-full" style={{ width: `${s.fill * 3.33}%`, background: 'var(--kinpaku-gold)' }} />
                  </div>
                  <span className="text-xs font-medium w-8 text-right" style={{ color: 'var(--text-muted)' }}>{s.pct}%</span>
                </div>
              ))}
            </div>
            <div>
              <div itemScope itemType="https://schema.org/FAQPage">
                {[
                  { q: 'Why does schema markup matter most?', a: 'AI assistants read structured data first. Schema tells them exactly what you do, where you do it, and who to call — in their language.' },
                  { q: 'What is a Geoom Score?', a: 'A 0–100 score measuring how visible your business is to AI recommendation engines: ChatGPT, Perplexity, Google AI Overviews, Copilot, Gemini, and Siri.' },
                  { q: 'How long does it take to improve?', a: 'Most contractors see a 15–25 point jump in the first 30 days by completing the Monday action plans.' },
                  { q: 'Do I need to change my website?', a: 'Some actions are on your site (adding FAQ schema). Most are off-site: Google Business Profile, citation sources, review platforms.' },
                ].map((item) => (
                  <details key={item.q} className="py-0" style={{ borderBottom: '1px solid var(--border-subtle)' }}
                    itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                    <summary className="flex items-center justify-between py-4 cursor-pointer text-[15px] font-semibold" style={{ color: 'var(--champagne)' }} itemProp="name">
                      {item.q}
                      <span className="chevron ml-3 shrink-0 text-sm transition-transform" style={{ color: 'var(--text-dim)' }}>▾</span>
                    </summary>
                    <p className="pb-4 text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}
                      itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                      <span itemProp="text">{item.a}</span>
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5 — PLATFORMS */}
      <section className="py-16" style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--lacquer-deep)' }}>
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="font-barlow font-semibold text-center mb-10" style={{ fontSize: 'clamp(28px,3vw,36px)', color: 'var(--champagne)' }}>One score. Six platforms.</h2>
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide justify-center flex-wrap md:flex-nowrap">
            {['ChatGPT', 'Perplexity', 'Google AI', 'Copilot', 'Gemini', 'Siri'].map((p) => (
              <div key={p} className="shrink-0 rounded-lg p-4" style={{ background: 'var(--raised-lacquer)', border: '1px solid var(--border-subtle)', width: '160px' }}>
                <p className="text-sm font-semibold mb-2.5" style={{ color: 'var(--champagne)' }}>{p}</p>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--score-green)' }} />
                  <span className="text-[10px] font-medium uppercase tracking-[1px]" style={{ color: 'var(--verdigris)' }}>Tracked</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-center mt-7" style={{ color: 'var(--text-muted)' }}>
            Geoom monitors all six weekly and surfaces the one platform where you have the biggest coverage gap.
          </p>
        </div>
      </section>

      {/* SECTION 6 — SOCIAL PROOF */}
      <section className="py-24" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="font-barlow font-semibold mb-10" style={{ fontSize: 'clamp(28px,3vw,36px)', color: 'var(--champagne)' }}>What contractors are saying</h2>
          {[
            { date: 'Mon 10/14', who: 'Marcus T. — HVAC — Denver CO', quote: 'Went from a 31 to a 68 in 6 weeks. I got a call last month from someone who said ChatGPT recommended me. First time that\'s ever happened.' },
            { date: 'Mon 09/30', who: 'Julie R. — Plumbing — Austin TX', quote: 'The Monday action plans are 10 minutes max. I do them before my first job.' },
            { date: 'Mon 09/16', who: 'Dave K. — Electrical — Phoenix AZ', quote: 'Didn\'t realize I wasn\'t showing up anywhere on AI. The free audit was eye-opening.' },
          ].map((entry) => (
            <div key={entry.date} className="py-6" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              <p className="text-[11px] font-medium uppercase tracking-[1.5px] mb-2" style={{ color: 'var(--text-muted)' }}>{entry.date}</p>
              <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>{entry.who}</p>
              <p className="text-[15px] leading-relaxed pl-4" style={{ color: 'var(--text-warm)', borderLeft: '3px solid var(--border-subtle)' }}>
                &ldquo;{entry.quote}&rdquo;
              </p>
            </div>
          ))}
          <p className="text-xs mt-4" style={{ color: 'var(--text-dim)' }}>Illustrative testimonials. Replace with verified reviews before launch.</p>
        </div>
      </section>

      {/* SECTION 7 — PRICING */}
      <PricingSection />

      {/* SECTION 8 — FAQ */}
      <FAQSection />

      {/* SECTION 9 — FINAL CTA */}
      <section className="py-24 text-center" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <div className="max-w-[600px] mx-auto px-6">
          <h2 className="font-barlow font-bold mb-4" style={{ fontSize: 'clamp(36px,5vw,56px)', color: 'var(--champagne)' }}>
            Find out where you stand.<br />Free. 60 seconds.
          </h2>
          <p className="text-lg mb-8" style={{ color: 'var(--text-muted)' }}>
            Enter your business name and city. Get your Geoom Score instantly — no signup required.
          </p>
          <AuditWidget id="cta" />
          <p className="text-sm mt-4" style={{ color: 'var(--text-muted)' }}>
            No credit card <span className="mx-2" style={{ color: 'var(--border-strong)' }}>·</span>
            No signup <span className="mx-2" style={{ color: 'var(--border-strong)' }}>·</span>
            Live score in 60 seconds
          </p>
        </div>
      </section>
    </div>
  )
}
