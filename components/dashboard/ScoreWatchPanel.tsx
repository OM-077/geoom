'use client'
import { useState } from 'react'

interface Props { email: string; isPro: boolean }

export default function ScoreWatchPanel({ email, isPro }: Props) {
  const [open, setOpen] = useState(false)
  const [scoreAlert, setScoreAlert] = useState(true)
  const [emailVal, setEmailVal] = useState(email)

  if (typeof window !== 'undefined') {
    (window as any).__toggleScoreWatch = () => setOpen(o => !o)
  }

  return (
    <>
      {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />}
      <div
        id="score-watch-panel"
        className={`fixed top-0 right-0 bottom-0 z-50 overflow-y-auto transition-transform ${open ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ width: '320px', background: 'var(--raised-lacquer)', borderLeft: '1px solid var(--border-subtle)' }}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <span className="text-base font-semibold" style={{ color: 'var(--champagne)' }}>Score Watch</span>
            <button onClick={() => setOpen(false)} className="text-lg" style={{ color: 'var(--text-dim)', background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
          </div>

          {/* Toggle: score moves */}
          <div className="flex items-center justify-between py-3.5" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            <span className="text-sm" style={{ color: 'var(--text-warm)' }}>Alert me when my score moves 5+ points</span>
            <button
              onClick={() => setScoreAlert(v => !v)}
              className="w-11 h-6 rounded-full relative shrink-0 transition-colors"
              style={{ background: scoreAlert ? 'var(--kinpaku-gold)' : 'var(--border-strong)', cursor: 'pointer', border: 'none' }}
              role="switch" aria-checked={scoreAlert}>
              <div className="absolute top-0.5 w-5 h-5 rounded-full transition-all" style={{ background: 'var(--lacquer-black)', left: scoreAlert ? 'calc(100% - 22px)' : '2px' }} />
            </button>
          </div>

          {/* Toggle: competitor (Pro only) */}
          <div className="flex items-center justify-between py-3.5" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            <div>
              <span className="text-sm" style={{ color: 'var(--text-warm)' }}>Alert when a competitor moves</span>
              {!isPro && <span className="ml-2 text-[10px] font-semibold uppercase tracking-[1px] px-1.5 py-0.5 rounded-sm" style={{ color: 'var(--kinpaku-gold)', border: '1px solid var(--kinpaku-gold)' }}>Pro</span>}
            </div>
            <div className="w-11 h-6 rounded-full relative opacity-40" style={{ background: 'var(--border-strong)' }}>
              <div className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full" style={{ background: 'var(--text-dim)' }} />
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3">
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-[1px] mb-1.5" style={{ color: 'var(--text-muted)' }}>Your email</label>
              <input type="email" value={emailVal} onChange={e => setEmailVal(e.target.value)} className="w-full rounded-md px-3 py-2.5 text-[15px]" style={{ background: 'var(--lacquer-deep)', border: '1px solid var(--border-subtle)', color: 'var(--champagne)', fontFamily: 'Inter,sans-serif' }} />
            </div>
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-[1px] mb-1.5" style={{ color: 'var(--text-muted)' }}>Phone for SMS <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(Pro only)</span></label>
              <div className="relative">
                <input type="tel" disabled placeholder="+1 (555) 000-0000" className="w-full rounded-md px-3 py-2.5 text-[15px]" style={{ background: 'var(--lacquer-deep)', border: '1px solid var(--border-subtle)', color: 'var(--text-dim)', fontFamily: 'Inter,sans-serif', filter: 'blur(2px)' }} />
                <div className="absolute inset-0 flex items-center justify-center text-xs font-medium" style={{ color: 'var(--kinpaku-gold)' }}>Pro only</div>
              </div>
            </div>
            <button className="w-full py-3 rounded text-sm font-semibold mt-1" style={{ background: 'var(--kinpaku-gold)', color: 'var(--lacquer-black)', border: 'none', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>Save</button>
          </div>
        </div>
      </div>
    </>
  )
}
