'use client'

'use client'
import { useState } from 'react'

const FAQ_DATA: Record<string, Array<{ q: string; a: string }>> = {
  pricing: [
    { q:'How much does a furnace tune-up cost in Denver?', a:'A furnace tune-up from Summit HVAC in Denver costs $89–$149. This includes a full safety inspection, filter check, burner cleaning, and thermostat calibration. Call (720) 555-0100 to schedule.' },
    { q:'How much does emergency HVAC service cost?', a:'Emergency HVAC service from Summit HVAC starts at $149 for the service call, plus parts. We provide a full written estimate before any work begins. Call (720) 555-0100 for 24/7 service.' },
    { q:'Do you give free estimates?', a:'Yes. Summit HVAC provides free written estimates for all installations and major repairs in Denver. For service calls, there is a diagnostic fee credited toward the repair cost if you proceed.' },
    { q:'Do you offer financing for HVAC installations?', a:'Yes. Summit HVAC offers financing on system installations. Terms vary — ask when you request a quote. Call (720) 555-0100 for details.' },
    { q:'What payment methods do you accept?', a:'Summit HVAC accepts credit cards, debit cards, check, and cash. We also offer financing on larger installations. We never require full payment upfront.' },
  ],
  emergency: [
    { q:'Do you offer 24/7 emergency HVAC service in Denver?', a:'Yes. Summit HVAC provides 24/7 emergency heating and cooling service in Denver, CO. If your furnace fails on a cold night, call (720) 555-0100.' },
    { q:'How fast can you respond to a heating emergency?', a:'Summit HVAC aims to respond to heating emergencies in Denver within 2–4 hours. Call (720) 555-0100 to get an ETA.' },
    { q:'My furnace stopped working overnight. What should I check first?', a:'Check your thermostat (set to HEAT, above room temp). Check your air filter (replace if clogged). Check your circuit breaker. If none work, call Summit HVAC at (720) 555-0100.' },
    { q:'What counts as an HVAC emergency?', a:'Any situation where your home is unsafe — no heat in freezing temperatures, no cooling in extreme heat, gas smell near your furnace, or a complete system failure.' },
    { q:'Do you charge more for emergency service?', a:'Summit HVAC charges a standard emergency service call fee for after-hours visits. We tell you the fee upfront before dispatching. Call (720) 555-0100.' },
  ],
}

export default function FAQGeneratorTab() {
  const [topic, setTopic] = useState('pricing')
  const [count, setCount] = useState(5)
  const [results, setResults] = useState<Array<{ q: string; a: string }> | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState<number | null>(null)
  const [schemaCopied, setSchemaCopied] = useState(false)

  function generate() {
    setLoading(true)
    setTimeout(() => {
      setResults((FAQ_DATA[topic] || FAQ_DATA.pricing).slice(0, count))
      setLoading(false)
    }, 800)
  }

  function copyItem(i: number) {
    const item = results![i]
    navigator.clipboard.writeText(`Q: ${item.q}\n\nA: ${item.a}`).then(() => {
      setCopied(i); setTimeout(() => setCopied(null), 2000)
    })
  }

  function copySchema() {
    if (!results) return
    const schema = { '@context':'https://schema.org', '@type':'FAQPage', mainEntity: results.map(r => ({ '@type':'Question', name:r.q, acceptedAnswer:{ '@type':'Answer', text:r.a } })) }
    navigator.clipboard.writeText(JSON.stringify(schema, null, 2)).then(() => {
      setSchemaCopied(true); setTimeout(() => setSchemaCopied(false), 2000)
    })
  }

  return (
    <div>
      <h2 className="font-barlow font-semibold text-[28px] mb-1.5" style={{ color: 'var(--champagne)' }}>FAQ Generator</h2>
      <p className="text-[15px] mb-6" style={{ color: 'var(--text-muted)' }}>Generate trade-specific FAQ content ready to paste into your website. AI cites FAQ blocks 2.7x more than regular paragraphs.</p>

      <div className="flex gap-2.5 flex-wrap mb-6">
        <select value={topic} onChange={e => setTopic(e.target.value)} className="rounded-md px-3.5 py-2.5 text-sm" style={{ background: 'var(--lacquer-deep)', border: '1px solid var(--border-subtle)', color: 'var(--champagne)', fontFamily: 'Inter,sans-serif', cursor: 'pointer' }}>
          <option value="pricing">Pricing questions</option>
          <option value="emergency">Emergency service</option>
        </select>
        <select value={count} onChange={e => setCount(Number(e.target.value))} className="rounded-md px-3.5 py-2.5 text-sm" style={{ background: 'var(--lacquer-deep)', border: '1px solid var(--border-subtle)', color: 'var(--champagne)', fontFamily: 'Inter,sans-serif', cursor: 'pointer' }}>
          <option value={3}>3 questions</option>
          <option value={5}>5 questions</option>
        </select>
        <button onClick={generate} disabled={loading} className="font-barlow font-bold text-lg px-6 py-2.5 rounded disabled:opacity-40"
          style={{ background: 'var(--kinpaku-gold)', color: 'var(--lacquer-black)', border: 'none', cursor: 'pointer' }}>
          {loading ? 'Generating…' : 'Generate FAQs →'}
        </button>
      </div>

      {results && (
        <div>
          {results.map((item, i) => (
            <div key={i} className="rounded-md p-4 mb-2.5" style={{ background: 'var(--raised-lacquer)', border: '1px solid var(--border-subtle)' }}>
              <p className="text-[15px] font-semibold mb-2" style={{ color: 'var(--champagne)' }}>{item.q}</p>
              <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--text-muted)' }}>{item.a}</p>
              <div className="flex justify-end">
                <button onClick={() => copyItem(i)} className="text-xs font-medium px-2.5 py-1.5 rounded" style={{ background: 'transparent', border: '1px solid var(--border-strong)', color: copied===i ? 'var(--verdigris)' : 'var(--text-muted)', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
                  {copied === i ? 'Copied ✓' : 'Copy Q&A'}
                </button>
              </div>
            </div>
          ))}

          {/* Schema block */}
          <div className="rounded-lg p-5 mt-5" style={{ background: 'var(--lacquer-deep)', border: '1px solid var(--border-subtle)' }}>
            <div className="text-[11px] font-medium uppercase tracking-[1px] mb-3" style={{ color: 'var(--text-dim)' }}>Schema markup — paste into your website&apos;s &lt;head&gt;</div>
            <pre className="text-[12px] leading-relaxed overflow-x-auto max-h-44" style={{ color: 'var(--verdigris)', fontFamily: 'Courier New,monospace' }}>
              {JSON.stringify({ '@context':'https://schema.org', '@type':'FAQPage', mainEntity: results.map(r => ({ '@type':'Question', name:r.q, acceptedAnswer:{ '@type':'Answer', text:r.a } })) }, null, 2)}
            </pre>
            <button onClick={copySchema} className="mt-3 text-xs font-medium px-3 py-1.5 rounded" style={{ background: 'transparent', border: '1px solid var(--border-strong)', color: schemaCopied ? 'var(--verdigris)' : 'var(--text-muted)', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
              {schemaCopied ? 'Copied ✓' : 'Copy schema'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
