'use client'

'use client'
import { useState } from 'react'

const cards = [
  { week:'Week of Oct 28', title:'"How much does furnace repair cost in Denver in 2024?"',  type:'FAQ page',      platforms:['Google AI','Perplexity'] },
  { week:'Week of Nov 4',  title:'"Best HVAC companies in Denver — what to look for"',      type:'Location page', platforms:['ChatGPT','Siri'] },
  { week:'Week of Nov 11', title:'"Emergency HVAC service in Denver — what to do when your heat goes out"', type:'FAQ page', platforms:['Google AI','Perplexity'] },
  { week:'Week of Nov 18', title:'"Google reviews for Summit HVAC — what customers say"',   type:'Review page',   platforms:['All platforms'] },
  { week:'Week of Nov 25', title:'"Furnace tune-up checklist before Denver winter"',         type:'Seasonal FAQ',  platforms:['Google AI','Perplexity'] },
  { week:'Week of Dec 2',  title:'"HVAC service areas near Denver — Summit HVAC coverage"', type:'Location page', platforms:['ChatGPT','Siri'] },
  { week:'Week of Dec 9',  title:'"How long does HVAC installation take? Denver contractor answers"', type:'FAQ page', platforms:['Google AI','Perplexity'] },
  { week:'Week of Dec 16', title:'"Is Summit HVAC licensed in Colorado? Credentials"',       type:'Trust page',    platforms:['All platforms'] },
]

export default function ContentCalendarTab() {
  const [generating, setGenerating] = useState<number | null>(null)
  const [generated, setGenerated] = useState<number | null>(null)

  function generate(i: number) {
    setGenerating(i)
    setTimeout(() => { setGenerating(null); setGenerated(i) }, 900)
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <h2 className="font-barlow font-semibold text-[28px] mb-1" style={{ color: 'var(--champagne)' }}>Content Calendar</h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>8 weeks of AI-targeted content ideas, built for HVAC contractors in Denver.</p>
        </div>
        <button className="text-sm font-medium px-4 py-2 rounded transition-colors" style={{ background: 'transparent', border: '1px solid var(--border-strong)', color: 'var(--champagne)', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
          Regenerate →
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3.5">
        {cards.map((card, i) => (
          <div key={i} className="rounded-lg p-5" style={{ background: 'var(--raised-lacquer)', border: '1px solid var(--border-subtle)' }}>
            <div className="text-[11px] font-medium uppercase tracking-[1px] mb-2" style={{ color: 'var(--text-dim)' }}>{card.week}</div>
            <div className="text-[15px] font-semibold mb-1.5 leading-snug" style={{ color: 'var(--champagne)' }}>{card.title}</div>
            <div className="text-xs mb-3.5" style={{ color: 'var(--text-muted)' }}>{card.type}</div>
            <button onClick={() => generate(i)} className="w-full py-2 rounded text-[13px] font-medium transition-colors"
              style={{ background: 'transparent', border: '1px solid var(--kinpaku-gold)', color: generating===i ? 'var(--text-dim)' : generated===i ? 'var(--verdigris)' : 'var(--kinpaku-gold)', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
              {generating === i ? 'Generating…' : generated === i ? 'Generated ✓ — copy above' : 'Generate this content →'}
            </button>
            <div className="flex items-center gap-1.5 flex-wrap mt-3 pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              <span className="text-xs" style={{ color: 'var(--text-dim)' }}>Helps with:</span>
              {card.platforms.map(p => (
                <span key={p} className="text-[11px] font-medium px-1.5 py-0.5 rounded-sm" style={{ border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>{p}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
