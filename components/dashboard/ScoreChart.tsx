'use client'
import { useState } from 'react'
import { scoreColor } from '@/lib/utils'

interface Props {
  scoreHistory: number[]
  weekLabels: string[]
  score: number
  startingScore: number
  streak: number
  businessName: string
  city: string
  estimatedCallsPerMonth: number
}

export default function ScoreChart({
  scoreHistory,
  weekLabels,
  score,
  startingScore,
  streak,
  businessName,
  city,
  estimatedCallsPerMonth,
}: Props) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; label: string; val: number } | null>(null)
  const [copied, setCopied] = useState<'summary' | 'history' | null>(null)

  const W = 860, H = 140, padL = 28, padR = 16, padT = 10, padB = 24
  const cW = W - padL - padR
  const cH = H - padT - padB
  const xp = (i: number) => padL + (i / (scoreHistory.length - 1)) * cW
  const yp = (v: number) => padT + cH - (v / 100) * cH
  const pts = scoreHistory.map((v, i) => `${xp(i)},${yp(v)}`).join(' ')

  const totalGain = score - startingScore

  function copySummary() {
    const text = `${businessName} (${city}) — Geoom Progress\nScore: ${startingScore} → ${score} in ${streak} weeks (+${totalGain} pts)\nStreak: ${streak} weeks\n\nEstimated: ~${estimatedCallsPerMonth} AI calls/month at this score.\n\nPowered by Geoom · geoom.com`
    navigator.clipboard.writeText(text).then(() => {
      setCopied('summary')
      setTimeout(() => setCopied(null), 2000)
    })
  }

  function copyHistory() {
    const text = `Score history — ${businessName}:\n${scoreHistory.map((v, i) => `${weekLabels[i]}: ${v}`).join(' → ')}\n↑ +${totalGain} pts in ${streak} weeks`
    navigator.clipboard.writeText(text).then(() => {
      setCopied('history')
      setTimeout(() => setCopied(null), 2000)
    })
  }

  return (
    <div className="mt-10">
      <div
        className="text-[11px] font-medium uppercase tracking-[1.5px] mb-3"
        style={{ color: 'var(--text-dim)' }}
      >
        Your score over time
      </div>

      <div
        className="rounded-lg p-5 relative"
        style={{ background: 'var(--raised-lacquer)', border: '1px solid var(--border-subtle)' }}
      >
        {/* Chart */}
        <div className="relative" style={{ height: '140px' }}>
          <svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="none"
            aria-label={`Geoom Score over ${scoreHistory.length} weeks`}
            role="img"
          >
            {/* Zone bands */}
            {([
              [67, 100, 'var(--score-green)'],
              [34, 66,  'var(--score-amber)'],
              [0,  33,  'var(--score-red)'],
            ] as [number, number, string][]).map(([y0, y1, c]) => (
              <rect
                key={y0}
                x={padL}
                y={yp(y1)}
                width={cW}
                height={yp(y0) - yp(y1)}
                fill={c}
                opacity="0.04"
              />
            ))}

            {/* Gridlines */}
            {[25, 50, 75].map((v) => (
              <line
                key={v}
                x1={padL} y1={yp(v)}
                x2={W - padR} y2={yp(v)}
                stroke="var(--border-subtle)"
                strokeWidth="1"
              />
            ))}

            {/* Line */}
            <polyline
              points={pts}
              fill="none"
              stroke="var(--kinpaku-gold)"
              strokeWidth="2"
              strokeLinejoin="round"
            />

            {/* Dots */}
            {scoreHistory.map((v, i) => (
              <circle
                key={i}
                cx={xp(i)}
                cy={yp(v)}
                r={i === scoreHistory.length - 1 ? 5 : 3.5}
                fill="var(--kinpaku-gold)"
                stroke="var(--lacquer-black)"
                strokeWidth="1.5"
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setTooltip({ x: xp(i), y: yp(v), label: weekLabels[i], val: v })}
                onMouseLeave={() => setTooltip(null)}
              />
            ))}
          </svg>

          {/* Tooltip */}
          {tooltip && (
            <div
              className="absolute pointer-events-none rounded-md px-3 py-2 text-xs z-20"
              style={{
                left: `${(tooltip.x / W) * 100}%`,
                top: `${Math.max(0, (tooltip.y / H) * 100 - 30)}%`,
                background: 'var(--lacquer-deep)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-warm)',
                whiteSpace: 'nowrap',
                transform: 'translateX(-50%)',
              }}
            >
              <span style={{ color: 'var(--text-dim)' }}>{tooltip.label}</span>
              <br />
              <span
                className="font-barlow font-bold text-base"
                style={{ color: scoreColor(tooltip.val) }}
              >
                {tooltip.val}
              </span>
            </div>
          )}
        </div>

        {/* Stat tiles */}
        <div className="grid grid-cols-4 gap-3 mt-4">
          {[
            { label: 'Starting Score', val: startingScore,      color: scoreColor(startingScore) },
            { label: 'Current Score',  val: score,              color: scoreColor(score) },
            { label: 'Total Gain',     val: `+${totalGain}`,    color: 'var(--score-green)' },
            { label: 'Streak',         val: `${streak} wks`,    color: streak >= 3 ? 'var(--kinpaku-gold)' : 'var(--champagne)' },
          ].map((tile) => (
            <div
              key={tile.label}
              className="rounded-lg p-4"
              style={{ background: 'var(--lacquer-deep)', border: '1px solid var(--border-subtle)' }}
            >
              <div
                className="text-[10px] font-medium uppercase tracking-[1.2px] mb-2"
                style={{ color: 'var(--text-dim)' }}
              >
                {tile.label}
              </div>
              <div
                className="font-barlow font-bold text-3xl leading-none"
                style={{ color: tile.color }}
              >
                {tile.val}
              </div>
            </div>
          ))}
        </div>

        {/* Projection callout */}
        <div
          className="mt-3 px-5 py-3.5 rounded-r-md text-[15px] font-medium leading-relaxed"
          style={{
            background: 'var(--lacquer-deep)',
            borderLeft: '3px solid var(--kinpaku-gold)',
            color: 'var(--text-warm)',
          }}
        >
          At this pace,{' '}
          <strong style={{ color: 'var(--champagne)' }}>{businessName}</strong> will be in the{' '}
          <strong style={{ color: 'var(--champagne)' }}>top 20%</strong> of {city} businesses on
          AI by <strong style={{ color: 'var(--champagne)' }}>Jan 2025</strong>.
        </div>

        {/* Share buttons */}
        <div className="flex gap-2.5 mt-3">
          <button
            onClick={copySummary}
            className="text-sm font-medium px-4 py-2 rounded transition-colors"
            style={{
              background: 'var(--lacquer-deep)',
              color: copied === 'summary' ? 'var(--verdigris)' : 'var(--text-muted)',
              border: '1px solid var(--border-subtle)',
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {copied === 'summary' ? 'Copied ✓' : 'Copy progress summary'}
          </button>
          <button
            onClick={copyHistory}
            className="text-sm font-medium px-4 py-2 rounded transition-colors"
            style={{
              background: 'var(--lacquer-deep)',
              color: copied === 'history' ? 'var(--verdigris)' : 'var(--text-muted)',
              border: '1px solid var(--border-subtle)',
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {copied === 'history' ? 'Copied ✓' : 'Copy score history'}
          </button>
        </div>
      </div>
    </div>
  )
}
