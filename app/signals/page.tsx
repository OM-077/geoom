'use client'
import Sidebar from '@/components/shared/Sidebar'
import SignalsTabs from '@/components/signals/SignalsTabs'

export default function SignalsPage() {
  return (
    <div className="flex min-h-screen" style={{ background: 'var(--lacquer-black)' }}>
      <Sidebar active="signals" />
      <main className="ml-60 flex-1 px-9 py-7 pb-16 max-w-[calc(100%-240px)]">
        <div className="max-w-[900px]">
          <nav className="text-sm mb-3.5" style={{ color: 'var(--text-dim)' }}>
            <a href="/dashboard" style={{ color: 'var(--text-dim)', textDecoration: 'none' }}>Dashboard</a>
            <span className="mx-2">→</span>Signals
          </nav>
          <h1 className="font-barlow font-bold text-[40px] tracking-tight mb-1.5" style={{ color: 'var(--champagne)' }}>Signals</h1>
          <p className="text-[15px] mb-6" style={{ color: 'var(--text-muted)' }}>What&apos;s holding your score down — and what&apos;s already working.</p>
          <SignalsTabs />
        </div>
      </main>
    </div>
  )
}
