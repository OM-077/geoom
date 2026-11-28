'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Sidebar from '@/components/shared/Sidebar'
import AlertBanner from '@/components/dashboard/AlertBanner'
import AiVisibilityTrend from '@/components/dashboard/AiVisibilityTrend'
import ScoreRow from '@/components/dashboard/ScoreRow'
import WeeklyActionCard from '@/components/dashboard/WeeklyActionCard'
import ScoreChart from '@/components/dashboard/ScoreChart'
import WeekByWeek from '@/components/dashboard/WeekByWeek'
import PlatformCoverage from '@/components/dashboard/PlatformCoverage'
import QuickStats from '@/components/dashboard/QuickStats'
import AttributionPanel from '@/components/dashboard/AttributionPanel'
import ScoreWatchPanel from '@/components/dashboard/ScoreWatchPanel'
import { estimatedCalls } from '@/lib/utils'

interface Business {
  id: string
  business_name: string
  trade: string | null
  city: string | null
  state: string | null
  email: string | null
  subscription_status: string
  pricing_tier: string | null
}

interface ScoreHistory {
  score: number
  week_label: string | null
  recorded_at: string
}

interface Action {
  id: string
  title: string
  signal: string | null
  time_estimate: string | null
  difficulty: string | null
  status: string
  due_date: string | null
}

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const [business, setBusiness] = useState<Business | null>(null)
  const [scoreHistory, setScoreHistory] = useState<ScoreHistory[]>([])
  const [currentAction, setCurrentAction] = useState<Action | null>(null)
  const [latestScore, setLatestScore] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      // Load business
      const { data: biz } = await supabase
        .from('businesses')
        .select('id, business_name, trade, city, state, email, subscription_status, pricing_tier')
        .eq('user_id', user.id)
        .single()

      if (!biz) { router.push('/onboarding'); return }
      setBusiness(biz)

      // Load score history
      const { data: scores } = await supabase
        .from('score_history')
        .select('score, week_label, recorded_at')
        .eq('business_id', biz.id)
        .order('recorded_at', { ascending: true })
        .limit(12)

      if (scores && scores.length > 0) {
        setScoreHistory(scores)
        setLatestScore(scores[scores.length - 1].score)
      }

      // Load latest audit score if no history
      if (!scores || scores.length === 0) {
        const { data: audit } = await supabase
          .from('audits')
          .select('score')
          .eq('business_id', biz.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()
        if (audit) setLatestScore(audit.score)
      }

      // Load current pending action
      const { data: actions } = await supabase
        .from('actions')
        .select('id, title, signal, time_estimate, difficulty, status, due_date')
        .eq('business_id', biz.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: true })
        .limit(1)

      if (actions && actions.length > 0) setCurrentAction(actions[0])

      setLoading(false)
    }
    load()
  }, [router, supabase])

  if (loading) {
    return (
      <div style={{ background: '#0d0d10', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 36, height: 36, border: '3px solid rgba(245,158,11,0.3)', borderTopColor: '#f59e0b', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (!business) return null

  const scores = scoreHistory.map(s => s.score)
  const labels = scoreHistory.map(s => s.week_label || new Date(s.recorded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
  const startingScore = scores[0] || latestScore
  const scoreDelta = scores.length >= 2 ? scores[scores.length - 1] - scores[scores.length - 2] : 0
  const streak = scores.filter((_, i) => i > 0 && scores[i] >= scores[i - 1]).length
  const cityDisplay = [business.city, business.state].filter(Boolean).join(', ')
  const isPro = business.subscription_status === 'active'

  const defaultAction = {
    id: 'default',
    title: 'Complete your business profile',
    signal: 'Profile',
    timeEstimate: '5 minutes',
    difficulty: 'Easy',
    previewStep: 'Fill in your trade, city, phone and website in settings.',
    dueDate: 'TODAY',
    completed: false,
  }

  const actionForCard = currentAction ? {
    id: currentAction.id,
    title: currentAction.title,
    signal: currentAction.signal || 'Signal',
    timeEstimate: currentAction.time_estimate || '10 minutes',
    difficulty: currentAction.difficulty || 'Easy',
    previewStep: '',
    dueDate: currentAction.due_date || 'THIS WEEK',
    completed: false,
  } : defaultAction

  type PlatformStatus = 'indexed' | 'not_indexed' | 'partial'
  const platformCoverage: { name: string; status: PlatformStatus; detail: string; fix?: string }[] = [
    { name: 'ChatGPT',           status: (latestScore > 40 ? 'indexed' : 'not_indexed') as PlatformStatus,  detail: latestScore > 40 ? 'Visible' : 'Not indexed yet' },
    { name: 'Perplexity',        status: (latestScore > 50 ? 'indexed' : 'partial') as PlatformStatus,      detail: latestScore > 50 ? 'Visible' : 'Partial coverage' },
    { name: 'Google AI',         status: (latestScore > 30 ? 'partial' : 'not_indexed') as PlatformStatus,  detail: 'Needs GBP connection',   fix: '/signals?tab=platforms' },
    { name: 'Copilot',           status: 'not_indexed' as PlatformStatus,                                    detail: 'Fix available',           fix: '/signals?tab=platforms' },
    { name: 'Gemini',            status: (latestScore > 60 ? 'indexed' : 'partial') as PlatformStatus,      detail: latestScore > 60 ? 'Visible' : 'Partial' },
    { name: 'Siri',              status: 'partial' as PlatformStatus,                                        detail: 'Needs GBP completeness',  fix: '/signals?tab=platforms' },
  ]

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--lacquer-black)' }}>
      <Sidebar
        active="dashboard"
        businessName={business.business_name}
        trade={business.trade || ''}
        city={cityDisplay}
        score={latestScore}
      />

      <main className="md:ml-60 flex-1 px-4 md:px-8 py-6 pb-20 md:pb-16 max-w-full md:max-w-[calc(100%-240px)]">
        <AlertBanner />

        {/* TODAY'S ACTION */}
        <div className="mb-5 rounded-lg p-5 flex items-center justify-between gap-4" style={{ background: 'var(--raised-lacquer)', borderLeft: '3px solid var(--kinpaku-gold)', border: '1px solid var(--kinpaku-gold)' }}>
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-widest mb-1" style={{ color: 'var(--kinpaku-gold)' }}>Today&apos;s action — {actionForCard.timeEstimate}</p>
            <p className="text-lg font-bold mb-0.5 truncate" style={{ color: 'var(--champagne)' }}>{actionForCard.title}</p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{actionForCard.difficulty} · +8 pts when done</p>
          </div>
          <a href="/driver" style={{ background: 'var(--kinpaku-gold)', color: 'var(--lacquer-black)', padding: '10px 20px', borderRadius: '6px', fontWeight: 700, fontSize: '14px', whiteSpace: 'nowrap', textDecoration: 'none', flexShrink: 0 }}>
            Do this now →
          </a>
        </div>

        {/* AI visibility tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          {[
            { name: 'ChatGPT',           status: latestScore > 40 ? 'green' : 'red'   as const, label: latestScore > 40 ? 'Visible' : 'Not visible yet',   sub: 'Uses Foursquare + Yelp' },
            { name: 'Google AI & Gemini',status: latestScore > 30 ? 'amber' : 'red'   as const, label: 'Partially visible',                                 sub: 'Triggers on 97% of local searches' },
            { name: 'Siri & Apple Maps', status: 'amber'                               as const, label: 'Partially visible',                                 sub: 'Uses Apple Maps + Yelp reviews' },
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
          score={latestScore}
          scoreDelta={scoreDelta}
          estimatedCallsPerMonth={estimatedCalls(latestScore)}
          scoreHistory={scores}
          platformCoverage={platformCoverage}
        />

        <AiVisibilityTrend
          scoreHistory={scores}
          gbpImpressions={[]}
          reviewVelocity={[]}
        />

        <div className="mt-5">
          <WeeklyActionCard action={actionForCard} nextActionDate={actionForCard.dueDate} />
        </div>

        <ScoreChart
          scoreHistory={scores.length > 0 ? scores : [latestScore]}
          weekLabels={labels.length > 0 ? labels : ['Now']}
          score={latestScore}
          startingScore={startingScore}
          streak={streak}
          businessName={business.business_name}
          city={cityDisplay}
          estimatedCallsPerMonth={estimatedCalls(latestScore)}
        />

        {scores.length > 1 && (
          <WeekByWeek
            scoreHistory={scores}
            weekLabels={labels}
            weekStatuses={scores.map((_, i) => i === scores.length - 1 ? 'pending' : 'done') as ('done' | 'missed' | 'pending')[]}
          />
        )}

        <div className="mt-10">
          <PlatformCoverage platforms={platformCoverage} />
        </div>

        <AttributionPanel isPro={isPro} estimatedCalls={estimatedCalls(latestScore)} />
        <QuickStats />
        <ScoreWatchPanel email={business.email || ''} isPro={isPro} />
      </main>
    </div>
  )
}
