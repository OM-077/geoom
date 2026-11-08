export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { rotateDriverToken } from '@/lib/driver-engine'

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: business } = await supabase
      .from('businesses')
      .select('id, driver_token')
      .eq('user_id', session.user.id)
      .single()

    if (!business) return NextResponse.json({ error: 'No business found' }, { status: 404 })

    const body = await req.json().catch(() => ({})) as { action?: string }

    if (body.action === 'rotate') {
      const { newToken } = await rotateDriverToken(business.id)
      return NextResponse.json({ success: true, token: newToken })
    }

    return NextResponse.json({ success: true, token: business.driver_token })
  } catch (error) {
    console.error('Driver route error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
