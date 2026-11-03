import { supabaseAdmin } from '../supabase'
import { generateJobPage } from '../content-engine'
import { generateReviewRequest } from '../review-engine'
import { publishToWordPress } from '../wordpress-publisher'
import { logJourneyEvent, JOURNEY_EVENTS } from '../journey-engine'

export async function processWorkizJobs(params: {
  businessId: string
  apiToken: string
}): Promise<{ processed: number; actions: string[] }> {
  const { data: business } = await supabaseAdmin
    .from('businesses')
    .select('*')
    .eq('id', params.businessId)
    .single()

  if (!business || business.subscription_status !== 'active') {
    return { processed: 0, actions: [] }
  }

  try {
    const response = await fetch(
      `https://api.workiz.com/api/v1/${params.apiToken}/job/all/?status=completed&records=25`,
      { headers: { 'Content-Type': 'application/json' } }
    )

    if (response.status === 429) {
      await new Promise(r => setTimeout(r, 5000))
      return { processed: 0, actions: ['rate_limited'] }
    }

    if (!response.ok) return { processed: 0, actions: [] }

    const data = await response.json() as { data?: Array<Record<string, unknown>> }
    const jobs = data.data || []
    const actions: string[] = []
    let processed = 0

    for (const job of jobs.slice(0, 10)) {
      const jobId = `workiz-${job.UUID || job.ID || Date.now()}`

      const { data: existing } = await supabaseAdmin
        .from('content_pages')
        .select('id')
        .eq('business_id', business.id)
        .eq('job_id', jobId)
        .single()

      if (existing) continue

      const jobCity = (job.LocationCity || job.City || business.city) as string
      const jobState = (job.LocationState || job.State || business.state) as string
      const jobType = (job.JobTitle || job.Title || business.trade) as string
      const customerPhone = (job.Phone || '') as string
      const customerName = `${job.FirstName || ''} ${job.LastName || ''}`.trim() || 'Customer'

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
          source: 'workiz'
        })
        actions.push(`content_${jobId}`)

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
          }
        }

        if (customerPhone) {
          await generateReviewRequest({
            businessId: business.id,
            businessName: business.business_name,
            trade: business.trade,
            customerName,
            customerPhone,
            jobType,
            jobCity,
            jobId
          })
          actions.push(`review_${jobId}`)
        }

        await logJourneyEvent({
          businessId: business.id,
          eventType: JOURNEY_EVENTS.CONTENT_PAGE_PUBLISHED,
          pointsGained: 3,
          description: `Auto-published SEO page via Workiz: "${page.title}"`,
          metadata: { city: jobCity, job_type: jobType }
        })

        processed++
        await new Promise(r => setTimeout(r, 500))
      } catch (err) {
        console.error(`Workiz job ${jobId} failed:`, err)
      }
    }

    return { processed, actions }
  } catch (error) {
    console.error('Workiz API error:', error)
    return { processed: 0, actions: [] }
  }
}
