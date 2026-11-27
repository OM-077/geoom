export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization')
    if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { queueAllWeeklyAudits } = await import('@/lib/job-queue')
    const { cleanExpiredCache } = await import('@/lib/audit-cache')

    const [auditResult] = await Promise.all([
      queueAllWeeklyAudits(),
      cleanExpiredCache()
    ])

    return NextResponse.json({ success: true, queued: auditResult.queued })
  } catch (error) {
    console.error('Weekly cron error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
