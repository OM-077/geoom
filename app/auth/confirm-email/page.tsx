'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function ConfirmEmailPage() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || 'your email'

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
      <Link href="/" style={{ textDecoration: 'none', marginBottom: 40 }}>
        <p style={{ color: 'oklch(0.55 0.02 260)', fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', margin: 0 }}>
          GEOOM
        </p>
      </Link>

      <div style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        {/* Email icon */}
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'oklch(0.14 0.02 60)', border: '1px solid oklch(0.28 0.12 60)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2"/>
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
          </svg>
        </div>

        <h1 style={{ margin: '0 0 12px', fontSize: '24px', fontWeight: 700, color: 'oklch(0.94 0.01 260)' }}>
          Check your email
        </h1>

        <p style={{ margin: '0 0 8px', color: 'oklch(0.65 0.02 260)', fontSize: '15px', lineHeight: 1.6 }}>
          We sent a confirmation link to
        </p>
        <p style={{ margin: '0 0 24px', color: '#f59e0b', fontSize: '15px', fontWeight: 600 }}>
          {decodeURIComponent(email)}
        </p>

        <p style={{ margin: '0 0 32px', color: 'oklch(0.55 0.02 260)', fontSize: '14px', lineHeight: 1.6 }}>
          Click the link in the email to confirm your account, then you&apos;ll be taken straight to checkout.
        </p>

        <div style={{ background: 'oklch(0.12 0.015 260)', border: '1px solid oklch(0.20 0.02 260)', borderRadius: '8px', padding: '16px 20px', textAlign: 'left' }}>
          <p style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 600, color: 'oklch(0.94 0.01 260)' }}>Didn&apos;t get it?</p>
          <ul style={{ margin: 0, padding: '0 0 0 16px', color: 'oklch(0.55 0.02 260)', fontSize: '13px', lineHeight: 1.8 }}>
            <li>Check your spam or junk folder</li>
            <li>Make sure you used the right email</li>
            <li>Wait 1–2 minutes and refresh</li>
          </ul>
        </div>

        <p style={{ marginTop: 32, color: 'oklch(0.45 0.02 260)', fontSize: '13px' }}>
          <Link href="/signup" style={{ color: '#f59e0b', textDecoration: 'none', fontWeight: 600 }}>
            ← Try a different email
          </Link>
        </p>
      </div>
    </main>
  )
}
