// ============================================
// FOURSQUARE LOOKUP — Real business data
// 1000 req/day free on Foursquare Places API
// Critical: ChatGPT uses Foursquare as primary
// local business data source
// ============================================

export interface FoursquareBusinessData {
  found: boolean
  fsqId: string
  name: string
  rating: number
  reviewCount: number
  phone: string
  address: string
  city: string
  state: string
  zip: string
  website: string
  categories: string[]
  verified: boolean
  url: string
}

const FALLBACK: FoursquareBusinessData = {
  found: false,
  fsqId: '',
  name: '',
  rating: 0,
  reviewCount: 0,
  phone: '',
  address: '',
  city: '',
  state: '',
  zip: '',
  website: '',
  categories: [],
  verified: false,
  url: ''
}

interface FoursquareResult {
  fsq_id: string
  name: string
  rating?: number
  stats?: { total_ratings: number }
  tel?: string
  location?: {
    address?: string
    city?: string
    region?: string
    postcode?: string
  }
  website?: string
  categories?: Array<{ name: string }>
  verified?: boolean
}

interface FoursquareSearchResponse {
  results: FoursquareResult[]
}

export async function lookupBusinessOnFoursquare(params: {
  businessName: string
  city: string
  state: string
}): Promise<FoursquareBusinessData> {
  const key = process.env.FOURSQUARE_API_KEY
  if (!key) return FALLBACK

  try {
    const query = encodeURIComponent(params.businessName)
    const near = encodeURIComponent(`${params.city}, ${params.state}`)

    const res = await fetch(
      `https://api.foursquare.com/v3/places/search?query=${query}&near=${near}&limit=3&fields=fsq_id,name,rating,stats,tel,location,website,categories,verified`,
      {
        headers: {
          Authorization: key,
          Accept: 'application/json'
        },
        signal: AbortSignal.timeout(8000)
      }
    )

    if (!res.ok) return FALLBACK

    const data = await res.json() as FoursquareSearchResponse
    if (!data.results || data.results.length === 0) return FALLBACK

    const nameLower = params.businessName.toLowerCase()
    const best = data.results.find(r =>
      r.name.toLowerCase().includes(nameLower) ||
      nameLower.includes(r.name.toLowerCase())
    ) || data.results[0]

    return {
      found: true,
      fsqId: best.fsq_id,
      name: best.name,
      rating: best.rating ? best.rating / 2 : 0, // Foursquare rates 0-10, convert to 0-5
      reviewCount: best.stats?.total_ratings || 0,
      phone: best.tel || '',
      address: best.location?.address || '',
      city: best.location?.city || params.city,
      state: best.location?.region || params.state,
      zip: best.location?.postcode || '',
      website: best.website || '',
      categories: (best.categories || []).map(c => c.name),
      verified: best.verified || false,
      url: `https://foursquare.com/v/${best.fsq_id}`
    }
  } catch {
    return FALLBACK
  }
}

export async function lookupCompetitorOnFoursquare(params: {
  businessName: string
  city: string
  state: string
}): Promise<FoursquareBusinessData> {
  return lookupBusinessOnFoursquare(params)
}
