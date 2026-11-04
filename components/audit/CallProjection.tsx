import { estimatedCalls, scoreColor } from '@/lib/utils'

interface Props { score: number; city: string; trade: string }

export default function CallProjection({ score, city, trade }: Props) {
  const callsNow = estimatedCalls(score)
  const callsFuture = estimatedCalls(70)

  return (
    <section className="mt-12">
      <h2 className="font-barlow font-semibold text-[28px] mb-5" style={{ color: 'var(--champagne)' }}>
        What your score means in calls
      </h2>
      <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center gap-5 px-6 py-4" style={{ background: 'var(--raised-lacquer)', borderBottom: '1px solid var(--border-subtle)' }}>
          <span className="text-sm font-medium flex-1" style={{ color: 'var(--text-muted)' }}>Your score now: <strong style={{ color: 'var(--champagne)' }}>{score}</strong></span>
          <span className="font-barlow font-bold text-[28px]" style={{ color: scoreColor(score) }}>{score}</span>
          <span className="text-base font-medium" style={{ color: 'var(--text-muted)' }}>~{callsNow} AI calls/month</span>
        </div>
        <div className="flex items-center gap-5 px-6 py-4" style={{ background: 'var(--lacquer-deep)', border: '1px dashed var(--border-strong)' }}>
          <span className="text-sm font-medium flex-1" style={{ color: 'var(--score-green)' }}>At score 70+</span>
          <span className="font-barlow font-bold text-[28px]" style={{ color: 'var(--score-green)' }}>70+</span>
          <span className="text-base font-semibold" style={{ color: 'var(--score-green)' }}>~{callsFuture} AI calls/month</span>
        </div>
      </div>
      <p className="text-[15px] mt-4 leading-relaxed" style={{ color: 'var(--text-warm)' }}>
        That&apos;s ~{callsFuture - callsNow} more calls/month from people already looking for {trade} in {city}.<br />
        <span className="font-medium" style={{ color: 'var(--kinpaku-gold)' }}>Those calls don&apos;t stop in February.</span>
      </p>
    </section>
  )
}
