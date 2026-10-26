import { supabaseAdmin } from './supabase'
import { generateWithFailover, safeParseJSON } from './llm-failover'
import { getTradeLabel } from './utils'

// ============================================
// REVIEW ENGINE
// SMS generated after every completed job
// AI writes personalized per customer, per job
// Review velocity = direct AI citation driver
// Keyword coaching = trade + city in reviews
// More relevant reviews = higher AI market share
// ============================================

export async function getReviewVelocity(businessId: string): Promise<{
  total: number
  byPlatform: Record<string, { count: number; avgRating: number }>
  weeklyVelocity: number
  targetVelocity: number
  velocityStatus: 'good' | 'slow' | 'critical'
  unanswered: number
  recentReviews: Array<{
    id: string
    platform: string
    reviewer_name: string
    rating: number
    review_text: string
    responded: boolean
    created_at: string
  }>
}> {
  const { data: reviews } = await supabaseAdmin
    .from('reviews')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })

  if (!reviews || reviews.length === 0) {
    return {
      total: 0,
      byPlatform: {},
      weeklyVelocity: 0,
      targetVelocity: 5,
      velocityStatus: 'critical',
      unanswered: 0,
      recentReviews: []
    }
  }

  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  const weeklyVelocity = reviews.filter(r =>
    new Date(r.created_at) > oneWeekAgo
  ).length

  const byPlatform: Record<string, { count: number; avgRating: number }> = {}
  for (const review of reviews) {
    if (!byPlatform[review.platform]) {
      byPlatform[review.platform] = { count: 0, avgRating: 0 }
    }
    byPlatform[review.platform].count++
    byPlatform[review.platform].avgRating += review.rating || 0
  }
  for (const platform of Object.keys(byPlatform)) {
    byPlatform[platform].avgRating = Math.round(
      (byPlatform[platform].avgRating / byPlatform[platform].count) * 10
    ) / 10
  }

  const targetVelocity = 5
  const velocityStatus = weeklyVelocity >= targetVelocity ? 'good'
    : weeklyVelocity >= 2 ? 'slow' : 'critical'

  const unanswered = reviews.filter(r => !r.responded && r.review_text).length

  return {
    total: reviews.length,
    byPlatform,
    weeklyVelocity,
    targetVelocity,
    velocityStatus,
    unanswered,
    recentReviews: reviews.slice(0, 10)
  }
}

export async function generateReviewRequest(params: {
  businessId: string
  businessName: string
  trade: string
  customerName: string
  customerPhone: string
  customerEmail?: string
  jobType: string
  jobCity: string
  jobId?: string
}): Promise<{
  smsText: string
  emailSubject: string
  emailText: string
}> {
  const firstName = params.customerName.split(' ')[0] || 'there'
  const tradeLabel = getTradeLabel(params.trade)

  const prompt = `Write a personalized review request SMS and email for a home service contractor.

Business: ${params.businessName}
Trade: ${tradeLabel}
Customer first name: ${firstName}
Job completed: ${params.jobType} in ${params.jobCity}

CRITICAL RULES:
- SMS must be under 160 characters
- Sound like the contractor texted this personally — not automated
- Ask the customer to mention the specific service AND city in their review
- This is important because AI search engines prioritize reviews mentioning the trade and location
- Do not use exclamation marks more than once
- End SMS with [REVIEW_LINK] placeholder
- Email: 3 sentences max, genuine not corporate

Return as JSON:
{
  "sms": "...",
  "emailSubject": "...",
  "emailBody": "..."
}`

  const fallback = {
    sms: `Hi ${firstName}, thanks for choosing ${params.businessName} for your ${params.jobType} in ${params.jobCity}. If we did a great job, a quick Google review mentioning the service and ${params.jobCity} helps us a lot: [REVIEW_LINK]`,
    emailSubject: `How did we do, ${firstName}?`,
    emailBody: `Hi ${firstName}, thank you for trusting ${params.businessName} with your ${params.jobType} in ${params.jobCity}. If you have a moment, mentioning the service and ${params.jobCity} in a Google review helps other homeowners find us. Here is the link: [REVIEW_LINK]`
  }

  const { content } = await generateWithFailover({
    prompt,
    maxTokens: 400,
    temperature: 0.8,
    fallbackTemplate: JSON.stringify(fallback)
  })

  const parsed = safeParseJSON<typeof fallback>(content, fallback)

  const result = {
    smsText: parsed.sms || fallback.sms,
    emailSubject: parsed.emailSubject || fallback.emailSubject,
    emailText: parsed.emailBody || fallback.emailBody
  }

  await supabaseAdmin.from('review_requests').insert({
    business_id: params.businessId,
    customer_name: params.customerName,
    customer_phone: params.customerPhone,
    customer_email: params.customerEmail || null,
    job_type: params.jobType,
    job_city: params.jobCity,
    job_id: params.jobId || null,
    sms_text: result.smsText,
    email_text: `${result.emailSubject}\n\n${result.emailText}`,
    sent: false
  })

  return result
}

export async function generateReviewResponse(params: {
  businessName: string
  trade: string
  reviewerName: string
  rating: number
  reviewText: string
}): Promise<{
  empathetic: string
  professional: string
  gratitude: string
}> {
  const firstName = params.reviewerName.split(' ')[0] || 'there'
  const tradeLabel = getTradeLabel(params.trade)
  const isPositive = params.rating >= 4
  const isNegative = params.rating <= 2

  const prompt = `Write 3 different Google review responses for ${params.businessName}, a ${tradeLabel} contractor.

Reviewer: ${firstName}
Rating: ${params.rating}/5 stars
Review: "${params.reviewText}"

Write 3 responses:
1. EMPATHETIC: Warm, mentions something specific from the review
2. PROFESSIONAL: Concise, confident, business-focused
3. GRATITUDE: Thank-focused, invites referrals

Rules:
- Max 3 sentences each
- Use first name: ${firstName}
- ${isNegative ? 'Apologize sincerely, offer to make it right, include a request to call' : ''}
- ${isPositive ? 'Reinforce specifically what they loved' : ''}
- Sound like a real local contractor wrote this
- Never say "we apologize for any inconvenience"
- Include trade and city naturally where possible — this helps AI search

Return as JSON:
{
  "empathetic": "...",
  "professional": "...",
  "gratitude": "..."
}`

  const fallback = {
    empathetic: `Thank you so much, ${firstName}! We really appreciate you sharing your experience — it means everything to the team here at ${params.businessName}.`,
    professional: `Thank you for your review, ${firstName}. We appreciate your business and look forward to serving you again.`,
    gratitude: `${firstName}, thank you for choosing ${params.businessName}. Your kind words help other homeowners find us — we truly appreciate it.`
  }

  const { content } = await generateWithFailover({
    prompt,
    maxTokens: 600,
    temperature: 0.8,
    fallbackTemplate: JSON.stringify(fallback)
  })

  return safeParseJSON<typeof fallback>(content, fallback)
}

export async function analyseReviewKeywords(params: {
  businessId: string
  trade: string
  city: string
}): Promise<{
  mentionsTrade: number
  mentionsCity: number
  totalReviews: number
  qualityScore: number
  suggestion: string
}> {
  const { data: reviews } = await supabaseAdmin
    .from('reviews')
    .select('review_text')
    .eq('business_id', params.businessId)

  if (!reviews || reviews.length === 0) {
    return {
      mentionsTrade: 0,
      mentionsCity: 0,
      totalReviews: 0,
      qualityScore: 0,
      suggestion: `Ask customers to mention "${params.trade}" and "${params.city}" in their reviews — AI engines prioritize reviews with location and trade keywords`
    }
  }

  const tradeKeywords: Record<string, string[]> = {
    hvac: ['hvac', 'ac', 'air conditioning', 'furnace', 'heating', 'cooling'],
    plumbing: ['plumb', 'pipe', 'drain', 'water heater', 'toilet'],
    electrical: ['electric', 'wiring', 'outlet', 'panel', 'circuit'],
    roofing: ['roof', 'shingle', 'gutter', 'leak'],
    cleaning: ['clean', 'spotless', 'vacuum'],
    lawn: ['lawn', 'grass', 'landscape', 'yard'],
    pest: ['pest', 'bug', 'termite', 'rodent', 'exterminator']
  }

  const keywords = tradeKeywords[params.trade.toLowerCase()] || []
  const cityLower = params.city.toLowerCase()

  let mentionsTrade = 0
  let mentionsCity = 0

  for (const review of reviews) {
    const text = (review.review_text || '').toLowerCase()
    if (keywords.some(k => text.includes(k))) mentionsTrade++
    if (text.includes(cityLower)) mentionsCity++
  }

  const qualityScore = Math.round(
    ((mentionsTrade + mentionsCity) / (reviews.length * 2)) * 100
  )

  const suggestion = qualityScore < 50
    ? `When asking for reviews, say: "Could you mention that we helped with ${params.trade} in ${params.city}? It helps homeowners find us on ChatGPT and Google." AI citation rate increases 2-3x when reviews mention your trade and city.`
    : `Your reviews mention your trade and city well — keep sending personalized review requests after every job.`

  return {
    mentionsTrade,
    mentionsCity,
    totalReviews: reviews.length,
    qualityScore,
    suggestion
  }
}
