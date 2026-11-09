'use client'

'use client'
import { useState } from 'react'
import LlmsTxtTab from './LlmsTxtTab'
import CitabilityGraderTab from './CitabilityGraderTab'
import ContentCalendarTab from './ContentCalendarTab'
import FAQGeneratorTab from './FAQGeneratorTab'

const TABS = [
  { key: 'llms',     label: 'llms.txt',           pro: false },
  { key: 'grader',   label: 'Citability Grader',   pro: true  },
  { key: 'calendar', label: 'Content Calendar',    pro: false },
  { key: 'faq',      label: 'FAQ Generator',       pro: false },
]

export default function ContentTabs() {
  const [active, setActive] = useState('llms')
  return (
    <div>
      <div className="flex overflow-x-auto scrollbar-hide" style={{ borderBottom: '1px solid var(--border-subtle)' }} role="tablist">
        {TABS.map(t => (
          <button key={t.key} role="tab" aria-selected={active===t.key}
            onClick={() => setActive(t.key)}
            className="text-sm font-medium px-5 py-3 whitespace-nowrap transition-colors relative"
            style={{ background:'transparent', border:'none', cursor:'pointer', fontFamily:'Inter,sans-serif',
              color: active===t.key ? 'var(--champagne)' : 'var(--text-muted)',
              borderBottom: active===t.key ? '2px solid var(--kinpaku-gold)' : '2px solid transparent',
              marginBottom: '-1px' }}>
            {t.label}
            {t.pro && <span className="ml-1.5 text-[9px] font-semibold uppercase tracking-[0.8px] px-1.5 py-0.5 rounded-sm align-middle" style={{ color:'var(--kinpaku-gold)', border:'1px solid var(--kinpaku-gold)' }}>Pro</span>}
          </button>
        ))}
      </div>
      <div className="mt-8">
        {active === 'llms'     && <LlmsTxtTab />}
        {active === 'grader'   && <CitabilityGraderTab />}
        {active === 'calendar' && <ContentCalendarTab />}
        {active === 'faq'      && <FAQGeneratorTab />}
      </div>
    </div>
  )
}
