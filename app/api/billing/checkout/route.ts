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

    // Use admin client to bypass RLS for business lookup/create
    const { getSupabaseAdmin } = await import('@/lib/supabase')
    const admin = getSupabaseAdmin()

    // Try to get existing business
    const { data: existing } = await admin
      .from('businesses')
      .select('id, business_name, email')
      .eq('user_id', session.user.id)
      .single()

    let business = existing

    if (!business) {
      const displayName =
        session.user.user_metadata?.full_name ||
        session.user.user_metadata?.name ||
        body.business_name ||
        email.split('@')[0] ||
        'My Business'

      // Log what columns we're trying to insert
      console.log('Creating business for user:', session.user.id, 'name:', displayName)

      const { data: newBiz, error: insertError } = await admin
        .from('businesses')
        .insert({
          user_id: session.user.id,
          business_name: displayName,
          email,
          subscription_status: 'inactive',
        })
        .select('id, business_name, email')
        .single()

      if (insertError || !newBiz) {
        console.error('Business insert failed:', JSON.stringify(insertError))
        // Return the actual DB error so we can see it
        return NextResponse.json({
          error: `DB error: ${insertError?.message || 'unknown'} (code: ${insertError?.code || '?'})`
        }, { status: 500 })
      }

      business = newBiz
      console.log('Business created:', business.id)
    }

    // Return business info + product ID so client can call Dodo directly
    // (Vercel Hobby plan blocks outbound DNS to payment APIs)
    const { PRICING } = await import('@/lib/pricing-engine')
    const pricing = PRICING[tier]

    return NextResponse.json({
      success: true,
      businessId: business.id,
      productId: pricing.priceId,
      email: business.email || email,
      businessName: business.business_name,
      tier,
      returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/onboarding?paid=true`
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('Checkout error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
