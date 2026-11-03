export default function QuickStats() {
  const nextMon = getNextMonday()
  const daysAway = Math.ceil((nextMon.getTime() - Date.now()) / 86400000)

  return (
    <>
      <div className="grid grid-cols-4 mt-10 rounded-lg overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
        {[
          { label: 'Your city rank',     val: '#3',   sub: 'of 12 HVAC',  color: 'var(--champagne)' },
          { label: 'Actions done',       val: '8',    sub: 'of 10 weeks', color: 'var(--champagne)' },
          { label: 'Points gained',      val: '+28',  sub: '',            color: 'var(--champagne)' },
          { label: 'vs. top competitor', val: '−7 pts', sub: 'behind #1', color: 'var(--score-amber)' },
        ].map((s, i, arr) => (
          <div key={s.label} className="px-5 py-4" style={{ borderRight: i < arr.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
            <div className="text-[10px] font-medium uppercase tracking-[1px] mb-2" style={{ color: 'var(--text-dim)' }}>{s.label}</div>
            <div className="font-barlow font-bold text-[28px] leading-none" style={{ color: s.color }}>{s.val}</div>
            {s.sub && <div className="text-xs mt-1" style={{ color: 'var(--text-dim)' }}>{s.sub}</div>}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-end gap-2 pt-4 mt-4 flex-wrap" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Next action: {nextMon.toLocaleDateString('en-US',{month:'short',day:'numeric'})} at 8am</span>
        <span className="text-sm font-medium" style={{ color: 'var(--kinpaku-gold)' }}>{daysAway === 0 ? 'Today' : daysAway === 1 ? 'Tomorrow' : `${daysAway} days away`}</span>
        <span className="text-xs" style={{ color: 'var(--text-dim)' }}>· We&apos;ll email it to you</span>
      </div>
    </>
  )
}

function getNextMonday() {
  const d = new Date()
  const day = d.getDay()
  const diff = (1 + 7 - day) % 7 || 7
  d.setDate(d.getDate() + diff)
  return d
}
