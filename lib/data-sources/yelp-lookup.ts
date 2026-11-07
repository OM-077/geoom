// ============================================
// YELP FUSION LOOKUP — Real business data
// 500 req/day free on Yelp Fusion API
// Best source: Perplexity uses Yelp data
// Returns real review count, rating, categories
// ============================================

export interface YelpBusinessData {
  found: boolean
  yelpId: string
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
  isClosed: boolean
  url: string
}

const FALLBACK: YelpBusinessData = {
  found: false,
  yelpId: '',
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
  isClosed: false,
  url: ''
}

interface YelpSearchResult {
  id: string
  name: string
  rating: number
  review_count: number
  phone: string
  location: {
    address1: string
    city: string
    state: string
    zip_code: string
  }
  url: string
  categories: Array<{ alias: string; title: string }>
  is_closed: boolean
}

interface YelpSearchResponse {
  businesses: YelpSearchResult[]
  total: number
}

export async function lookupBusinessOnYelp(params: {
  businessName: string
  city: string
  state: string
}): Promise<YelpBusinessData> {
  const key = process.env.YELP_API_KEY
  if (!key) return FALLBACK

  try {
    const query = encodeURIComponent(params.businessName)
    const location = encodeURIComponent(`${params.city}, ${params.state}`)

    const res = await fetch(
      `https://api.yelp.com/v3/businesses/search?term=${query}&location=${location}&limit=3`,
      {
        headers: {
          Authorization: `Bearer ${key}`,
          Accept: 'application/json'
        },
        signal: AbortSignal.timeout(8000)
      }
    )

    if (!res.ok) return FALLBACK

    const data = await res.json() as YelpSearchResponse
    if (!data.businesses || data.businesses.length === 0) return FALLBACK

    // Pick the best match — closest name
    const nameLower = params.businessName.toLowerCase()
    const best = data.businesses.find(b =>
      b.name.toLowerCase().includes(nameLower) ||
      nameLower.includes(b.name.toLowerCase())
    ) || data.businesses[0]

    return {
      found: true,
      yelpId: best.id,
      name: best.name,
      rating: best.rating || 0,
      reviewCount: best.review_count || 0,
      phone: best.phone || '',
      address: best.location?.address1 || '',
      city: best.location?.city || params.city,
      state: best.location?.state || params.state,
      zip: best.location?.zip_code || '',
      website: '',
      categories: (best.categories || []).map(c => c.title),
      isClosed: best.is_closed || false,
      url: best.url || ''
    }
  } catch {
    return FALLBACK
  }
}

// Competitor lookup — same function, different name for clarity
export async function lookupCompetitorOnYelp(params: {
  businessName: string
  city: string
  state: string
}): Promise<YelpBusinessData> {
  return lookupBusinessOnYelp(params)
}
