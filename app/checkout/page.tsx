'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

function CheckoutInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClientComponentClient()

  const planFromUrl = searchParams.get('plan')
  const plan = planFromUrl || (() => {
    try {
      const saved = localStorage.getItem('geoom_auth_next') || ''
      const match = saved.match(/[?&]plan=([^&]+)/)
      return match ? match[1] : 'pro'
    } catch { return 'pro' }
  })()

  const [status, setStatus] = useState<'loading' | 'redirecting' | 'error'>('loading')
  const [errorMsg, setErrorMsg] = useState('')

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    async function startCheckout() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Step 1: Create/find business row in DB (server-side, Supabase works fine)
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: plan === 'founding' ? 'founding' : 'pro' }),
      })

      const json = await res.json() as {
        success?: boolean
        businessId?: string
        productId?: string
        email?: string
        businessName?: string
        tier?: string
        returnUrl?: string
        error?: string
      }

      if (!res.ok || json.error || !json.productId) {
        setErrorMsg(json.error || 'Could not set up account. Please try again.')
        setStatus('error')
        return
      }

      // Step 2: Call Dodo from browser (Vercel server blocks outbound DNS)
      setStatus('redirecting')
      const dodoRes = await fetch('https://api.dodopayments.com/checkouts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_DODO_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          product_cart: [{ product_id: json.productId, quantity: 1 }],
          customer: { email: json.email, name: json.businessName },
          return_url: json.returnUrl,
          metadata: { business_id: json.businessId, pricing_tier: json.tier }
        })
      })

      const dodoData = await dodoRes.json() as { checkout_url?: string; message?: string }

      if (!dodoRes.ok || !dodoData.checkout_url) {
        setErrorMsg(dodoData.message || `Dodo error ${dodoRes.status}`)
        setStatus('error')
        return
      }

      window.location.href = dodoData.checkout_url
    }

    startCheckout()
  }, [])

  return (
    <div style={{ background: '#0d0d10', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
      <div style={{ textAlign: 'center', maxWidth: 400, padding: '0 24px' }}>
        {(status === 'loading' || status === 'redirecting') && (
          <>
            <div style={{ width: 40, height: 40, border: '3px solid rgba(245,158,11,0.3)', borderTopColor: '#f59e0b', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 20px' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15 }}>
              {status === 'loading' ? 'Setting up your checkout…' : 'Redirecting to payment…'}
            </p>
          </>
        )}
        {status === 'error' && (
          <>
            <p style={{ color: '#ef4444', fontSize: 15, marginBottom: 8 }}>{errorMsg}</p>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, marginBottom: 16, wordBreak: 'break-all' }}>{errorMsg}</p>
            <button
              onClick={() => window.location.reload()}
              style={{ background: '#f59e0b', color: '#000', border: 'none', padding: '10px 24px', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}
            >
              Try again
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div style={{ background: '#0d0d10', minHeight: '100vh' }} />}>
      <CheckoutInner />
    </Suspense>
  )
}
