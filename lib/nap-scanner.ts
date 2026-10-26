import { supabaseAdmin } from './supabase'

// ============================================
// NAP SCANNER — NAME ADDRESS PHONE
// Checks 8 platforms for consistency
// Foursquare = 70% of ChatGPT local data
// Inconsistent NAP = AI does not trust you
// Every fixed platform = higher AI citations
// ============================================

const PLATFORM_WEIGHTS: Record<string, number> = {
  google: 15,    // Highest — GBP is everything
  foursquare: 12, // ChatGPT pulls 70% of data here
  yelp: 10,      // Perplexity primary source
  bing: 8,       // Microsoft Bing Chat / Copilot
  apple: 8,      // Apple Maps / Siri
  bbb: 6,        // Trust signal for AI
  angi: 5,       // Home service specific
  homeadvisor: 5 // Home service specific
}

export interface PlatformStatus {
  status: 'consistent' | 'mismatch' | 'missing' | 'unknown'
  points: number
  manually_verified?: boolean
  verified_at?: string
}

export async function runNAPScan(params: {
  businessId: string
  businessName: string
  trade: string
  city: string
  state: string
  phone: string
  address: string
  website: string
}): Promise<{
  overallScore: number
  platforms: Record<string, PlatformStatus>
  issues: string[]
  priorityFixes: Array<{ platform: string; points: number; impact: string }>
}> {

  // Get existing scan to preserve manually verified platforms
  const { data: existingScan } = await supabaseAdmin
    .from('nap_scans')
    .select('platforms_status')
    .eq('business_id', params.businessId)
    .single()

  const existingStatus = (existingScan?.platforms_status || {}) as Record<string, PlatformStatus>

  // Build platform status
  // Start with existing verified platforms
  // Unverified platforms start as 'unknown'
  const platforms: Record<string, PlatformStatus> = {}

  for (const [platform, weight] of Object.entries(PLATFORM_WEIGHTS)) {
    const existing = existingStatus[platform]

    if (existing?.manually_verified) {
      // Keep manually verified platforms
      platforms[platform] = existing
    } else {
      // Unknown until contractor checks via Copilot HUD
      platforms[platform] = {
        status: 'unknown',
        points: weight
      }
    }
  }

  // Calculate score from verified platforms only
  let score = 0
  const issues: string[] = []
  const priorityFixes: Array<{ platform: string; points: number; impact: string }> = []

  for (const [platform, status] of Object.entries(platforms)) {
    if (status.status === 'consistent' && status.manually_verified) {
      score += PLATFORM_WEIGHTS[platform]
    } else if (status.status !== 'consistent') {
      const platformName = platform.charAt(0).toUpperCase() + platform.slice(1)
      const weight = PLATFORM_WEIGHTS[platform]

      const impacts: Record<string, string> = {
        google: 'ChatGPT and all AI engines verify GBP first',
        foursquare: 'ChatGPT pulls 70% of local business data from Foursquare',
        yelp: 'Perplexity uses Yelp as primary local data source',
        bing: 'Microsoft Copilot reads Bing Places directly',
        apple: 'Siri and Apple Maps citations come from here',
        bbb: 'AI engines use BBB as trust verification signal',
        angi: 'Angi is a top cited source for home service AI recommendations',
        homeadvisor: 'HomeAdvisor data feeds multiple AI recommendation engines'
      }

      issues.push(`${platformName}: Not yet verified`)
      priorityFixes.push({
        platform: platformName,
        points: weight,
        impact: impacts[platform] || `Important citation source for AI engines`
      })
    }
  }

  // Sort priority fixes by impact (points)
  priorityFixes.sort((a, b) => b.points - a.points)

  // Update database
  await supabaseAdmin
    .from('nap_scans')
    .upsert({
      business_id: params.businessId,
      nap_score: Math.min(score, 100),
      platforms_status: platforms,
      issues_found: issues.length,
      updated_at: new Date().toISOString()
    }, { onConflict: 'business_id' })

  return {
    overallScore: Math.min(score, 100),
    platforms,
    issues,
    priorityFixes
  }
}

export async function markPlatformFixed(params: {
  businessId: string
  platform: string
}): Promise<{ success: boolean; pointsGained: number; newScore: number }> {
  try {
    const { data: scan } = await supabaseAdmin
      .from('nap_scans')
      .select('platforms_status, nap_score')
      .eq('business_id', params.businessId)
      .single()

    if (!scan) return { success: false, pointsGained: 0, newScore: 0 }

    const platforms = (scan.platforms_status || {}) as Record<string, PlatformStatus>
    const platform = params.platform.toLowerCase()

    const wasFixed = platforms[platform]?.status === 'consistent'
    const pointsForPlatform = PLATFORM_WEIGHTS[platform] || 5

    platforms[platform] = {
      status: 'consistent',
      points: pointsForPlatform,
      manually_verified: true,
      verified_at: new Date().toISOString()
    }

    // Recalculate score
    let newScore = 0
    for (const [p, status] of Object.entries(platforms)) {
      if (status.status === 'consistent') {
        newScore += PLATFORM_WEIGHTS[p] || 0
      }
    }
    newScore = Math.min(newScore, 100)

    await supabaseAdmin
      .from('nap_scans')
      .update({
        platforms_status: platforms,
        nap_score: newScore,
        updated_at: new Date().toISOString()
      })
      .eq('business_id', params.businessId)

    return {
      success: true,
      pointsGained: wasFixed ? 0 : pointsForPlatform,
      newScore
    }
  } catch (error) {
    console.error('Mark platform fixed error:', error)
    return { success: false, pointsGained: 0, newScore: 0 }
  }
}
