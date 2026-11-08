export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { processWorkizJobs } from '@/lib/pipelines/workiz'

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: business } = await supabase
      .from('businesses')
      .select('id, workiz_api_token')
      .eq('user_id', session.user.id)
      .single()

    if (!business?.workiz_api_token) {
      return NextResponse.json({ error: 'Workiz not connected' }, { status: 400 })
    }

    const result = await processWorkizJobs({
      businessId: business.id,
      apiToken: business.workiz_api_token
    })

    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    console.error('Workiz route error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
