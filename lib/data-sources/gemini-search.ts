// ============================================
// GEMINI SEARCH — Free business data lookup
// Uses Gemini Flash to research a business
// 1500 req/day free on Google AI Studio
// Returns structured business data for audit
// ============================================

export interface GeminiBusinessData {
  found: boolean
  businessName: string
  rating: number
  reviewCount: number
  hasWebsite: boolean
  hasPhone: boolean
  hasHours: boolean
  address: string
  phone: string
  website: string
  categories: string[]
  gbpLikely: boolean
  yelpLikely: boolean
  foursquareLikely: boolean
  bingLikely: boolean
  confidence: 'high' | 'medium' | 'low'
}

const FALLBACK: GeminiBusinessData = {
  found: false,
  businessName: '',
  rating: 0,
  reviewCount: 0,
  hasWebsite: false,
  hasPhone: false,
  hasHours: false,
  address: '',
  phone: '',
  website: '',
  categories: [],
  gbpLikely: false,
  yelpLikely: false,
  foursquareLikely: false,
  bingLikely: false,
  confidence: 'low'
}

export async function searchBusinessWithGemini(params: {
  businessName: string
  trade: string
  city: string
  state: string
}): Promise<GeminiBusinessData> {
  const key = process.env.GEMINI_API_KEY
  if (!key) return FALLBACK

  const prompt = `Research this home service contractor and return structured data about their online presence.

Business: "${params.businessName}"
Trade: ${params.trade}
Location: ${params.city}, ${params.state}

Look up what you know about this business and estimate:
1. Do they have a Google Business Profile (GBP)?
2. What is their approximate Google review count and rating?
3. Do they have a website?
4. Are they listed on Yelp?
5. Are they listed on Foursquare?
6. Are they listed on Bing Places?
7. Do they have consistent NAP (name, address, phone) across directories?

Return ONLY valid JSON — no markdown, no explanation:
{
  "found": boolean,
  "businessName": "exact name as found",
  "rating": number 0-5,
  "reviewCount": number,
  "hasWebsite": boolean,
  "hasPhone": boolean,
  "hasHours": boolean,
  "address": "street address or empty string",
  "phone": "phone number or empty string",
  "website": "url or empty string",
  "categories": ["category1"],
  "gbpLikely": boolean,
  "yelpLikely": boolean,
  "foursquareLikely": boolean,
  "bingLikely": boolean,
  "confidence": "high" or "medium" or "low"
}`

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 600, temperature: 0.1 }
        }),
        signal: AbortSignal.timeout(12000)
      }
    )
    if (!res.ok) return FALLBACK

    const data = await res.json() as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
    }
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

    const match = text.match(/\{[\s\S]*\}/)
    if (!match) return FALLBACK

    const parsed = JSON.parse(match[0]) as GeminiBusinessData
    return { ...FALLBACK, ...parsed }
  } catch {
    return FALLBACK
  }
}
