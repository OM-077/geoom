// ============================================
// LEADERBOARD SCANNER — Free version
// Replaced Google Places with Yelp Fusion
// Yelp gives real review counts, ratings, names
// 500 req/day free — enough for daily scans
// ============================================

import { supabaseAdmin } from '../supabase'
import { lookupBusinessOnYelp } from '../data-sources/yelp-lookup'

export interface LeaderboardEntry {
  rank: number
  businessName: string
  placeId: string
  city: string
  trade: string
  score: number
  claimed: boolean
  claimedBusinessId?: string
  scoreBreakdown: {
    entity: number
    citations: number
    reviews: number
  }
  reviewCount: number
  rating: number
  website: string | null
  gbpUrl: string
}

export const SEED_TARGETS: { city: string; trade: string }[] = [
  { city: 'Houston', trade: 'plumber' },
  { city: 'Phoenix', trade: 'plumber' },
  { city: 'Dallas', trade: 'hvac' },
]

async function getDynamicTargets(): Promise<{ city: string; trade: string }[]> {
  const { data, error } = await supabaseAdmin
    .from('businesses')
    .select('city, trade')
    .not('city', 'is', null)
    .not('trade', 'is', null)

  if (error || !data || data.length === 0) return SEED_TARGETS

  const seen = new Set<string>()
  const targets: { city: string; trade: string }[] = []

  for (const row of data) {
    const key = `${row.city?.toLowerCase()}|${row.trade?.toLowerCase()}`
    if (!seen.has(key) && row.city && row.trade) {
      seen.add(key)
      targets.push({ city: row.city, trade: row.trade })
    }
  }

  return targets.length > 0 ? targets : SEED_TARGETS
}

function quickScoreFromYelp(params: {
  reviewCount: number
  rating: number
  hasWebsite: boolean
  phone: string
}): { score: number; entity: number; citations: number; reviews: number } {
  // Entity: Yelp listing = they have some online presence
  let entity = 7 // base for being found on Yelp
  if (params.hasWebsite) entity += 4
  if (params.phone) entity += 2
  entity = Math.min(entity, 15)

  // Citations: proxy from review count (more reviews = more directory spread)
  let citations = 0
  const rc = params.reviewCount
  if (rc >= 100) citations = 16
  else if (rc >= 50) citations = 12
  else if (rc >= 20) citations = 8
  else if (rc >= 5) citations = 4
  else citations = 1
  citations = Math.min(citations, 20)

  // Reviews: rating + volume
  let reviews = 0
  const rating = params.rating
  if (rating >= 4.8) reviews = 13
  else if (rating >= 4.5) reviews = 11
  else if (rating >= 4.0) reviews = 8
  else if (rating >= 3.5) reviews = 4
  else reviews = 1
  reviews = Math.min(reviews, 15)

  const baselineOther = Math.round(((entity + citations + reviews) / 50) * 25)
  const score = Math.min(100, entity + citations + reviews + baselineOther)

  return { score, entity, citations, reviews }
}

async function fetchTopContractorsFromYelp(
  city: string,
  trade: string
): Promise<Array<{
  id: string
  name: string
  rating: number
  reviewCount: number
  phone: string
  website: string
  url: string
}>> {
  const key = process.env.YELP_API_KEY
  if (!key) {
    console.warn('YELP_API_KEY not set — leaderboard scanner skipped')
    return []
  }

  try {
    const term = encodeURIComponent(`${trade} contractor`)
    const location = encodeURIComponent(`${city}`)
    const res = await fetch(
      `https://api.yelp.com/v3/businesses/search?term=${term}&location=${location}&limit=20&sort_by=review_count`,
      {
        headers: {
          Authorization: `Bearer ${key}`,
          Accept: 'application/json'
        },
        signal: AbortSignal.timeout(10000)
      }
    )

    if (!res.ok) return []

    const data = await res.json() as {
      businesses: Array<{
        id: string
        name: string
        rating: number
        review_count: number
        phone: string
        url: string
        categories: Array<{ alias: string }>
      }>
    }

    return (data.businesses || []).map(b => ({
      id: b.id,
      name: b.name,
      rating: b.rating || 0,
      reviewCount: b.review_count || 0,
      phone: b.phone || '',
      website: '',
      url: b.url || ''
    }))
  } catch {
    return []
  }
}

async function checkClaimed(yelpIds: string[]): Promise<Record<string, string>> {
  const { data } = await supabaseAdmin
    .from('businesses')
    .select('id, yelp_id')
    .in('yelp_id', yelpIds)

  const result: Record<string, string> = {}
  for (const row of data || []) {
    if (row.yelp_id) result[row.yelp_id] = row.id
  }
  return result
}

export async function scanLeaderboard(
  city: string,
  trade: string
): Promise<{ inserted: number; error?: string }> {
  try {
    const businesses = await fetchTopContractorsFromYelp(city, trade)

    if (businesses.length === 0) {
      return { inserted: 0, error: 'No results from Yelp' }
    }

    const yelpIds = businesses.map(b => b.id)
    const claimedMap = await checkClaimed(yelpIds)

    const entries: LeaderboardEntry[] = businesses.map((biz, i) => {
      const { score, entity, citations, reviews } = quickScoreFromYelp({
        reviewCount: biz.reviewCount,
        rating: biz.rating,
        hasWebsite: false,
        phone: biz.phone
      })
      const claimed = Boolean(claimedMap[biz.id])

      return {
        rank: i + 1,
        businessName: biz.name,
        placeId: biz.id,
        city,
        trade,
        score,
        claimed,
        claimedBusinessId: claimedMap[biz.id],
        scoreBreakdown: { entity, citations, reviews },
        reviewCount: biz.reviewCount,
        rating: biz.rating,
        website: biz.website || null,
        gbpUrl: biz.url || `https://www.yelp.com/search?find_desc=${encodeURIComponent(biz.name)}&find_loc=${encodeURIComponent(city)}`
      }
    })

    entries.sort((a, b) => b.score - a.score)
    entries.forEach((e, i) => { e.rank = i + 1 })

    const rows = entries.map(e => ({
      place_id: e.placeId,
      city: e.city,
      trade: e.trade,
      rank: e.rank,
      business_name: e.businessName,
      score: e.score,
      claimed: e.claimed,
      claimed_business_id: e.claimedBusinessId || null,
      entity_score: e.scoreBreakdown.entity,
      citations_score: e.scoreBreakdown.citations,
      reviews_score: e.scoreBreakdown.reviews,
      review_count: e.reviewCount,
      rating: e.rating,
      website: e.website,
      gbp_url: e.gbpUrl,
      scanned_at: new Date().toISOString()
    }))

    const { error } = await supabaseAdmin
      .from('leaderboard_cache')
      .upsert(rows, {
        onConflict: 'place_id,city,trade',
        ignoreDuplicates: false
      })

    if (error) throw error

    return { inserted: rows.length }
  } catch (err) {
    console.error(`Leaderboard scan failed for ${trade} in ${city}:`, err)
    return { inserted: 0, error: String(err) }
  }
}

export async function scanAllTargets(): Promise<void> {
  const targets = await getDynamicTargets()
  console.log(`Starting leaderboard scan for ${targets.length} city+trade combos`)

  for (const target of targets) {
    const result = await scanLeaderboard(target.city, target.trade)
    console.log(`${target.trade} in ${target.city}: ${result.inserted} entries${result.error ? ' — ERROR: ' + result.error : ''}`)
    await new Promise(r => setTimeout(r, 1200))
  }

  console.log('Leaderboard scan complete')
}

export async function scanForNewUser(city: string, trade: string): Promise<void> {
  const { data: existing } = await supabaseAdmin
    .from('leaderboard_cache')
    .select('scanned_at')
    .eq('city', city)
    .eq('trade', trade)
    .order('scanned_at', { ascending: false })
    .limit(1)
    .single()

  const lastScan = existing?.scanned_at ? new Date(existing.scanned_at) : null
  const hoursSinceLastScan = lastScan
    ? (Date.now() - lastScan.getTime()) / (1000 * 60 * 60)
    : 999

  if (hoursSinceLastScan < 24) {
    console.log(`Leaderboard for ${trade} in ${city} is fresh — skipping scan`)
    return
  }

  await scanLeaderboard(city, trade)
}
