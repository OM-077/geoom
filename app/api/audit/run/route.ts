import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { runAudit } from '@/lib/audit-engine'
import { logJourneyEvent, JOURNEY_EVENTS } from '@/lib/journey-engine'

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => ({})) as { forceRefresh?: boolean }

    const { data: business } = await supabase
      .from('businesses')
      .select('*')
      .eq('user_id', session.user.id)
      .single()

    if (!business) return NextResponse.json({ error: 'No business found' }, { status: 404 })

    const { data: napData } = await supabase
      .from('nap_scans')
      .select('nap_score')
      .eq('business_id', business.id)
      .single()

    const { count: contentCount } = await supabase
      .from('content_pages')
      .select('id', { count: 'exact' })
      .eq('business_id', business.id)
      .eq('published', true)

    const { data: prevAudit } = await supabase
      .from('audit_results')
      .select('visibility_score')
      .eq('business_id', business.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    const result = await runAudit({
      businessId: business.id,
      businessName: business.business_name,
      trade: business.trade,
      city: business.city,
      state: business.state,
      competitorName: business.competitor_name,
      napScore: napData?.nap_score || 0,
      contentCount: contentCount || 0,
      forceRefresh: body.forceRefresh || false
    })

    // Log score increase to journey
    if (prevAudit && result.score > prevAudit.visibility_score) {
      const increase = result.score - prevAudit.visibility_score
      await logJourneyEvent({
        businessId: business.id,
        eventType: JOURNEY_EVENTS.AUDIT_SCORE_INCREASE,
        pointsGained: increase,
        description: `AI audit complete — market share increased to ${result.marketSharePercent}%`,
metadata: { new_score: result.score, new_share: result.marketSharePercent }
      })
    }

    await supabase
      .from('onboarding')
      .update({ step_audit_complete: true })
      .eq('business_id', business.id)

    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    console.error('Audit run error:', error)
    return NextResponse.json({ error: 'Audit failed' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: business } = await supabase
      .from('businesses')
      .select('id')
      .eq('user_id', session.user.id)
      .single()

    if (!business) return NextResponse.json({ error: 'No business found' }, { status: 404 })

    const { data: audits } = await supabase
      .from('audit_results')
      .select('*')
      .eq('business_id', business.id)
      .order('created_at', { ascending: false })
      .limit(12)

    return NextResponse.json({ success: true, audits: audits || [] })
  } catch (error) {
    console.error('Audit GET error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
