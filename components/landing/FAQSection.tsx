const faqs = [
  {
    q: 'Does this work for HVAC, plumbing, electrical, and roofing?',
    a: 'Yes. Every fix, every action, and every score signal is built specifically for trade contractors. The algorithm knows that an HVAC company in Phoenix needs different signals than a plumber in Austin.',
  },
  {
    q: 'What is ChatGPT actually using to find local contractors?',
    a: 'Mainly Foursquare, Yelp, and Google Business Profile data. If you\'re not listed correctly on those, you don\'t exist to ChatGPT. Geoom checks all 8 platforms that AI systems pull from.',
  },
  {
    q: 'How long until I see more calls?',
    a: 'Most contractors see their score move in the first 2 weeks. AI-driven calls typically start showing up in 6–12 weeks as the platforms update.',
  },
  {
    q: 'Do I need a website?',
    a: 'A website helps but it\'s not required to start. Your Google Business Profile and third-party listings matter more for AI recommendations than your website does.',
  },
  {
    q: 'What if I cancel?',
    a: 'Cancel any time. No fees, no penalties. Your score history stays in our system.',
  },
]

export default function FAQSection() {
  return (
    <section className="py-24" style={{ borderTop: '1px solid var(--border-subtle)' }} itemScope itemType="https://schema.org/FAQPage">
      <div className="max-w-[720px] mx-auto px-6">
        <h2 className="font-barlow font-semibold mb-7" style={{ fontSize: '28px', color: 'var(--champagne)' }}>
          Common questions
        </h2>
        {faqs.map((item) => (
          <details
            key={item.q}
            style={{ borderBottom: '1px solid var(--border-subtle)' }}
            itemScope itemProp="mainEntity" itemType="https://schema.org/Question"
          >
            <summary
              className="flex items-center justify-between py-[18px] cursor-pointer text-base font-semibold"
              style={{ color: 'var(--champagne)' }}
              itemProp="name"
            >
              {item.q}
              <span className="chevron ml-4 shrink-0 text-sm transition-transform" style={{ color: 'var(--text-dim)' }}>▾</span>
            </summary>
            <p
              className="pb-[18px] text-[15px] leading-relaxed max-w-[640px]"
              style={{ color: 'var(--text-warm)' }}
              itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer"
            >
              <span itemProp="text">{item.a}</span>
            </p>
          </details>
        ))}
      </div>
    </section>
  )
}
