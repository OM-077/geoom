import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { runFreeAudit } from '@/lib/free-audit-engine'

export const dynamic = 'force-dynamic'

const schema = z.object({
  businessName: z.string().min(2).max(100),
  // city can be "Austin, TX" or just "Austin" — we split it
  city: z.string().min(2),
  // trade and state are optional — we infer them if missing
  trade: z.string().optional(),
  state: z.string().optional(),
})

// Guess trade from business name
function inferTrade(name: string): string {
  const n = name.toLowerCase()
  if (n.includes('hvac') || n.includes('heat') || n.includes('cool') || n.includes('air')) return 'hvac'
  if (n.includes('plumb') || n.includes('pipe') || n.includes('drain')) return 'plumbing'
  if (n.includes('electric') || n.includes('wiring')) return 'electrical'
  if (n.includes('roof')) return 'roofing'
  if (n.includes('clean') || n.includes('maid')) return 'cleaning'
  if (n.includes('lawn') || n.includes('landscape') || n.includes('mow')) return 'lawn'
  if (n.includes('pest') || n.includes('exterminate') || n.includes('bug')) return 'pest'
  return 'hvac' // default
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    const { businessName, city } = parsed.data

    // Split "Austin, TX" → city="Austin", state="TX"
    const parts = city.split(',').map(s => s.trim())
    const cityName = parts[0] || city
    const state = parsed.data.state || parts[1] || 'US'
    const trade = parsed.data.trade || inferTrade(businessName)

    const result = await runFreeAudit({ businessName, city: cityName, state, trade })
    return NextResponse.json({ success: true, ...result })

  } catch (error) {
    console.error('Free audit error:', error)
    return NextResponse.json({ error: 'Audit failed' }, { status: 500 })
  }
}
