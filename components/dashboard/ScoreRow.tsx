'use client'
import { useState } from 'react'
import { scoreColor, estimatedCalls } from '@/lib/utils'

interface Platform { name: string; status: 'indexed' | 'partial' | 'not_indexed'; detail: string; fix?: string }

interface Props {
  score: number
  scoreDelta: number
  estimatedCallsPerMonth: number
  scoreHistory: number[]
  platformCoverage: Platform[]
}

export default function ScoreRow({ score, scoreDelta, estimatedCallsPerMonth, scoreHistory, platformCoverage }: Props) {
  const color = scoreColor(score)
  const deltaColor = scoreDelta > 0 ? 'var(--score-green)' : scoreDelta < 0 ? 'var(--score-red)' : 'var(--text-dim)'
  const deltaText = scoreDelta > 0 ? `+${scoreDelta} from last week` : scoreDelta < 0 ? `${scoreDelta} from last week` : 'Same as last week'
  const indexed = platformCoverage.filter(p => p.status === 'indexed').length

  const statusColor = (s: Platform['status']) => s === 'indexed' ? 'var(--score-green)' : s === 'partial' ? 'var(--score-amber)' : 'var(--score-red)'

  return (
    <div className="grid grid-cols-3 rounded-lg overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
      {/* Score block */}
      <div className="px-6 py-5 relative" style={{ borderRight: '1px solid var(--border-subtle)' }}>
        <div className="text-[11px] font-medium uppercase tracking-[1.5px] mb-2" style={{ color: 'var(--text-dim)' }}>Your Geoom Score</div>
        <button
          onClick={() => document.getElementById('score-watch-panel')?.classList.toggle('open')}
          className="absolute top-4 right-4 text-lg rounded p-1 transition-colors"
          style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
          aria-label="Score Watch alerts">🔔</button>
        <div className="font-barlow font-bold leading-none tracking-tight" style={{ fontSize: '72px', color, letterSpacing: '-1px' }}
          role="status" aria-label={`Your Geoom Score is ${score} out of 100`}>{score}</div>
        <div className="text-lg font-medium mt-1" style={{ color: 'var(--kinpaku-gold)' }}>~{estimatedCallsPerMonth} AI calls/month</div>
        <div className="text-xs mt-0.5 mb-2" style={{ color: 'var(--text-dim)' }}>estimated from your current score</div>
        <div className="text-sm font-medium" style={{ color: deltaColor }}>{deltaText}</div>
      </div>

      {/* Sparkline — hidden on mobile, built client-side */}
      <div className="px-6 py-5 hidden md:flex flex-col justify-center" style={{ borderRight: '1px solid var(--border-subtle)' }}>
        <SparklineCanvas data={scoreHistory} />
        <p className="text-xs mt-2" style={{ color: 'var(--text-dim)' }}>12-week trend</p>
      </div>

      {/* Platform coverage */}
      <div className="px-6 py-5">
        <div className="text-[11px] font-medium uppercase tracking-[1.5px] mb-3" style={{ color: 'var(--text-dim)' }}>AI Platform Coverage</div>
        <div className="flex gap-2.5 flex-wrap mb-2">
          {platformCoverage.map((p) => (
            <div key={p.name} className="flex flex-col items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ background: statusColor(p.status) }} />
              <span className="text-[10px]" style={{ color: 'var(--text-dim)' }}>{p.name.split(' ')[0]}</span>
            </div>
          ))}
        </div>
        <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>{indexed} of 6 platforms</p>
      </div>
    </div>
  )
}

function SparklineCanvas({ data }: { data: number[] }) {
  const W = 160, H = 48
  const min = 0, max = 100
  const xp = (i: number) => (i / (data.length - 1)) * W
  const yp = (v: number) => H - ((v - min) / (max - min)) * H
  const pts = data.map((v, i) => `${xp(i)},${yp(v)}`).join(' ')
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
      <polyline points={pts} fill="none" stroke="var(--kinpaku-gold)" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx={xp(0)} cy={yp(data[0])} r="3.5" fill="var(--lacquer-black)" stroke="var(--kinpaku-gold)" strokeWidth="1.5" />
      <circle cx={xp(data.length-1)} cy={yp(data[data.length-1])} r="4" fill="var(--kinpaku-gold)" />
    </svg>
  )
}
