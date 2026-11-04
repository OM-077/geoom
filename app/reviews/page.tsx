'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ReviewsPage() {
  const [copied, setCopied] = useState(false)

  const reviewLink = 'https://g.page/r/your-google-review-link'

  function copyLink() {
    navigator.clipboard.writeText(reviewLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex min-h-screen" style={{ background: 'oklch(0.09 0.01 260)' }}>
      <main style={{ flex: 1, padding: '36px 40px', maxWidth: '860px', margin: '0 auto' }}>

        <nav style={{ fontSize: '13px', color: 'oklch(0.45 0.02 260)', marginBottom: '28px' }}>
          <Link href="/dashboard" style={{ color: 'oklch(0.45 0.02 260)', textDecoration: 'none' }}>Dashboard</Link>
          <span style={{ margin: '0 8px' }}>→</span>
          <span style={{ color: 'oklch(0.70 0.02 260)' }}>Reviews</span>
        </nav>

        <h1 style={{ margin: '0 0 6px', fontSize: '36px', fontWeight: 800, color: 'oklch(0.94 0.01 260)' }}>
          Reviews
        </h1>
        <p style={{ margin: '0 0 32px', fontSize: '15px', color: 'oklch(0.55 0.02 260)' }}>
          Reviews are worth 15 points of your Geoom Score. More 5-star reviews = more AI mentions.
        </p>

        {/* Score impact */}
        <div style={{
          background: 'oklch(0.12 0.015 260)',
          border: '1px solid oklch(0.20 0.02 260)',
          borderRadius: '10px',
          padding: '24px',
          marginBottom: '20px',
          display: 'flex',
          gap: '32px',
          flexWrap: 'wrap' as const,
        }}>
          {[
            { label: 'Review Score', value: '7/15', sub: 'points earned' },
            { label: 'Total Reviews', value: '23', sub: 'across platforms' },
            { label: 'Avg Rating', value: '4.6★', sub: 'Google + Yelp' },
            { label: 'Last Review', value: '3 days ago', sub: 'keep momentum' },
          ].map((stat) => (
            <div key={stat.label}>
              <p style={{ margin: '0 0 2px', fontSize: '11px', color: 'oklch(0.45 0.02 260)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>{stat.label}</p>
              <p style={{ margin: '0 0 2px', fontSize: '26px', fontWeight: 800, color: '#FF7A00' }}>{stat.value}</p>
              <p style={{ margin: 0, fontSize: '12px', color: 'oklch(0.55 0.02 260)' }}>{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Get more reviews */}
        <div style={{
          background: 'oklch(0.12 0.015 260)',
          border: '1px solid oklch(0.20 0.02 260)',
          borderRadius: '10px',
          padding: '24px',
          marginBottom: '20px',
        }}>
          <h2 style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: 700, color: 'oklch(0.94 0.01 260)' }}>
            Get more reviews
          </h2>
          <p style={{ margin: '0 0 20px', fontSize: '14px', color: 'oklch(0.55 0.02 260)' }}>
            Send this link to customers after every job. Each new 5-star review adds ~1 point to your score.
          </p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' as const }}>
            <div style={{
              flex: 1,
              minWidth: '200px',
              background: 'oklch(0.09 0.01 260)',
              border: '1px solid oklch(0.20 0.02 260)',
              borderRadius: '6px',
              padding: '12px 16px',
              fontSize: '13px',
              color: 'oklch(0.70 0.02 260)',
              fontFamily: 'monospace',
            }}>
              {reviewLink}
            </div>
            <button
              onClick={copyLink}
              style={{
                background: copied ? 'oklch(0.78 0.17 150)' : '#FF7A00',
                color: 'oklch(0.09 0.01 260)',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                whiteSpace: 'nowrap' as const,
              }}
            >
              {copied ? '✓ Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>

        {/* What to do */}
        <div style={{
          background: 'oklch(0.12 0.015 260)',
          border: '1px solid oklch(0.20 0.02 260)',
          borderRadius: '10px',
          padding: '24px',
        }}>
          <h2 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: 700, color: 'oklch(0.94 0.01 260)' }}>
            3 actions to boost your review score
          </h2>
          {[
            { num: '1', title: 'Text every customer after job completion', desc: 'Send: "Hi [Name], thanks for choosing us! Would you mind leaving a quick Google review? [link]"' },
            { num: '2', title: 'Reply to every review within 48 hours', desc: 'AI engines check if you respond to reviews. It signals you are active and trustworthy.' },
            { num: '3', title: 'Get to 25+ reviews on Google', desc: 'Businesses with 25+ reviews are 3x more likely to be recommended by ChatGPT and Gemini.' },
          ].map((item) => (
            <div key={item.num} style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: '#FF7A00',
                color: 'oklch(0.09 0.01 260)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '13px',
                flexShrink: 0,
              }}>
                {item.num}
              </div>
              <div>
                <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 600, color: 'oklch(0.90 0.01 260)' }}>{item.title}</p>
                <p style={{ margin: 0, fontSize: '13px', color: 'oklch(0.55 0.02 260)', lineHeight: 1.5 }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

      </main>
    </div>
  )
}
