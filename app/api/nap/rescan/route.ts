import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { markPlatformFixed } from '@/lib/nap-scanner'
import { logJourneyEvent, JOURNEY_EVENTS } from '@/lib/journey-engine'

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: business } = await supabase
      .from('businesses')
      .select('id, business_name')
      .eq('user_id', session.user.id)
      .single()

    if (!business) return NextResponse.json({ error: 'No business found' }, { status: 404 })

    const { platform } = await req.json()

    if (!platform) {
      return NextResponse.json({ error: 'Platform required' }, { status: 400 })
    }

    const result = await markPlatformFixed({
      businessId: business.id,
      platform: platform.toLowerCase()
    })

    if (result.success && result.pointsGained > 0) {
      const platformDisplay = platform.charAt(0).toUpperCase() + platform.slice(1)
      await logJourneyEvent({
        businessId: business.id,
        eventType: JOURNEY_EVENTS.NAP_PLATFORM_FIXED,
        pointsGained: result.pointsGained,
        description: `Fixed ${platformDisplay} listing — NAP data now consistent across all platforms`,
        metadata: { platform: platform.toLowerCase(), new_nap_score: result.newScore }
      })
    }

    return NextResponse.json({
      success: result.success,
      pointsGained: result.pointsGained,
      newNapScore: result.newScore
    })
  } catch (error) {
    console.error('NAP rescan error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
