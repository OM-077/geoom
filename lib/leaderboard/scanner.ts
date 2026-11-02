// ============================================
// LEADERBOARD SCANNER
// Pre-scores top 20 contractors per city+trade
// Pulls from Google Places API, runs mini-audit
// Saves to leaderboard_cache table
// Run via: POST /api/leaderboard/scan
// Cron: daily at 3am UTC
// ============================================

import { supabaseAdmin } from '../supabase'
import { generateWithFailover, safeParseJSON } from '../llm-failover'

export interface LeaderboardEntry {
  rank: number
  businessName: string
  placeId: string
  city: string
  trade: string
  score: number
  claimed: boolean        // true if this business has a Geoom account
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

// DYNAMIC — no hardcoded cities
// Targets are pulled from your actual user base at scan time
// Any city + trade a real user signed up with gets a leaderboard
// Fallback seed list only used if DB has zero users yet (launch day)
export const SEED_TARGETS: { city: string; trade: string }[] = [
  { city: 'Houston', trade: 'plumber' },
  { city: 'Phoenix', trade: 'plumber' },
  { city: 'Dallas', trade: 'hvac' },
]

// Pull all unique city+trade combos from real users in DB
async function getDynamicTargets(): Promise<{ city: string; trade: string }[]> {
  const { data, error } = await supabaseAdmin
    .from('businesses')
    .select('city, trade')
    .not('city', 'is', null)
    .not('trade', 'is', null)

  if (error || !data || data.length === 0) {
    return SEED_TARGETS
  }

  // Deduplicate city+trade combos
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

// ---- Quick score for a Google Places result ----
// Not a full audit — fast approximation for leaderboard ranking
function quickScore(place: GooglePlaceResult): {
  score: number
  entity: number
  citations: number
  reviews: number
} {
  let entity = 0
  let citations = 0
  let reviews = 0

  // Entity: GBP presence (they're in Places so GBP exists = 7pts base)
  entity += 7
  if (place.website) entity += 4        // has website
  if (place.formatted_phone_number) entity += 4  // phone listed

  // Citations: approximate from rating count (proxy for directory spread)
  // More reviews = more directory presence over time
  const rc = place.user_ratings_total || 0
  if (rc >= 100) citations += 16
  else if (rc >= 50) citations += 12
  else if (rc >= 20) citations += 8
  else if (rc >= 5) citations += 4
  else citations += 1

  // Reviews: rating + velocity proxy
  const rating = place.rating || 0
  if (rating >= 4.8) reviews += 15
  else if (rating >= 4.5) reviews += 12
  else if (rating >= 4.0) reviews += 8
  else if (rating >= 3.5) reviews += 4
  else reviews += 1

  // Cap each bucket at max
  entity = Math.min(entity, 15)
  citations = Math.min(citations, 20)
  reviews = Math.min(reviews, 15)

  // Content + schema + freshness: can't determine from Places API alone
  // Give a baseline of 30% of remaining 50pts based on overall signals
  const baselineOther = Math.round(((entity + citations + reviews) / 50) * 30)

  const score = Math.min(100, entity + citations + reviews + baselineOther)

  return { score, entity, citations, reviews }
}

interface GooglePlaceResult {
  place_id: string
  name: string
  rating?: number
  user_ratings_total?: number
  website?: string
  formatted_phone_number?: string
  formatted_address?: string
  url?: string
}

interface GooglePlacesSearchResponse {
  results: GooglePlaceResult[]
  status: string
}

interface GooglePlaceDetailResponse {
  result: GooglePlaceResult
  status: string
}

// ---- Fetch top contractors from Google Places ----
async function fetchTopContractors(
  city: string,
  trade: string
): Promise<GooglePlaceResult[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) {
    console.warn('GOOGLE_PLACES_API_KEY not set — leaderboard scanner skipped')
    return []
  }

  const query = encodeURIComponent(`${trade} contractor ${city}`)
  const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${apiKey}`

  const searchRes = await fetch(searchUrl)
  if (!searchRes.ok) return []

  const searchData = await searchRes.json() as GooglePlacesSearchResponse
  if (searchData.status !== 'OK') return []

  // Get details for top 20 results
  const top20 = searchData.results.slice(0, 20)

  const detailed = await Promise.allSettled(
    top20.map(async (place) => {
      const detailUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=place_id,name,rating,user_ratings_total,website,formatted_phone_number,formatted_address,url&key=${apiKey}`
      const detailRes = await fetch(detailUrl)
      if (!detailRes.ok) return place
      const detailData = await detailRes.json() as GooglePlaceDetailResponse
      return detailData.status === 'OK' ? detailData.result : place
    })
  )

  return detailed
    .filter((r): r is PromiseFulfilledResult<GooglePlaceResult> => r.status === 'fulfilled')
    .map(r => r.value)
}

// ---- Check which places have claimed Geoom accounts ----
async function checkClaimed(
  placeIds: string[]
): Promise<Record<string, string>> {
  // Returns map of placeId → businessId for claimed businesses
  const { data } = await supabaseAdmin
    .from('businesses')
    .select('id, google_place_id')
    .in('google_place_id', placeIds)

  const result: Record<string, string> = {}
  for (const row of data || []) {
    if (row.google_place_id) {
      result[row.google_place_id] = row.id
    }
  }
  return result
}

// ---- Main scanner function ----
export async function scanLeaderboard(
  city: string,
  trade: string
): Promise<{ inserted: number; error?: string }> {
  try {
    const places = await fetchTopContractors(city, trade)

    if (places.length === 0) {
      return { inserted: 0, error: 'No results from Google Places' }
    }

    const placeIds = places.map(p => p.place_id).filter(Boolean)
    const claimedMap = await checkClaimed(placeIds)

    const entries: LeaderboardEntry[] = places.map((place, i) => {
      const { score, entity, citations, reviews } = quickScore(place)
      const claimed = Boolean(claimedMap[place.place_id])

      return {
        rank: i + 1,
        businessName: place.name,
        placeId: place.place_id,
        city,
        trade,
        score,
        claimed,
        claimedBusinessId: claimedMap[place.place_id],
        scoreBreakdown: { entity, citations, reviews },
        reviewCount: place.user_ratings_total || 0,
        rating: place.rating || 0,
        website: place.website || null,
        gbpUrl: place.url || `https://www.google.com/maps/search/${encodeURIComponent(place.name + ' ' + city)}`
      }
    })

    // Sort by score descending and re-rank
    entries.sort((a, b) => b.score - a.score)
    entries.forEach((e, i) => { e.rank = i + 1 })

    // Upsert into leaderboard_cache
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

// ---- Scan all targets (called by cron) ----
// Fully dynamic — scans every city+trade combo from real users
// Works for contractors in any country, any city, any trade
export async function scanAllTargets(): Promise<void> {
  const targets = await getDynamicTargets()

  console.log(`Starting leaderboard scan for ${targets.length} city+trade combos`)

  for (const target of targets) {
    const result = await scanLeaderboard(target.city, target.trade)
    console.log(`${target.trade} in ${target.city}: ${result.inserted} entries${result.error ? ' — ERROR: ' + result.error : ''}`)

    // Polite delay between API calls — respect Google Places rate limits
    await new Promise(r => setTimeout(r, 1200))
  }

  console.log('Leaderboard scan complete')
}

// ---- Trigger scan for a single new user (call this at onboarding) ----
// When someone signs up in Melbourne or Mumbai — leaderboard builds for them immediately
export async function scanForNewUser(city: string, trade: string): Promise<void> {
  // Only scan if we don't already have recent data for this combo
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

  // Only rescan if data is older than 24 hours
  if (hoursSinceLastScan < 24) {
    console.log(`Leaderboard for ${trade} in ${city} is fresh — skipping scan`)
    return
  }

  await scanLeaderboard(city, trade)
  console.log(`Leaderboard built for ${trade} in ${city}`)
}
