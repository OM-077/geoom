
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { generateServicePage, getSeasonalSuggestionForBusiness } from '@/lib/content-engine'
import { publishToWordPress } from '@/lib/wordpress-publisher'
import { processManualJob } from '@/lib/pipelines/manual'

export async function GET(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: business } = await supabase
      .from('businesses')
      .select('id, trade')
      .eq('user_id', session.user.id)
      .single()

    if (!business) return NextResponse.json({ error: 'No business found' }, { status: 404 })

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = 20
    const from = (page - 1) * limit

    const { data: pages, count } = await supabase
      .from('content_pages')
      .select('*', { count: 'exact' })
      .eq('business_id', business.id)
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1)

    const seasonal = getSeasonalSuggestionForBusiness(business.trade)

    return NextResponse.json({
      success: true,
      pages: pages || [],
      total: count || 0,
      page,
      seasonal
    })
  } catch (error) {
    console.error('Content GET error:', error)
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

    if (body.action === 'manual_job') {
      const result = await processManualJob({
        businessId: business.id,
        customerName: body.customerName || 'Customer',
        customerPhone: body.customerPhone || '',
        customerEmail: body.customerEmail,
        jobType: body.jobType,
        jobCity: body.jobCity || business.city,
        jobDescription: body.jobDescription
      })
      return NextResponse.json({ success: result.success, ...result })
    }

    const page = await generateServicePage({
      businessId: business.id,
      businessName: business.business_name,
      trade: business.trade,
      service: body.service || body.jobType,
      city: body.city || business.city,
      state: body.state || business.state,
      phone: business.phone || '',
      website: business.website || ''
    })

    return NextResponse.json({ success: true, page })
  } catch (error) {
    console.error('Content POST error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
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

    const { pageId } = await req.json()

    const { data: page } = await supabase
      .from('content_pages')
      .select('*')
      .eq('id', pageId)
      .eq('business_id', business.id)
      .single()

    if (!page) return NextResponse.json({ error: 'Page not found' }, { status: 404 })

    if (business.wordpress_url && business.wordpress_api_key) {
      const result = await publishToWordPress({
        wordpressUrl: business.wordpress_url,
        apiKey: business.wordpress_api_key,
        title: page.title,
        slug: page.slug,
        content: page.content,
        trade: business.trade,
        city: page.city || business.city,
        contentPageId: pageId
      })

      return NextResponse.json({
        success: result.success,
        wordpressUrl: result.wordpressUrl,
        error: result.error
      })
    }

    await supabase
      .from('content_pages')
      .update({ published: true, published_at: new Date().toISOString() })
      .eq('id', pageId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Content PATCH error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
