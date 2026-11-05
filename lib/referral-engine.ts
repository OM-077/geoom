import { supabaseAdmin } from './supabase'
import crypto from 'crypto'

// ============================================
// REFERRAL ENGINE
// Contractors refer other contractors
// Give 1 month → get 1 month free
// HVAC contractors are tribal — they talk
// One happy contractor in a Facebook group
// = 20 more potential users
// ============================================

export async function generateReferralCode(businessId: string): Promise<string> {
  const code = crypto.randomBytes(6).toString('hex')

  await Promise.all([
    supabaseAdmin
      .from('businesses')
      .update({ referral_code: code })
      .eq('id', businessId),
    supabaseAdmin
      .from('referrals')
      .insert({
        referral_code: code,
        referrer_business_id: businessId
      })
  ])

  return code
}

export async function getReferralByCode(code: string): Promise<{
  valid: boolean
  referrerName?: string
  referralId?: string
}> {
  const { data } = await supabaseAdmin
    .from('referrals')
    .select(`
      id,
      referrer_business_id,
      businesses!referrer_business_id(business_name)
    `)
    .eq('referral_code', code)
    .single()

  if (!data) return { valid: false }

const business = (data.businesses as unknown) as { business_name: string } | null

  return {
    valid: true,
    referrerName: business?.business_name || 'A GeoOm contractor',
    referralId: data.id
  }
}

export async function trackReferralEmail(params: {
  code: string
  email: string
}): Promise<void> {
  await supabaseAdmin
    .from('referrals')
    .update({ referred_email: params.email })
    .eq('referral_code', params.code)
    .eq('status', 'pending')
}

export async function activateReferralCredit(params: {
  referredBusinessId: string
  referredByCode: string
}): Promise<{ credited: boolean }> {
  try {
    const { data: referral } = await supabaseAdmin
      .from('referrals')
      .select('id, referrer_business_id, credit_applied')
      .eq('referral_code', params.referredByCode)
      .single()

    if (!referral || referral.credit_applied) return { credited: false }

    await supabaseAdmin
      .from('referrals')
      .update({
        status: 'active',
        referred_business_id: params.referredBusinessId,
        credit_applied: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', referral.id)

    await supabaseAdmin
      .from('businesses')
      .update({ referred_by_code: params.referredByCode })
      .eq('id', params.referredBusinessId)

    console.log(`Referral credited: ${referral.referrer_business_id} gets 1 free month`)
    return { credited: true }
  } catch (err) {
    console.error('Referral credit error:', err)
    return { credited: false }
  }
}

export async function getReferralNetwork(businessId: string): Promise<{
  code: string | null
  referrals: Array<{
    referred_email: string | null
    status: string
    credit_applied: boolean
    created_at: string
    referred_business_name?: string
  }>
  totalCreditsEarned: number
}> {
  const { data: business } = await supabaseAdmin
    .from('businesses')
    .select('referral_code')
    .eq('id', businessId)
    .single()

  if (!business?.referral_code) {
    return { code: null, referrals: [], totalCreditsEarned: 0 }
  }

  const { data: referrals } = await supabaseAdmin
    .from('referrals')
    .select(`
      referred_email,
      status,
      credit_applied,
      created_at,
      businesses!referred_business_id(business_name)
    `)
    .eq('referral_code', business.referral_code)
    .order('created_at', { ascending: false })

  const totalCreditsEarned = (referrals || [])
    .filter(r => r.credit_applied).length * 149

  return {
    code: business.referral_code,
    referrals: (referrals || []).map(r => ({
      referred_email: r.referred_email,
      status: r.status,
      credit_applied: r.credit_applied,
      created_at: r.created_at,
      referred_business_name:
        (r.businesses as { business_name: string } | null)?.business_name
    })),
    totalCreditsEarned
  }
}
