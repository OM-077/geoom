import { supabaseAdmin } from '../supabase'
import { generateJobPage } from '../content-engine'
import { generateReviewRequest } from '../review-engine'
import { publishToWordPress } from '../wordpress-publisher'
import { logJourneyEvent, JOURNEY_EVENTS } from '../journey-engine'

export async function processManualJob(params: {
  businessId: string
  customerName: string
  customerPhone: string
  customerEmail?: string
  jobType: string
  jobCity: string
  jobDescription?: string
}): Promise<{
  success: boolean
  pageTitle?: string
  contentPageId?: string
}> {
  const { data: business } = await supabaseAdmin
    .from('businesses')
    .select('*')
    .eq('id', params.businessId)
    .single()

  if (!business) return { success: false }

  const jobId = `manual-${Date.now()}`

  try {
    const page = await generateJobPage({
      businessName: business.business_name,
      trade: business.trade,
      jobType: params.jobType,
      city: params.jobCity,
      state: business.state,
      problemDescription: params.jobDescription,
      phone: business.phone || '',
      website: business.website || '',
      businessId: business.id,
      jobId,
      source: 'jobber' // Manual uses same source key
    })

    const { data: savedPage } = await supabaseAdmin
      .from('content_pages')
      .select('id')
      .eq('business_id', business.id)
      .eq('job_id', jobId)
      .single()

    if (business.wordpress_url && business.wordpress_api_key && savedPage) {
      await publishToWordPress({
        wordpressUrl: business.wordpress_url,
        apiKey: business.wordpress_api_key,
        title: page.title,
        slug: page.slug,
        content: page.content,
        trade: business.trade,
        city: params.jobCity,
        contentPageId: savedPage.id
      })
    }

    if (params.customerPhone) {
      await generateReviewRequest({
        businessId: business.id,
        businessName: business.business_name,
        trade: business.trade,
        customerName: params.customerName,
        customerPhone: params.customerPhone,
        customerEmail: params.customerEmail,
        jobType: params.jobType,
        jobCity: params.jobCity,
        jobId
      })
    }

    await logJourneyEvent({
      businessId: business.id,
      eventType: JOURNEY_EVENTS.CONTENT_PAGE_PUBLISHED,
      pointsGained: 3,
      description: `Published SEO page via manual entry: "${page.title}"`,
      metadata: {
        city: params.jobCity,
        job_type: params.jobType,
        source: 'manual'
      }
    })

    await supabaseAdmin
      .from('onboarding')
      .update({ step_first_page_published: true })
      .eq('business_id', business.id)

    return {
      success: true,
      pageTitle: page.title,
      contentPageId: savedPage?.id
    }
  } catch (error) {
    console.error('Manual job error:', error)
    return { success: false }
  }
}
