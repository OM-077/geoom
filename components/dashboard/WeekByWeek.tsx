'use client'

import { scoreColor } from '@/lib/utils'

type Status = 'done' | 'missed' | 'pending' | 'empty'

interface Props {
  scoreHistory: number[]
  weekLabels: string[]
  weekStatuses: readonly Status[]
}

export default function WeekByWeek({ scoreHistory, weekLabels, weekStatuses }: Props) {
  const done = weekStatuses.filter(s => s === 'done').length
  const gains = scoreHistory.slice(1).map((v, i) => v - scoreHistory[i]).filter((_, i) => weekStatuses[i] === 'done')
  const avgGain = gains.length ? Math.round(gains.reduce((a, b) => a + b, 0) / gains.length) : 0
  const bestGain = gains.length ? Math.max(...gains) : 0

  const dotColor = (s: Status) => s === 'done' ? 'var(--score-green)' : s === 'missed' ? 'var(--score-red)' : s === 'pending' ? 'var(--kinpaku-gold)' : 'var(--text-dim)'

  return (
    <div className="mt-10">
      <h2 className="font-barlow font-semibold text-2xl mb-4" style={{ color: 'var(--champagne)' }}>Week by week</h2>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {scoreHistory.map((score, i) => {
          const isCurrent = i === scoreHistory.length - 1
          const isMissed = weekStatuses[i] === 'missed'
          return (
            <div key={i} className="shrink-0 rounded-md px-3 py-2.5 flex flex-col gap-1.5" style={{
              background: 'var(--raised-lacquer)',
              border: `1px solid ${isCurrent ? 'var(--kinpaku-gold)' : isMissed ? 'oklch(62% 0.21 25 / 0.35)' : 'var(--border-subtle)'}`,
              width: '76px',
            }}>
              <span className="text-[10px]" style={{ color: 'var(--text-dim)' }}>{weekLabels[i]}</span>
              <span className="font-barlow font-semibold text-[22px] leading-none" style={{ color: scoreColor(score) }}>{score}</span>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: dotColor(weekStatuses[i]) }} />
            </div>
          )
        })}
      </div>
      <p className="text-sm mt-2.5" style={{ color: 'var(--text-muted)' }}>
        Done: <strong style={{ color: 'var(--champagne)' }}>{done} of {scoreHistory.length} weeks</strong> · Avg gain: +{avgGain}/week · Best: +{bestGain}
      </p>
    </div>
  )
}
