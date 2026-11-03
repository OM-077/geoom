import { supabaseAdmin } from '../supabase'
import { generateJobPage } from '../content-engine'
import { generateReviewRequest } from '../review-engine'
import { publishToWordPress } from '../wordpress-publisher'
import { logJourneyEvent, JOURNEY_EVENTS } from '../journey-engine'

export function generateHousecallWebhookUrl(businessId: string): string {
  return `${process.env.NEXT_PUBLIC_APP_URL}/api/pipelines/housecall/${businessId}`
}

export async function processHousecallWebhook(payload: {
  event?: string
  job?: {
    id?: string
    work_status?: string
    customer?: {
      first_name?: string
      last_name?: string
      mobile_number?: string
      email?: string
    }
    address?: { city?: string; state?: string }
    line_items?: Array<{ name?: string }>
  }
  businessId: string
}): Promise<{ processed: boolean; actions: string[] }> {
  const status = payload.job?.work_status?.toLowerCase() || ''
  if (!status.includes('complet')) {
    return { processed: false, actions: ['not_completed'] }
  }

  const { data: business } = await supabaseAdmin
    .from('businesses')
    .select('*')
    .eq('id', payload.businessId)
    .single()

  if (!business || business.subscription_status !== 'active') {
    return { processed: false, actions: ['not_active'] }
  }

  const actions: string[] = []
  const job = payload.job
  const firstName = job?.customer?.first_name || ''
  const lastName = job?.customer?.last_name || ''
  const customerName = `${firstName} ${lastName}`.trim() || 'Customer'
  const customerPhone = job?.customer?.mobile_number || ''
  const customerEmail = job?.customer?.email || ''
  const jobCity = job?.address?.city || business.city
  const jobState = job?.address?.state || business.state
  const jobType = job?.line_items?.[0]?.name || business.trade
  const jobId = `hcp-${job?.id || Date.now()}`

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
      source: 'housecall'
    })
    actions.push('content_generated')

    if (business.wordpress_url && business.wordpress_api_key) {
      const { data: savedPage } = await supabaseAdmin
        .from('content_pages')
        .select('id')
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
      description: `Auto-published SEO page via Housecall Pro: "${page.title}"`,
      metadata: { city: jobCity, job_type: jobType, source: 'housecall' }
    })
  } catch (err) {
    console.error('HCP content gen failed:', err)
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
      console.error('HCP review request failed:', err)
    }
  }

  return { processed: true, actions }
}
