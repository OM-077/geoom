'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function CheckoutPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClientComponentClient()

  const plan = searchParams.get('plan') || 'pro'
  const score = searchParams.get('score')
  const business = searchParams.get('business')

  const [status, setStatus] = useState<'loading' | 'redirecting' | 'error'>('loading')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    async function startCheckout() {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Get their business record
      const { data: biz } = await supabase
        .from('businesses')
        .select('id, name')
        .eq('user_id', user.id)
        .single()

      const businessId = biz?.id
      const businessName = biz?.name || business || 'Your Business'

      if (!businessId) {
        // No business yet — go to onboarding first, then come back
        const params = new URLSearchParams({ plan, ...(score ? { score } : {}), ...(business ? { business } : {}) })
        router.push(`/onboarding?next=/checkout&${params.toString()}`)
        return
      }

      // Create Dodo checkout session
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: plan === 'founding' ? 'founding' : 'pro',
        }),
      })

      if (!res.ok) {
        setErrorMsg('Could not start checkout. Please try again.')
        setStatus('error')
        return
      }

      const { checkoutUrl, error } = await res.json()

      if (error || !checkoutUrl) {
        setErrorMsg(error || 'No checkout URL returned.')
        setStatus('error')
        return
      }

      setStatus('redirecting')
      window.location.href = checkoutUrl
    }

    startCheckout()
  }, [])

  return (
    <div style={{ background: '#0d0d10', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
      <div style={{ textAlign: 'center', maxWidth: 400 }}>
        {status === 'loading' && (
          <>
            <div style={{ width: 40, height: 40, border: '3px solid rgba(245,158,11,0.3)', borderTopColor: '#f59e0b', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 20px' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15 }}>Setting up your checkout…</p>
          </>
        )}
        {status === 'redirecting' && (
          <>
            <div style={{ width: 40, height: 40, border: '3px solid rgba(245,158,11,0.3)', borderTopColor: '#f59e0b', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 20px' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15 }}>Redirecting to payment…</p>
          </>
        )}
        {status === 'error' && (
          <>
            <p style={{ color: '#ef4444', fontSize: 15, marginBottom: 16 }}>{errorMsg}</p>
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
