import { supabaseAdmin } from '../supabase'
import { generateJobPage } from '../content-engine'
import { generateReviewRequest } from '../review-engine'
import { publishToWordPress } from '../wordpress-publisher'
import { logJourneyEvent, JOURNEY_EVENTS } from '../journey-engine'

export function getJobberOAuthUrl(businessId: string): string {
  const params = new URLSearchParams({
    client_id: process.env.JOBBER_CLIENT_ID!,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/pipelines/jobber/callback`,
    response_type: 'code',
    state: businessId
  })
  return `https://api.getjobber.com/api/oauth/authorize?${params.toString()}`
}

export async function exchangeJobberCode(
  code: string,
  businessId: string
): Promise<{ success: boolean }> {
  try {
    const response = await fetch('https://api.getjobber.com/api/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.JOBBER_CLIENT_ID!,
        client_secret: process.env.JOBBER_CLIENT_SECRET!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/pipelines/jobber/callback`
      })
    })

    const tokens = await response.json() as { access_token?: string; refresh_token?: string }
    if (!tokens.access_token) return { success: false }

    await supabaseAdmin
      .from('businesses')
      .update({
        jobber_connected: true,
        jobber_access_token: tokens.access_token,
        jobber_refresh_token: tokens.refresh_token || null
      })
      .eq('id', businessId)

    await supabaseAdmin
      .from('onboarding')
      .update({ step_pipeline_connected: true })
      .eq('business_id', businessId)

    await logJourneyEvent({
      businessId,
      eventType: JOURNEY_EVENTS.PIPELINE_CONNECTED,
      pointsGained: 5,
      description: 'Jobber connected — jobs now auto-generate SEO pages and review requests',
      metadata: { pipeline: 'jobber' }
    })

    return { success: true }
  } catch (error) {
    console.error('Jobber OAuth error:', error)
    return { success: false }
  }
}

export async function processJobberWebhook(payload: {
  webHookEvent?: {
    data?: {
      job?: {
        id?: string
        title?: string
        client?: {
          name?: string
          phones?: Array<{ number: string }>
          emails?: Array<{ address: string }>
        }
        property?: {
          city?: string
          address?: { city?: string; province?: string }
        }
      }
    }
    topic?: string
  }
  businessId: string
}): Promise<{ processed: boolean; actions: string[] }> {
  const topic = payload.webHookEvent?.topic || ''

  if (!topic.toLowerCase().includes('job') || !topic.toLowerCase().includes('complet')) {
    return { processed: false, actions: ['ignored_event'] }
  }

  const job = payload.webHookEvent?.data?.job
  if (!job) return { processed: false, actions: ['no_job_data'] }

  const { data: business } = await supabaseAdmin
    .from('businesses')
    .select('*')
    .eq('id', payload.businessId)
    .single()

  if (!business || business.subscription_status !== 'active') {
    return { processed: false, actions: ['not_active'] }
  }

  const actions: string[] = []
  const jobCity = job.property?.address?.city || job.property?.city || business.city
  const jobState = job.property?.address?.province || business.state
  const customerName = job.client?.name || 'Customer'
  const customerPhone = job.client?.phones?.[0]?.number || ''
  const customerEmail = job.client?.emails?.[0]?.address || ''
  const jobType = job.title || business.trade
  const jobId = job.id || `jobber-${Date.now()}`

  const { data: existing } = await supabaseAdmin
    .from('content_pages')
    .select('id')
    .eq('business_id', business.id)
    .eq('job_id', jobId)
    .single()

  if (existing) return { processed: false, actions: ['duplicate'] }

  try {
    const page = await generateJobPage({
      businessName: business.business_name,
      trade: business.trade,
      jobType,
      city: jobCity,
      state: jobState,
      phone: business.phone || '',
      website: business.website || '',
      businessId: business.id,
      jobId,
      source: 'jobber'
    })
    actions.push('content_page_generated')

    if (business.wordpress_url && business.wordpress_api_key) {
      const { data: savedPage } = await supabaseAdmin
        .from('content_pages')
        .select('id')
        .eq('business_id', business.id)
        .eq('job_id', jobId)
        .single()

      if (savedPage) {
        await publishToWordPress({
          wordpressUrl: business.wordpress_url,
          apiKey: business.wordpress_api_key,
          title: page.title,
          slug: page.slug,
          content: page.content,
          trade: business.trade,
          city: jobCity,
          contentPageId: savedPage.id
        })
        actions.push('published_wordpress')
      }
    }

    await logJourneyEvent({
      businessId: business.id,
      eventType: JOURNEY_EVENTS.CONTENT_PAGE_PUBLISHED,
      pointsGained: 3,
      description: `Auto-published SEO page: "${page.title}"`,
      metadata: { city: jobCity, job_type: jobType, source: 'jobber' }
    })
  } catch (err) {
    console.error('Jobber content gen failed:', err)
  }

  if (customerPhone) {
    try {
      await generateReviewRequest({
        businessId: business.id,
        businessName: business.business_name,
        trade: business.trade,
        customerName,
        customerPhone,
        customerEmail: customerEmail || undefined,
        jobType,
        jobCity,
        jobId
      })
      actions.push('review_request_generated')
    } catch (err) {
      console.error('Review request failed:', err)
    }
  }

  await supabaseAdmin
    .from('onboarding')
    .update({ step_first_page_published: true })
    .eq('business_id', business.id)

  return { processed: true, actions }
}
