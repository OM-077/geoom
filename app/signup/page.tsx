'use client'

// ============================================
// SIGNUP PAGE — app/signup/page.tsx
// Google OAuth + Email/Password
// Supabase Auth
// After signup → /onboarding
// ============================================

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const supabase = createClientComponentClient()
  const router = useRouter()
  const searchParams = useSearchParams()

  const selectedPlan = searchParams.get('plan') || 'pro'
  const refCity = searchParams.get('city') || null
  const refTrade = searchParams.get('trade') || null
  const auditScore = searchParams.get('score') || null
  const auditBusiness = searchParams.get('business') || null

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')

  const planLabels: Record<string, string> = {
    
    pro: 'Geoom — $97/mo',
    founding: 'Founding — $499/yr'
  }

  // After signup → go to checkout, not onboarding
  // Onboarding happens after payment webhook fires
  function checkoutNext() {
    const params = new URLSearchParams()
    params.set('plan', selectedPlan || 'pro')
    if (auditScore) params.set('score', auditScore)
    if (auditBusiness) params.set('business', auditBusiness)
    return `/checkout?${params.toString()}`
  }

  async function handleGoogleSignup() {
    setGoogleLoading(true)
    setError('')
    const next = checkoutNext()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      }
    })
    if (error) {
      setError(error.message)
      setGoogleLoading(false)
    }
  }

  async function handleEmailSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const next = checkoutNext()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      }
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/auth/confirm-email?email=' + encodeURIComponent(email))
  }

  return (
    <main style={{
      minHeight: '100vh',
      background: 'oklch(0.09 0.01 260)',
      color: 'oklch(0.94 0.01 260)',
      fontFamily: 'var(--font-inter), system-ui, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
    }}>

      {/* Logo */}
      <Link href="/" style={{ textDecoration: 'none' }}>
        <p style={{
          margin: '0 0 40px',
          color: 'oklch(0.55 0.02 260)',
          fontSize: '11px',
          letterSpacing: '4px',
          textTransform: 'uppercase',
          cursor: 'pointer',
        }}>
          GEOOM
        </p>
      </Link>

      <div style={{ width: '100%', maxWidth: '400px' }}>

        {/* Audit score reminder — shown when coming from free audit */}
        {auditScore && auditBusiness && (
          <div style={{
            background: 'oklch(0.12 0.015 260)',
            border: '1px solid oklch(0.22 0.12 60)',
            borderRadius: '8px',
            padding: '14px 20px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}>
            <span style={{ fontSize: '40px', fontWeight: 800, color: parseInt(auditScore) < 40 ? '#ef4444' : parseInt(auditScore) < 70 ? '#f59e0b' : '#22c55e', lineHeight: 1 }}>
              {auditScore}
            </span>
            <div>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: 'oklch(0.94 0.01 260)' }}>{decodeURIComponent(auditBusiness)}</p>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'oklch(0.55 0.02 260)' }}>Your Geoom Score · Create account to fix it</p>
            </div>
          </div>
        )}

        {/* Heading */}
        <h1 style={{
          margin: '0 0 8px',
          fontSize: '26px',
          fontWeight: 700,
          color: 'oklch(0.94 0.01 260)',
          textAlign: 'center',
        }}>
          Create your account
        </h1>
        <p style={{
          margin: '0 0 32px',
          color: 'oklch(0.55 0.02 260)',
          fontSize: '14px',
          textAlign: 'center',
          lineHeight: 1.5,
        }}>
          Account creation takes 30 seconds. Payment comes next.
        </p>

        {/* Google button */}
        <button
          onClick={handleGoogleSignup}
          disabled={googleLoading}
          style={{
            width: '100%',
            background: 'oklch(0.12 0.015 260)',
            border: '1px solid oklch(0.25 0.02 260)',
            color: 'oklch(0.94 0.01 260)',
            padding: '13px 20px',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: googleLoading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            marginBottom: '20px',
            opacity: googleLoading ? 0.6 : 1,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.6 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.1 8 3l5.7-5.7C34.6 6.4 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 19 13 24 13c3.1 0 5.9 1.1 8 3l5.7-5.7C34.6 6.4 29.6 4 24 4 16.3 4 9.7 8.4 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 44c5.4 0 10.3-2 14-5.4l-6.5-5.5C29.5 35 26.9 36 24 36c-5.3 0-9.7-3.4-11.3-8.1l-6.6 5.1C9.5 39.5 16.3 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.4 4.3-4.4 5.7l6.5 5.5C43 35.5 44 30 44 24c0-1.3-.1-2.6-.4-3.9z"/>
          </svg>
          {googleLoading ? 'Connecting...' : 'Continue with Google'}
        </button>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '20px',
        }}>
          <div style={{ flex: 1, height: '1px', background: 'oklch(0.18 0.02 260)' }} />
          <span style={{ color: 'oklch(0.40 0.02 260)', fontSize: '12px' }}>or</span>
          <div style={{ flex: 1, height: '1px', background: 'oklch(0.18 0.02 260)' }} />
        </div>

        {/* Email form */}
        <form onSubmit={handleEmailSignup} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{
              background: 'oklch(0.12 0.015 260)',
              border: '1px solid oklch(0.22 0.02 260)',
              color: 'oklch(0.94 0.01 260)',
              padding: '13px 16px',
              borderRadius: '6px',
              fontSize: '14px',
              outline: 'none',
              width: '100%',
              boxSizing: 'border-box',
            }}
          />
          <input
            type="password"
            placeholder="Password (min 8 characters)"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={8}
            style={{
              background: 'oklch(0.12 0.015 260)',
              border: '1px solid oklch(0.22 0.02 260)',
              color: 'oklch(0.94 0.01 260)',
              padding: '13px 16px',
              borderRadius: '6px',
              fontSize: '14px',
              outline: 'none',
              width: '100%',
              boxSizing: 'border-box',
            }}
          />

          {error && (
            <p style={{ margin: 0, color: 'oklch(0.55 0.22 25)', fontSize: '13px' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              background: '#FF7A00',
              color: 'oklch(0.09 0.01 260)',
              border: 'none',
              padding: '14px 20px',
              borderRadius: '6px',
              fontSize: '15px',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              marginTop: '4px',
            }}
          >
            {loading ? 'Creating account...' : 'Create Account →'}
          </button>
        </form>

        {/* Login link */}
        <p style={{
          margin: '24px 0 0',
          textAlign: 'center',
          color: 'oklch(0.55 0.02 260)',
          fontSize: '13px',
        }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: '#FF7A00', textDecoration: 'none', fontWeight: 600 }}>
            Log in →
          </Link>
        </p>

      </div>
    </main>
  )
}
