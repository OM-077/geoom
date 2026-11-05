import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { updateGBPListing, postGBPUpdate, runGBPQuickWin } from '@/lib/gbp-oauth'

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

    const body = await req.json() as { action?: string; text?: string; updates?: Record<string, string> }

    if (body.action === 'quick_win') {
      const result = await runGBPQuickWin({
        businessId: business.id,
        phone: business.phone || '',
        website: business.website || ''
      })
      return NextResponse.json({ ...result })
    }

    if (body.action === 'post' && body.text) {
      const result = await postGBPUpdate({
        businessId: business.id,
        text: body.text
      })
      return NextResponse.json({ success: result.success, postId: result.postId })
    }

    const result = await updateGBPListing({
      businessId: business.id,
      updates: body.updates || {}
    })

    return NextResponse.json({ success: result.success, updated: result.updated })
  } catch (error) {
    console.error('GBP update error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
