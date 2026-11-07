// ============================================
// COMPETITOR TRACKER — Now with REAL data
// First: Yelp + Foursquare real lookup
// Then: AI for narrative + recommendations only
// Real review counts, real listing status
// AI never guesses numbers again
// ============================================

import { supabaseAdmin } from './supabase'
import { scoreToMarketShare, getTradeLabel } from './utils'
import { safeParseJSON } from './llm-failover'
import { callAI } from './copilot/ai-router'
import { lookupCompetitorOnYelp } from './data-sources/yelp-lookup'
import { lookupCompetitorOnFoursquare } from './data-sources/foursquare-lookup'

export async function runCompetitorAnalysis(params: {
  businessId: string
  businessName: string
  competitorName: string
  trade: string
  city: string
  state: string
  businessScore: number
}): Promise<{
  competitorScore: number
  competitorMarketShare: number
  gap: number
  advantages: string[]
  recommendations: string[]
  competitorPageCount: number
}> {
  const tradeLabel = getTradeLabel(params.trade)

  // Step 1: Get REAL data from Yelp + Foursquare
  const [yelpResult, foursquareResult] = await Promise.allSettled([
    lookupCompetitorOnYelp({ businessName: params.competitorName, city: params.city, state: params.state }),
    lookupCompetitorOnFoursquare({ businessName: params.competitorName, city: params.city, state: params.state })
  ])

  const yelp = yelpResult.status === 'fulfilled' ? yelpResult.value : null
  const foursquare = foursquareResult.status === 'fulfilled' ? foursquareResult.value : null

  const realReviewCount = yelp?.found ? yelp.reviewCount
    : foursquare?.found ? foursquare.reviewCount
    : 0

  const realRating = yelp?.found ? yelp.rating
    : foursquare?.found ? foursquare.rating
    : 0

  const yelpFound = yelp?.found || false
  const foursquareFound = foursquare?.found || false

  // Step 2: Score competitor based on real data
  // Entity
  let entity = 7 // assume GBP if they're findable
  if (foursquareFound) entity += 5
  entity = Math.min(entity, 15)

  // Reviews
  let reviews = 0
  if (realReviewCount >= 50) reviews += 5
  else if (realReviewCount >= 25) reviews += 3
  else if (realReviewCount >= 10) reviews += 2
  else if (realReviewCount >= 5) reviews += 1
  if (realRating >= 4.5) reviews += 3
  else if (realRating >= 4.0) reviews += 1
  if (realReviewCount > 0) reviews += 2
  reviews = Math.min(reviews, 15)

  // Citations
  let citations = 7 // Google assumed
  if (foursquareFound) citations += 4
  if (yelpFound) citations += 3
  citations = Math.min(citations, 20)

  // Other buckets — estimate from review count proxy
  const contentEstimate = realReviewCount >= 50 ? 10 : realReviewCount >= 20 ? 6 : 3
  const schemaEstimate = 3
  const freshnessEstimate = realReviewCount >= 10 ? 6 : 3

  const competitorScore = Math.min(100,
    entity + reviews + citations + contentEstimate + schemaEstimate + freshnessEstimate
  )

  // Step 3: AI for NARRATIVE only — not for numbers
  const prompt = `Analyze this ${tradeLabel} competitor for ${params.businessName} in ${params.city}, ${params.state}.

Competitor: ${params.competitorName}
Real data we found:
- Yelp: ${yelpFound ? `Found — ${realReviewCount} reviews, ${realRating} stars` : 'Not found on Yelp'}
- Foursquare: ${foursquareFound ? `Found — ${foursquare?.reviewCount || 0} ratings` : 'Not found on Foursquare'}
- Estimated AI score: ${competitorScore}/100

${params.businessName} has score ${params.businessScore}/100.

Based on this data, write:
1. 3-4 specific advantages this competitor has
2. 3-4 specific actions ${params.businessName} should take to outrank them

Return ONLY valid JSON:
{
  "advantages": ["specific advantage 1", "specific advantage 2", "specific advantage 3"],
  "recommendations": ["action 1", "action 2", "action 3"]
}`

  const fallback = {
    advantages: [
      yelpFound ? `${params.competitorName} has ${realReviewCount} Yelp reviews — Perplexity surfaces them for every local search` : `${params.competitorName} is listed on Yelp — feeding Perplexity with their data`,
      foursquareFound ? `They are verified on Foursquare — ChatGPT recommends them for local ${tradeLabel} searches` : `Their Foursquare listing gives them an edge in ChatGPT results`,
      `They likely post GBP updates more frequently — freshness signals favour them in AI recommendations`
    ],
    recommendations: [
      `Fix your Foursquare listing now — this is ChatGPT's primary local data source for ${params.city}`,
      `Send review requests after every job — aim to surpass ${params.competitorName}'s ${realReviewCount} reviews`,
      `Publish service pages for each ${params.city} neighborhood — more content = more AI citations`
    ]
  }

  let parsed = fallback

  try {
    const result = await callAI(prompt, {
      maxTokens: 800,
      temperature: 0.3,
      fallback: JSON.stringify(fallback)
    })
    if (result) parsed = safeParseJSON(result, fallback)
  } catch (err) {
    console.error('Competitor analysis error:', err)
  }

  const competitorMarketShare = scoreToMarketShare(competitorScore)
  const businessMarketShare = scoreToMarketShare(params.businessScore)
  const gap = competitorMarketShare - businessMarketShare

  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())

  await supabaseAdmin
    .from('competitor_tracking')
    .insert({
      business_id: params.businessId,
      competitor_name: params.competitorName,
      competitor_score: competitorScore,
      competitor_market_share: competitorMarketShare,
      business_score: params.businessScore,
      business_market_share: businessMarketShare,
      score_gap: gap,
      competitor_advantages: parsed.advantages || [],
      competitor_pages_count: 0,
      week_start: weekStart.toISOString()
    })

  return {
    competitorScore,
    competitorMarketShare,
    gap,
    advantages: parsed.advantages || [],
    recommendations: parsed.recommendations || [],
    competitorPageCount: 0
  }
}

export async function getCompetitorHistory(businessId: string): Promise<{
  history: Array<{
    week_start: string
    business_score: number
    competitor_score: number
    business_market_share: number
    competitor_market_share: number
    score_gap: number
  }>
  latestAdvantages: string[]
  latestRecommendations: string[]
  trend: 'gaining' | 'losing' | 'stable'
  competitorName: string
}> {
  const { data } = await supabaseAdmin
    .from('competitor_tracking')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
    .limit(12)

  if (!data || data.length === 0) {
    return { history: [], latestAdvantages: [], latestRecommendations: [], trend: 'stable', competitorName: '' }
  }

  const history = data.map(d => ({
    week_start: d.week_start,
    business_score: d.business_score,
    competitor_score: d.competitor_score,
    business_market_share: d.business_market_share || scoreToMarketShare(d.business_score),
    competitor_market_share: d.competitor_market_share || scoreToMarketShare(d.competitor_score),
    score_gap: d.score_gap
  })).reverse()

  let trend: 'gaining' | 'losing' | 'stable' = 'stable'
  if (data.length >= 2) {
    const latestGap = data[0].score_gap
    const prevGap = data[1].score_gap
    if (latestGap < prevGap - 2) trend = 'gaining'
    else if (latestGap > prevGap + 2) trend = 'losing'
  }

  return {
    history,
    latestAdvantages: (data[0]?.competitor_advantages as string[]) || [],
    latestRecommendations: [],
    trend,
    competitorName: data[0]?.competitor_name || ''
  }
}
