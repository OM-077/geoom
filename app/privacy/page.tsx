import Link from 'next/link'

export const metadata = { title: 'Privacy Policy — Geoom' }

export default function PrivacyPage() {
  return (
    <div style={{ background: 'var(--lacquer-black)', minHeight: '100vh' }}>
      <header className="py-4 sticky top-0 z-50" style={{ background: 'var(--lacquer-black)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="max-w-[760px] mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="font-barlow font-bold text-[22px] tracking-tight" style={{ color: 'var(--champagne)' }}>
            geo<span style={{ color: 'var(--kinpaku-gold)' }}>om</span>
          </Link>
          <Link href="/" className="text-sm" style={{ color: 'var(--text-muted)' }}>← Back</Link>
        </div>
      </header>

      <main className="max-w-[760px] mx-auto px-6 py-12 pb-20">
        <h1 className="font-barlow font-bold text-[40px] mb-2" style={{ color: 'var(--champagne)' }}>Privacy Policy</h1>
        <p className="text-sm mb-10" style={{ color: 'var(--text-dim)' }}>Last updated: November 2026</p>

        {[
          {
            title: '1. What we collect',
            body: `When you use Geoom, we collect:
• Your email address and password (for account creation)
• Your business name, trade, city, state, phone number, and website URL (entered during onboarding)
• Competitor name you choose to track (entered by you — we do not scrape or guess this)
• Payment information (processed by Dodo Payments — we never store card numbers)
• Audit results generated from publicly available data sources (Google, Foursquare, Yelp)
• Usage data: pages visited, features used, session times`
          },
          {
            title: '2. How we use it',
            body: `We use your data to:
• Generate your Geoom Score and weekly fix plan
• Send your weekly Monday action email
• Process your subscription payments
• Show you competitor data for the competitor name you provide
• Improve our scoring algorithms and product features

We do not sell your data to third parties. Ever.`
          },
          {
            title: '3. Competitor data',
            body: `The competitor scores shown in Geoom are calculated using the same publicly available data sources used for your own score: Google Business Profile listings, Foursquare Places API, Yelp public listings, and schema markup detection. This is equivalent to manually searching a business name on Google or Yelp. We display aggregate scores — not private data. All data displayed about competitors is sourced from public indexes.`
          },
          {
            title: '4. Third-party services',
            body: `Geoom uses the following third-party services:
• Supabase (database and authentication — data stored in US)
• Dodo Payments (payment processing — PCI compliant)
• Google Generative AI / Gemini API (AI search signals)
• Foursquare Places API (business listing data)
• Resend (transactional emails)

Each of these services has their own privacy policy.`
          },
          {
            title: '5. Pipeline integrations',
            body: `If you connect Jobber, Housecall Pro, Workiz, or ServiceM8, we receive job data (job type, city, completion date) to generate local service pages. We do not access customer names, phone numbers, or payment information from your job management software. You can disconnect any integration at any time from Settings.`
          },
          {
            title: '6. Data retention',
            body: `We retain your data for as long as your account is active. If you cancel and request deletion, we will delete your business data, audit history, and content within 30 days. Email us at privacy@geoom.io to request deletion.`
          },
          {
            title: '7. Your rights',
            body: `You have the right to:
• Access the data we hold about you
• Correct inaccurate data
• Request deletion of your data
• Export your audit history and content
• Withdraw consent at any time by cancelling your subscription

Email privacy@geoom.io for any data requests.`
          },
          {
            title: '8. Cookies',
            body: `We use essential cookies only: session authentication (Supabase auth token) and preference storage. We do not use advertising or tracking cookies. We do not use third-party analytics that track you across sites.`
          },
          {
            title: '9. Contact',
            body: `Questions about this policy: privacy@geoom.io`
          },
        ].map(({ title, body }) => (
          <section key={title} className="mb-9">
            <h2 className="font-barlow font-semibold text-xl mb-3" style={{ color: 'var(--champagne)' }}>{title}</h2>
            <p className="text-[15px] leading-relaxed whitespace-pre-line" style={{ color: 'var(--text-warm)' }}>{body}</p>
          </section>
        ))}

        <div className="mt-12 pt-6" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <Link href="/terms" className="text-sm" style={{ color: 'var(--verdigris)' }}>Terms of Service →</Link>
        </div>
      </main>
    </div>
  )
}
