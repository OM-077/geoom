import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { pollServiceM8Jobs } from '@/lib/pipelines/servicem8'

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: business } = await supabase
      .from('businesses')
      .select('id, servicem8_api_key')
      .eq('user_id', session.user.id)
      .single()

    if (!business?.servicem8_api_key) {
      return NextResponse.json({ error: 'ServiceM8 not connected' }, { status: 400 })
    }

    const result = await pollServiceM8Jobs({
      businessId: business.id,
      apiKey: business.servicem8_api_key
    })

    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    console.error('ServiceM8 route error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
