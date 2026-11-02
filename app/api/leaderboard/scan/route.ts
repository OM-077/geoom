// ============================================
// LEADERBOARD SCAN API ROUTE
// Triggers leaderboard scanner for one or all city+trade combos
// Protected by CRON_SECRET
// Called by: Vercel cron daily, or manually for a specific market
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { scanLeaderboard, scanAllTargets } from '@/lib/leaderboard/scanner'

export const maxDuration = 300 // 5 min — scanning 20 targets takes time

export async function POST(req: NextRequest) {
  // Auth — cron secret only
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({})) as {
    city?: string
    trade?: string
    all?: boolean
  }

  // Scan a specific market
  if (body.city && body.trade) {
    const result = await scanLeaderboard(body.city, body.trade)
    return NextResponse.json(result)
  }

  // Scan all targets
  if (body.all) {
    await scanAllTargets()
    return NextResponse.json({ success: true, message: 'All targets scanned' })
  }

  return NextResponse.json(
    { error: 'Provide city+trade or all:true' },
    { status: 400 }
  )
}

// Vercel cron handler (runs daily at 3am UTC)
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await scanAllTargets()
  return NextResponse.json({ success: true })
}
