import { supabaseAdmin } from '../supabase'
import { generateJobPage } from '../content-engine'
import { generateReviewRequest } from '../review-engine'
import { publishToWordPress } from '../wordpress-publisher'
import { logJourneyEvent, JOURNEY_EVENTS } from '../journey-engine'

export async function pollServiceM8Jobs(params: {
  businessId: string
  apiKey: string
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
    const since = new Date()
    since.setHours(since.getHours() - 25)
    const sinceStr = since.toISOString().split('.')[0]

    const credentials = Buffer.from(`${params.apiKey}:`).toString('base64')

    const response = await fetch(
      `https://api.servicem8.com/api_1.0/job.json?%24filter=edit_date%20gt%20'${sinceStr}'%20and%20status%20eq%20'Complete'`,
      {
        headers: {
          Authorization: `Basic ${credentials}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (response.status === 429) {
      await new Promise(r => setTimeout(r, 5000))
      return { processed: 0, actions: ['rate_limited'] }
    }

    if (!response.ok) return { processed: 0, actions: [] }

    const jobs = await response.json() as Array<Record<string, unknown>>
    if (!Array.isArray(jobs)) return { processed: 0, actions: [] }

    const actions: string[] = []
    let processed = 0

    for (const job of jobs.slice(0, 10)) {
      const jobId = `sm8-${job.uuid}`

      const { data: existing } = await supabaseAdmin
        .from('content_pages')
        .select('id')
        .eq('business_id', business.id)
        .eq('job_id', jobId)
        .single()

      if (existing) continue

      const addressParts = ((job.job_address || '') as string).split(',')
      const jobCity = (job.geo_city || addressParts[addressParts.length - 2]?.trim() || business.city) as string
      const jobState = (addressParts[addressParts.length - 1]?.trim().split(' ')[0] || business.state) as string
      const jobType = ((job.job_description || business.trade) as string).split('\n')[0].substring(0, 80)

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
          source: 'servicem8'
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

        if (job.contact_phone) {
          await generateReviewRequest({
            businessId: business.id,
            businessName: business.business_name,
            trade: business.trade,
            customerName: (job.contact_name || 'Customer') as string,
            customerPhone: job.contact_phone as string,
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
          description: `Auto-published SEO page via ServiceM8: "${page.title}"`,
          metadata: { city: jobCity, job_type: jobType }
        })

        processed++
        await new Promise(r => setTimeout(r, 500))
      } catch (err) {
        console.error(`ServiceM8 job ${jobId} failed:`, err)
      }
    }

    return { processed, actions }
  } catch (error) {
    console.error('ServiceM8 poll error:', error)
    return { processed: 0, actions: [] }
  }
}
