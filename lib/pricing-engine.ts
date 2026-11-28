import { supabaseAdmin } from './supabase'

// ============================================
// PRICING ENGINE
// One plan: $97/month — full product, everything
// Founding Member: $499/year — 35 spots only
//   saves $665 vs monthly
//   after year ends → switches to $97/month
// No tiers, no feature gates — everyone gets all
// ============================================

export const PRICING = {
  pro: {
    amount: 97,
    interval: 'month' as const,
    label: 'Geoom',
    description: 'Full product — every engine, every feature, cancel anytime',
    priceId: process.env.DODO_PRO_PRICE_ID
  },
  founding: {
    amount: 499,
    interval: 'year' as const,
    label: 'Founding Member',
    description: '12 months full access — saves $665 vs monthly — 35 spots only',
    spotsTotal: 35,
    monthsAccess: 12,
    priceId: process.env.DODO_FOUNDING_PRICE_ID
  }
} as const

export type PricingTier = keyof typeof PRICING

export async function getFoundingSpotsRemaining(): Promise<{
  remaining: number
  total: number
  isFull: boolean
}> {
  const { count } = await supabaseAdmin
    .from('businesses')
    .select('id', { count: 'exact' })
    .eq('pricing_tier', 'founding')

  const used = count || 0
  const total = PRICING.founding.spotsTotal
  const remaining = Math.max(0, total - used)

  return { remaining, total, isFull: remaining === 0 }
}

export async function createCheckoutSession(params: {
  businessId: string
  email: string
  businessName: string
  tier: PricingTier
  referralCode?: string
}): Promise<{ checkoutUrl: string | null; error?: string }> {
  const pricing = PRICING[params.tier]

  if (params.tier === 'founding') {
    const { isFull } = await getFoundingSpotsRemaining()
    if (isFull) {
      return { checkoutUrl: null, error: 'All founding spots have been claimed' }
    }
  }

  try {
    // Use Dodo Payments Checkout Sessions API (POST /checkouts)
    const body: Record<string, unknown> = {
      product_cart: [
        {
          product_id: pricing.priceId,
          quantity: 1
        }
      ],
      customer: {
        email: params.email,
        name: params.businessName
      },
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/onboarding?paid=true`,
      metadata: {
        business_id: params.businessId,
        pricing_tier: params.tier,
        referred_by_code: params.referralCode || null
      }
    }

    console.log('Dodo request body:', JSON.stringify(body))
    console.log('Dodo API key set:', !!process.env.DODO_API_KEY)

    // Use Node https module to avoid Vercel fetch blocking
    const rawText = await new Promise<string>((resolve, reject) => {
      const https = require('https') as typeof import('https')
      const payload = JSON.stringify(body)
      const req = https.request({
        hostname: 'api.dodopayments.com',
        path: '/checkouts',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.DODO_API_KEY}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        }
      }, (res) => {
        let data = ''
        res.on('data', chunk => { data += chunk })
        res.on('end', () => {
          console.log('Dodo status:', res.statusCode, 'body:', data)
          if (res.statusCode && res.statusCode >= 400) {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`))
          } else {
            resolve(data)
          }
        })
      })
      req.on('error', reject)
      req.write(payload)
      req.end()
    })

    const data = JSON.parse(rawText) as { checkout_url?: string; url?: string }
    console.log('Dodo parsed:', JSON.stringify(data))
    return { checkoutUrl: data.checkout_url || data.url || null }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('Checkout exception:', msg)
    return { checkoutUrl: null, error: `Payment error: ${msg}` }
  }
}

export async function activateSubscription(params: {
  businessId: string
  tier: PricingTier
  subscriptionId?: string
}): Promise<void> {
  const updates: Record<string, unknown> = {
    subscription_status: 'active',
    pricing_tier: params.tier,
    subscribed_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  if (params.subscriptionId) {
    updates.subscription_id = params.subscriptionId
  }

  if (params.tier === 'founding') {
    updates.founding_member = true
    const expiry = new Date()
    expiry.setFullYear(expiry.getFullYear() + 1)
    updates.subscription_expires_at = expiry.toISOString()
  }

  await supabaseAdmin
    .from('businesses')
    .update(updates)
    .eq('id', params.businessId)

  await supabaseAdmin
    .from('onboarding')
    .upsert({
      business_id: params.businessId,
      step_gbp_connected: false,
      step_audit_complete: false,
      step_nap_fixed: false,
      step_pipeline_connected: false,
      step_first_page_published: false
    }, { onConflict: 'business_id' })
}

export async function isSubscriptionActive(businessId: string): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from('businesses')
    .select('subscription_status, pricing_tier, subscription_expires_at')
    .eq('id', businessId)
    .single()

  if (!data || data.subscription_status !== 'active') return false

  if (data.pricing_tier === 'founding' && data.subscription_expires_at) {
    return new Date(data.subscription_expires_at) > new Date()
  }

  return true
}
