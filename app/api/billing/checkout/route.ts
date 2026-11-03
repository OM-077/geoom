import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import {
  createCheckoutSession,
  getFoundingSpotsRemaining,
  type PricingTier
} from '@/lib/pricing-engine'

export async function GET(req: NextRequest) {
  try {
    const spots = await getFoundingSpotsRemaining()
    return NextResponse.json({ success: true, ...spots })
  } catch (error) {
    console.error('Spots error:', error)
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
      .select('id, business_name, email')
      .eq('user_id', session.user.id)
      .single()

    if (!business) return NextResponse.json({ error: 'No business found' }, { status: 404 })

    const body = await req.json() as { tier?: string; referral_code?: string }
    const tier = (body.tier || 'pro') as PricingTier
    const email = business.email || session.user.email || ''

    const result = await createCheckoutSession({
      businessId: business.id,
      email,
      businessName: business.business_name,
      tier,
      referralCode: body.referral_code
    })

    return NextResponse.json({
      success: !!result.checkoutUrl,
      checkoutUrl: result.checkoutUrl,
      error: result.error
    })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
