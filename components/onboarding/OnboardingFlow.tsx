
'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { scoreColor, estimatedCalls } from '@/lib/utils'

type Trade = 'HVAC' | 'Plumbing' | 'Electrical' | 'Roofing'
type Tool = 'Jobber' | 'Workiz' | 'ServiceM8' | 'HousecallPro' | 'Manual' | 'none'

const trades: { key: Trade; emoji: string; desc: string }[] = [
  { key: 'HVAC',       emoji: '🔧', desc: 'Heating, cooling & air quality' },
  { key: 'Plumbing',   emoji: '🚰', desc: 'Pipes, drains & water systems' },
  { key: 'Electrical', emoji: '⚡', desc: 'Wiring, panels & lighting' },
  { key: 'Roofing',    emoji: '🏠', desc: 'Roofs, gutters & exteriors' },
]

const tools: { key: Tool; name: string; benefit: string }[] = [
  { key: 'Jobber',      name: 'Jobber',           benefit: 'Auto-fills your service area and completed jobs' },
  { key: 'Workiz',      name: 'Workiz',            benefit: 'Imports your job history to build FAQ content' },
  { key: 'ServiceM8',   name: 'ServiceM8',         benefit: 'Syncs your service area and completed jobs automatically' },
  { key: 'HousecallPro',name: 'Housecall Pro',     benefit: 'Imports your review data into your score' },
  { key: 'Manual',      name: 'I manage jobs manually', benefit: 'We\'ll set up your profile from your business name and city' },
  { key: 'none',        name: 'I don\'t use any of these', benefit: '' },
]

const faqByTrade: Record<Trade, { q: string; a: string }> = {
  HVAC:       { q: 'How much does a furnace tune-up cost in [City]?', a: 'A furnace tune-up from [Business] typically costs $89–$149. We include a full safety check and written summary of any issues found.' },
  Plumbing:   { q: 'How much does it cost to replace a water heater in [City]?', a: 'A water heater replacement from [Business] in [City] typically costs $800–$1,500 depending on the unit. We provide a written estimate before any work begins.' },
  Electrical: { q: 'How much does an electrical panel upgrade cost in [City]?', a: 'An electrical panel upgrade from [Business] in [City] typically costs $1,500–$3,000. We provide a written estimate and pull all required permits.' },
  Roofing:    { q: 'How much does a roof replacement cost in [City]?', a: 'A roof replacement from [Business] in [City] typically costs $8,000–$18,000 depending on materials. We provide a free written estimate.' },
}

export default function OnboardingFlow() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [step, setStep] = useState(0)
  const [trade, setTrade] = useState<Trade | null>((searchParams.get('trade') as Trade) || null)
  const [businessName, setBusinessName] = useState(searchParams.get('business') ?? '')
  const [city, setCity] = useState(searchParams.get('city') ?? '')
  const [stateVal, setStateVal] = useState('')
  const [phone, setPhone] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [urlWarn, setUrlWarn] = useState(false)
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null)
  const [connectedTool, setConnectedTool] = useState<Tool | null>(null)
  const [connectLoading, setConnectLoading] = useState(false)
  const [connectError, setConnectError] = useState('')
  const [foursquareClaimed, setFoursquareClaimed] = useState(false)
  const [showClaimContinue, setShowClaimContinue] = useState(false)
  const [step1Loading, setStep1Loading] = useState(false)
  const [step2Loading, setStep2Loading] = useState(false)
  const [scanCount, setScanCount] = useState(0)
  const [scanDone, setScanDone] = useState(false)

  const score = parseInt(searchParams.get('score') ?? '34', 10)
  const calls = estimatedCalls(score)
  const futureCalls = estimatedCalls(70)
  const color = scoreColor(score)

  // If trade in URL, skip step 0
  useEffect(() => {
    if (searchParams.get('trade')) setStep(1)
  }, [])

  function goTo(n: number) { setStep(n) }

  // Step 0 — pick trade, auto-advance
  function pickTrade(t: Trade) {
    setTrade(t)
    setTimeout(() => goTo(1), 300)
  }

  // Step 1 — confirm business
  function submitStep1() {
    if (!trade || !businessName.trim()) return
    setStep1Loading(true)
    setTimeout(() => { setStep1Loading(false); goTo(2) }, 900)
  }

  function validateWebsite() {
    if (websiteUrl && !websiteUrl.startsWith('http')) setUrlWarn(true)
    else setUrlWarn(false)
  }

  // Step 2 — connect tools
  function submitStep2() {
    setStep2Loading(true)
    setTimeout(() => { setStep2Loading(false); goTo(3) }, 700)
  }

  async function connectTool(tool: Tool) {
    setConnectLoading(true)
    setConnectError('')
    await new Promise(r => setTimeout(r, 1200))
    // In production: OAuth redirect
    const ok = Math.random() > 0.3
    if (ok) { setConnectedTool(tool) }
    else { setConnectError('Connection failed — try again') }
    setConnectLoading(false)
  }

  // Step 3 — foursquare + scan
  function claimFoursquare() {
    setFoursquareClaimed(true)
    startScan()
  }

  function startScan() {
    goTo(4)
    let count = 0
    const target = score
    const duration = 1200
    const start = performance.now()
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) { setScanCount(target); setScanDone(true); return }
    function tick(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      count = Math.round(eased * target)
      setScanCount(count)
      if (progress < 1) requestAnimationFrame(tick)
      else { setScanDone(true); setTimeout(() => router.push('/dashboard'), 2500) }
    }
    requestAnimationFrame(tick)
  }

  const faqTemplate = trade ? faqByTrade[trade] : faqByTrade['HVAC']
  const schemaCode = `{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [{
    "@type": "Question",
    "name": "${faqTemplate.q.replace('[City]', city || 'your city')}",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "${faqTemplate.a.replace(/\[Business\]/g, businessName || 'We').replace(/\[City\]/g, city || 'your city')}"
    }
  }]
}`

  const stepCount = step >= 1 && step <= 4 ? `Step ${step} of 4` : ''

  return (
    <div className="max-w-[560px] mx-auto px-6 pb-20">
      {stepCount && (
        <p className="text-sm font-medium pt-6 mb-0" style={{ color: 'var(--text-muted)' }}>{stepCount}</p>
      )}

      {/* ── STEP 0 — TRADE PICKER ── */}
      {step === 0 && (
        <div className="pt-10">
          <h1 className="font-barlow font-bold text-[36px] mb-2.5" style={{ color: 'var(--champagne)' }}>What&apos;s your trade?</h1>
          <p className="text-base mb-8" style={{ color: 'var(--text-muted)' }}>We&apos;ll customize your score and fix plan for your specific business.</p>
          <div className="grid grid-cols-2 gap-3.5" role="radiogroup" aria-label="Select your trade">
            {trades.map((t) => (
              <button
                key={t.key}
                role="radio"
                aria-checked={trade === t.key}
                onClick={() => pickTrade(t.key)}
                className="rounded-lg p-6 text-center cursor-pointer transition-all"
                style={{
                  background: 'var(--raised-lacquer)',
                  border: trade === t.key ? '2px solid var(--kinpaku-gold)' : '1px solid var(--border-subtle)',
                  outline: 'none',
                }}
              >
                <div className="text-5xl mb-2.5">{t.emoji}</div>
                <div className="font-barlow font-bold text-2xl mb-1" style={{ color: 'var(--champagne)' }}>{t.key}</div>
                <div className="text-[13px]" style={{ color: 'var(--text-muted)' }}>{t.desc}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── STEP 1 — CONFIRM BUSINESS ── */}
      {step === 1 && (
        <div className="pt-8">
          <p className="text-[15px] mb-3.5" style={{ color: 'var(--text-muted)' }}>We pulled your info from your audit. Does this look right?</p>
          <h2 className="font-barlow font-semibold text-[28px] mb-6" style={{ color: 'var(--champagne)' }}>Your business</h2>

          {/* Trade selector */}
          <div className="mb-4">
            <label className="block text-[12px] font-medium uppercase tracking-[1px] mb-1.5" style={{ color: 'var(--text-muted)' }}>Trade</label>
            <div className="grid grid-cols-2 gap-2" role="radiogroup">
              {trades.map((t) => (
                <button key={t.key} role="radio" aria-checked={trade === t.key}
                  onClick={() => setTrade(t.key)}
                  className="py-3 px-4 rounded text-sm font-semibold text-center transition-all"
                  style={{ background: 'var(--raised-lacquer)', border: trade === t.key ? '2px solid var(--kinpaku-gold)' : '1px solid var(--border-subtle)', color: trade === t.key ? 'var(--kinpaku-gold)' : 'var(--text-warm)' }}>
                  {t.key}
                </button>
              ))}
            </div>
          </div>

          {/* Business name */}
          <div className="mb-3.5">
            <label className="block text-[12px] font-medium uppercase tracking-[1px] mb-1.5" htmlFor="biz" style={{ color: 'var(--text-muted)' }}>Business name</label>
            <input id="biz" type="text" value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="Summit HVAC" autoComplete="organization"
              className="w-full rounded-md px-3 py-2.5 text-[15px]"
              style={{ background: 'var(--lacquer-deep)', border: '1px solid var(--border-subtle)', color: 'var(--champagne)', fontFamily: 'Inter,sans-serif' }} />
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3.5">
            <div>
              <label className="block text-[12px] font-medium uppercase tracking-[1px] mb-1.5" htmlFor="city" style={{ color: 'var(--text-muted)' }}>City</label>
              <input id="city" type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="Denver" autoComplete="address-level2"
                className="w-full rounded-md px-3 py-2.5 text-[15px]"
                style={{ background: 'var(--lacquer-deep)', border: '1px solid var(--border-subtle)', color: 'var(--champagne)', fontFamily: 'Inter,sans-serif' }} />
            </div>
            <div>
              <label className="block text-[12px] font-medium uppercase tracking-[1px] mb-1.5" htmlFor="state" style={{ color: 'var(--text-muted)' }}>State</label>
              <input id="state" type="text" value={stateVal} onChange={e => setStateVal(e.target.value)} placeholder="CO" maxLength={2}
                className="w-full rounded-md px-3 py-2.5 text-[15px]"
                style={{ background: 'var(--lacquer-deep)', border: '1px solid var(--border-subtle)', color: 'var(--champagne)', fontFamily: 'Inter,sans-serif' }} />
            </div>
          </div>

          <div className="mb-3.5">
            <label className="block text-[12px] font-medium uppercase tracking-[1px] mb-1.5" htmlFor="phone" style={{ color: 'var(--text-muted)' }}>Phone <span style={{ color: 'var(--text-dim)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
            <input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(720) 555-0100" autoComplete="tel"
              className="w-full rounded-md px-3 py-2.5 text-[15px]"
              style={{ background: 'var(--lacquer-deep)', border: '1px solid var(--border-subtle)', color: 'var(--champagne)', fontFamily: 'Inter,sans-serif' }} />
          </div>

          <div className="mb-6">
            <label className="block text-[12px] font-medium uppercase tracking-[1px] mb-1.5" htmlFor="url" style={{ color: 'var(--text-muted)' }}>Website URL <span style={{ color: 'var(--text-dim)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
            <input id="url" type="url" value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)} onBlur={validateWebsite} placeholder="https://summithvac.com" autoComplete="url"
              className="w-full rounded-md px-3 py-2.5 text-[15px]"
              style={{ background: 'var(--lacquer-deep)', border: '1px solid var(--border-subtle)', color: 'var(--champagne)', fontFamily: 'Inter,sans-serif' }} />
            {urlWarn && <p className="text-[13px] mt-1.5" style={{ color: 'var(--score-amber)' }}>⚠ We&apos;ll need your website URL to check your schema markup. You can add it in Settings later.</p>}
          </div>

          <button onClick={submitStep1} disabled={!trade || !businessName.trim() || step1Loading}
            className="w-full py-3.5 rounded font-semibold text-base transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ background: 'var(--kinpaku-gold)', color: 'var(--lacquer-black)', fontFamily: 'Inter,sans-serif' }}>
            {step1Loading && <Spinner dark />}
            {step1Loading ? 'Saving…' : 'Confirm my business →'}
          </button>
        </div>
      )}

      {/* ── STEP 2 — CONNECT TOOLS ── */}
      {step === 2 && (
        <div className="pt-8">
          <button onClick={() => goTo(1)} className="flex items-center gap-1 text-sm mb-7 transition-colors" style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>← Back</button>
          <p className="text-[15px] mb-3.5" style={{ color: 'var(--text-muted)' }}>If you use one of these, we can set up your profile automatically.</p>
          <h2 className="font-barlow font-semibold text-[28px] mb-6" style={{ color: 'var(--champagne)' }}>Do you use any of these?</h2>

          <div className="flex flex-col gap-2.5 mb-5">
            {tools.map((tool) => {
              const isSelected = selectedTool === tool.key
              const isConnected = connectedTool === tool.key
              return (
                <div key={tool.key}>
                  <button
                    role="radio" aria-checked={isSelected}
                    onClick={() => setSelectedTool(tool.key)}
                    className="w-full text-left rounded-lg px-5 py-4 min-h-[64px] transition-all"
                    style={{ background: 'var(--raised-lacquer)', border: isSelected ? '2px solid var(--kinpaku-gold)' : '1px solid var(--border-subtle)' }}>
                    <div className="text-[15px] font-semibold" style={{ color: 'var(--champagne)' }}>{tool.name}</div>
                    {tool.benefit && <div className="text-[13px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{tool.benefit}</div>}
                  </button>
                  {isSelected && tool.key !== 'none' && (
                    <div className="mt-2 ml-4">
                      {isConnected ? (
                        <span className="text-sm font-semibold" style={{ color: 'var(--verdigris)' }}>Connected ✓</span>
                      ) : (
                        <>
                          <button onClick={() => connectTool(tool.key)} disabled={connectLoading}
                            className="text-sm font-semibold px-4 py-2 rounded transition-colors"
                            style={{ background: 'oklch(70% 0.12 188 / 0.15)', border: '1px solid var(--verdigris)', color: 'var(--verdigris)', fontFamily: 'Inter,sans-serif', cursor: 'pointer' }}>
                            {connectLoading ? 'Connecting…' : `Connect ${tool.name} →`}
                          </button>
                          {connectError && <p className="text-xs mt-1.5" style={{ color: 'var(--score-red)' }}>{connectError}</p>}
                        </>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <button onClick={submitStep2} disabled={step2Loading}
            className="w-full py-3.5 rounded font-semibold text-base flex items-center justify-center gap-2 mb-3"
            style={{ background: 'var(--kinpaku-gold)', color: 'var(--lacquer-black)', fontFamily: 'Inter,sans-serif', cursor: 'pointer' }}>
            {step2Loading && <Spinner dark />}
            {step2Loading ? 'Saving…' : 'Continue →'}
          </button>
          <button onClick={() => { setSelectedTool(null); goTo(3) }} className="w-full text-sm text-center underline" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
            Skip for now →
          </button>
        </div>
      )}

      {/* ── STEP 3 — FOURSQUARE ── */}
      {step === 3 && (
        <div className="pt-8">
          <button onClick={() => goTo(2)} className="flex items-center gap-1 text-sm mb-7" style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>← Back</button>
          <p className="text-[15px] mb-3.5" style={{ color: 'var(--text-muted)' }}>One more — this one matters for ChatGPT specifically.</p>
          <h2 className="font-barlow font-semibold text-[28px] mb-6" style={{ color: 'var(--champagne)' }}>Is your Foursquare listing claimed?</h2>

          <div className="rounded-lg p-6 mb-6" style={{ background: 'var(--raised-lacquer)', border: '1px solid var(--kinpaku-pale)' }}>
            <div className="text-[32px] mb-3.5" style={{ color: 'var(--verdigris)' }}>📍</div>
            <h3 className="text-lg font-semibold mb-2.5" style={{ color: 'var(--champagne)' }}>Is your Foursquare listing claimed?</h3>
            <p className="text-[15px] leading-relaxed" style={{ color: 'var(--text-warm)' }}>
              ChatGPT uses Foursquare to recommend local contractors. Most contractors have never claimed it — which means yours might be showing wrong information.
            </p>
          </div>

          <div className="flex gap-2.5 mb-3">
            <button onClick={claimFoursquare}
              className="flex-1 py-3 rounded text-sm font-medium transition-colors"
              style={{ background: 'transparent', border: '1px solid var(--border-strong)', color: 'var(--champagne)', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
              Yes, it&apos;s claimed
            </button>
            <a href="https://foursquare.com/add-place" target="_blank" rel="noopener"
              onClick={() => setTimeout(() => setShowClaimContinue(true), 800)}
              className="flex-1 py-3 rounded text-sm font-semibold text-center"
              style={{ background: 'var(--verdigris)', color: '#fff', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              Claim it now →
            </a>
          </div>
          {showClaimContinue && (
            <button onClick={claimFoursquare} className="w-full py-3 rounded text-sm font-semibold"
              style={{ background: 'transparent', border: '1px solid var(--verdigris)', color: 'var(--verdigris)', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
              I&apos;ve claimed it — continue →
            </button>
          )}
        </div>
      )}

      {/* ── STEP 4 — SCAN + FIRST ACTION ── */}
      {step === 4 && (
        <div className="pt-12">
          {!scanDone ? (
            <div className="text-center py-10">
              <h2 className="font-barlow font-bold text-[32px] mb-3" style={{ color: 'var(--champagne)' }}>Scanning your AI visibility...</h2>
              <p className="text-[15px] mb-10" style={{ color: 'var(--text-muted)' }}>We&apos;re checking 6 signals across ChatGPT, Google AI, Siri, and 3 more platforms right now.</p>
              <div className="font-barlow font-bold" style={{ fontSize: '96px', lineHeight: 1, color: scoreColor(scanCount), letterSpacing: '-1px' }}>
                {scanCount}
              </div>
            </div>
          ) : (
            <div>
              <p className="text-[15px] mb-1.5" style={{ color: 'var(--verdigris)' }}>✓ You&apos;re set up. Here&apos;s your first action.</p>
              <h2 className="font-barlow font-bold text-[32px] mb-6" style={{ color: 'var(--champagne)' }}>Your first action is ready</h2>

              {/* Score */}
              <div className="flex items-start gap-6 rounded-lg p-5 mb-2" style={{ background: 'var(--raised-lacquer)', borderLeft: `3px solid ${color}` }}>
                <span className="font-barlow font-bold" style={{ fontSize: '80px', lineHeight: 1, color, letterSpacing: '-1px' }}>{score}</span>
                <div className="pt-1.5">
                  <p className="text-[17px] font-medium mb-1" style={{ color: 'var(--champagne)' }}>~{calls} AI calls estimated this month.</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>At 70+, that&apos;s ~{futureCalls} AI calls estimated this month.</p>
                </div>
              </div>
              <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Complete this action and your score moves.</p>

              {/* Action card */}
              <div className="rounded-lg p-6 mb-5" style={{ background: 'var(--raised-lacquer)', border: '1px solid var(--border-strong)', borderLeft: '4px solid var(--kinpaku-gold)' }}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-medium uppercase tracking-[1px]" style={{ color: 'var(--text-dim)' }}>Add FAQ Schema to your website</span>
                  <span className="text-xs" style={{ color: 'var(--text-dim)' }}>8 minutes</span>
                </div>
                <p className="text-sm mb-3" style={{ color: 'var(--verdigris)' }}>Easy — copy and paste</p>
                <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)', marginBottom: '14px' }} />
                <div className="text-[11px] font-medium uppercase tracking-[1px] mb-2" style={{ color: 'var(--text-dim)' }}>Step 1 of 3</div>
                <p className="text-[15px] mb-3" style={{ color: 'var(--text-warm)' }}>Go to your website&apos;s contact or services page in your CMS — WordPress, Squarespace, Wix, wherever you manage your site.</p>
                <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)', marginBottom: '14px' }} />
                <div className="text-[11px] font-medium uppercase tracking-[1px] mb-2" style={{ color: 'var(--text-dim)' }}>Step 2 of 3</div>
                <p className="text-[15px] mb-3" style={{ color: 'var(--text-warm)' }}>Add this block to the page. Copy it exactly:</p>
                <pre className="text-[12px] rounded-md p-4 overflow-x-auto mb-2" style={{ background: 'var(--lacquer-deep)', color: 'var(--verdigris)', fontFamily: 'Courier New,monospace', lineHeight: 1.55 }}>
{schemaCode}
                </pre>
                <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)', marginBottom: '14px' }} />
                <div className="text-[11px] font-medium uppercase tracking-[1px] mb-2" style={{ color: 'var(--text-dim)' }}>Step 3 of 3</div>
                <p className="text-[15px]" style={{ color: 'var(--text-warm)' }}>
                  Save the page and publish it. Done.<br />
                  AI assistants can now quote your FAQ when recommending <strong style={{ color: 'var(--champagne)' }}>{businessName || 'your business'}</strong> in <strong style={{ color: 'var(--champagne)' }}>{city || 'your city'}</strong>.
                </p>
              </div>

              <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Your next action will be ready Monday morning. We&apos;ll email it to you at 8am.</p>

              <a href="/dashboard" className="block w-full text-center font-barlow font-bold text-lg py-4 rounded"
                style={{ background: 'var(--kinpaku-gold)', color: 'var(--lacquer-black)', textDecoration: 'none' }}>
                Go to my dashboard →
              </a>
              <p className="text-xs text-center mt-2.5" style={{ color: 'var(--text-muted)' }}>You can always find this action in your Fix Plan.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Spinner({ dark = false }: { dark?: boolean }) {
  return (
    <span className="inline-block w-3.5 h-3.5 rounded-full border-2 animate-spin"
      style={{ borderColor: dark ? 'rgba(0,0,0,0.2)' : 'var(--border-strong)', borderTopColor: dark ? 'var(--lacquer-black)' : 'var(--kinpaku-gold)' }}
      aria-hidden="true" />
  )
}
