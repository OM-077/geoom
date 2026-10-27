import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import {
  getReviewVelocity,
  generateReviewResponse,
  analyseReviewKeywords
} from '@/lib/review-engine'

export async function GET(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: business } = await supabase
      .from('businesses')
      .select('id, trade, city')
      .eq('user_id', session.user.id)
      .single()

    if (!business) return NextResponse.json({ error: 'No business found' }, { status: 404 })

    const [velocity, keywords, requestsResult] = await Promise.all([
      getReviewVelocity(business.id),
      analyseReviewKeywords({
        businessId: business.id,
        trade: business.trade,
        city: business.city
      }),
      supabase
        .from('review_requests')
        .select('*')
        .eq('business_id', business.id)
        .order('created_at', { ascending: false })
        .limit(20)
    ])

    return NextResponse.json({
      success: true,
      velocity,
      keywords,
      requests: requestsResult.data || []
    })
  } catch (error) {
    console.error('Reviews GET error:', error)
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

    const body = await req.json()

    if (body.action === 'generate_response') {
      const responses = await generateReviewResponse({
        businessName: business.business_name,
        trade: business.trade,
        reviewerName: body.reviewerName || 'Customer',
        rating: body.rating || 5,
        reviewText: body.reviewText || ''
      })
      return NextResponse.json({ success: true, responses })
    }

    if (body.action === 'mark_sent') {
      await supabase
        .from('review_requests')
        .update({ sent: true, sent_at: new Date().toISOString() })
        .eq('id', body.requestId)
        .eq('business_id', business.id)
      return NextResponse.json({ success: true })
    }

    if (body.action === 'save_response') {
      await supabase
        .from('reviews')
        .update({
          responded: true,
          response_text: body.responseText,
          responded_at: new Date().toISOString()
        })
        .eq('id', body.reviewId)
        .eq('business_id', business.id)
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (error) {
    console.error('Reviews POST error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
