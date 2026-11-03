const entries = [
  { date:'Oct 21', sig:'Review Signals',       change:'Went from 6 to 8 pts',  reason:'You responded to 3 Google reviews' },
  { date:'Oct 14', sig:'Schema Markup',         change:'Went from 0 to 4 pts',  reason:'FAQ schema added to services page' },
  { date:'Oct 7',  sig:'FAQ Content',           change:'Went from 0 to 2 pts',  reason:'3 FAQ questions added to services page' },
  { date:'Sep 30', sig:'Citation Consistency',  change:'Went from 5 to 8 pts',  reason:'Foursquare address corrected to match Google' },
  { date:'Sep 23', sig:'GBP Completeness',      change:'Went from 8 to 12 pts', reason:'Service area and business hours added to GBP' },
]

export default function ChangelogTab() {
  return (
    <div>
      <h2 className="font-barlow font-semibold text-[28px] mb-1.5" style={{ color:'var(--champagne)' }}>What changed on your signals</h2>
      <p className="text-sm mb-6" style={{ color:'var(--text-muted)' }}>Signals update every 7 days. Last scan: Oct 21, 2024.</p>
      {entries.length === 0 ? (
        <p className="text-sm text-center py-10" style={{ color:'var(--text-muted)' }}>No signal changes yet. Signals update every 7 days.</p>
      ) : (
        <div>
          {entries.map((e,i) => (
            <div key={i} className="flex gap-3.5 py-3.5" style={{ borderBottom: i<entries.length-1?'1px solid var(--border-subtle)':'none' }}>
              <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background:'var(--kinpaku-gold)' }}/>
              <div className="text-xs font-medium w-14 shrink-0 mt-0.5" style={{ color:'var(--text-dim)' }}>{e.date}</div>
              <div>
                <div className="text-sm font-semibold mb-0.5" style={{ color:'var(--champagne)' }}>{e.sig}</div>
                <div className="text-sm mb-0.5" style={{ color:'var(--text-muted)' }}>{e.change}</div>
                <div className="text-xs" style={{ color:'var(--text-dim)' }}>{e.reason}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
