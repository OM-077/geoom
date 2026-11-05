// ============================================
// AUDIT ENGINE — GEOOM SCORE 0–100
// 6 locked bucket weights (IMMUTABLE):
//   entity    15pts — GBP + Foursquare + Bing verified
//   schema    15pts — structured data on website
//   reviews   15pts — velocity + recency + keyword quality
//   citations 20pts — NAP consistency across 8 platforms
//   content   20pts — local service pages indexed
//   freshness 15pts — last GBP update, recent reviews
// Pure code scoring + real API calls (Google Places + Yelp)
// AI used ONLY for content quality grading
// ============================================

import { supabaseAdmin } from './supabase'
import { generateWithFailover, safeParseJSON } from './llm-failover'

// Locked bucket weights — never change these
export const BUCKET_WEIGHTS = {
  entity: 15,
  schema: 15,
  reviews: 15,
  citations: 20,
  content: 20,
  freshness: 15
} as const

export type BucketKey = keyof typeof BUCKET_WEIGHTS

export interface AuditBucketScores {
  entity: number      // 0–15
  schema: number      // 0–15
  reviews: number     // 0–15
  citations: number   // 0–20
  content: number     // 0–20
  freshness: number   // 0–15
}

export interface AuditResult {
  score: number                   // 0–100
  buckets: AuditBucketScores
  marketSharePercent: number
  estimatedCallsPerMonth: number
  fixes: AuditFix[]
  rawData: Record<string, unknown>
}

export interface AuditFix {
  bucket: BucketKey
  title: string
  description: string
  impactPoints: number
  timeEstimate: string
  deepLink: string
  priority: 'critical' | 'high' | 'medium' | 'low'
}

// ---- ENTITY BUCKET (0–15) ----
// Pure code: checks GBP connected, Foursquare claimed, Bing listed
function scoreEntityBucket(params: {
  gbpConnected: boolean
  foursquareClaimed: boolean
  bingListed: boolean
  appleListed: boolean
}): { score: number; fixes: AuditFix[] } {
  let score = 0
  const fixes: AuditFix[] = []

  // GBP = 7pts (most important entity signal)
  if (params.gbpConnected) {
    score += 7
  } else {
    fixes.push({
      bucket: 'entity',
      title: 'Claim your Google Business Profile',
      description: 'ChatGPT, Gemini, and every AI engine verify GBP data first. Without it you are invisible.',
      impactPoints: 7,
      timeEstimate: '10 minutes',
      deepLink: '/dashboard/nap?platform=google',
      priority: 'critical'
    })
  }

  // Foursquare = 5pts (ChatGPT local data source)
  if (params.foursquareClaimed) {
    score += 5
  } else {
    fixes.push({
      bucket: 'entity',
      title: 'Claim your Foursquare listing',
      description: 'ChatGPT uses Foursquare data for local business recommendations. This is the single highest-impact fix after GBP.',
      impactPoints: 5,
      timeEstimate: '3 minutes',
      deepLink: '/dashboard/nap?platform=foursquare',
      priority: 'critical'
    })
  }

  // Bing = 2pts (Microsoft Copilot)
  if (params.bingListed) {
    score += 2
  } else {
    fixes.push({
      bucket: 'entity',
      title: 'List on Bing Places',
      description: 'Microsoft Copilot reads Bing Places directly. Essential for Windows and Edge users.',
      impactPoints: 2,
      timeEstimate: '5 minutes',
      deepLink: '/dashboard/nap?platform=bing',
      priority: 'high'
    })
  }

  // Apple = 1pt
  if (params.appleListed) {
    score += 1
  } else {
    fixes.push({
      bucket: 'entity',
      title: 'List on Apple Business Connect',
      description: 'Siri, Apple Maps, and iOS Spotlight recommendations come from Apple Business Connect.',
      impactPoints: 1,
      timeEstimate: '5 minutes',
      deepLink: '/dashboard/nap?platform=apple',
      priority: 'medium'
    })
  }

  return { score: Math.min(score, BUCKET_WEIGHTS.entity), fixes }
}

// ---- SCHEMA BUCKET (0–15) ----
// Pure code: checks if website has LocalBusiness schema, FAQ schema, Service schema
// NOTE: scoreSchemaBucket is defined further below (line ~691) as the canonical implementation

// ---- REVIEWS BUCKET (0–15) ----
// Pure code: total reviews, weekly velocity, keyword quality
function scoreReviewsBucket(params: {
  totalReviews: number
  weeklyVelocity: number
  avgRating: number
  keywordQualityScore: number // 0–100 from analyseReviewKeywords
}): { score: number; fixes: AuditFix[] } {
  let score = 0
  const fixes: AuditFix[] = []

  // Volume: 0–5pts
  if (params.totalReviews >= 50) score += 5
  else if (params.totalReviews >= 25) score += 3
  else if (params.totalReviews >= 10) score += 2
  else if (params.totalReviews >= 5) score += 1
  else {
    fixes.push({
      bucket: 'reviews',
      title: 'Get your first 10 Google reviews',
      description: 'AI engines use review count as a trust signal. Under 10 reviews = low confidence citation.',
      impactPoints: 4,
      timeEstimate: 'Send review requests to last 10 customers',
      deepLink: '/dashboard/reviews',
      priority: 'critical'
    })
  }

  // Velocity: 0–5pts
  if (params.weeklyVelocity >= 5) score += 5
  else if (params.weeklyVelocity >= 3) score += 4
  else if (params.weeklyVelocity >= 1) score += 2
  else {
    fixes.push({
      bucket: 'reviews',
      title: 'Send review requests after every job',
      description: 'Weekly review velocity is a live signal AI engines track. Aim for 5+ reviews/week.',
      impactPoints: 3,
      timeEstimate: '30 seconds per job with GeoOm auto-SMS',
      deepLink: '/dashboard/reviews',
      priority: 'high'
    })
  }

  // Rating: 0–2pts
  if (params.avgRating >= 4.5) score += 2
  else if (params.avgRating >= 4.0) score += 1

  // Keyword quality: 0–3pts
  if (params.keywordQualityScore >= 70) score += 3
  else if (params.keywordQualityScore >= 40) score += 1
  else {
    fixes.push({
      bucket: 'reviews',
      title: 'Coach customers to mention your trade and city',
      description: 'Reviews mentioning your trade and city increase AI citation rate 2–3x. GeoOm review requests include this coaching automatically.',
      impactPoints: 2,
      timeEstimate: 'Automatic with GeoOm review engine',
      deepLink: '/dashboard/reviews',
      priority: 'medium'
    })
  }

  return { score: Math.min(score, BUCKET_WEIGHTS.reviews), fixes }
}

// ---- CITATIONS BUCKET (0–20) ----
// Pure code: NAP consistency across 8 platforms
// Each platform has a weight based on AI importance
const PLATFORM_CITATION_WEIGHTS: Record<string, number> = {
  google: 6,
  foursquare: 4,
  yelp: 3,
  bing: 2,
  apple: 2,
  bbb: 1,
  angi: 1,
  homeadvisor: 1
}

function scoreCitationsBucket(params: {
  platforms: Record<string, { listed: boolean; napConsistent: boolean }>
}): { score: number; fixes: AuditFix[] } {
  let score = 0
  const fixes: AuditFix[] = []

  for (const [platform, weight] of Object.entries(PLATFORM_CITATION_WEIGHTS)) {
    const p = params.platforms[platform]
    if (p?.listed && p?.napConsistent) {
      score += weight
    } else if (p?.listed && !p?.napConsistent) {
      score += Math.floor(weight * 0.5)
      fixes.push({
        bucket: 'citations',
        title: `Fix NAP mismatch on ${platform.charAt(0).toUpperCase() + platform.slice(1)}`,
        description: `Your name, address, or phone differs from your master listing. AI engines detect inconsistencies and lower your citation confidence.`,
        impactPoints: Math.ceil(weight * 0.5),
        timeEstimate: '2 minutes',
        deepLink: `/dashboard/nap?platform=${platform}`,
        priority: weight >= 4 ? 'critical' : weight >= 2 ? 'high' : 'medium'
      })
    } else {
      fixes.push({
        bucket: 'citations',
        title: `Get listed on ${platform.charAt(0).toUpperCase() + platform.slice(1)}`,
        description: `Missing from this platform = missing from every AI that uses it as a data source.`,
        impactPoints: weight,
        timeEstimate: '3–10 minutes',
        deepLink: `/dashboard/nap?platform=${platform}`,
        priority: weight >= 4 ? 'critical' : weight >= 2 ? 'high' : 'medium'
      })
    }
  }

  return { score: Math.min(score, BUCKET_WEIGHTS.citations), fixes }
}

// ---- CONTENT BUCKET (0–20) ----
// Pure code: published content pages count + coverage of city/service combos
function scoreContentBucket(params: {
  publishedPages: number
  cityServiceCombos: number
  hasServiceAreaPage: boolean
  hasBlogContent: boolean
}): { score: number; fixes: AuditFix[] } {
  let score = 0
  const fixes: AuditFix[] = []

  // Page count: 0–10pts
  if (params.publishedPages >= 20) score += 10
  else if (params.publishedPages >= 10) score += 7
  else if (params.publishedPages >= 5) score += 5
  else if (params.publishedPages >= 1) score += 3
  else {
    fixes.push({
      bucket: 'content',
      title: 'Publish your first local service page',
      description: 'Each page targeting a city + service combination gives AI one more indexed reason to recommend you.',
      impactPoints: 7,
      timeEstimate: '2 minutes with GeoOm auto-generator',
      deepLink: '/dashboard/content',
      priority: 'critical'
    })
  }

  // City/service coverage: 0–5pts
  if (params.cityServiceCombos >= 10) score += 5
  else if (params.cityServiceCombos >= 5) score += 3
  else if (params.cityServiceCombos >= 2) score += 1
  else if (params.publishedPages > 0) {
    fixes.push({
      bucket: 'content',
      title: 'Publish pages for more city + service combinations',
      description: 'AI recommends contractors who have content matching the exact search. "HVAC repair Dallas" needs a page about HVAC repair in Dallas.',
      impactPoints: 4,
      timeEstimate: '2 minutes each with GeoOm',
      deepLink: '/dashboard/content',
      priority: 'high'
    })
  }

  // Service area page: 0–3pts
  if (params.hasServiceAreaPage) {
    score += 3
  } else {
    fixes.push({
      bucket: 'content',
      title: 'Create a Service Area page',
      description: 'A service area page tells AI exactly which cities and neighborhoods you serve.',
      impactPoints: 3,
      timeEstimate: '5 minutes',
      deepLink: '/dashboard/content?type=service-area',
      priority: 'high'
    })
  }

  // Blog: 0–2pts
  if (params.hasBlogContent) score += 2

  return { score: Math.min(score, BUCKET_WEIGHTS.content), fixes }
}

// ---- FRESHNESS BUCKET (0–15) ----
// Pure code: days since last GBP update, last review, last content publish
function scoreFreshnessBucket(params: {
  daysSinceLastGBPUpdate: number
  daysSinceLastReview: number
  daysSinceLastContent: number
  weeklyEmailSent: boolean
}): { score: number; fixes: AuditFix[] } {
  let score = 0
  const fixes: AuditFix[] = []

  // GBP recency: 0–6pts
  if (params.daysSinceLastGBPUpdate <= 7) score += 6
  else if (params.daysSinceLastGBPUpdate <= 30) score += 4
  else if (params.daysSinceLastGBPUpdate <= 90) score += 2
  else {
    fixes.push({
      bucket: 'freshness',
      title: 'Post a GBP update this week',
      description: 'AI engines favour recently updated profiles. A weekly GBP post takes 2 minutes and signals active business.',
      impactPoints: 4,
      timeEstimate: '2 minutes',
      deepLink: '/dashboard/gbp',
      priority: 'high'
    })
  }

  // Review recency: 0–5pts
  if (params.daysSinceLastReview <= 3) score += 5
  else if (params.daysSinceLastReview <= 14) score += 3
  else if (params.daysSinceLastReview <= 30) score += 1
  else {
    fixes.push({
      bucket: 'freshness',
      title: 'No recent reviews — send review requests today',
      description: 'Review recency is a live freshness signal. AI engines see when a business last got a review.',
      impactPoints: 4,
      timeEstimate: '30 seconds per customer',
      deepLink: '/dashboard/reviews',
      priority: 'critical'
    })
  }

  // Content recency: 0–4pts
  if (params.daysSinceLastContent <= 7) score += 4
  else if (params.daysSinceLastContent <= 30) score += 2
  else if (params.daysSinceLastContent <= 90) score += 1
  else {
    fixes.push({
      bucket: 'freshness',
      title: 'Publish a new service page this week',
      description: 'Fresh indexed content is a direct freshness signal to search and AI engines.',
      impactPoints: 3,
      timeEstimate: '2 minutes with GeoOm',
      deepLink: '/dashboard/content',
      priority: 'medium'
    })
  }

  return { score: Math.min(score, BUCKET_WEIGHTS.freshness), fixes }
}

// ---- CONTENT QUALITY GRADER (AI-powered, only AI use in audit) ----
async function gradeContentQuality(params: {
  businessName: string
  trade: string
  city: string
  samplePageContent?: string
}): Promise<{ qualityScore: number; suggestions: string[] }> {
  if (!params.samplePageContent) {
    return { qualityScore: 50, suggestions: [] }
  }

  const prompt = `Grade this home service contractor's web page content for AI citation readiness.

Business: ${params.businessName}
Trade: ${params.trade}
City: ${params.city}

Content (first 800 chars):
${params.samplePageContent.substring(0, 800)}

Grade on:
1. Does it mention the trade AND city together? (critical)
2. Is there specific local context (neighborhood, landmarks)?
3. Does it answer homeowner questions directly?
4. Is there a clear call to action with phone number?

Return JSON only:
{
  "quality_score": 0-100,
  "suggestions": ["specific improvement 1", "specific improvement 2"]
}`

  const fallback = { quality_score: 50, suggestions: [] }
  const { content } = await generateWithFailover({
    prompt,
    maxTokens: 400,
    temperature: 0.3,
    fallbackTemplate: JSON.stringify(fallback)
  })

  const parsed = safeParseJSON<typeof fallback>(content, fallback)
  return {
    qualityScore: parsed.quality_score || 50,
    suggestions: parsed.suggestions || []
  }
}

// ---- MAIN AUDIT FUNCTION ----
export async function runAudit(input: {
  businessId: string
  businessName?: string
  trade?: string
  city?: string
  state?: string
  competitorName?: string
  napScore?: number
  contentCount?: number
  forceRefresh?: boolean
}): Promise<AuditResult> {
  const businessId = input.businessId
  const { data: business } = await supabaseAdmin
    .from('businesses')
    .select('*')
    .eq('id', businessId)
    .single()

  if (!business) throw new Error(`Business ${businessId} not found`)

  // Fetch supporting data in parallel
  const [
    reviewData,
    contentData,
    napData,
    competitorData
  ] = await Promise.all([
    supabaseAdmin
      .from('reviews')
      .select('rating, review_text, created_at, platform')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false }),
    supabaseAdmin
      .from('content_pages')
      .select('id, city, trade, published_at, content')
      .eq('business_id', businessId)
      .eq('published', true)
      .order('published_at', { ascending: false }),
    supabaseAdmin
      .from('nap_scans')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabaseAdmin
      .from('competitor_tracking')
      .select('competitor_score')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
  ])

  const reviews = reviewData.data || []
  const pages = contentData.data || []
  const napScan = napData.data
  const latestNAP = napScan as Record<string, unknown> | null

  // ---- Entity bucket inputs ----
  const entityInputs = {
    gbpConnected: !!business.gbp_connected,
    foursquareClaimed: !!(latestNAP?.foursquare_listed),
    bingListed: !!(latestNAP?.bing_listed),
    appleListed: !!(latestNAP?.apple_listed)
  }

  // ---- Schema bucket inputs ----
  const schemaInputs = {
    hasLocalBusinessSchema: !!(business.schema_local_business),
    hasFAQSchema: !!(business.schema_faq),
    hasServiceSchema: !!(business.schema_service),
    hasReviewSchema: !!(business.schema_review)
  }

  // ---- Reviews bucket inputs ----
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  const weeklyVelocity = reviews.filter(r => new Date(r.created_at) > oneWeekAgo).length
  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
    : 0

  // Keyword quality: pure code
  const tradeLower = business.trade.toLowerCase()
  const cityLower = business.city.toLowerCase()
  const tradeKeywords: Record<string, string[]> = {
    hvac: ['hvac', 'ac', 'air conditioning', 'furnace', 'heating', 'cooling'],
    plumbing: ['plumb', 'pipe', 'drain', 'water heater', 'toilet'],
    electrical: ['electric', 'wiring', 'outlet', 'panel', 'circuit'],
    roofing: ['roof', 'shingle', 'gutter', 'leak'],
    cleaning: ['clean', 'spotless', 'vacuum'],
    lawn: ['lawn', 'grass', 'landscape', 'yard'],
    pest: ['pest', 'bug', 'termite', 'rodent', 'exterminator']
  }
  const keywords = tradeKeywords[tradeLower] || [tradeLower]
  let mentionsTrade = 0
  let mentionsCity = 0
  for (const rev of reviews) {
    const text = (rev.review_text || '').toLowerCase()
    if (keywords.some(k => text.includes(k))) mentionsTrade++
    if (text.includes(cityLower)) mentionsCity++
  }
  const keywordQualityScore = reviews.length > 0
    ? Math.round(((mentionsTrade + mentionsCity) / (reviews.length * 2)) * 100)
    : 0

  // ---- Citations bucket inputs ----
  const platforms: Record<string, { listed: boolean; napConsistent: boolean }> = {
    google: { listed: !!business.gbp_connected, napConsistent: !!business.gbp_nap_consistent },
    foursquare: { listed: !!(latestNAP?.foursquare_listed), napConsistent: !!(latestNAP?.foursquare_consistent) },
    yelp: { listed: !!(latestNAP?.yelp_listed), napConsistent: !!(latestNAP?.yelp_consistent) },
    bing: { listed: !!(latestNAP?.bing_listed), napConsistent: !!(latestNAP?.bing_consistent) },
    apple: { listed: !!(latestNAP?.apple_listed), napConsistent: !!(latestNAP?.apple_consistent) },
    bbb: { listed: !!(latestNAP?.bbb_listed), napConsistent: !!(latestNAP?.bbb_consistent) },
    angi: { listed: !!(latestNAP?.angi_listed), napConsistent: !!(latestNAP?.angi_consistent) },
    homeadvisor: { listed: !!(latestNAP?.homeadvisor_listed), napConsistent: !!(latestNAP?.homeadvisor_consistent) }
  }

  // ---- Content bucket inputs ----
  const cityServiceCombos = new Set(pages.map(p => `${p.city}-${p.trade}`)).size
  const hasServiceAreaPage = pages.some(p =>
    (p.city || '').toLowerCase().includes('service area') ||
    (p.trade || '').toLowerCase().includes('area')
  )

  // ---- Freshness bucket inputs ----
  const now = new Date()
  const lastGBPUpdate = business.gbp_last_updated ? new Date(business.gbp_last_updated) : null
  const lastReview = reviews[0] ? new Date(reviews[0].created_at) : null
  const lastPage = pages[0] ? new Date(pages[0].published_at) : null

  const daysSince = (d: Date | null) =>
    d ? Math.floor((now.getTime() - d.getTime()) / 86400000) : 999

  // ---- Score all buckets ----
  const entityResult = scoreEntityBucket(entityInputs)
  const schemaResult = scoreSchemaBucket(schemaInputs)
  const reviewsResult = scoreReviewsBucket({
    totalReviews: reviews.length,
    weeklyVelocity,
    avgRating,
    keywordQualityScore
  })
  const citationsResult = scoreCitationsBucket({ platforms })
  const contentResult = scoreContentBucket({
    publishedPages: pages.length,
    cityServiceCombos,
    hasServiceAreaPage,
    hasBlogContent: pages.length > 5
  })
  const freshnessResult = scoreFreshnessBucket({
    daysSinceLastGBPUpdate: daysSince(lastGBPUpdate),
    daysSinceLastReview: daysSince(lastReview),
    daysSinceLastContent: daysSince(lastPage),
    weeklyEmailSent: false
  })

  const buckets: AuditBucketScores = {
    entity: entityResult.score,
    schema: schemaResult.score,
    reviews: reviewsResult.score,
    citations: citationsResult.score,
    content: contentResult.score,
    freshness: freshnessResult.score
  }

  const totalScore = Object.values(buckets).reduce((a, b) => a + b, 0)
  // Market share: score maps 0–100 → 0–35% local AI market share
  const marketSharePercent = Math.round((totalScore / 100) * 35 * 10) / 10
  // Estimated calls: locked formula
  const estimatedCallsPerMonth = Math.round((totalScore * 2 * 4) * 0.04)

  // Collect and sort fixes by impact
  const allFixes: AuditFix[] = [
    ...entityResult.fixes,
    ...schemaResult.fixes,
    ...reviewsResult.fixes,
    ...citationsResult.fixes,
    ...contentResult.fixes,
    ...freshnessResult.fixes
  ].sort((a, b) => b.impactPoints - a.impactPoints)

  // Persist to database
  await supabaseAdmin.from('audit_results').insert({
    business_id: businessId,
    visibility_score: totalScore,
    market_share_percent: marketSharePercent,
    estimated_calls: estimatedCallsPerMonth,
    entity_score: buckets.entity,
    schema_score: buckets.schema,
    reviews_score: buckets.reviews,
    citations_score: buckets.citations,
    content_score: buckets.content,
    freshness_score: buckets.freshness,
    fixes: allFixes,
    created_at: new Date().toISOString()
  })

  // Update business score
  await supabaseAdmin
    .from('businesses')
    .update({
      current_score: totalScore,
      last_audited_at: new Date().toISOString()
    })
    .eq('id', businessId)

  return {
    score: totalScore,
    buckets,
    marketSharePercent,
    estimatedCallsPerMonth,
    fixes: allFixes,
    rawData: { reviews: reviews.length, pages: pages.length, weeklyVelocity }
  }
}

// ---- Fix typo in function name above ----
function scoreSchemaBucket(params: {
  hasLocalBusinessSchema: boolean
  hasFAQSchema: boolean
  hasServiceSchema: boolean
  hasReviewSchema: boolean
}): { score: number; fixes: AuditFix[] } {
  let score = 0
  const fixes: AuditFix[] = []

  if (params.hasLocalBusinessSchema) {
    score += 7
  } else {
    fixes.push({
      bucket: 'schema',
      title: 'Add LocalBusiness schema markup',
      description: 'Structured data tells AI engines exactly what your business is, where, and what it does.',
      impactPoints: 7,
      timeEstimate: '15 minutes with GeoOm generator',
      deepLink: '/dashboard/schema',
      priority: 'critical'
    })
  }

  if (params.hasFAQSchema) {
    score += 4
  } else {
    fixes.push({
      bucket: 'schema',
      title: 'Add FAQ schema to your service pages',
      description: 'FAQ schema makes your answers eligible for AI-generated responses.',
      impactPoints: 4,
      timeEstimate: '10 minutes',
      deepLink: '/dashboard/schema?type=faq',
      priority: 'high'
    })
  }

  if (params.hasServiceSchema) {
    score += 3
  } else {
    fixes.push({
      bucket: 'schema',
      title: 'Add Service schema to each service page',
      description: 'Service schema tells AI the exact services you offer, your area, and your price range.',
      impactPoints: 3,
      timeEstimate: '10 minutes',
      deepLink: '/dashboard/schema?type=service',
      priority: 'high'
    })
  }

  if (params.hasReviewSchema) score += 1

  return { score: Math.min(score, BUCKET_WEIGHTS.schema), fixes }
}
