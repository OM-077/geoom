'use client'
import { useState } from 'react'

const TRADE_SCHEMA_TYPE: Record<string, string> = {
  hvac: 'HVACBusiness',
  plumbing: 'Plumber',
  electrical: 'Electrician',
  roofing: 'RoofingContractor',
  cleaning: 'HouseCleaner',
  lawn: 'LandscapeService',
  pest: 'PestControlService',
}

export default function SchemaTab() {
  const [copied, setCopied] = useState(false)

  // In production these come from the business DB record
  const business = {
    name: 'Summit HVAC',
    trade: 'hvac',
    phone: '(720) 555-0100',
    address: '123 Main St',
    city: 'Denver',
    state: 'CO',
    zip: '80201',
    url: 'https://summithvac.com',
    description: 'Professional HVAC repair, installation and maintenance serving Denver, CO',
    areaServed: ['Denver', 'Aurora', 'Lakewood', 'Englewood'],
  }

  const schemaType = TRADE_SCHEMA_TYPE[business.trade] || 'LocalBusiness'

  const schema = {
    '@context': 'https://schema.org',
    '@type': schemaType,
    'name': business.name,
    'description': business.description,
    'url': business.url,
    'telephone': business.phone,
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': business.address,
      'addressLocality': business.city,
      'addressRegion': business.state,
      'postalCode': business.zip,
      'addressCountry': 'US',
    },
    'areaServed': business.areaServed.map(city => ({ '@type': 'City', 'name': city })),
    'openingHoursSpecification': [{
      '@type': 'OpeningHoursSpecification',
      'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      'opens': '08:00',
      'closes': '17:00',
    }],
    'priceRange': '$$',
  }

  const code = `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`

  function handleCopy() {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      <div className="mb-5 rounded-lg p-5" style={{ background: 'var(--raised-lacquer)', border: '1px solid var(--border-subtle)' }}>
        <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
          <div>
            <h3 className="font-semibold text-base mb-1" style={{ color: 'var(--champagne)' }}>Your Schema Markup</h3>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Paste this in the{' '}
              <code style={{ background: 'var(--lacquer-deep)', padding: '1px 5px', borderRadius: 3, fontSize: 12 }}>&lt;head&gt;</code>
              {' '}of your website. Tells AI engines exactly who you are, what you do, and where you serve.
            </p>
          </div>
          <button
            onClick={handleCopy}
            style={{ background: copied ? 'var(--score-green)' : 'var(--kinpaku-gold)', color: 'var(--lacquer-black)', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}
          >
            {copied ? '✓ Copied!' : 'Copy code'}
          </button>
        </div>
        <pre style={{ background: 'var(--lacquer-deep)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '16px', fontSize: '12px', color: 'var(--text-warm)', overflowX: 'auto', lineHeight: 1.6, margin: 0 }}>
          {code}
        </pre>
      </div>

      <div className="rounded-lg p-5" style={{ background: 'var(--raised-lacquer)', border: '1px solid var(--border-subtle)' }}>
        <h3 className="font-semibold text-sm mb-3" style={{ color: 'var(--champagne)' }}>How to add this to your site</h3>
        {[
          { cms: 'WordPress', steps: 'Install "Insert Headers and Footers" plugin → paste in Header section' },
          { cms: 'Wix', steps: 'Settings → Custom Code → Head → paste code' },
          { cms: 'Squarespace', steps: 'Settings → Advanced → Code Injection → Header → paste code' },
          { cms: 'Webflow', steps: 'Project Settings → Custom Code → Head Code → paste code' },
          { cms: 'Custom site', steps: 'Add inside <head>...</head> in your index.html or layout file' },
        ].map(item => (
          <div key={item.cms} className="flex gap-3 py-2.5" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            <span className="text-sm font-semibold w-28 shrink-0" style={{ color: 'var(--champagne)' }}>{item.cms}</span>
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{item.steps}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
