'use client'

// ============================================
// LOGIN PAGE — app/login/page.tsx
// Google OAuth + Email/Password
// Supabase Auth
// After login → /dashboard (or /onboarding if no business)
// ============================================

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const supabase = createClientComponentClient()
  const router = useRouter()

  // Already logged in → go straight to dashboard
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace('/dashboard')
    })
  }, [])

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [resetSent, setResetSent] = useState(false)
  const [showReset, setShowReset] = useState(false)
  const [resetEmail, setResetEmail] = useState('')

  async function handleGoogleLogin() {
    setGoogleLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      }
    })
    if (error) {
      setError(error.message)
      setGoogleLoading(false)
    }
  }

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    if (data.session) {
      // Check if onboarding complete
      const { data: business } = await supabase
        .from('businesses')
        .select('id, onboarding_complete')
        .eq('user_id', data.session.user.id)
        .single()

      if (!business || !business.onboarding_complete) {
        router.push('/onboarding')
      } else {
        router.push('/dashboard')
      }
    }
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setResetSent(true)
    }
  }

  if (showReset) {
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
        <Link href="/" style={{ textDecoration: 'none' }}>
          <p style={{ margin: '0 0 40px', color: 'oklch(0.55 0.02 260)', fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase' }}>
            GEOOM
          </p>
        </Link>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <h1 style={{ margin: '0 0 8px', fontSize: '24px', fontWeight: 700, textAlign: 'center' }}>
            Reset password
          </h1>
          {resetSent ? (
            <div style={{
              background: 'oklch(0.12 0.015 260)',
              border: '1px solid oklch(0.80 0.20 145)',
              borderRadius: '6px',
              padding: '20px',
              textAlign: 'center',
              marginTop: '24px',
            }}>
              <p style={{ margin: '0 0 8px', color: 'oklch(0.80 0.20 145)', fontSize: '15px', fontWeight: 600 }}>
                Check your email
              </p>
              <p style={{ margin: 0, color: 'oklch(0.55 0.02 260)', fontSize: '13px' }}>
                We sent a reset link to {resetEmail}
              </p>
            </div>
          ) : (
            <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px' }}>
              <input
                type="email"
                placeholder="Your email address"
                value={resetEmail}
                onChange={e => setResetEmail(e.target.value)}
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
                  boxSizing: 'border-box' as const,
                }}
              />
              {error && <p style={{ margin: 0, color: 'oklch(0.55 0.22 25)', fontSize: '13px' }}>{error}</p>}
              <button type="submit" disabled={loading} style={{
                background: '#FF7A00', color: 'oklch(0.09 0.01 260)', border: 'none',
                padding: '13px', borderRadius: '6px', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
              }}>
                {loading ? 'Sending...' : 'Send Reset Link →'}
              </button>
            </form>
          )}
          <p style={{ margin: '20px 0 0', textAlign: 'center', fontSize: '13px' }}>
            <button onClick={() => setShowReset(false)} style={{
              background: 'none', border: 'none', color: '#FF7A00', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
            }}>
              ← Back to login
            </button>
          </p>
        </div>
      </main>
    )
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

        <h1 style={{
          margin: '0 0 8px',
          fontSize: '26px',
          fontWeight: 700,
          color: 'oklch(0.94 0.01 260)',
          textAlign: 'center',
        }}>
          Welcome back
        </h1>
        <p style={{
          margin: '0 0 32px',
          color: 'oklch(0.55 0.02 260)',
          fontSize: '14px',
          textAlign: 'center',
        }}>
          Log in to see your AI visibility score
        </p>

        {/* Google button */}
        <button
          onClick={handleGoogleLogin}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{ flex: 1, height: '1px', background: 'oklch(0.18 0.02 260)' }} />
          <span style={{ color: 'oklch(0.40 0.02 260)', fontSize: '12px' }}>or</span>
          <div style={{ flex: 1, height: '1px', background: 'oklch(0.18 0.02 260)' }} />
        </div>

        {/* Email form */}
        <form onSubmit={handleEmailLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
              boxSizing: 'border-box' as const,
            }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
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
              boxSizing: 'border-box' as const,
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
            {loading ? 'Logging in...' : 'Log In →'}
          </button>
        </form>

        {/* Forgot password */}
        <p style={{ margin: '16px 0 0', textAlign: 'center' }}>
          <button
            onClick={() => setShowReset(true)}
            style={{
              background: 'none', border: 'none',
              color: 'oklch(0.55 0.02 260)', cursor: 'pointer', fontSize: '13px',
            }}
          >
            Forgot password?
          </button>
        </p>

        {/* Signup link */}
        <p style={{
          margin: '20px 0 0',
          textAlign: 'center',
          color: 'oklch(0.55 0.02 260)',
          fontSize: '13px',
        }}>
          Don&apos;t have an account?{' '}
          <Link href="/audit" style={{ color: '#FF7A00', textDecoration: 'none', fontWeight: 600 }}>
            Start free audit →
          </Link>
        </p>

      </div>
    </main>
  )
}
