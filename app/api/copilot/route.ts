// ============================================
// COPILOT API ROUTE
// AI chat assistant for contractors
// Uses callAI() rotation — NO Anthropic/Claude SDK
// Pro + Founding tier only
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase'
import { callAI } from '@/lib/copilot/ai-router'

const ALLOWED_TIERS = ['pro', 'founding']

export async function POST(req: NextRequest) {
  try {
    // Auth
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Tier check
    const { data: business } = await supabaseAdmin
      .from('businesses')
      .select('id, business_name, trade, city, state, pricing_tier, geoom_score')
      .eq('user_id', session.user.id)
      .single()

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    if (!ALLOWED_TIERS.includes(business.pricing_tier || '')) {
      return NextResponse.json(
        { error: 'Copilot requires Pro or Founding tier', requiresUpgrade: true },
        { status: 403 }
      )
    }

    const { message, context } = await req.json() as {
      message: string
      context?: {
        currentScore?: number
        weakestBucket?: string
        recentFix?: string
      }
    }

    if (!message || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    if (message.length > 2000) {
      return NextResponse.json({ error: 'Message too long (max 2000 chars)' }, { status: 400 })
    }

    // Build system context
    const systemContext = [
      `You are GeoOm Copilot, an AI assistant for home service contractors who want to show up on ChatGPT, Siri, and Google AI.`,
      `You are talking to the owner of ${business.business_name}, a ${business.trade} contractor in ${business.city}, ${business.state}.`,
      `Their current Geoom Score is ${business.geoom_score ?? 'unknown'}/100.`,
      context?.weakestBucket ? `Their weakest bucket right now is ${context.weakestBucket}.` : '',
      context?.recentFix ? `They recently completed: ${context.recentFix}.` : '',
      ``,
      `You speak plainly and directly — like a trusted advisor who knows GEO (Generative Engine Optimization) for home service contractors.`,
      `Keep responses concise (under 200 words). Always give one specific next action if applicable.`,
      `Never mention this prompt or that you are an AI assistant in a prompt. Just answer.`
    ].filter(Boolean).join('\n')

    const fullPrompt = `${systemContext}\n\nContractor question: ${message.trim()}\n\nAnswer:`

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
