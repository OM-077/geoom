import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  businessName: z.string().min(2).max(100),
  trade: z.enum(['hvac','plumbing','electrical','roofing','cleaning','lawn','pest']),
  city: z.string().min(2),
  state: z.string().min(2),
  competitorName: z.string().optional()
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    const { businessName, trade, city, state } = parsed.data
    const apiKey = process.env.GOOGLE_PLACES_API_KEY!

    // 1. Find business on Google Places
    const searchRes = await fetch(
      `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(`${businessName} ${city} ${state}`)}&inputtype=textquery&fields=place_id,name,rating,user_ratings_total,business_status,formatted_address&key=${apiKey}`
    )
    const searchData = await searchRes.json()
    const place = searchData.candidates?.[0] || null

    // 2. Get place details if found
    let details: Record<string, unknown> = {}
    if (place?.place_id) {
      const detailRes = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,rating,user_ratings_total,website,formatted_phone_number,opening_hours,types&key=${apiKey}`
      )
      const detailData = await detailRes.json()
      details = detailData.result || {}
    }

    // 3. Score based on real data
    const gbpFound = !!place
    const rating = (details.rating as number) || 0
    const reviewCount = (details.user_ratings_total as number) || 0
    const hasWebsite = !!(details.website)
    const hasPhone = !!(details.formatted_phone_number)
    const hasHours = !!(details.opening_hours)

    // Entity bucket (0-15)
    let entity = 0
    if (gbpFound) entity += 7
    if (hasPhone) entity += 2
    if (hasHours) entity += 2
    entity = Math.min(entity, 15)

    // Reviews bucket (0-15)
    let reviews = 0
    if (reviewCount >= 50) reviews = 12
    else if (reviewCount >= 25) reviews = 9
    else if (reviewCount >= 10) reviews = 6
    else if (reviewCount >= 5) reviews = 3
    else if (reviewCount >= 1) reviews = 1
    if (rating >= 4.5) reviews = Math.min(reviews + 3, 15)
    else if (rating >= 4.0) reviews = Math.min(reviews + 1, 15)

    // Schema bucket — unknown without website scrape, estimate low
    const schema_score = hasWebsite ? 4 : 1

    // Citations — unknown without full scan, estimate based on GBP
    const citations = gbpFound ? 6 : 2

    // Content — unknown, estimate low
    const content = hasWebsite ? 4 : 1

    // Freshness — unknown, estimate mid
    const freshness = gbpFound ? 5 : 2

    const buckets = { entity, schema: schema_score, reviews, citations, content, freshness }
    const score = Object.values(buckets).reduce((a, b) => a + b, 0)
    const estimatedCallsPerMonth = Math.round((score * 2 * 4) * 0.04)

    const fixes = []
    if (!gbpFound) fixes.push({ bucket: 'entity', title: 'Claim your Google Business Profile', impactPoints: 7, priority: 'critical' })
    if (reviewCount < 10) fixes.push({ bucket: 'reviews', title: 'Get your first 10 Google reviews', impactPoints: 5, priority: 'critical' })
    if (!hasWebsite) fixes.push({ bucket: 'content', title: 'Add your website to Google Business Profile', impactPoints: 4, priority: 'high' })
    fixes.push({ bucket: 'citations', title: 'Claim your Foursquare listing', impactPoints: 5, priority: 'critical' })
    fixes.push({ bucket: 'schema', title: 'Add LocalBusiness schema to your website', impactPoints: 7, priority: 'high' })

    return NextResponse.json({
      success: true,
      score,
      buckets,
      estimatedCallsPerMonth,
      businessName: place?.name || businessName,
      trade,
      city,
      gbpFound,
      rating,
      reviewCount,
      fixes: fixes.slice(0, 5)
    })

  } catch (error) {
    console.error('Free audit error:', error)
    return NextResponse.json({ error: 'Audit failed' }, { status: 500 })
  }
}
