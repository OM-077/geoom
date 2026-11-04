'use client'
import { useState } from 'react'

type DotStatus = 'red' | 'amber' | 'green'

interface ListingResult {
  name: string
  status: DotStatus
  issue: string
  action: string
  href: string
  special?: boolean
}

const results: ListingResult[] = [
  {
    name: 'Foursquare', status: 'red',
    issue: 'Listing unclaimed — data may be wrong',
    action: 'Claim listing →', href: 'https://foursquare.com/add-place', special: true,
  },
  {
    name: 'Google', status: 'green',
    issue: 'Name, address, phone match ✓',
    action: 'Good', href: '',
  },
  {
    name: 'Yelp', status: 'amber',
    issue: 'Phone number differs: (720) 555-0100 vs (720) 555-0101',
    action: 'Fix →', href: 'https://biz.yelp.com',
  },
  {
    name: 'Bing Places', status: 'red',
    issue: 'Business not listed',
    action: 'Add listing →', href: 'https://www.bingplaces.com',
  },
  {
    name: 'Apple Maps', status: 'amber',
    issue: 'Address shows old ZIP code (80201 vs 80202)',
    action: 'Fix →', href: 'https://businessconnect.apple.com',
  },
  {
    name: 'BBB', status: 'green',
    issue: 'Name, address, phone match ✓',
    action: 'Good', href: '',
  },
  {
    name: 'Angi', status: 'amber',
    issue: 'Business name listed as "Summit HVAC LLC" — inconsistent',
    action: 'Fix →', href: 'https://pro.angi.com',
  },
  {
    name: 'HomeGuide', status: 'red',
    issue: 'Business not listed',
    action: 'Add listing →', href: 'https://homeguide.com/pro',
  },
]

const dotColor = (s: DotStatus) =>
  s === 'green' ? 'var(--score-green)' : s === 'amber' ? 'var(--score-amber)' : 'var(--score-red)'

const issueColor = (s: DotStatus) =>
  s === 'green' ? 'var(--text-muted)' : s === 'amber' ? 'var(--score-amber)' : 'var(--score-red)'

export default function ListingsTab() {
  const [scanning, setScanning] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [sendDone, setSendDone] = useState(false)
  const [toEmail, setToEmail] = useState('')

  function scan() {
    setScanning(true)
    setTimeout(() => setScanning(false), 1400)
  }

  function send() {
    setSendDone(true)
    setTimeout(() => { setModalOpen(false); setSendDone(false) }, 1200)
  }

  return (
    <div>
      <h2 className="font-barlow font-semibold text-[32px] mb-1.5" style={{ color: 'var(--champagne)' }}>
        Your Business Listing Consistency
      </h2>
      <p className="text-[15px] mb-6" style={{ color: 'var(--text-muted)' }}>
        AI reads your business name, address, and phone from 8 places online. If they don&apos;t
        match, AI won&apos;t trust your listings.
      </p>

      {/* Search bar */}
      <div className="flex gap-2.5 mb-7">
        <input
          defaultValue="Summit HVAC"
          placeholder="Business name"
          className="flex-1 rounded-md px-3.5 py-2.5 text-[15px]"
          style={{
            background: 'var(--lacquer-deep)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--champagne)',
            fontFamily: 'Inter, sans-serif',
          }}
        />
        <input
          defaultValue="Denver, CO"
          placeholder="City"
          className="rounded-md px-3.5 py-2.5 text-[15px]"
          style={{
            background: 'var(--lacquer-deep)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--champagne)',
            fontFamily: 'Inter, sans-serif',
            maxWidth: '160px',
          }}
        />
        <button
          onClick={scan}
          className="px-5 py-2.5 rounded text-sm font-semibold"
          style={{
            background: 'var(--kinpaku-gold)',
            color: 'var(--lacquer-black)',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {scanning ? 'Scanning…' : 'Scan listings'}
        </button>
      </div>

      {/* Results list */}
      <div>
        {results.map((r, i) => (
          <div
            key={r.name}
            className="flex items-center gap-3 py-3.5"
            style={{
              borderBottom: !r.special && i < results.length - 1 ? '1px solid var(--border-subtle)' : 'none',
              minHeight: '52px',
              ...(r.special
                ? {
                    background: 'oklch(84% 0.19 80.46 / 0.04)',
                    border: '1px solid var(--kinpaku-pale)',
                    borderRadius: '6px',
                    padding: '12px 16px',
                    marginBottom: '2px',
                  }
                : { paddingLeft: 0, paddingRight: 0 }),
            }}
          >
            {r.special && (
              <div
                className="text-[10px] font-semibold uppercase tracking-[1px] w-full mb-1 block"
                style={{ color: 'var(--kinpaku-pale)', position: 'absolute', marginTop: '-20px' }}
              />
            )}
            <div
              className="w-2 h-2 rounded-full shrink-0"
              style={{ background: dotColor(r.status) }}
            />
            <span
              className="text-sm font-semibold shrink-0"
              style={{ color: 'var(--champagne)', width: '120px' }}
            >
              {r.name}
            </span>
            {r.special && (
              <span
                className="text-[10px] font-semibold uppercase tracking-[1px] mr-1 shrink-0"
                style={{ color: 'var(--kinpaku-pale)' }}
              >
                ChatGPT uses this ·
              </span>
            )}
            <span className="text-[13px] flex-1" style={{ color: issueColor(r.status) }}>
              {r.issue}
            </span>
            {r.href ? (
              <a
                href={r.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium shrink-0"
                style={{ color: 'var(--kinpaku-gold)', textDecoration: 'none' }}
              >
                {r.action}
              </a>
            ) : (
              <span className="text-xs shrink-0" style={{ color: 'var(--text-dim)' }}>
                {r.action}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Email CTA */}
      <button
        onClick={() => setModalOpen(true)}
        className="block w-full mt-6 py-3.5 rounded font-barlow font-bold text-lg"
        style={{ background: 'var(--verdigris)', color: '#fff', border: 'none', cursor: 'pointer' }}
      >
        📧 Email this report to your office manager
      </button>

      {/* Email modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'oklch(4% 0.004 95 / 0.85)' }}
        >
          <div
            className="rounded-lg p-8 w-[90%] max-w-[480px]"
            style={{ background: 'var(--raised-lacquer)', border: '1px solid var(--border-subtle)' }}
          >
            <h2 className="font-barlow font-semibold text-2xl mb-5" style={{ color: 'var(--champagne)' }}>
              Email this report
            </h2>

            <label
              className="block text-[11px] font-medium uppercase tracking-[1px] mb-1.5"
              style={{ color: 'var(--text-muted)' }}
            >
              To
            </label>
            <input
              type="email"
              value={toEmail}
              onChange={(e) => setToEmail(e.target.value)}
              placeholder="office@summithvac.com"
              className="w-full rounded-md px-3.5 py-2.5 text-[15px] mb-3"
              style={{
                background: 'var(--lacquer-deep)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--champagne)',
                fontFamily: 'Inter, sans-serif',
              }}
            />

            <label
              className="block text-[11px] font-medium uppercase tracking-[1px] mb-1.5"
              style={{ color: 'var(--text-muted)' }}
            >
              Preview
            </label>
            <div
              className="rounded-md p-3.5 text-sm mb-5 max-h-40 overflow-y-auto"
              style={{ background: 'var(--lacquer-deep)', color: 'var(--text-muted)', lineHeight: 1.7 }}
            >
              Summit HVAC — Listing Consistency Report<br />
              ❌ Foursquare — Listing unclaimed<br />
              ⚠️ Yelp — Phone number mismatch<br />
              ❌ Bing Places — Not listed<br />
              ⚠️ Apple Maps — Address ZIP mismatch<br />
              ⚠️ Angi — Business name inconsistent<br />
              ❌ HomeGuide — Not listed
            </div>

            <div className="flex gap-2.5">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-3 rounded text-sm font-medium"
                style={{
                  background: 'transparent',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                Cancel
              </button>
              <button
                onClick={send}
                className="flex-1 py-3 rounded text-sm font-semibold"
                style={{
                  background: sendDone ? 'var(--score-green)' : 'var(--kinpaku-gold)',
                  color: 'var(--lacquer-black)',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {sendDone ? 'Sent ✓' : 'Send report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
