export const dynamic = 'force-dynamic'

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

    const body = await req.json() as { tier?: string; referral_code?: string; business_name?: string }
    const tier = (body.tier || 'pro') as PricingTier
    const email = session.user.email || ''

    // Try to get existing business
    let { data: business } = await supabase
      .from('businesses')
      .select('id, business_name, email')
      .eq('user_id', session.user.id)
      .single()

    // If no business row yet, create one now using whatever info we have
    if (!business) {
      const displayName = session.user.user_metadata?.full_name ||
                          session.user.user_metadata?.name ||
                          body.business_name ||
                          email.split('@')[0] ||
                          'My Business'

      const { data: newBiz, error: insertError } = await supabase
        .from('businesses')
        .insert({
          user_id: session.user.id,
          business_name: displayName,
          email,
          trade: 'HVAC',
          city: '',
          subscription_status: 'inactive',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select('id, business_name, email')
        .single()

      if (insertError || !newBiz) {
        console.error('Failed to create business:', insertError)
        return NextResponse.json({ error: 'Could not set up your account. Please try again.' }, { status: 500 })
      }

      business = newBiz
    }

    const result = await createCheckoutSession({
      businessId: business.id,
      email: business.email || email,
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
