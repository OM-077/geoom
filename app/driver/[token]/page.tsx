import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { notFound } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type Params = Promise<{ token: string }>

export default async function DriverSharePage({ params }: { params: Params }) {
  const { token } = await params

  const { data: share } = await supabase
    .from('driver_shares')
    .select('*, businesses(name, trade, city)')
    .eq('token', token)
    .single()

  if (!share) return notFound()

  const business = share.businesses as { name: string; trade: string; city: string }

  return (
    <main style={{
      minHeight: '100vh',
      background: 'oklch(0.09 0.01 260)',
      color: 'oklch(0.94 0.01 260)',
      fontFamily: 'system-ui, sans-serif',
      padding: '48px 24px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      <p style={{ fontSize: '11px', letterSpacing: '4px', color: 'oklch(0.55 0.02 260)', marginBottom: '40px' }}>
        GEOOM
      </p>

      <div style={{ maxWidth: '600px', width: '100%' }}>
        <div style={{
          background: 'oklch(0.12 0.015 260)',
          border: '1px solid oklch(0.20 0.02 260)',
          borderRadius: '12px',
          padding: '32px',
          marginBottom: '24px',
        }}>
          <p style={{ margin: '0 0 4px', fontSize: '12px', color: 'oklch(0.55 0.02 260)', letterSpacing: '2px', textTransform: 'uppercase' }}>
            AI Visibility Action Plan
          </p>
          <h1 style={{ margin: '0 0 4px', fontSize: '28px', fontWeight: 700 }}>
            {business.name}
          </h1>
          <p style={{ margin: '0 0 24px', fontSize: '14px', color: 'oklch(0.55 0.02 260)' }}>
            {business.trade} · {business.city}
          </p>

          <div style={{
            background: 'oklch(0.09 0.01 260)',
            borderRadius: '8px',
            padding: '20px',
            textAlign: 'center',
          }}>
            <p style={{ margin: '0 0 4px', fontSize: '13px', color: 'oklch(0.55 0.02 260)' }}>Current Geoom Score</p>
            <p style={{ margin: 0, fontSize: '52px', fontWeight: 800, color: '#FF7A00', lineHeight: 1 }}>
              {share.current_score ?? '—'}
            </p>
            <p style={{ margin: '8px 0 0', fontSize: '13px', color: 'oklch(0.55 0.02 260)' }}>out of 100</p>
          </div>
        </div>

        <div style={{
          background: 'oklch(0.12 0.015 260)',
          border: '1px solid oklch(0.20 0.02 260)',
          borderRadius: '12px',
          padding: '32px',
          marginBottom: '24px',
        }}>
          <h2 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: 700 }}>
            12-Week Action Plan
          </h2>
          <p style={{ margin: '0 0 16px', fontSize: '14px', color: 'oklch(0.70 0.02 260)', lineHeight: 1.6 }}>
            This business is following a personalized AI visibility program. Each week they complete one action that improves how often they show up when someone asks ChatGPT, Siri, or Google AI for a {business.trade} contractor.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' as const }}>
            {['Citations', 'Schema Markup', 'Reviews', 'Content', 'Entity', 'Freshness'].map((bucket) => (
              <span key={bucket} style={{
                background: 'oklch(0.09 0.01 260)',
                border: '1px solid oklch(0.22 0.02 260)',
                borderRadius: '20px',
                padding: '4px 12px',
                fontSize: '12px',
                color: 'oklch(0.70 0.02 260)',
              }}>
                {bucket}
              </span>
            ))}
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <p style={{ margin: '0 0 16px', fontSize: '14px', color: 'oklch(0.55 0.02 260)' }}>
            Want to see your own AI visibility score?
          </p>
          <Link href="/audit" style={{
            display: 'inline-block',
            background: '#FF7A00',
            color: 'oklch(0.09 0.01 260)',
            padding: '14px 32px',
            borderRadius: '6px',
            fontWeight: 700,
            fontSize: '15px',
            textDecoration: 'none',
          }}>
            Get Your Free Score →
          </Link>
        </div>
      </div>
    </main>
  )
}
