
import Sidebar from '@/components/shared/Sidebar'
import AlertBanner from '@/components/dashboard/AlertBanner'
import ScoreRow from '@/components/dashboard/ScoreRow'
import WeeklyActionCard from '@/components/dashboard/WeeklyActionCard'
import ScoreChart from '@/components/dashboard/ScoreChart'
import WeekByWeek from '@/components/dashboard/WeekByWeek'
import PlatformCoverage from '@/components/dashboard/PlatformCoverage'
import QuickStats from '@/components/dashboard/QuickStats'
import AttributionPanel from '@/components/dashboard/AttributionPanel'
import ScoreWatchPanel from '@/components/dashboard/ScoreWatchPanel'
import { estimatedCalls } from '@/lib/utils'

// In production: fetch from Supabase with auth session
const MOCK = {
  businessName: 'Summit HVAC',
  trade: 'HVAC',
  city: 'Denver, CO',
  score: 34,
  scoreDelta: +7,
  estimatedCallsPerMonth: estimatedCalls(34),
  startingScore: 6,
  streak: 6,
  email: 'owner@summithvac.com',
  scoreHistory: [6,12,18,21,25,27,26,30,31,33,34,34],
  weekLabels: ['Aug 5','Aug 12','Aug 19','Aug 26','Sep 2','Sep 9','Sep 16','Sep 23','Sep 30','Oct 7','Oct 14','Oct 21'],
  weekStatuses: ['done','done','done','done','done','missed','done','done','done','done','done','pending'] as const,
  currentAction: {
    id: 'faq-schema-001',
    title: 'Add FAQ schema to your website',
    signal: 'Schema Markup',
    timeEstimate: '8 minutes',
    difficulty: 'Easy — copy and paste',
    previewStep: 'Go to your website\'s contact or services page in your CMS…',
    dueDate: 'MON OCT 28',
    completed: false,
  },
  platformCoverage: [
    { name: 'ChatGPT',       status: 'indexed'     as const, detail: 'Last checked Oct 24' },
    { name: 'Perplexity',    status: 'indexed'     as const, detail: 'Last checked Oct 24' },
    { name: 'Google AI',     status: 'partial'     as const, detail: 'Missing: GBP connection',    fix: '/signals?tab=platforms' },
    { name: 'Copilot',       status: 'not_indexed' as const, detail: 'Fix available',              fix: '/signals?tab=platforms' },
    { name: 'Gemini',        status: 'indexed'     as const, detail: 'Last checked Oct 24' },
    { name: 'Siri',          status: 'partial'     as const, detail: 'Missing: GBP completeness',  fix: '/signals?tab=platforms' },
  ],
  isPro: false,
}

export default function DashboardPage() {
  const d = MOCK
  return (
    <div className="flex min-h-screen" style={{ background: 'var(--lacquer-black)' }}>
      <Sidebar active="dashboard" businessName={d.businessName} trade={d.trade} city={d.city} score={d.score} />

      <main className="ml-60 flex-1 px-8 py-6 pb-16 max-w-[calc(100%-240px)]">
        <AlertBanner />

        {/* Which AI can find you */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { name: 'ChatGPT',          status: 'red'   as const, label: 'Not visible yet',     sub: 'Uses Foursquare + Yelp' },
            { name: 'Google AI & Gemini', status: 'amber' as const, label: 'Partially visible', sub: 'Triggers on 97% of local searches' },
            { name: 'Siri & Apple Maps', status: 'amber' as const, label: 'Partially visible',  sub: 'Uses Apple Maps + Yelp reviews' },
          ].map((tile) => (
            <div key={tile.name} className="rounded-lg p-5" style={{ background: 'var(--raised-lacquer)', border: '1px solid var(--border-subtle)' }}>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: tile.status === 'red' ? 'var(--score-red)' : tile.status === 'amber' ? 'var(--score-amber)' : 'var(--score-green)' }} />
                <span className="text-sm font-semibold" style={{ color: 'var(--champagne)' }}>{tile.name}</span>
              </div>
              <p className="text-sm font-medium mb-1" style={{ color: tile.status === 'red' ? 'var(--score-red)' : 'var(--score-amber)' }}>{tile.label}</p>
              <p className="text-xs" style={{ color: 'var(--text-dim)' }}>{tile.sub}</p>
            </div>
          ))}
        </div>

        {/* Score row */}
        <ScoreRow
          score={d.score}
          scoreDelta={d.scoreDelta}
          estimatedCallsPerMonth={d.estimatedCallsPerMonth}
          scoreHistory={d.scoreHistory}
          platformCoverage={d.platformCoverage}
        />

        {/* This week's action */}
        <div className="mt-5">
          <WeeklyActionCard action={d.currentAction} nextActionDate="Monday Oct 28" />
        </div>

        {/* Score over time (merged from Progress) */}
        <ScoreChart
          scoreHistory={d.scoreHistory}
          weekLabels={d.weekLabels}
          score={d.score}
          startingScore={d.startingScore}
          streak={d.streak}
          businessName={d.businessName}
          city={d.city}
          estimatedCallsPerMonth={d.estimatedCallsPerMonth}
        />

        {/* Week by week */}
        <WeekByWeek
          scoreHistory={d.scoreHistory}
          weekLabels={d.weekLabels}
          weekStatuses={d.weekStatuses}
        />

        {/* Score forecast */}
        <div className="mt-10">
          <div className="text-[11px] font-medium uppercase tracking-[1.5px] mb-3" style={{ color: 'var(--text-dim)' }}>Your Score Forecast</div>
          <div className="rounded-lg p-6" style={{ background: 'var(--raised-lacquer)', border: '1px solid var(--border-subtle)' }}>
            <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>At your current pace (completing ~3 of 4 jobs/month):</p>
            {[
              { score: 'Score 60', date: 'Dec 2024', rank: 'Top 33% of Denver HVAC on AI' },
              { score: 'Score 75', date: 'Mar 2025', rank: 'Top 10% of Denver HVAC on AI' },
              { score: 'Score 90', date: 'Aug 2025', rank: 'Top 3% of Denver HVAC on AI' },
            ].map((row, i, arr) => (
              <div key={row.score} className="flex items-baseline gap-4 flex-wrap py-3" style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                <span className="font-barlow font-semibold text-xl w-20 shrink-0" style={{ color: 'var(--kinpaku-gold)' }}>{row.score}</span>
                <span className="text-[15px] w-20 shrink-0" style={{ color: 'var(--text-muted)' }}>{row.date}</span>
                <span style={{ color: 'var(--text-dim)' }}>→</span>
                <span className="text-[15px] font-medium" style={{ color: 'var(--text-warm)' }}>{row.rank}</span>
              </div>
            ))}
            <p className="text-[13px] mt-4" style={{ color: 'var(--score-amber)' }}>Miss 2+ weeks in a row and your forecast shifts out by 6 weeks.</p>
          </div>
        </div>

        {/* What AI can now find */}
        <div className="mt-10">
          <div className="text-[11px] font-medium uppercase tracking-[1.5px] mb-3" style={{ color: 'var(--text-dim)' }}>What AI can now find</div>
          <div className="flex flex-col gap-3">
            {[
              { label: 'Schema markup',  pct: 60, status: 'Partially done', color: 'var(--score-amber)' },
              { label: 'FAQ content',    pct: 40, status: 'In progress',    color: 'var(--score-amber)' },
              { label: 'GBP signals',    pct: 100,status: 'Done',           color: 'var(--score-green)' },
              { label: 'Citations',      pct: 0,  status: 'Not started',    color: 'var(--score-red)' },
              { label: 'Review signals', pct: 20, status: 'In progress',    color: 'var(--score-amber)' },
            ].map((sig) => (
              <div key={sig.label} className="flex items-center gap-3">
                <span className="text-sm font-semibold w-32 shrink-0" style={{ color: 'var(--champagne)' }}>{sig.label}</span>
                <div className="flex-1 h-1.5 rounded-full" style={{ background: 'var(--border-subtle)' }}>
                  <div className="h-full rounded-full" style={{ width: `${sig.pct}%`, background: sig.color }} role="progressbar" aria-valuenow={sig.pct} aria-valuemin={0} aria-valuemax={100} />
                </div>
                <span className="text-xs w-24 shrink-0" style={{ color: 'var(--text-muted)' }}>{sig.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Platform coverage */}
        <div className="mt-10">
          <PlatformCoverage platforms={d.platformCoverage} />
        </div>

        {/* Attribution panel — Pro only */}
        <AttributionPanel isPro={d.isPro} estimatedCalls={d.estimatedCallsPerMonth} />

        {/* Quick stats + countdown */}
        <QuickStats />

        {/* Score Watch panel (slide-in) */}
        <ScoreWatchPanel email={d.email} isPro={d.isPro} />
      </main>
    </div>
  )
}
