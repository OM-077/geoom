import Link from 'next/link'

export const metadata = { title: 'Terms of Service — Geoom' }

export default function TermsPage() {
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
        <h1 className="font-barlow font-bold text-[40px] mb-2" style={{ color: 'var(--champagne)' }}>Terms of Service</h1>
        <p className="text-sm mb-10" style={{ color: 'var(--text-dim)' }}>Last updated: November 2026</p>

        {[
          {
            title: '1. What Geoom is',
            body: `Geoom is an AI visibility platform for home service contractors. We generate a Geoom Score (0–100) based on your business's presence across public data sources, and provide a weekly fix plan to improve that score over time. The score reflects your estimated visibility in AI-generated search results (ChatGPT, Perplexity, Google AI, Gemini, Copilot, Siri).`
          },
          {
            title: '2. Subscription and billing',
            body: `Geoom is a subscription service billed at $97/month (monthly plan) or $499/year (Founding Member, limited to 35 spots). Founding Member subscriptions convert to $97/month after 12 months. Payments are processed by Dodo Payments. You may cancel at any time — cancellation stops future billing and your access continues until the end of your current billing period.`
          },
          {
            title: '3. 30-day results guarantee',
            body: `If your Geoom Score does not increase within 30 days of completing at least 2 weekly actions, we will refund your first month's payment. To claim: email support@geoom.io with your account email. We reserve the right to verify completion of weekly actions before issuing refunds.`
          },
          {
            title: '4. What we provide',
            body: `Geoom provides:
• A visibility score based on public data (not guaranteed to reflect actual AI recommendations)
• Weekly action plans — these are recommendations, not guaranteed outcomes
• Schema markup code you can add to your website
• Competitor score estimates based on public data
• Content generation tools (FAQ pages, service area pages)
• Integration with job management platforms (Jobber, Housecall Pro, Workiz, ServiceM8)

We do not guarantee specific call volume, revenue increases, or placement in any specific AI engine's results.`
          },
          {
            title: '5. Competitor data',
            body: `Geoom calculates competitor scores using publicly available data. By using the competitor tracking feature, you confirm that you are tracking businesses for legitimate competitive analysis purposes. You may not use Geoom to monitor individuals, gather personal information about competitors' customers, or for any purpose that violates applicable law.`
          },
          {
            title: '6. Acceptable use',
            body: `You agree not to:
• Use Geoom to scrape, harvest, or collect data about other businesses beyond what the platform provides
• Attempt to reverse-engineer our scoring algorithm
• Share your account credentials with others
• Use Geoom for any unlawful purpose
• Resell or white-label Geoom's outputs without written permission`
          },
          {
            title: '7. Intellectual property',
            body: `The Geoom platform, branding, scoring methodology, and software are owned by Geoom. The content you generate using Geoom's tools (FAQ pages, service pages) belongs to you. You grant us a license to use aggregated, anonymized data to improve our scoring engine.`
          },
          {
            title: '8. Limitation of liability',
            body: `Geoom is provided "as is." We are not liable for any indirect, incidental, or consequential damages arising from your use of the platform. Our total liability to you in any month shall not exceed the amount you paid in that month. AI engine algorithms change — we cannot guarantee your score or ranking in any specific AI tool's output.`
          },
          {
            title: '9. Changes to terms',
            body: `We may update these terms. If we make material changes, we'll notify you by email at least 14 days before they take effect. Continued use of Geoom after that date constitutes acceptance.`
          },
          {
            title: '10. Contact',
            body: `Questions: support@geoom.io`
          },
        ].map(({ title, body }) => (
          <section key={title} className="mb-9">
            <h2 className="font-barlow font-semibold text-xl mb-3" style={{ color: 'var(--champagne)' }}>{title}</h2>
            <p className="text-[15px] leading-relaxed whitespace-pre-line" style={{ color: 'var(--text-warm)' }}>{body}</p>
          </section>
        ))}

        <div className="mt-12 pt-6" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <Link href="/privacy" className="text-sm" style={{ color: 'var(--verdigris)' }}>Privacy Policy →</Link>
        </div>
      </main>
    </div>
  )
}
