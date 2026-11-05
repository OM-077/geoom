import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { runAudit } from '@/lib/audit-engine'
import { runCompetitorAnalysis } from '@/lib/competitor-tracker'
import { logJourneyEvent, JOURNEY_EVENTS } from '@/lib/journey-engine'

export async function POST(req: NextRequest) {
  try {
    const { businessId } = await req.json() as { businessId: string }

    const { data: business } = await supabaseAdmin
      .from('businesses')
      .select('*')
      .eq('id', businessId)
      .single()

    if (!business || business.subscription_status !== 'active') {
      return NextResponse.json({ skipped: true })
    }

    const { data: napData } = await supabaseAdmin
      .from('nap_scans')
      .select('nap_score')
      .eq('business_id', businessId)
      .single()

    const { count: contentCount } = await supabaseAdmin
      .from('content_pages')
      .select('id', { count: 'exact' })
      .eq('business_id', businessId)
      .eq('published', true)

    const { data: prevAudit } = await supabaseAdmin
      .from('audit_results')
      .select('visibility_score, market_share_percent')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    const result = await runAudit({
      businessId,
      businessName: business.business_name,
      trade: business.trade,
      city: business.city,
      state: business.state,
      competitorName: business.competitor_name,
      napScore: napData?.nap_score || 0,
      contentCount: contentCount || 0
    })

    // Log score increase
    if (prevAudit && result.score > prevAudit.visibility_score) {
      await logJourneyEvent({
        businessId,
        eventType: JOURNEY_EVENTS.AUDIT_SCORE_INCREASE,
        pointsGained: result.score - prevAudit.visibility_score,
        description: `Weekly AI audit — market share increased to ${result.marketSharePercent}%`,
        metadata: { new_score: result.score, new_share: result.marketSharePercent }
      })
    }

    // Detect first citation
    if (result.citationsFound > 0) {
      const { data: existingCitation } = await supabaseAdmin
        .from('citation_events')
        .select('id')
        .eq('business_id', businessId)
        .eq('first_citation', true)
        .single()

      if (!existingCitation) {
        const citedQuery = result.queryResults.find(r => r.cited)
        await supabaseAdmin.from('citation_events').insert({
          business_id: businessId,
          first_citation: true,
          ai_engine: citedQuery?.engine || 'Gemini',
          query_text: citedQuery?.query || '',
          celebrated: false
        })

        await logJourneyEvent({
          businessId,
          eventType: JOURNEY_EVENTS.FIRST_CITATION,
          pointsGained: 12,
          description: `First AI citation detected — you are now being recommended by AI search engines`,
          metadata: { engine: citedQuery?.engine, query: citedQuery?.query }
        })
      }
    }

    // Run competitor analysis if set
    if (business.competitor_name) {
      await runCompetitorAnalysis({
        businessId,
        businessName: business.business_name,
        competitorName: business.competitor_name,
        trade: business.trade,
        city: business.city,
        state: business.state,
        businessScore: result.score
      })
    }

    return NextResponse.json({ success: true, score: result.score })
  } catch (error) {
    console.error('Audit job error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
