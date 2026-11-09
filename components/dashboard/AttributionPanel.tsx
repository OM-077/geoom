'use client'

import Link from 'next/link'

interface Props { isPro: boolean; estimatedCalls: number }

export default function AttributionPanel({ isPro, estimatedCalls }: Props) {
  return (
    <div className="relative mt-10">
      <div className="text-[11px] font-medium uppercase tracking-[1.5px] mb-3" style={{ color: 'var(--text-dim)' }}>Is it working?</div>
      <div className={isPro ? '' : 'pointer-events-none select-none'} style={{ filter: isPro ? 'none' : 'blur(4px)' }}>
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Est. calls/month from AI', val: `~${estimatedCalls}`, color: 'var(--kinpaku-gold)', trend: '+3 from last month', trendColor: 'var(--score-green)' },
            { label: 'New reviews this month',   val: '+6',                  color: 'var(--champagne)',    trend: 'vs 4 last month',   trendColor: 'var(--text-dim)' },
            { label: 'Listing consistency',      val: '71',                  color: 'var(--score-amber)',  trend: 'Across 8 platforms', trendColor: 'var(--text-dim)' },
            { label: 'AI-citable content pieces',val: '3',                  color: 'var(--champagne)',    trend: 'FAQ pages published', trendColor: 'var(--text-dim)' },
          ].map((tile) => (
            <div key={tile.label} className="rounded-lg p-6" style={{ background: 'var(--raised-lacquer)', border: '1px solid var(--border-subtle)' }}>
              <div className="font-barlow font-bold leading-none mb-2" style={{ fontSize: '48px', color: tile.color }}>{tile.val}</div>
              <div className="text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>{tile.label}</div>
              <div className="text-xs" style={{ color: tile.trendColor }}>{tile.trend}</div>
            </div>
          ))}
        </div>
      </div>
      {!isPro && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-lg" style={{ background: 'oklch(7% 0.006 95 / 0.82)' }}>
          <span className="text-2xl">🔒</span>
          <span className="text-xs font-semibold uppercase tracking-[1px]" style={{ color: 'var(--kinpaku-gold)' }}>Pro feature</span>
          <span className="text-sm text-center max-w-[220px]" style={{ color: 'var(--text-muted)' }}>See whether AI visibility is driving real calls and reviews</span>
          <Link href="/signup?plan=pro" className="px-5 py-2.5 rounded text-sm font-semibold" style={{ background: 'var(--kinpaku-gold)', color: 'var(--lacquer-black)', textDecoration: 'none' }}>
            Upgrade to Geoom — $97/mo
          </Link>
        </div>
      )}
    </div>
  )
}
