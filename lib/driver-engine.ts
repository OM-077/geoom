import { supabaseAdmin } from './supabase'
import crypto from 'crypto'

// ============================================
// DRIVER ENGINE — TECHNICIAN FIELD ACCESS
// Owner shares token URL with techs
// Tech sees only today's jobs + review SMS button
// Zero access to billing, scores, competitor data
// Makes review requests happen IN THE FIELD
// Immediately after job = highest conversion
// Rotate token instantly if tech leaves
// ============================================

export async function generateDriverToken(businessId: string): Promise<string> {
  const token = crypto.randomBytes(12).toString('hex')

  await supabaseAdmin
    .from('businesses')
    .update({
      driver_token: token,
      driver_token_created_at: new Date().toISOString()
    })
    .eq('id', businessId)

  return token
}

export async function rotateDriverToken(
  businessId: string
): Promise<{ newToken: string }> {
  const newToken = await generateDriverToken(businessId)
  return { newToken }
}

export async function validateDriverToken(token: string): Promise<{
  valid: boolean
  businessId?: string
  businessName?: string
  trade?: string
}> {
  const { data } = await supabaseAdmin
    .from('businesses')
    .select('id, business_name, trade, subscription_status')
    .eq('driver_token', token)
    .single()

  if (!data || data.subscription_status !== 'active') {
    return { valid: false }
  }

  return {
    valid: true,
    businessId: data.id,
    businessName: data.business_name,
    trade: data.trade
  }
}

export async function getDriverJobs(businessId: string): Promise<{
  jobs: Array<{
    id: string
    customer_name: string
    customer_phone: string
    job_type: string
    job_city: string
    sms_text: string
    sent: boolean
    created_at: string
  }>
}> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { data: jobs } = await supabaseAdmin
    .from('review_requests')
    .select('id, customer_name, customer_phone, job_type, job_city, sms_text, sent, created_at')
    .eq('business_id', businessId)
    .gte('created_at', today.toISOString())
    .order('created_at', { ascending: false })
    .limit(20)

  return { jobs: jobs || [] }
}

export async function markDriverSmsSent(
  requestId: string,
  businessId: string
): Promise<void> {
  await supabaseAdmin
    .from('review_requests')
    .update({ sent: true, sent_at: new Date().toISOString() })
    .eq('id', requestId)
    .eq('business_id', businessId)
}
