// ============================================
// NAP SCANNER
// Checks Name, Address, Phone consistency across 8 platforms
// Pure code — no AI needed for this
// Platform weights based on AI data source importance
// ============================================

import { supabaseAdmin } from './supabase'

export interface NAPData {
  businessName: string
  address: string
  city: string
  state: string
  zip: string
  phone: string
  website: string
}

export interface PlatformResult {
  key: string
  label: string
  listed: boolean
  napConsistent: boolean
  issues: string[]
  score: number
  maxScore: number
  impact: string
  editUrl: string
  claimUrl: string
}

export interface NAPScanResult {
  platforms: PlatformResult[]
  totalScore: number
  maxScore: number
  consistencyPercent: number
  topIssues: string[]
}

// Platform weights — higher = more AI data source importance
export const PLATFORM_WEIGHTS: Record<string, number> = {
  google: 6,
  foursquare: 4,
  yelp: 3,
  bing: 2,
  apple: 2,
  bbb: 1,
  angi: 1,
  homeadvisor: 1
}

export const PLATFORM_META: Record<string, {
  label: string
  impact: string
  editUrl: string
  claimUrl: string
}> = {
  google: {
    label: 'Google Business Profile',
    impact: 'ChatGPT, Gemini, and all AI engines verify GBP data first. Most important fix.',
    editUrl: 'https://business.google.com/dashboard',
    claimUrl: 'https://business.google.com/create'
  },
  foursquare: {
    label: 'Foursquare',
    impact: 'ChatGPT uses Foursquare data for local business recommendations. Highest-impact fix after GBP.',
    editUrl: 'https://business.foursquare.com',
    claimUrl: 'https://business.foursquare.com/claim'
  },
  yelp: {
    label: 'Yelp',
    impact: 'Perplexity uses Yelp as its primary local data source. Consistent Yelp data = more AI citations.',
    editUrl: 'https://biz.yelp.com/login',
    claimUrl: 'https://biz.yelp.com/claim'
  },
  bing: {
    label: 'Bing Places',
    impact: 'Microsoft Copilot reads Bing Places directly. Essential for Windows and Edge users.',
    editUrl: 'https://www.bingplaces.com',
    claimUrl: 'https://www.bingplaces.com'
  },
  apple: {
    label: 'Apple Business Connect',
    impact: 'Siri, Apple Maps, and iOS Spotlight recommendations come from Apple Business Connect.',
    editUrl: 'https://businessconnect.apple.com',
    claimUrl: 'https://businessconnect.apple.com/claim'
  },
  bbb: {
    label: 'Better Business Bureau',
    impact: 'AI engines use BBB as a trust verification signal — being listed confirms legitimacy.',
    editUrl: 'https://www.bbb.org/business-login',
    claimUrl: 'https://www.bbb.org/request-a-business-profile'
  },
  angi: {
    label: 'Angi',
    impact: 'Angi is a top-cited source for home service AI recommendations. Critical for HVAC, plumbing, electrical.',
    editUrl: 'https://pro.angi.com',
    claimUrl: 'https://pro.angi.com/signup'
  },
  homeadvisor: {
    label: 'HomeAdvisor',
    impact: 'HomeAdvisor data feeds multiple AI recommendation engines for home services.',
    editUrl: 'https://pro.homeadvisor.com',
    claimUrl: 'https://pro.homeadvisor.com/account/login'
  }
}

// Normalize a string for comparison: lowercase, strip punctuation, collapse spaces
function normalize(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// Phone normalization: digits only
function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '')
}

// Check if two NAP strings are consistent (fuzzy match)
function isConsistent(a: string, b: string): boolean {
  if (!a || !b) return false
  const na = normalize(a)
  const nb = normalize(b)
  if (na === nb) return true
  // Allow one to be a subset of the other (e.g. "LLC" suffix differences)
  return na.includes(nb) || nb.includes(na)
}

// Simulate platform check from stored scan data
// In production: replace each with a real API call or scrape result
function checkPlatformConsistency(
  platformData: Record<string, unknown> | null,
  masterNAP: NAPData,
  platformKey: string
): { listed: boolean; napConsistent: boolean; issues: string[] } {
  if (!platformData) {
    return { listed: false, napConsistent: false, issues: [`Not listed on ${PLATFORM_META[platformKey]?.label}`] }
  }

  const listed = !!(platformData[`${platformKey}_listed`])
  if (!listed) {
    return { listed: false, napConsistent: false, issues: [`Not listed on ${PLATFORM_META[platformKey]?.label}`] }
  }

  const issues: string[] = []
  let consistent = true

  const storedName = (platformData[`${platformKey}_name`] as string) || ''
  const storedPhone = (platformData[`${platformKey}_phone`] as string) || ''
  const storedAddress = (platformData[`${platformKey}_address`] as string) || ''

  if (storedName && !isConsistent(storedName, masterNAP.businessName)) {
    issues.push(`Name mismatch: "${storedName}" vs "${masterNAP.businessName}"`)
    consistent = false
  }

  if (storedPhone) {
    const normStored = normalizePhone(storedPhone)
    const normMaster = normalizePhone(masterNAP.phone)
    if (normStored !== normMaster && normStored.length > 0 && normMaster.length > 0) {
      issues.push(`Phone mismatch: ${storedPhone} vs ${masterNAP.phone}`)
      consistent = false
    }
  }

  if (storedAddress && !isConsistent(storedAddress, `${masterNAP.address} ${masterNAP.city} ${masterNAP.state}`)) {
    issues.push(`Address mismatch on ${PLATFORM_META[platformKey]?.label}`)
    consistent = false
  }

  return { listed: true, napConsistent: consistent, issues }
}

export async function runNAPScan(businessId: string): Promise<NAPScanResult> {
  const { data: business } = await supabaseAdmin
    .from('businesses')
    .select('*')
    .eq('id', businessId)
    .single()

  if (!business) throw new Error('Business not found')

  // Get latest stored NAP scan data
  const { data: scanData } = await supabaseAdmin
    .from('nap_scans')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const latestScan = scanData as Record<string, unknown> | null

  const masterNAP: NAPData = {
    businessName: business.business_name,
    address: business.address || '',
    city: business.city,
    state: business.state,
    zip: business.zip || '',
    phone: business.phone || '',
    website: business.website || ''
  }

  const platforms: PlatformResult[] = []
  let totalScore = 0
  const allIssues: string[] = []

  for (const [key, maxScore] of Object.entries(PLATFORM_WEIGHTS)) {
    const meta = PLATFORM_META[key]
    const check = checkPlatformConsistency(latestScan, masterNAP, key)

    let score = 0
    if (check.listed && check.napConsistent) {
      score = maxScore
    } else if (check.listed && !check.napConsistent) {
      score = Math.floor(maxScore * 0.5)
    }

    totalScore += score
    allIssues.push(...check.issues)

    platforms.push({
      key,
      label: meta.label,
      listed: check.listed,
      napConsistent: check.napConsistent,
      issues: check.issues,
      score,
      maxScore,
      impact: meta.impact,
      editUrl: meta.editUrl,
      claimUrl: meta.claimUrl
    })
  }

  const maxPossible = Object.values(PLATFORM_WEIGHTS).reduce((a, b) => a + b, 0)
  const consistencyPercent = Math.round((totalScore / maxPossible) * 100)

  // Persist scan result
  await supabaseAdmin.from('nap_scans').insert({
    business_id: businessId,
    total_score: totalScore,
    max_score: maxPossible,
    consistency_percent: consistencyPercent,
    platform_results: platforms,
    created_at: new Date().toISOString()
  })

  return {
    platforms,
    totalScore,
    maxScore: maxPossible,
    consistencyPercent,
    topIssues: allIssues.slice(0, 5)
  }
}

export async function getNAPStatus(businessId: string): Promise<NAPScanResult | null> {
  const { data } = await supabaseAdmin
    .from('nap_scans')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!data) return null

  return {
    platforms: (data.platform_results as PlatformResult[]) || [],
    totalScore: data.total_score || 0,
    maxScore: data.max_score || 20,
    consistencyPercent: data.consistency_percent || 0,
    topIssues: []
  }
}
