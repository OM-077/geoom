'use client'

import Link from 'next/link'

interface Platform { name: string; status: 'indexed' | 'partial' | 'not_indexed'; detail: string; fix?: string }

const statusColor = (s: Platform['status']) => s === 'indexed' ? 'var(--score-green)' : s === 'partial' ? 'var(--score-amber)' : 'var(--score-red)'
const statusLabel = (s: Platform['status']) => s === 'indexed' ? 'Indexed' : s === 'partial' ? 'Partial' : 'Not Indexed'

export default function PlatformCoverage({ platforms }: { platforms: Platform[] }) {
  return (
    <div>
      <h2 className="font-barlow font-semibold text-2xl mb-4" style={{ color: 'var(--champagne)' }}>AI platform coverage</h2>
      <div>
        {platforms.map((p, i) => (
          <div key={p.name} className="flex items-center gap-3 min-h-[48px] px-1" style={{ borderBottom: i < platforms.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: statusColor(p.status) }} />
            <span className="text-sm font-semibold w-28 shrink-0" style={{ color: 'var(--champagne)' }}>{p.name}</span>
            <span className="text-[11px] font-medium uppercase tracking-[1px] w-24 shrink-0" style={{ color: statusColor(p.status) }}>{statusLabel(p.status)}</span>
            <span className="text-xs flex-1" style={{ color: 'var(--text-dim)' }}>{p.detail}</span>
            {p.fix && <Link href={p.fix} className="text-xs font-medium shrink-0" style={{ color: 'var(--kinpaku-gold)' }}>Fix →</Link>}
          </div>
        ))}
      </div>
    </div>
  )
}
