import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { ImageResponse } from 'next/og'
import { buildTrophyElement } from '@/lib/trophy-generator'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    const businessName = searchParams.get('business') || 'Your Business'
    const city = searchParams.get('city') || 'Your City'
    const trade = searchParams.get('trade') || 'hvac'
    const scoreBefore = parseInt(searchParams.get('before') || '0')
    const scoreAfter = parseInt(searchParams.get('after') || '0')
    const aiEngine = searchParams.get('engine') || 'ChatGPT'
    const queryText = searchParams.get('query') || `Best ${trade} in ${city}`

    const element = buildTrophyElement({
      businessName,
      city,
      trade,
      scoreBefore,
      scoreAfter,
      aiEngine,
      queryText
    })

    return new ImageResponse(element as React.ReactElement, {
      width: 1080,
      height: 1080
    })
  } catch (error) {
    console.error('Trophy generation error:', error)
    return NextResponse.json({ error: 'Failed to generate trophy' }, { status: 500 })
  }
}
