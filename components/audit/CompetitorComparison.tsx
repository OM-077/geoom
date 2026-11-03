
import { scoreColor, estimatedCalls } from '@/lib/utils'
import Link from 'next/link'

interface Props { score: number; businessName: string; city: string; trade: string }

export default function CompetitorComparison({ score, businessName, city, trade }: Props) {
  const competitors = [
    { score: 67, label: `${trade} company in ${city}`, status: 'Getting calls', statusColor: 'var(--score-green)' },
    { score: 51, label: `${trade} company in ${city}`, status: 'Some calls',    statusColor: 'var(--score-amber)' },
    { score,     label: `${businessName} · YOU`,        status: 'Missing calls', statusColor: 'var(--score-red)', isYou: true },
    { score: 28, label: `Typical ${trade} in ${city}`,  status: 'Not indexed',  statusColor: 'var(--text-dim)' },
  ]

  const aheadCount = competitors.filter(c => !c.isYou && c.score > score).length
  const verdict = aheadCount >= 2
    ? `${aheadCount} of your competitors are already getting AI recommendations. You're not.`
    : aheadCount === 1
    ? `One competitor is ahead. You're ${competitors[0].score - score} points behind the top ${trade} in ${city}.`
    : `You're leading in ${city} — but your score still has room before slow season hits.`

  return (
    <section className="mt-12">
      <h2 className="font-barlow font-semibold text-[28px] mb-5" style={{ color: 'var(--champagne)' }}>
        How you compare to other {trade} companies in {city}
      </h2>
      <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
        {competitors.map((c, i) => (
          <div
            key={i}
            className="flex items-center gap-5 px-5 py-3.5"
            style={{
              borderBottom: i < competitors.length - 1 ? '1px solid var(--border-subtle)' : 'none',
              background: c.isYou ? 'var(--raised-lacquer)' : 'var(--lacquer-black)',
              borderLeft: c.isYou ? '3px solid var(--kinpaku-gold)' : '3px solid transparent',
            }}
          >
            <span className="font-barlow font-bold text-3xl w-12 shrink-0" style={{ color: scoreColor(c.score) }}>{c.score}</span>
            <span className="flex-1 text-sm font-medium" style={{ color: c.isYou ? 'var(--champagne)' : 'var(--text-muted)' }}>{c.label}</span>
            <span className="text-xs font-medium" style={{ color: c.statusColor }}>● {c.status}</span>
          </div>
        ))}
      </div>
      <p className="text-[15px] font-medium mt-4" style={{ color: 'var(--champagne)' }}>{verdict}</p>
    </section>
  )
}
