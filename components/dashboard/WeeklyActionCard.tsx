'use client'
import { useState } from 'react'
import Link from 'next/link'

interface Action {
  id: string; title: string; signal: string; timeEstimate: string
  difficulty: string; previewStep: string; dueDate: string; completed: boolean
}

interface Props { action: Action; nextActionDate: string }

export default function WeeklyActionCard({ action, nextActionDate }: Props) {
  const [done, setDone] = useState(action.completed)
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)

  async function confirmDone() {
    setLoading(true)
    await new Promise(r => setTimeout(r, 1000)) // POST /api/actions/complete
    setDone(true); setLoading(false); setConfirming(false)
  }

  return (
    <div className="rounded-lg p-6" style={{ background: 'var(--raised-lacquer)', border: '1px solid var(--border-subtle)', borderLeft: `4px solid ${done ? 'var(--score-green)' : 'var(--kinpaku-gold)'}` }}>
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[11px] font-medium uppercase tracking-[1.5px]" style={{ color: done ? 'var(--score-green)' : 'var(--text-dim)' }}>
          {done ? 'COMPLETED' : "THIS WEEK'S ACTION"}
        </span>
        <span className="text-xs" style={{ color: 'var(--text-dim)' }}>{action.dueDate}</span>
      </div>

      {done ? (
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--verdigris)' }}>
            ✓ Done — your score will update within 24 hours.<br />
            Next action: {nextActionDate} · <Link href="/signals" style={{ color: 'var(--verdigris)' }}>See your progress →</Link>
          </p>
        </div>
      ) : (
        <>
          <h2 className="font-barlow font-semibold text-[28px] mb-3" style={{ color: 'var(--champagne)' }}>{action.title}</h2>
          <div className="flex items-center gap-2 flex-wrap mb-4">
            <span className="text-[11px] font-medium uppercase tracking-[1px] px-2 py-0.5 rounded-sm" style={{ background: 'var(--lacquer-deep)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>{action.signal}</span>
            <span className="text-sm" style={{ color: 'var(--text-warm)' }}>{action.timeEstimate}</span>
            <span style={{ color: 'var(--text-dim)' }}>·</span>
            <span className="text-sm" style={{ color: 'var(--verdigris)' }}>{action.difficulty}</span>
          </div>
          <p className="text-sm mb-5" style={{ color: 'var(--text-warm)' }}>
            Step 1: {action.previewStep.slice(0, 80)}…{' '}
            <Link href={`/driver`} className="text-sm font-medium" style={{ color: 'var(--kinpaku-gold)' }}>See full instructions →</Link>
          </p>
          <div className="flex gap-2.5">
            <Link href="/driver" className="px-5 py-2.5 rounded text-sm font-semibold" style={{ background: 'var(--kinpaku-gold)', color: 'var(--lacquer-black)', textDecoration: 'none' }}>
              Start this action →
            </Link>
            <button onClick={() => setConfirming(true)} className="px-4 py-2.5 rounded text-sm font-medium transition-colors"
              style={{ background: 'transparent', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
              I already did this
            </button>
          </div>
          {confirming && (
            <div className="flex items-center gap-4 mt-4 px-4 py-3.5 rounded-md flex-wrap" style={{ background: 'var(--lacquer-deep)', border: '1px solid var(--border-subtle)' }}>
              <span className="text-sm flex-1" style={{ color: 'var(--champagne)' }}>Did you complete &ldquo;{action.title}&rdquo;?</span>
              <div className="flex gap-3">
                <button onClick={confirmDone} disabled={loading} className="text-sm font-semibold" style={{ color: 'var(--verdigris)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
                  {loading ? 'Saving…' : 'Yes, I did this'}
                </button>
                <button onClick={() => setConfirming(false)} className="text-sm" style={{ color: 'var(--text-dim)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>Cancel</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
