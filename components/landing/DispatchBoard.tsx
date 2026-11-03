'use client'

const rows = [
  { live: true,  platform: 'ChatGPT Local',       user: 'Sarah M. — Denver CO' },
  { live: true,  platform: 'Perplexity AI',        user: 'Mike T. — Austin TX' },
  { live: true,  platform: 'Google AI Overview',   user: 'Pat K. — Phoenix AZ' },
  { live: false, platform: 'Bing Copilot',         user: 'Not indexed' },
  { live: true,  platform: 'Gemini',               user: 'Renee L. — Nashville TN' },
  { live: true,  platform: 'Siri',                 user: 'Tom B. — Tampa FL' },
]

export default function DispatchBoard() {
  return (
    <div aria-hidden="true" className="rounded-lg overflow-hidden" style={{ background: 'var(--raised-lacquer)', border: '1px solid var(--border-subtle)' }}>
      <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <span className="text-[11px] font-medium uppercase tracking-[1.5px]" style={{ color: 'var(--text-muted)' }}>AI Job Board — Live Queries</span>
        <span className="text-[10px] font-semibold uppercase tracking-[1px] px-2 py-0.5 rounded-sm" style={{ color: 'var(--score-green)', background: 'oklch(18% 0.04 145)' }}>Live</span>
      </div>
      {rows.map((row, i) => (
        <div key={i} className="flex items-center gap-3 px-5 min-h-[52px]" style={{ borderBottom: i < rows.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
          <div
            className="w-2 h-2 rounded-full shrink-0"
            style={{ background: row.live ? 'var(--score-green)' : 'var(--border-strong)' }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold" style={{ color: 'var(--champagne)' }}>{row.platform}</p>
            <p className="text-[11px]" style={{ color: row.live ? 'var(--text-dim)' : 'var(--text-dim)' }}>{row.user}</p>
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-[1px]" style={{ color: row.live ? 'var(--verdigris)' : 'var(--text-dim)' }}>
            {row.live ? 'Live' : 'Dark'}
          </span>
        </div>
      ))}
    </div>
  )
}
