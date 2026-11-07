export const dynamic = 'force-dynamic'

// ============================================
// COPILOT — Now with LIVE business context injected
// Every answer is specific to this contractor's
// actual score, weak buckets, and competitor gap
// Generic advice is useless — specific is gold
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase'
import { callAI } from '@/lib/copilot/ai-router'

const ALLOWED_TIERS = ['pro', 'founding']

const BUCKET_NAMES: Record<string, string> = {
  entity: 'Entity (GBP + directory listings)',
  schema: 'Schema markup',
  reviews: 'Reviews (velocity + keywords)',
  citations: 'Citations (NAP consistency)',
  content: 'Content (local service pages)',
  freshness: 'Freshness (recency signals)'
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: business } = await supabaseAdmin
      .from('businesses')
      .select('id, business_name, trade, city, state, pricing_tier, geoom_score')
      .eq('user_id', session.user.id)
      .single()

    if (!business) return NextResponse.json({ error: 'Business not found' }, { status: 404 })

    if (!ALLOWED_TIERS.includes(business.pricing_tier || '')) {
      return NextResponse.json(
        { error: 'Copilot requires Pro or Founding tier', requiresUpgrade: true },
        { status: 403 }
      )
    }

    const { message } = await req.json() as { message: string }

    if (!message || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    if (message.length > 2000) {
      return NextResponse.json({ error: 'Message too long (max 2000 chars)' }, { status: 400 })
    }

    // Fetch live audit data to inject into context
    const [auditResult, competitorResult, napResult, reviewResult] = await Promise.allSettled([
      supabaseAdmin
        .from('audit_results')
        .select('visibility_score, entity_score, schema_score, reviews_score, citations_score, content_score, freshness_score, fixes')
        .eq('business_id', business.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single(),
      supabaseAdmin
        .from('competitor_tracking')
        .select('competitor_name, competitor_score, competitor_market_share, competitor_advantages')
        .eq('business_id', business.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single(),
      supabaseAdmin
        .from('nap_scans')
        .select('consistency_percent, google_listed, foursquare_listed, yelp_listed, bing_listed')
        .eq('business_id', business.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single(),
      supabaseAdmin
        .from('reviews')
        .select('id')
        .eq('business_id', business.id)
    ])

    const audit = auditResult.status === 'fulfilled' ? auditResult.value.data : null
    const competitor = competitorResult.status === 'fulfilled' ? competitorResult.value.data : null
    const nap = napResult.status === 'fulfilled' ? napResult.value.data : null
    const reviewCount = reviewResult.status === 'fulfilled' ? (reviewResult.value.data?.length || 0) : 0

    // Find weakest bucket
    let weakestBucket = ''
    let weakestScore = 999
    if (audit) {
      const scores: Record<string, number> = {
        entity: audit.entity_score,
        schema: audit.schema_score,
        reviews: audit.reviews_score,
        citations: audit.citations_score,
        content: audit.content_score,
        freshness: audit.freshness_score
      }
      for (const [key, val] of Object.entries(scores)) {
        if (val < weakestScore) {
          weakestScore = val
          weakestBucket = key
        }
      }
    }

    // Build rich context block
    const contextLines = [
      `You are GeoOm Copilot — AI advisor for home service contractors who want to show up on ChatGPT, Siri, and Google AI.`,
      ``,
      `CONTRACTOR PROFILE:`,
      `- Business: ${business.business_name}`,
      `- Trade: ${business.trade}`,
      `- Location: ${business.city}, ${business.state}`,
      ``,
      audit ? [
        `CURRENT SCORES (out of max):`,
        `- Overall Geoom Score: ${audit.visibility_score}/100`,
        `- Entity: ${audit.entity_score}/15`,
        `- Schema: ${audit.schema_score}/15`,
        `- Reviews: ${audit.reviews_score}/15`,
        `- Citations: ${audit.citations_score}/20`,
        `- Content: ${audit.content_score}/20`,
        `- Freshness: ${audit.freshness_score}/15`,
        `- WEAKEST BUCKET: ${BUCKET_NAMES[weakestBucket] || weakestBucket}`,
      ].join('\n') : `Current score: ${business.geoom_score ?? 'unknown'}/100`,
      ``,
      competitor ? [
        `COMPETITOR INTEL:`,
        `- Competitor: ${competitor.competitor_name}`,
        `- Their score: ${competitor.competitor_score}/100`,
        `- Their market share: ${competitor.competitor_market_share}%`,
        `- Their advantages: ${(competitor.competitor_advantages as string[])?.slice(0, 2).join('; ')}`,
      ].join('\n') : '',
      ``,
      nap ? [
        `NAP STATUS:`,
        `- Consistency: ${nap.consistency_percent}%`,
        `- Google: ${nap.google_listed ? '✓' : '✗'}`,
        `- Foursquare: ${nap.foursquare_listed ? '✓' : '✗'} (ChatGPT data source)`,
        `- Yelp: ${nap.yelp_listed ? '✓' : '✗'} (Perplexity data source)`,
        `- Bing: ${nap.bing_listed ? '✓' : '✗'} (Copilot data source)`,
      ].join('\n') : '',
      ``,
      `Total reviews: ${reviewCount}`,
      ``,
      `INSTRUCTIONS:`,
      `- Answer the contractor's question using their ACTUAL data above`,
      `- Be specific — reference their real scores, not generic advice`,
      `- Under 200 words. Plain language, like a trusted advisor`,
      `- Always give one specific next action`,
    ].filter(Boolean).join('\n')

    const fullPrompt = `${contextLines}\n\nContractor question: ${message.trim()}\n\nAnswer:`

    const reply = await callAI(fullPrompt, {
      maxTokens: 400,
      temperature: 0.4
    })

    return NextResponse.json({ reply: reply.trim() })

  } catch (error) {
    console.error('Copilot error:', error)
    return NextResponse.json({ error: 'Copilot unavailable' }, { status: 500 })
  }
}
