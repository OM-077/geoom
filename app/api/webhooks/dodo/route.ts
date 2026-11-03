import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { supabaseAdmin } from '@/lib/supabase'
import { activateSubscription, type PricingTier } from '@/lib/pricing-engine'
import { activateReferralCredit } from '@/lib/referral-engine'
import { generateReferralCode } from '@/lib/referral-engine'
import { generateDriverToken } from '@/lib/driver-engine'

function verifyDodoSignature(payload: string, signature: string): boolean {
  try {
    const secret = process.env.DODO_WEBHOOK_SECRET || ''
    const expected = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex')
    return signature === expected
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get('webhook-signature') || ''

    if (signature && !verifyDodoSignature(body, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const payload = JSON.parse(body) as {
      type: string
      data?: {
        subscription_id?: string
        metadata?: {
          business_id?: string
          pricing_tier?: string
          referred_by_code?: string
        }
        status?: string
      }
    }

    const businessId = payload.data?.metadata?.business_id
    const pricingTier = (payload.data?.metadata?.pricing_tier || 'pro') as PricingTier
    const referredByCode = payload.data?.metadata?.referred_by_code

    if (!businessId) {
      console.error('Dodo webhook: no business_id in metadata')
      return NextResponse.json({ received: true })
    }

    switch (payload.type) {
      case 'payment.succeeded':
      case 'subscription.active': {
        await activateSubscription({
          businessId,
          tier: pricingTier,
          subscriptionId: payload.data?.subscription_id
        })

        // Generate referral code and driver token for new subscribers
        const { data: business } = await supabaseAdmin
          .from('businesses')
          .select('referral_code, driver_token')
          .eq('id', businessId)
          .single()

        if (!business?.referral_code) {
          await generateReferralCode(businessId)
        }
        if (!business?.driver_token) {
          await generateDriverToken(businessId)
        }

        // Credit referrer if applicable
        if (referredByCode) {
          await activateReferralCredit({
            referredBusinessId: businessId,
            referredByCode
          })
        }

        console.log(`Business ${businessId} activated on ${pricingTier} plan`)
        break
      }

      case 'subscription.cancelled':
      case 'subscription.expired': {
        await supabaseAdmin
          .from('businesses')
          .update({
            subscription_status: 'cancelled',
            updated_at: new Date().toISOString()
          })
          .eq('id', businessId)
        console.log(`Business ${businessId} cancelled`)
        break
      }

      case 'payment.failed':
      case 'subscription.on_hold': {
        await supabaseAdmin
          .from('businesses')
          .update({
            subscription_status: 'past_due',
            updated_at: new Date().toISOString()
          })
          .eq('id', businessId)
        console.log(`Business ${businessId} past due`)
        break
      }

      default:
        console.log(`Unhandled Dodo event: ${payload.type}`)
    }

    return NextResponse.json({ received: true, type: payload.type })
  } catch (error) {
    console.error('Dodo webhook error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
