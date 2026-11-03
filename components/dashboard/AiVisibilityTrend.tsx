'use client'

interface SparklineProps {
  data: number[]
  color: string
  label: string
  currentValue: string | number
}

function Sparkline({ data, color, label, currentValue }: SparklineProps) {
  const W = 160, H = 56
  const min = Math.min(...data), max = Math.max(...data)
  const range = max - min || 1
  const xp = (i: number) => (i / (data.length - 1)) * W
  const yp = (v: number) => H - 4 - ((v - min) / range) * (H - 8)
  const pts = data.map((v, i) => `${xp(i)},${yp(v)}`).join(' ')

  return (
    <div className="flex flex-col gap-1.5">
      <span className="font-barlow font-bold leading-none" style={{ fontSize: '26px', color }}>
        {currentValue}
      </span>
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
        <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
        <circle cx={xp(data.length - 1)} cy={yp(data[data.length - 1])} r="3" fill={color} />
      </svg>
      <span className="text-[10px] font-medium uppercase tracking-[1.5px]" style={{ color: 'var(--text-dim)' }}>
        {label}
      </span>
    </div>
  )
}

interface AiVisibilityTrendProps {
  scoreHistory: number[]
  gbpImpressions: number[]
  reviewVelocity: number[]
}

function estimatedCallsHistory(scores: number[]): number[] {
  return scores.map(s => Math.round((s * 2 * 4) * 0.04))
}

export default function AiVisibilityTrend({ scoreHistory, gbpImpressions, reviewVelocity }: AiVisibilityTrendProps) {
  const scores  = scoreHistory.slice(-8)
  const gbp     = gbpImpressions.slice(-8)
  const reviews = reviewVelocity.slice(-8)
  const calls   = estimatedCallsHistory(scores)

  const series = [
    { data: scores,  color: 'oklch(0.70 0.18 55)',  label: 'Geoom Score',     fmt: (v: number) => String(v) },
    { data: gbp,     color: 'oklch(0.65 0.18 240)', label: 'GBP Impressions', fmt: (v: number) => v >= 1000 ? `${(v/1000).toFixed(1)}k` : String(v) },
    { data: reviews, color: 'oklch(0.80 0.20 145)', label: 'Review Velocity', fmt: (v: number) => String(v) },
    { data: calls,   color: '#FF7A00',               label: 'Est. Calls/Mo',   fmt: (v: number) => `~${v}` },
  ]

  return (
    <div className="rounded-lg p-5 mt-5" style={{ background: '#11151C', border: '1px solid #222A35' }}>
      <div className="text-[10px] font-medium uppercase mb-4" style={{ color: 'var(--text-dim)', letterSpacing: '3px' }}>
        AI Visibility Trend
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {series.map((s) =>
          s.data.length < 2 ? (
            <div key={s.label} className="flex flex-col gap-1.5">
              <span className="text-[10px] font-medium uppercase tracking-[1.5px]" style={{ color: 'var(--text-dim)' }}>{s.label}</span>
              <p className="text-xs" style={{ color: 'var(--text-dim)' }}>Tracking — check back next week</p>
            </div>
          ) : (
            <Sparkline key={s.label} data={s.data} color={s.color} label={s.label} currentValue={s.fmt(s.data[s.data.length - 1])} />
          )
        )}
      </div>
      <p className="text-xs mt-5" style={{ color: 'var(--text-dim)' }}>
        When all 4 lines trend up together, AI engines are citing you more.
      </p>
    </div>
  )
}
