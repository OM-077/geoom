import Sidebar from '@/components/shared/Sidebar'
import ContentTabs from '@/components/content/ContentTabs'

export default function ContentPage() {
  return (
    <div className="flex min-h-screen" style={{ background: 'var(--lacquer-black)' }}>
      <Sidebar active="content" />
      <main className="ml-60 flex-1 px-9 py-7 pb-16 max-w-[calc(100%-240px)]">
        <div className="max-w-[860px]">
          <nav className="text-sm mb-3.5" style={{ color: 'var(--text-dim)' }}>
            <a href="/dashboard" style={{ color: 'var(--text-dim)', textDecoration: 'none' }}>Dashboard</a>
            <span className="mx-2">→</span>Content
          </nav>
          <h1 className="font-barlow font-bold text-[40px] tracking-tight mb-1.5" style={{ color: 'var(--champagne)' }}>Content</h1>
          <p className="text-[15px] mb-6" style={{ color: 'var(--text-muted)' }}>Tools to make your business citable by AI assistants.</p>
          <ContentTabs />
        </div>
      </main>
    </div>
  )
}
