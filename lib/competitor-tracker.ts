import { GoogleGenerativeAI } from '@google/generative-ai'
import { supabaseAdmin } from './supabase'
import { scoreToMarketShare, getTradeLabel } from './utils'
import { safeParseJSON } from './llm-failover'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

// ============================================
// COMPETITOR TRACKER
// Weekly Gemini web analysis of competitor
// Shows contractor exactly who is beating them
// And exactly what that competitor is doing right
// Emotional driver — nobody wants to lose
// ============================================

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

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: { temperature: 0.2, maxOutputTokens: 1500 }
  })

  const prompt = `Research this ${tradeLabel} business in ${params.city}, ${params.state}: "${params.competitorName}"

Investigate:
1. Google Business Profile — completeness, review count, rating, last updated
2. Foursquare listing — claimed? categories? consistent NAP?
3. Yelp listing — claimed, categories, review count
4. Website — do they have local service pages for ${params.city}? City + service specific pages?
5. Review velocity — how many reviews in last 90 days?
6. Overall AI visibility — would ChatGPT or Gemini recommend them for ${tradeLabel} searches?

Compared to ${params.businessName}, what specific advantages does ${params.competitorName} have?
What specific actions should ${params.businessName} take to outrank them?

Return ONLY valid JSON:
{
  "ai_visibility_score": number 0-100,
  "estimated_review_count": number,
  "platforms_listed": ["string"],
  "estimated_pages": number,
  "advantages": ["3-5 specific things they do better"],
  "recommendations": ["3-5 specific actions to outrank them"]
}`

  const fallback = {
    ai_visibility_score: 45,
    estimated_review_count: 35,
    platforms_listed: ['Google', 'Yelp'],
    estimated_pages: 3,
    advantages: [
      `${params.competitorName} has more Google reviews with city and trade keywords`,
      'Their Foursquare listing is verified and complete',
      'They publish location-specific service pages regularly'
    ],
    recommendations: [
      `Send review requests after every job — ask customers to mention ${params.city} and ${tradeLabel}`,
      'Fix your Foursquare listing — it feeds ChatGPT local data',
      `Publish local service pages for your top 5 ${params.city} neighborhoods`
    ]
  }

  let parsed = fallback

  try {
    const result = await model.generateContent(prompt)
    const response = result.response.text()
    parsed = safeParseJSON(response, fallback)
  } catch (err) {
    console.error('Competitor analysis error:', err)
  }

  const competitorScore = parsed.ai_visibility_score || 45
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
      competitor_pages_count: parsed.estimated_pages || 0,
      week_start: weekStart.toISOString()
    })

  return {
    competitorScore,
    competitorMarketShare,
    gap,
    advantages: parsed.advantages || [],
    recommendations: parsed.recommendations || [],
    competitorPageCount: parsed.estimated_pages || 0
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
    return {
      history: [],
      latestAdvantages: [],
      latestRecommendations: [],
      trend: 'stable',
      competitorName: ''
    }
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
