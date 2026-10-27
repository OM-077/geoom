import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { runCompetitorAnalysis, getCompetitorHistory } from '@/lib/competitor-tracker'

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

    const history = await getCompetitorHistory(business.id)
    return NextResponse.json({ success: true, ...history })
  } catch (error) {
    console.error('Competitor GET error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
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

    const body = await req.json().catch(() => ({})) as { competitorName?: string }
    const target = body.competitorName || business.competitor_name

    if (!target) {
      return NextResponse.json({ error: 'No competitor name provided' }, { status: 400 })
    }

    if (body.competitorName && body.competitorName !== business.competitor_name) {
      await supabase
        .from('businesses')
        .update({ competitor_name: body.competitorName })
        .eq('id', business.id)
    }

    const { data: latestAudit } = await supabase
      .from('audit_results')
      .select('visibility_score')
      .eq('business_id', business.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    const result = await runCompetitorAnalysis({
      businessId: business.id,
      businessName: business.business_name,
      competitorName: target,
      trade: business.trade,
      city: business.city,
      state: business.state,
      businessScore: latestAudit?.visibility_score || 0
    })

    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    console.error('Competitor POST error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
