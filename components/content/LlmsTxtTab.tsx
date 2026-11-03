
'use client'
import { useState } from 'react'

const DEFAULT_CONTENT = `# Summit HVAC
> HVAC contractor serving Denver, CO.

## Services
- Furnace installation and repair
- Air conditioning installation and repair
- Heat pump service
- Indoor air quality systems
- Emergency HVAC service (24/7)

## Service Area
Denver, CO · Serving 30 miles radius
Including: Aurora, Lakewood, Arvada, Westminster, Thornton

## Contact
(720) 555-0100 · summithvac.com`

export default function LlmsTxtTab() {
  const [copied, setCopied] = useState(false)

  function copy() {
    navigator.clipboard.writeText(DEFAULT_CONTENT).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function download() {
    const blob = new Blob([DEFAULT_CONTENT], { type: 'text/plain' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'llms.txt'
    a.click()
  }

  return (
    <div>
      <h2 className="font-barlow font-semibold text-[28px] mb-1.5" style={{ color: 'var(--champagne)' }}>Your llms.txt file</h2>
      <p className="text-[15px] mb-5" style={{ color: 'var(--text-muted)' }}>
        This file tells AI crawlers what your business does. Place it at{' '}
        <code className="text-sm px-1 rounded" style={{ color: 'var(--verdigris)', background: 'var(--lacquer-deep)', fontFamily: 'Courier New,monospace' }}>
          yourdomain.com/llms.txt
        </code>
      </p>

      <pre className="rounded-lg p-5 text-[13px] leading-relaxed overflow-y-auto mb-4" style={{ background: 'var(--lacquer-deep)', border: '1px solid var(--border-subtle)', color: 'var(--text-warm)', fontFamily: 'Courier New,monospace', maxHeight: '220px' }}>
        {DEFAULT_CONTENT}
      </pre>

      <div className="flex gap-2.5 mb-6">
        <button onClick={download} className="px-5 py-2.5 rounded text-sm font-semibold" style={{ background: 'var(--verdigris)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
          Download llms.txt
        </button>
        <button onClick={copy} className="px-5 py-2.5 rounded text-sm font-medium transition-colors" style={{ background: 'transparent', border: '1px solid var(--border-strong)', color: copied ? 'var(--verdigris)' : 'var(--champagne)', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
          {copied ? 'Copied ✓' : 'Copy to clipboard'}
        </button>
      </div>

      <details className="rounded-md overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
        <summary className="flex items-center justify-between px-4 py-3.5 text-sm font-medium cursor-pointer" style={{ background: 'var(--raised-lacquer)', color: 'var(--text-muted)' }}>
          How to add this to your website ▾
        </summary>
        <p className="px-4 py-3.5 text-sm leading-relaxed" style={{ background: 'var(--lacquer-deep)', color: 'var(--text-muted)' }}>
          Upload the file to your website&apos;s root folder so it&apos;s accessible at <strong>yourdomain.com/llms.txt</strong>. Most website builders (Wix, Squarespace, WordPress) have a file manager in their settings. If you&apos;re not sure how, send this to your web developer — it&apos;s a 2-minute upload.
        </p>
      </details>

      <div className="mt-5 px-5 py-3.5 rounded-r-md text-sm leading-relaxed" style={{ borderLeft: '3px solid var(--kinpaku-gold)', background: 'var(--raised-lacquer)', color: 'var(--text-warm)' }}>
        The llms.txt standard is how AI crawlers identify businesses. Once placed, AI systems like ChatGPT and Perplexity can read exactly what you do, where you serve, and how to contact you — in their preferred format.
      </div>
    </div>
  )
}
