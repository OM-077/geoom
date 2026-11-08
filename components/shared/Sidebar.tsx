'use client'

import Link from 'next/link'

interface SidebarProps {
  active: 'dashboard' | 'driver' | 'signals' | 'content' | 'copilot' | 'competitors'
  businessName?: string
  trade?: string
  city?: string
  score?: number
}

export default function Sidebar({
  active,
  businessName = 'Summit HVAC',
  trade = 'HVAC',
  city = 'Denver, CO',
  score = 47,
}: SidebarProps) {
  const scoreColor = score < 40 ? 'var(--score-red)' : score < 70 ? 'var(--score-amber)' : 'var(--score-green)'

  const navItems = [
    { href: '/dashboard', key: 'dashboard', label: 'Dashboard',   icon: <GridIcon /> },
    { href: '/driver',    key: 'driver',    label: 'Fix Plan',    icon: <ClockIcon /> },
    { href: '/signals',   key: 'signals',   label: 'Signals',     icon: <ChartIcon /> },
    { href: '/content',   key: 'content',   label: 'Content',     icon: <DocIcon /> },
    { href: '/copilot',   key: 'copilot',   label: 'Ask Geoom',   icon: <UserIcon /> },
    { href: '/competitors', key: 'competitors', label: 'Competitors', icon: <PeopleIcon /> },
  ]

  return (
    <aside className="fixed top-0 left-0 bottom-0 w-60 flex flex-col z-30" style={{ background: 'var(--raised-lacquer)', borderRight: '1px solid var(--border-subtle)' }}>
      {/* Logo */}
      <div className="px-6 pt-6 pb-4">
        <Link href="/" className="font-barlow font-bold text-[22px] tracking-tight" style={{ color: 'var(--champagne)' }}>
          geo<span style={{ color: 'var(--kinpaku-gold)' }}>om</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = active === item.key
          return (
            <Link
              key={item.key}
              href={item.href}
              className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium transition-colors"
              style={{
                color: isActive ? 'var(--champagne)' : 'var(--text-muted)',
                background: isActive ? 'var(--lacquer-black)' : 'transparent',
                borderLeft: isActive ? '2px solid var(--kinpaku-gold)' : '2px solid transparent',
                borderRadius: '0 4px 4px 0',
              }}
            >
              <span style={{ color: isActive ? 'var(--kinpaku-gold)' : undefined, opacity: isActive ? 1 : 0.7 }}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Account block */}
      <div className="px-4 py-3.5" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <p className="text-sm font-semibold" style={{ color: 'var(--champagne)' }}>{businessName}</p>
        <p className="text-xs mb-2.5" style={{ color: 'var(--text-muted)' }}>{trade} · {city}</p>
        <div className="flex items-center justify-between">
          <span className="font-barlow font-semibold text-base px-2 py-0.5 rounded" style={{ background: 'var(--lacquer-deep)', border: '1px solid var(--border-subtle)', color: scoreColor }}>
            {score}
          </span>
          <Link href="/settings" className="text-sm" style={{ color: 'var(--text-muted)' }}>Settings →</Link>
        </div>
      </div>
    </aside>
  )
}

function GridIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="1" width="6" height="6" rx="1"/><rect x="9" y="1" width="6" height="6" rx="1"/><rect x="1" y="9" width="6" height="6" rx="1"/><rect x="9" y="9" width="6" height="6" rx="1"/></svg>
}
function ClockIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6"/><path d="M8 5v3l2 2"/></svg>
}
function ChartIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 10 L5 7 L8 9 L11 4 L14 6"/></svg>
}
function DocIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="12" height="12" rx="2"/><path d="M5 6h6M5 9h4"/></svg>
}
function UserIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="6" r="3"/><path d="M2 14c0-3 2.7-5 6-5s6 2 6 5"/></svg>
}
function PeopleIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="5" cy="8" r="3"/><circle cx="11" cy="8" r="3"/></svg>
}
