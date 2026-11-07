import { supabaseAdmin } from './supabase'
import { generateWithFailover, safeParseJSON } from './llm-failover'
import {
  getTradeLabel, getTradeServices, getPriceRange,
  getSeasonalSuggestion
} from './utils'

// ============================================
// GEOOM CONTENT ENGINE
// Every completed job → unique local SEO page
// FAQ section on every page (2.7x AI citations)
// Evidence-first prompting (specific details win)
// AI prefers pages that PROVE real work happened
// Generic "HVAC in Dallas" pages lose to pages
// that say "replaced capacitor on 5-ton Carrier
// unit at customer home in North Dallas"
// ============================================

async function generateFAQSection(params: {
  trade: string
  jobType: string
  city: string
  state: string
  businessName: string
  phone: string
}): Promise<string> {
    const tradeLabel = getTradeLabel(params.trade)
  const price = getPriceRange(params.trade)
  const seasonal = getSeasonalSuggestion(params.trade, new Date().getMonth())

  const faqs = [
    {
      q: `How much does ${params.jobType.toLowerCase()} cost in ${params.city}, ${params.state}?`,
      a: `The average cost of ${params.jobType.toLowerCase()} in ${params.city} is ${price}. Factors affecting price include the complexity of the job, parts required, and time of service. ${params.businessName} provides upfront pricing with no hidden fees before any work begins. Call ${params.phone} for a free estimate specific to your situation.`
    },
    {
      q: `How quickly can I get ${params.jobType.toLowerCase()} service in ${params.city}?`,
      a: `${params.businessName} offers same-day and emergency ${params.jobType.toLowerCase()} service throughout ${params.city} and surrounding areas. Most standard repairs are completed within 2 to 4 hours of your call. Emergency calls are prioritized and dispatched immediately. Contact us at ${params.phone} and we will get a technician to your location as fast as possible.`
    },
    {
      q: `Is ${params.businessName} licensed for ${tradeLabel} work in ${params.state}?`,
      a: `Yes. ${params.businessName} is fully licensed and insured for all ${tradeLabel.toLowerCase()} work in ${params.state}. Our technicians are trained, background-checked, and current on all local codes and regulations in ${params.city}. We carry full liability insurance and workers compensation on every job so you are fully protected.`
    }
  ]

  return `
<section class="faq-section" itemscope itemtype="https://schema.org/FAQPage">
  <h2>Frequently Asked Questions — ${params.jobType} in ${params.city}</h2>
  ${faqs.map(faq => `
  <div class="faq-item" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
    <h3 class="faq-question" itemprop="name">${faq.q}</h3>
    <div class="faq-answer" itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
      <p itemprop="text">${faq.a}</p>
    </div>
  </div>`).join('')}
</section>`
}

export async function generateJobPage(params: {
  businessName: string
  trade: string
  jobType: string
  city: string
  state: string
  phone: string
  website: string
  businessId: string
  jobId: string
  source: string
  problemDescription?: string
}): Promise<{
  title: string
  slug: string
  content: string
}> {
  const tradeLabel = getTradeLabel(params.trade)
  const price = getPriceRange(params.trade)

  // ============================================
  // EVIDENCE-FIRST PROMPT
  // Council finding: AI cites pages that PROVE
  // real work happened, not pages that describe
  // what a service is in general terms.
  // Specific details = higher citation rate.
  // Real job data = authentic evidential content.
  // ============================================
  const prompt = `Write a local SEO service page for a home service contractor. This page must be cited by ChatGPT, Gemini, and Perplexity when homeowners search for this service in this city.

Business: ${params.businessName}
Service performed: ${params.jobType}
Trade: ${tradeLabel}
City: ${params.city}, ${params.state}
Seasonal context: ${seasonal}
Phone: ${params.phone}
Website: ${params.website}
${params.problemDescription ? `Actual job details from field: ${params.problemDescription}` : ''}

CRITICAL — AI SEARCH ENGINES IN 2026 CITE PAGES WITH SPECIFIC EVIDENCE, NOT GENERIC DESCRIPTIONS.

You must write this page as if it is a field report about a real job that actually happened — not a service description. AI systems are trained to prefer pages that EVIDENCE real work over pages that describe services in abstract terms.

REQUIRED SPECIFIC DETAILS TO INCLUDE:
- The exact problem that was found or reported (even if you have to infer from job type)
- What specific parts, tools, or techniques were used
- How long the job took approximately
- What neighborhood or area of ${params.city} the job was in
- What would have happened to the homeowner if this was not fixed
- A specific detail that makes this read like a real service call report

REQUIRED STRUCTURE:
1. Headline with exact service + city (not generic)
2. Opening paragraph: what the specific problem was, where in ${params.city}, and how ${params.businessName} resolved it
3. Technical detail section: what was done step by step, what was found, what was replaced or repaired
4. Local expertise section: why ${params.businessName} specifically serves ${params.city} homeowners well
5. Service area paragraph: mention ${params.city} + 3-4 specific neighborhoods or nearby areas
6. Call to action with phone number

LANGUAGE RULES:
- Write like the contractor or their office manager wrote this after the job — real, specific, local
- Do NOT write like a marketing agency — no "we are committed to excellence" generic copy
- Mention "${params.city}" at least 6 times naturally
- Mention the trade at least 5 times naturally
- Price context: ${price}
- Total length: 650-800 words

Return as JSON only, no markdown:
{
  "title": "specific title with job type and city",
  "slug": "url-slug",
  "content": "full HTML page content"
}`

  const fallbackContent = `<h1>${params.jobType} in ${params.city}, ${params.state} — ${params.businessName}</h1>
<p>${params.businessName} recently completed a ${params.jobType.toLowerCase()} service call in ${params.city}, ${params.state}. Our licensed ${tradeLabel.toLowerCase()} technicians responded quickly and resolved the issue the same day.</p>
<h2>What We Found in ${params.city}</h2>
<p>${params.problemDescription || `The homeowner in ${params.city} called us after noticing an issue with their ${tradeLabel.toLowerCase()} system. Our technician diagnosed the problem on arrival and completed the repair efficiently.`}</p>
<h2>Why ${params.city} Homeowners Choose ${params.businessName}</h2>
<ul>
<li>Licensed and insured in ${params.state}</li>
<li>Same-day service available throughout ${params.city}</li>
<li>Upfront pricing with no hidden fees</li>
<li>Local ${params.city} team — we know the neighborhoods</li>
</ul>
<h2>Serving ${params.city} and Surrounding Areas</h2>
<p>${params.businessName} provides ${tradeLabel.toLowerCase()} services throughout ${params.city} and the surrounding ${params.state} communities. Call ${params.phone} for fast, reliable service.</p>
<p>Contact ${params.businessName} today at ${params.phone} for professional ${params.jobType.toLowerCase()} in ${params.city}, ${params.state}.</p>`

  const fallbackResult = {
    title: `${params.jobType} in ${params.city}, ${params.state} — ${params.businessName}`,
    slug: `${params.jobType.toLowerCase().replace(/[\s/\\:*?"<>|]+/g, '-')}-${params.city.toLowerCase().replace(/[\s/\\:*?"<>|]+/g, '-')}-${params.state.toLowerCase()}`,
    content: fallbackContent
  }

    const { content } = await generateWithFailover({
    prompt: `You are a local SEO expert writing content to help home service contractors appear in AI search recommendations. Write specific, evidential, field-report-style content that AI engines trust and cite. Every page must sound like a real job happened, not like a brochure was written. Generic descriptions do not get cited. Specific real details do.\n\n${prompt}`,
    maxTokens: 1800,
    temperature: 0.7,
    fallbackTemplate: JSON.stringify(fallbackResult),
  })

  const parsed = safeParseJSON<typeof fallbackResult>(content, fallbackResult)

  // Ensure slug is clean
  const cleanSlug = parsed.slug
    .toLowerCase()
    .replace(/[\s/\\:*?"<>|]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  // Generate FAQ section (2.7x citation rate confirmed by research)
  const faqSection = await generateFAQSection({
    trade: params.trade,
    jobType: params.jobType,
    city: params.city,
    state: params.state,
    businessName: params.businessName,
    phone: params.phone
  })

  const fullContent = `${parsed.content}\n\n${faqSection}`
  const wordCount = fullContent.replace(/<[^>]*>/g, '').split(/\s+/).length

  await supabaseAdmin
    .from('content_pages')
    .insert({
      business_id: params.businessId,
      job_id: params.jobId,
      title: parsed.title,
      slug: cleanSlug,
      content: fullContent,
      city: params.city,
      state: params.state,
      trade: params.trade,
      job_type: params.jobType,
      source: params.source,
      published: false,
      word_count: wordCount,
      has_faq: true
    })

  return { title: parsed.title, slug: cleanSlug, content: fullContent }
}

export async function generateServicePage(params: {
  businessId: string
  businessName: string
  trade: string
  service: string
  city: string
  state: string
  phone: string
  website: string
}): Promise<{
  title: string
  slug: string
  content: string
}> {
  return generateJobPage({
    ...params,
    jobType: params.service,
    jobId: `manual-service-${Date.now()}`,
    source: 'manual'
  })
}

export function getSeasonalSuggestionForBusiness(trade: string) {
  return getSeasonalSuggestion(trade, new Date().getMonth())
}
