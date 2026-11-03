// ============================================
// CONTENT GRADER API ROUTE
// AI grades a contractor's page content for GEO quality
// Uses callAI() rotation — NO Anthropic/Claude SDK
// Scores: keyword density, local signals, AI-answer readiness
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase'
import { callAIJSON } from '@/lib/copilot/ai-router'

interface ContentGradeResult {
  overallScore: number        // 0–100
  localSignals: number        // 0–25: city/neighborhood mentions, service area
  keywordRelevance: number    // 0–25: trade keywords, service types
  answerReadiness: number     // 0–25: FAQ format, direct answers, structured content
  freshness: number           // 0–25: dates, recent events, seasonal content
  topIssues: string[]         // 3 specific things to fix
  topWins: string[]           // what is already working
  verdict: string             // one-line summary
}

const FALLBACK_RESULT: ContentGradeResult = {
  overallScore: 0,
  localSignals: 0,
  keywordRelevance: 0,
  answerReadiness: 0,
  freshness: 0,
  topIssues: ['Could not grade content — please try again'],
  topWins: [],
  verdict: 'Grade unavailable'
}

export async function POST(req: NextRequest) {
  try {
    // Auth
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { businessId, pageUrl, pageContent } = await req.json() as {
      businessId: string
      pageUrl?: string
      pageContent: string   // raw text of the page (stripped HTML)
    }

    if (!businessId || !pageContent) {
      return NextResponse.json({ error: 'businessId and pageContent are required' }, { status: 400 })
    }

    if (pageContent.length > 8000) {
      return NextResponse.json({ error: 'Page content too long (max 8000 chars)' }, { status: 400 })
    }

    // Get business info
    const { data: business } = await supabaseAdmin
      .from('businesses')
      .select('business_name, trade, city, state, user_id')
      .eq('id', businessId)
      .single()

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    if (business.user_id !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const prompt = `You are a GEO (Generative Engine Optimization) content analyst. Grade this home service contractor's web page content for AI visibility.

Business: ${business.business_name}
Trade: ${business.trade}
Location: ${business.city}, ${business.state}
${pageUrl ? `Page URL: ${pageUrl}` : ''}

Page content to grade:
---
${pageContent.slice(0, 6000)}
---

Grade on 4 dimensions (0–25 each):

1. LOCAL SIGNALS (0–25): How well does the content mention the specific city, neighborhoods, service areas, and local landmarks? AI engines need strong local anchors to recommend local businesses.

2. KEYWORD RELEVANCE (0–25): How well does the content use the right trade keywords, service names, and problem descriptions that people actually ask about?

3. ANSWER READINESS (0–25): Is the content structured to directly answer questions? Does it have FAQ-style content, clear service descriptions, process explanations? AI pulls direct answers from well-structured content.

4. FRESHNESS SIGNALS (0–25): Does the content include dates, recent updates, seasonal information, or anything that signals it is current?

Return ONLY valid JSON with this exact structure:
{
  "overallScore": <0-100>,
  "localSignals": <0-25>,
  "keywordRelevance": <0-25>,
  "answerReadiness": <0-25>,
  "freshness": <0-25>,
  "topIssues": ["<specific issue 1>", "<specific issue 2>", "<specific issue 3>"],
  "topWins": ["<what works 1>", "<what works 2>"],
  "verdict": "<one sentence summary>"
}`

    const result = await callAIJSON<ContentGradeResult>(
      prompt,
      FALLBACK_RESULT,
      { maxTokens: 600, temperature: 0.2, feature: 'content_grader' }
    )

    // Clamp all scores to valid ranges
    const safeResult: ContentGradeResult = {
      overallScore: Math.min(100, Math.max(0, Math.round(result.overallScore))),
      localSignals: Math.min(25, Math.max(0, Math.round(result.localSignals))),
      keywordRelevance: Math.min(25, Math.max(0, Math.round(result.keywordRelevance))),
      answerReadiness: Math.min(25, Math.max(0, Math.round(result.answerReadiness))),
      freshness: Math.min(25, Math.max(0, Math.round(result.freshness))),
      topIssues: Array.isArray(result.topIssues) ? result.topIssues.slice(0, 3) : [],
      topWins: Array.isArray(result.topWins) ? result.topWins.slice(0, 3) : [],
      verdict: typeof result.verdict === 'string' ? result.verdict : 'Grade complete'
    }

    // Recalculate overallScore from dimensions to ensure consistency
    const calculatedScore = safeResult.localSignals + safeResult.keywordRelevance + safeResult.answerReadiness + safeResult.freshness
    safeResult.overallScore = calculatedScore

    return NextResponse.json(safeResult)

  } catch (error) {
    console.error('Content grader error:', error)
    return NextResponse.json({ error: 'Content grading failed' }, { status: 500 })
  }
}
