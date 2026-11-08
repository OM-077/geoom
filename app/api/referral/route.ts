export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { getReferralNetwork, trackReferralEmail } from '@/lib/referral-engine'

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

    const network = await getReferralNetwork(business.id)
    return NextResponse.json({ success: true, ...network })
  } catch (error) {
    console.error('Referral GET error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { code, email } = await req.json()
    if (!code || !email) {
      return NextResponse.json({ error: 'Code and email required' }, { status: 400 })
    }
    await trackReferralEmail({ code, email })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Referral POST error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
