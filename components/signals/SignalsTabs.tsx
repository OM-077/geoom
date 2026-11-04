'use client'
import { useState } from 'react'
import ScoreBreakdownTab from './ScoreBreakdownTab'
import PlatformsTab from './PlatformsTab'
import ListingsTab from './ListingsTab'
import ChangelogTab from './ChangelogTab'

const TABS = [
  { key: 'breakdown', label: 'Score Breakdown' },
  { key: 'platforms', label: 'Platforms' },
  { key: 'listings',  label: 'Listings (NAP)' },
  { key: 'changelog', label: 'What Changed' },
]

export default function SignalsTabs() {
  const [active, setActive] = useState('breakdown')

  return (
    <div>
      {/* Tab bar */}
      <div
        className="flex overflow-x-auto scrollbar-hide"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={active === t.key}
            onClick={() => setActive(t.key)}
            className="text-sm font-medium px-5 py-3 whitespace-nowrap transition-colors"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              color: active === t.key ? 'var(--champagne)' : 'var(--text-muted)',
              borderBottom: active === t.key
                ? '2px solid var(--kinpaku-gold)'
                : '2px solid transparent',
              marginBottom: '-1px',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      <div className="mt-7">
        {active === 'breakdown' && <ScoreBreakdownTab />}
        {active === 'platforms' && <PlatformsTab />}
        {active === 'listings'  && <ListingsTab />}
        {active === 'changelog' && <ChangelogTab />}
      </div>
    </div>
  )
}
