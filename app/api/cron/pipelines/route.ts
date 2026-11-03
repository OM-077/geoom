import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { queuePipelinePoll } from '@/lib/job-queue'

export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization')
    if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: businesses } = await supabaseAdmin
      .from('businesses')
      .select('id, servicem8_api_key, workiz_api_token')
      .eq('subscription_status', 'active')

    if (!businesses?.length) return NextResponse.json({ queued: 0 })

    let queued = 0

    for (const business of businesses) {
      if (business.servicem8_api_key) {
        await queuePipelinePoll(business.id, 'servicem8')
        queued++
      }
      if (business.workiz_api_token) {
        await queuePipelinePoll(business.id, 'workiz')
        queued++
      }
    }

    return NextResponse.json({ success: true, queued })
  } catch (error) {
    console.error('Pipeline cron error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
