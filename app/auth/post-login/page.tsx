'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// After Google OAuth, Supabase redirects here.
// Read saved destination from localStorage and forward.
// Business creation happens in /api/billing/checkout, not here.
export default function PostLoginPage() {
  const router = useRouter()

  useEffect(() => {
    try {
      const saved = localStorage.getItem('geoom_auth_next')
      if (saved) {
        localStorage.removeItem('geoom_auth_next')
        router.replace(saved)
      } else {
        router.replace('/checkout')
      }
    } catch {
      router.replace('/checkout')
    }
  }, [router])

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
      Redirecting…
    </main>
  )
}
