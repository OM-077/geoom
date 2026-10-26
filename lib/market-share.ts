import { supabaseAdmin } from './supabase'
import { scoreToMarketShare } from './utils'

// ============================================
// MARKET SHARE ENGINE
// Converts raw scores to market share %
// "You control 42% of local AI searches"
// This language is what makes contractors stay
// Nobody cancels when they are gaining territory
// ============================================

export async function getMarketShareData(businessId: string): Promise<{
  currentShare: number
  previousShare: number
  changePercent: number
  competitorShare: number
  competitorName: string
  marketShareStolen: number
  narrative: string
  trend: 'gaining' | 'losing' | 'stable'
}> {
  const { data: audits } = await supabaseAdmin
    .from('audit_results')
    .select('visibility_score, market_share_percent, market_share_change, created_at')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
    .limit(2)

  const { data: competitor } = await supabaseAdmin
    .from('competitor_tracking')
    .select('competitor_name, competitor_score, competitor_market_share')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const currentScore = audits?.[0]?.visibility_score || 0
  const previousScore = audits?.[1]?.visibility_score || 0

  const currentShare = audits?.[0]?.market_share_percent
    || scoreToMarketShare(currentScore)
  const previousShare = audits?.[1]?.market_share_percent
    || scoreToMarketShare(previousScore)

  const competitorRawScore = competitor?.competitor_score || 0
  const competitorShare = competitor?.competitor_market_share
    || scoreToMarketShare(competitorRawScore)
  const competitorName = competitor?.competitor_name || 'your top competitor'

  const changePercent = Math.round((currentShare - previousShare) * 10) / 10
  const marketShareStolen = Math.max(0, changePercent)

  let trend: 'gaining' | 'losing' | 'stable' = 'stable'
  if (changePercent > 1) trend = 'gaining'
  else if (changePercent < -1) trend = 'losing'

  let narrative = ''
  if (changePercent > 0) {
    narrative = `You now control ${currentShare}% of local AI search recommendations in your area, up from ${previousShare}% last week. You captured ${marketShareStolen}% directly from ${competitorName}.`
  } else if (changePercent < 0) {
    narrative = `Your AI market share dropped to ${currentShare}%. ${competitorName} gained ground this week. Publish more content pages and send more review requests to recover.`
  } else {
    narrative = `You control ${currentShare}% of local AI searches. ${competitorName} is at ${competitorShare}%. Fix your next directory listing to increase your share.`
  }

  return {
    currentShare,
    previousShare,
    changePercent,
    competitorShare,
    competitorName,
    marketShareStolen,
    narrative,
    trend
  }
}
