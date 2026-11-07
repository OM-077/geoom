// ============================================
// FREE AUDIT ENGINE — No Google billing needed
// Data rotation: Gemini → Yelp → Foursquare → estimated
// Powers the public /audit page — no login required
// Same 6 bucket scoring as paid audit engine
// LOCKED formula: estimatedCalls = (score * 2 * 4) * 0.04
// ============================================

import { searchBusinessWithGemini } from './data-sources/gemini-search'
import { lookupBusinessOnYelp } from './data-sources/yelp-lookup'
import { lookupBusinessOnFoursquare } from './data-sources/foursquare-lookup'
import { getEstimatedBusinessData } from './data-sources/public-scrape'

export interface FreeAuditResult {
  score: number
  buckets: {
    entity: number
    schema: number
    reviews: number
    citations: number
    content: number
    freshness: number
  }
  estimatedCallsPerMonth: number
  marketSharePercent: number
  businessName: string
  trade: string
  city: string
  gbpFound: boolean
  rating: number
  reviewCount: number
  dataSource: string
  fixes: Array<{
    bucket: string
    title: string
    impactPoints: number
    priority: 'critical' | 'high' | 'medium'
  }>
}

export async function runFreeAudit(params: {
  businessName: string
  trade: string
  city: string
  state: string
}): Promise<FreeAuditResult> {

  // ---- STEP 1: Gather data from rotation ----
  // Try all three sources in parallel, use whichever has the best data
  const [geminiData, yelpData, foursquareData] = await Promise.allSettled([
    searchBusinessWithGemini(params),
    lookupBusinessOnYelp(params),
    lookupBusinessOnFoursquare(params)
  ])

  const gemini = geminiData.status === 'fulfilled' ? geminiData.value : null
  const yelp = yelpData.status === 'fulfilled' ? yelpData.value : null
  const foursquare = foursquareData.status === 'fulfilled' ? foursquareData.value : null

  // Pick the best review count — real API data beats Gemini estimates
  const realReviewCount = yelp?.found ? yelp.reviewCount
    : foursquare?.found ? foursquare.reviewCount
    : gemini?.found ? gemini.reviewCount
    : 0

  const realRating = yelp?.found ? yelp.rating
    : foursquare?.found ? foursquare.rating
    : gemini?.found ? gemini.rating
    : 0

  const gbpFound = gemini?.gbpLikely || false
  const hasWebsite = gemini?.hasWebsite || foursquare?.website !== '' || false
  const hasPhone = gemini?.hasPhone || foursquare?.phone !== '' || yelp?.phone !== '' || false
  const hasHours = gemini?.hasHours || false
  const yelpFound = yelp?.found || gemini?.yelpLikely || false
  const foursquareFound = foursquare?.found || gemini?.foursquareLikely || false
  const bingFound = gemini?.bingLikely || false

  const resolvedName = yelp?.name || foursquare?.name || gemini?.businessName || params.businessName

  // If nothing found anywhere, use baseline estimates
  const estimated = (!yelp?.found && !foursquare?.found && !gemini?.found)
    ? getEstimatedBusinessData(params)
    : null

  const reviewCount = estimated ? estimated.estimatedReviewCount : realReviewCount
  const rating = estimated ? estimated.estimatedRating : realRating
  const dataSource = yelp?.found ? 'yelp'
    : foursquare?.found ? 'foursquare'
    : gemini?.found ? 'gemini'
    : 'estimated'

  // ---- STEP 2: Score all 6 buckets ----

  // ENTITY (0-15)
  let entity = 0
  if (gbpFound || estimated?.gbpLikely) entity += 7
  if (foursquareFound) entity += 5
  if (bingFound) entity += 2
  if (hasPhone) entity += 1
  entity = Math.min(entity, 15)

  // SCHEMA (0-15) — can't know without website scrape, estimate conservatively
  const schema = hasWebsite ? 4 : 1

  // REVIEWS (0-15)
  let reviews = 0
  if (reviewCount >= 50) reviews += 5
  else if (reviewCount >= 25) reviews += 3
  else if (reviewCount >= 10) reviews += 2
  else if (reviewCount >= 5) reviews += 1

  // Weekly velocity unknown — give 0 (they need to fix this)
  // Rating bonus
  if (rating >= 4.5) reviews += 3
  else if (rating >= 4.0) reviews += 1

  // No keyword quality data for free audit — give baseline 2 if reviews exist
  if (reviewCount > 0) reviews += 2
  reviews = Math.min(reviews, 15)

  // CITATIONS (0-20)
  let citations = 0
  if (gbpFound || estimated?.gbpLikely) citations += 6
  if (foursquareFound) citations += 4
  if (yelpFound) citations += 3
  if (bingFound) citations += 2
  citations = Math.min(citations, 20)

  // CONTENT (0-20) — unknown without DB, estimate from website presence
  const content = hasWebsite ? 4 : 1

  // FRESHNESS (0-15) — unknown for free audit, give conservative estimate
  const freshness = gbpFound ? 4 : 2

  const buckets = { entity, schema, reviews, citations, content, freshness }
  const score = Object.values(buckets).reduce((a, b) => a + b, 0)

  // LOCKED FORMULAS
  const estimatedCallsPerMonth = Math.round((score * 2 * 4) * 0.04)
  const marketSharePercent = Math.round((score / 100) * 35 * 10) / 10

  // ---- STEP 3: Generate fixes ----
  const fixes: FreeAuditResult['fixes'] = []

  if (!gbpFound) fixes.push({
    bucket: 'entity',
    title: 'Claim your Google Business Profile',
    impactPoints: 7,
    priority: 'critical'
  })

  if (!foursquareFound) fixes.push({
    bucket: 'entity',
    title: 'Claim your Foursquare listing — ChatGPT uses this data',
    impactPoints: 5,
    priority: 'critical'
  })

  if (reviewCount < 10) fixes.push({
    bucket: 'reviews',
    title: 'Get your first 10 Google reviews',
    impactPoints: 5,
    priority: 'critical'
  })

  if (!yelpFound) fixes.push({
    bucket: 'citations',
    title: 'Get listed on Yelp — Perplexity uses Yelp data',
    impactPoints: 3,
    priority: 'high'
  })

  if (!hasWebsite) fixes.push({
    bucket: 'content',
    title: 'Add a website — required for schema and content scores',
    impactPoints: 7,
    priority: 'critical'
  })

  fixes.push({
    bucket: 'schema',
    title: 'Add LocalBusiness schema markup to your website',
    impactPoints: 7,
    priority: 'high'
  })

  fixes.push({
    bucket: 'content',
    title: 'Publish local service pages for each city you serve',
    impactPoints: 7,
    priority: 'high'
  })

  return {
    score,
    buckets,
    estimatedCallsPerMonth,
    marketSharePercent,
    businessName: resolvedName,
    trade: params.trade,
    city: params.city,
    gbpFound,
    rating,
    reviewCount,
    dataSource,
    fixes: fixes.slice(0, 5)
  }
}
