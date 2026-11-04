import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type Params = Promise<{ code: string }>

export default async function InvitePage({ params }: { params: Params }) {
  const { code } = await params

  const { data: invite } = await supabase
    .from('referrals')
    .select('referrer_name, referrer_trade, referrer_city')
    .eq('code', code)
    .single()

  const referrerName = invite?.referrer_name ?? 'A contractor'
  const trade = invite?.referrer_trade ?? 'home services'
  const city = invite?.referrer_city ?? 'your area'

  return (
    <main style={{
      minHeight: '100vh',
      background: 'oklch(0.09 0.01 260)',
      color: 'oklch(0.94 0.01 260)',
      fontFamily: 'system-ui, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px',
    }}>
      <p style={{ fontSize: '11px', letterSpacing: '4px', color: 'oklch(0.55 0.02 260)', marginBottom: '48px' }}>
        GEOOM
      </p>

      <div style={{ maxWidth: '480px', width: '100%', textAlign: 'center' }}>
        <div style={{
          background: 'oklch(0.12 0.015 260)',
          border: '1px solid oklch(0.20 0.02 260)',
          borderRadius: '12px',
          padding: '40px 32px',
          marginBottom: '24px',
        }}>
          <p style={{ margin: '0 0 12px', fontSize: '13px', color: 'oklch(0.55 0.02 260)' }}>
            {referrerName} invited you
          </p>
          <h1 style={{ margin: '0 0 16px', fontSize: '28px', fontWeight: 800, lineHeight: 1.2 }}>
            See if ChatGPT & Siri can find your {trade} business in {city}
          </h1>
          <p style={{ margin: '0 0 32px', fontSize: '15px', color: 'oklch(0.70 0.02 260)', lineHeight: 1.6 }}>
            Get a free AI visibility score in 60 seconds. No credit card. See exactly which AI engines can recommend you — and which can't.
          </p>
          <Link href={`/audit?ref=${code}`} style={{
            display: 'inline-block',
            background: '#FF7A00',
            color: 'oklch(0.09 0.01 260)',
            padding: '16px 40px',
            borderRadius: '6px',
            fontWeight: 700,
            fontSize: '16px',
            textDecoration: 'none',
          }}>
            Get My Free Score →
          </Link>
        </div>

        <p style={{ fontSize: '12px', color: 'oklch(0.40 0.02 260)' }}>
          Free audit. No spam. No credit card.
        </p>
      </div>
    </main>
  )
}
