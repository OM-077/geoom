'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// After Google OAuth or email signup, Supabase redirects here.
// We create a minimal business record (so checkout can run),
// then forward the user to checkout.
export default function PostLoginPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function run() {
      try {
        // Get session
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.replace('/login'); return }

        // Read saved destination (plan, score, business name from audit)
        const saved = localStorage.getItem('geoom_auth_next') || ''
        const savedParams = new URLSearchParams(saved.includes('?') ? saved.split('?')[1] : '')
        const plan = savedParams.get('plan') || 'pro'
        const businessNameFromAudit = savedParams.get('business') || ''

        // Check if business record already exists
        const { data: existing } = await supabase
          .from('businesses')
          .select('id')
          .eq('user_id', user.id)
          .single()

        if (!existing) {
          // Create a minimal business record so checkout can proceed
          // User fills in the full details during onboarding (after payment)
          const displayName = user.user_metadata?.full_name || user.user_metadata?.name || ''
          const bizName = businessNameFromAudit || displayName || 'My Business'

          await supabase.from('businesses').insert({
            user_id: user.id,
            business_name: bizName,
            email: user.email,
            trade: 'HVAC', // default — updated during onboarding
            city: '',       // updated during onboarding
            subscription_status: 'inactive',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
        }

        // Forward to checkout (or saved destination)
        const dest = saved || `/checkout?plan=${plan}`
        localStorage.removeItem('geoom_auth_next')
        router.replace(dest)
      } catch {
        router.replace('/checkout')
      }
    }
    run()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <main style={{
      minHeight: '100vh',
      background: 'oklch(0.09 0.01 260)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
      color: 'oklch(0.55 0.02 260)',
      fontFamily: 'system-ui, sans-serif',
      fontSize: '14px',
    }}>
      <div style={{ width: 32, height: 32, border: '3px solid rgba(245,158,11,0.25)', borderTopColor: '#f59e0b', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      Setting up your account…
    </main>
  )
}
