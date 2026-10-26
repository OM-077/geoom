import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { scoreToMarketShare } from '@/lib/utils'
import { calculateEstimatedCalls } from '@/lib/audit-engine'

export async function GET(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: business } = await supabase
      .from('businesses')
      .select('*')
      .eq('user_id', session.user.id)
      .single()

    if (!business) return NextResponse.json({ error: 'No business found' }, { status: 404 })

    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const [
      auditsResult,
      competitorResult,
      pagesWeekResult,
      totalPagesResult,
      pendingReviewsResult,
      onboardingResult,
      firstCitationResult,
      journeyResult
    ] = await Promise.all([
      supabase
        .from('audit_results')
        .select('visibility_score, market_share_percent, created_at')
        .eq('business_id', business.id)
        .order('created_at', { ascending: false })
        .limit(12),

      supabase
        .from('competitor_tracking')
        .select('competitor_name, competitor_score, competitor_market_share, competitor_advantages')
        .eq('business_id', business.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single(),

      supabase
        .from('content_pages')
        .select('id, title, source, city')
        .eq('business_id', business.id)
        .eq('published', true)
        .gte('published_at', oneWeekAgo.toISOString()),

      supabase
        .from('content_pages')
        .select('id', { count: 'exact' })
        .eq('business_id', business.id)
        .eq('published', true),

      supabase
        .from('review_requests')
        .select('id')
        .eq('business_id', business.id)
        .eq('sent', false),

      supabase
        .from('onboarding')
        .select('*')
        .eq('business_id', business.id)
        .single(),

      supabase
        .from('citation_events')
        .select('*')
        .eq('business_id', business.id)
        .eq('first_citation', true)
        .eq('celebrated', false)
        .single(),

      supabase
        .from('journey_events')
        .select('*')
        .eq('business_id', business.id)
        .order('created_at', { ascending: false })
        .limit(20)
    ])

    // Mark first citation as celebrated — only shows once
    if (firstCitationResult.data) {
      await supabase
        .from('citation_events')
        .update({ celebrated: true })
        .eq('id', firstCitationResult.data.id)
    }

    const scoreNow = auditsResult.data?.[0]?.visibility_score || 0
    const scoreLast = auditsResult.data?.[1]?.visibility_score || 0
    const shareNow = auditsResult.data?.[0]?.market_share_percent
      || scoreToMarketShare(scoreNow)
    const shareLast = auditsResult.data?.[1]?.market_share_percent
      || scoreToMarketShare(scoreLast)

    const competitorScore = competitorResult.data?.competitor_score || 0
    const competitorShare = competitorResult.data?.competitor_market_share
      || scoreToMarketShare(competitorScore)

    // ============================================
    // ESTIMATED CALLS — council's most important fix
    // Connects score to revenue
    // "~21 AI-driven calls this month" keeps
    // contractors subscribed — a score going from
    // 67 to 71 does not
    // ============================================
    const callEstimates = calculateEstimatedCalls(scoreNow)
    const previousCallEstimates = calculateEstimatedCalls(scoreLast)
    const callChange = callEstimates.estimatedCallsPerMonth
      - previousCallEstimates.estimatedCallsPerMonth

    // Pipeline heartbeat check
    const { data: lastJob } = await supabase
      .from('review_requests')
      .select('created_at')
      .eq('business_id', business.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    const daysSilent = lastJob
      ? Math.floor(
          (Date.now() - new Date(lastJob.created_at).getTime()) /
          (1000 * 60 * 60 * 24)
        )
      : 999

    const pipelineInactive =
      onboardingResult.data?.step_pipeline_connected && daysSilent > 3

    return NextResponse.json({
      success: true,
      business,
      dashboard: {
        // Score data
        scoreNow,
        scoreLast,
        scoreChange: scoreNow - scoreLast,
        shareNow,
        shareLast,
        shareChange: Math.round((shareNow - shareLast) * 10) / 10,

        // ============================================
        // REVENUE CONNECTION — show on dashboard
        // prominently below the radial gauge
        // "~21 AI-driven calls estimated this month"
        // ============================================
        estimatedCallsPerMonth: callEstimates.estimatedCallsPerMonth,
        estimatedRevenueMin: callEstimates.estimatedRevenueMin,
        estimatedRevenueMax: callEstimates.estimatedRevenueMax,
        callChange,

        // Competitor data
        competitorName: competitorResult.data?.competitor_name
          || business.competitor_name || '',
        competitorScore,
        competitorShare,
        competitorAdvantages:
          (competitorResult.data?.competitor_advantages as string[]) || [],

        // Content data
        pagesThisWeek: pagesWeekResult.data?.length || 0,
        totalPages: totalPagesResult.count || 0,
        pendingReviews: pendingReviewsResult.data?.length || 0,
        recentPages: pagesWeekResult.data || [],

        // System data
        auditHistory: auditsResult.data || [],
        onboarding: onboardingResult.data,
        journeyEvents: journeyResult.data || [],

        // Alerts
        pipelineInactive: !!pipelineInactive,
        daysSilent,

        // First citation celebration — fires once
        firstCitationCelebration: firstCitationResult.data
          ? {
              show: true,
              aiEngine: firstCitationResult.data.ai_engine,
              queryText: firstCitationResult.data.query_text,
              scoreBefore: scoreLast,
              scoreAfter: scoreNow,
              shareBefore: shareLast,
              shareAfter: shareNow,
              estimatedCallsBefore: previousCallEstimates.estimatedCallsPerMonth,
              estimatedCallsAfter: callEstimates.estimatedCallsPerMonth
            }
          : null
      }
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
