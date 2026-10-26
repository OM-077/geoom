import { supabaseAdmin } from './supabase'
import { logJourneyEvent, JOURNEY_EVENTS } from './journey-engine'

const GBP_API = 'https://mybusinessbusinessinformation.googleapis.com/v1'
const OAUTH_BASE = 'https://oauth2.googleapis.com'

// ============================================
// GBP OAUTH ENGINE
// Google Business Profile connection
// Auto-fix listing data on connection
// Weekly GBP posts scheduled automatically
// GBP is THE most critical AI citation signal
// Applied for — guided fix until approved
// ============================================

export function getGBPAuthUrl(businessId: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/gbp/callback`,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/business.manage',
    access_type: 'offline',
    prompt: 'consent',
    state: businessId
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

export async function exchangeGBPCode(
  code: string,
  businessId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const tokenRes = await fetch(`${OAUTH_BASE}/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/gbp/callback`,
        grant_type: 'authorization_code'
      })
    })

    const tokens = await tokenRes.json() as {
      access_token?: string
      refresh_token?: string
    }

    if (!tokens.access_token) {
      return { success: false, error: 'No access token received' }
    }

    // Get location ID
    const accountsRes = await fetch(
      'https://mybusinessaccountmanagement.googleapis.com/v1/accounts',
      { headers: { Authorization: `Bearer ${tokens.access_token}` } }
    )
    const accountsData = await accountsRes.json() as {
      accounts?: Array<{ name: string }>
    }
    const accountName = accountsData.accounts?.[0]?.name || ''

    let locationId = ''
    if (accountName) {
      const locRes = await fetch(
        `${GBP_API}/${accountName}/locations?readMask=name`,
        { headers: { Authorization: `Bearer ${tokens.access_token}` } }
      )
      const locData = await locRes.json() as {
        locations?: Array<{ name: string }>
      }
      locationId = locData.locations?.[0]?.name || ''
    }

    await supabaseAdmin
      .from('businesses')
      .update({
        gbp_connected: true,
        gbp_access_token: tokens.access_token,
        gbp_refresh_token: tokens.refresh_token || null,
        gbp_location_id: locationId,
        updated_at: new Date().toISOString()
      })
      .eq('id', businessId)

    await supabaseAdmin
      .from('onboarding')
      .update({ step_gbp_connected: true })
      .eq('business_id', businessId)

    await logJourneyEvent({
      businessId,
      eventType: JOURNEY_EVENTS.GBP_CONNECTED,
      pointsGained: 15,
      description: 'Connected Google Business Profile — AI citation signal activated',
      metadata: { location_id: locationId }
    })

    return { success: true }
  } catch (error) {
    console.error('GBP exchange error:', error)
    return { success: false, error: 'OAuth exchange failed' }
  }
}

async function refreshGBPToken(
  businessId: string,
  refreshToken: string
): Promise<string | null> {
  try {
    const res = await fetch(`${OAUTH_BASE}/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        refresh_token: refreshToken,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        grant_type: 'refresh_token'
      })
    })
    const data = await res.json() as { access_token?: string }
    if (!data.access_token) return null
    await supabaseAdmin
      .from('businesses')
      .update({ gbp_access_token: data.access_token })
      .eq('id', businessId)
    return data.access_token
  } catch {
    return null
  }
}

export async function getValidGBPToken(businessId: string): Promise<string | null> {
  const { data: business } = await supabaseAdmin
    .from('businesses')
    .select('gbp_access_token, gbp_refresh_token, gbp_connected')
    .eq('id', businessId)
    .single()

  if (!business?.gbp_connected || !business.gbp_access_token) return null

  const testRes = await fetch(
    'https://mybusinessaccountmanagement.googleapis.com/v1/accounts',
    { headers: { Authorization: `Bearer ${business.gbp_access_token}` } }
  )

  if (testRes.ok) return business.gbp_access_token
  if (business.gbp_refresh_token) {
    return await refreshGBPToken(businessId, business.gbp_refresh_token)
  }
  return null
}

export async function updateGBPListing(params: {
  businessId: string
  updates: {
    description?: string
    phoneNumber?: string
    websiteUri?: string
  }
}): Promise<{ success: boolean; updated: string[] }> {
  const { data: business } = await supabaseAdmin
    .from('businesses')
    .select('gbp_location_id, gbp_connected')
    .eq('id', params.businessId)
    .single()

  if (!business?.gbp_connected || !business.gbp_location_id) {
    return { success: false, updated: [] }
  }

  const token = await getValidGBPToken(params.businessId)
  if (!token) return { success: false, updated: [] }

  const updateMask: string[] = []
  const body: Record<string, unknown> = {}

  if (params.updates.description) {
    body.profile = { description: params.updates.description }
    updateMask.push('profile.description')
  }
  if (params.updates.phoneNumber) {
    body.phoneNumbers = { primaryPhone: params.updates.phoneNumber }
    updateMask.push('phoneNumbers.primaryPhone')
  }
  if (params.updates.websiteUri) {
    body.websiteUri = params.updates.websiteUri
    updateMask.push('websiteUri')
  }

  if (updateMask.length === 0) return { success: true, updated: [] }

  try {
    const res = await fetch(
      `${GBP_API}/${business.gbp_location_id}?updateMask=${updateMask.join(',')}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      }
    )

    if (!res.ok) return { success: false, updated: [] }
    return { success: true, updated: updateMask }
  } catch {
    return { success: false, updated: [] }
  }
}

export async function postGBPUpdate(params: {
  businessId: string
  text: string
}): Promise<{ success: boolean; postId?: string }> {
  const { data: business } = await supabaseAdmin
    .from('businesses')
    .select('gbp_location_id, gbp_connected')
    .eq('id', params.businessId)
    .single()

  if (!business?.gbp_connected || !business.gbp_location_id) {
    return { success: false }
  }

  const token = await getValidGBPToken(params.businessId)
  if (!token) return { success: false }

  try {
    const accountRes = await fetch(
      'https://mybusinessaccountmanagement.googleapis.com/v1/accounts',
      { headers: { Authorization: `Bearer ${token}` } }
    )
    const accountData = await accountRes.json() as {
      accounts?: Array<{ name: string }>
    }
    const accountName = accountData.accounts?.[0]?.name
    if (!accountName) return { success: false }

    const locationShort = business.gbp_location_id.split('/').pop()
    const postRes = await fetch(
      `https://mybusiness.googleapis.com/v4/${accountName}/locations/${locationShort}/localPosts`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          languageCode: 'en-US',
          summary: params.text,
          topicType: 'STANDARD'
        })
      }
    )

    if (!postRes.ok) return { success: false }
    const postData = await postRes.json() as { name: string }

    await supabaseAdmin.from('gbp_posts').insert({
      business_id: params.businessId,
      post_text: params.text,
      published: true,
      gbp_post_id: postData.name,
      published_at: new Date().toISOString()
    })

    return { success: true, postId: postData.name }
  } catch {
    return { success: false }
  }
}

export async function runGBPQuickWin(params: {
  businessId: string
  phone: string
  website: string
}): Promise<{ success: boolean; pointsGained: number; fixed: string[] }> {
  const result = await updateGBPListing({
    businessId: params.businessId,
    updates: {
      phoneNumber: params.phone,
      websiteUri: params.website
    }
  })

  return {
    success: result.success,
    pointsGained: result.updated.length * 5,
    fixed: result.updated
  }
}
