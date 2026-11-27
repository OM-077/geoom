export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization')
    if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Lightweight ping to keep Supabase free tier active
    const { supabaseAdmin } = await import('@/lib/supabase')
    await supabaseAdmin.from('businesses').select('id').limit(1)

    return NextResponse.json({
      success: true,
      pinged_at: new Date().toISOString()
    })
  } catch (error) {
    console.error('DB ping error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
