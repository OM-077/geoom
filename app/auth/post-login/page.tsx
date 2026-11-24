'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// After Google OAuth, Supabase redirects here.
// We read the saved destination from localStorage and forward the user.
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
      alignItems: 'center',
      justifyContent: 'center',
      color: 'oklch(0.55 0.02 260)',
      fontFamily: 'system-ui, sans-serif',
      fontSize: '14px',
    }}>
      Redirecting…
    </main>
  )
}
