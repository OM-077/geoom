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

      // Dodo hosted checkout links (no API call needed)
      const DODO_LINKS: Record<string, string> = {
        pro: 'https://test.checkout.dodopayments.com/buy/pdt_0NrZxL5oL6mMCnFvZJQus?quantity=1',
        founding: 'https://test.checkout.dodopayments.com/buy/pdt_0NrZxWpCwksakQWh3SFiN?quantity=1',
      }

      // Step 1: Create/find business row in DB
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: plan === 'founding' ? 'founding' : 'pro' }),
      })

      const json = await res.json() as { success?: boolean; email?: string; error?: string }

      if (!res.ok || json.error) {
        setErrorMsg(json.error || 'Could not set up account. Please try again.')
        setStatus('error')
        return
      }

      // Step 2: Redirect to Dodo hosted checkout (works on any Vercel plan)
      setStatus('redirecting')
      const tier = plan === 'founding' ? 'founding' : 'pro'
      const baseUrl = DODO_LINKS[tier]
      const returnUrl = `${window.location.origin}/onboarding?paid=true`
      const checkoutUrl = `${baseUrl}&redirect_url=${encodeURIComponent(returnUrl)}${json.email ? `&customer[email]=${encodeURIComponent(json.email)}` : ''}`
      window.location.href = checkoutUrl
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
