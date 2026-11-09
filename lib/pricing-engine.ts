import { supabaseAdmin } from './supabase'

// ============================================
// PRICING ENGINE
// Core $79/month — audit + score + fix plan
// Pro $149/month — full product, all engines
// Founding Member $599/year — 35 spots only
//   after 35 spots → price becomes $149/month
// No Agency tier
// ============================================

export const PRICING = {
  core: {
    amount: 79,
    interval: 'month' as const,
    label: 'Core',
    description: 'Audit, score, weekly fix plan — everything to get started',
    priceId: process.env.DODO_CORE_PRICE_ID
  },
  pro: {
    amount: 149,
    interval: 'month' as const,
    label: 'Pro',
    description: 'Full product — content engine, pipelines, copilot, all features',
    priceId: process.env.DODO_PRO_PRICE_ID
  },
  founding: {
    amount: 599,
    interval: 'year' as const,
    label: 'Founding Member',
    description: '12 months full Pro access — saves $1,189 vs monthly — 35 spots only',
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
    const isOneTime = params.tier === 'founding'

    const body: Record<string, unknown> = {
      customer: {
        email: params.email,
        name: params.businessName
      },
      metadata: {
        business_id: params.businessId,
        pricing_tier: params.tier,
        months_access: params.tier === 'founding' ? 12 : null,
        referred_by_code: params.referralCode || null
      },
      payment_link: true,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?subscribed=true`
    }

    if (isOneTime) {
      body.amount = pricing.amount * 100
      body.currency = 'USD'
    } else {
      body.billing = { interval: 'month', interval_count: 1 }
      body.price_id = pricing.priceId
      body.quantity = 1
    }

    const endpoint = isOneTime
      ? 'https://api.dodopayments.com/v1/payments'
      : 'https://api.dodopayments.com/v1/subscriptions'

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.DODO_PAYMENTS_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const error = await response.json() as { message?: string }
      console.error('Dodo checkout error:', error)
      return { checkoutUrl: null, error: error.message || 'Checkout failed' }
    }

    const data = await response.json() as { payment_link?: string }
    return { checkoutUrl: data.payment_link || null }
  } catch (err) {
    console.error('Checkout exception:', err)
    return { checkoutUrl: null, error: 'Payment system error' }
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
