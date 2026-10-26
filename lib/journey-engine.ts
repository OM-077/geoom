import { supabaseAdmin } from './supabase'

// ============================================
// JOURNEY ENGINE
// Logs every score-changing action automatically
// Shows contractor exactly what caused growth
// "Jan 18 — +8% — Fixed Foursquare listing"
// This is the anti-churn weapon
// When they see cause → effect they never leave
// ============================================

export const JOURNEY_EVENTS = {
  GBP_CONNECTED: 'gbp_connected',
  GBP_UPDATED: 'gbp_updated',
  NAP_PLATFORM_FIXED: 'nap_platform_fixed',
  CONTENT_PAGE_PUBLISHED: 'content_page_published',
  PIPELINE_CONNECTED: 'pipeline_connected',
  AUDIT_SCORE_INCREASE: 'audit_score_increase',
  FIRST_CITATION: 'first_citation',
  REVIEW_RECEIVED: 'review_received',
  COMPETITOR_TRACKED: 'competitor_tracked',
  REVIEW_REQUEST_SENT: 'review_request_sent'
} as const

export type JourneyEventType = typeof JOURNEY_EVENTS[keyof typeof JOURNEY_EVENTS]

export async function logJourneyEvent(params: {
  businessId: string
  eventType: JourneyEventType
  pointsGained: number
  description: string
  metadata?: Record<string, unknown>
}): Promise<void> {
  try {
    await supabaseAdmin.from('journey_events').insert({
      business_id: params.businessId,
      event_type: params.eventType,
      points_gained: params.pointsGained,
      description: params.description,
      metadata: params.metadata || {}
    })
  } catch (err) {
    // Non-critical — log but never throw
    console.error('Journey log error:', err)
  }
}

export async function getJourneyTimeline(businessId: string): Promise<{
  events: Array<{
    id: string
    event_type: string
    points_gained: number
    description: string
    metadata: Record<string, unknown>
    created_at: string
  }>
  totalPointsGained: number
}> {
  const { data: events } = await supabaseAdmin
    .from('journey_events')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (!events?.length) return { events: [], totalPointsGained: 0 }

  const totalPointsGained = events.reduce((sum, e) => sum + (e.points_gained || 0), 0)

  return {
    events: events as Array<{
      id: string
      event_type: string
      points_gained: number
      description: string
      metadata: Record<string, unknown>
      created_at: string
    }>,
    totalPointsGained
  }
}
