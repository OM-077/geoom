import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { pollServiceM8Jobs } from '@/lib/pipelines/servicem8'
import { processWorkizJobs } from '@/lib/pipelines/workiz'

export async function POST(req: NextRequest) {
  try {
    const { businessId, pipeline } = await req.json() as {
      businessId: string
      pipeline: 'workiz' | 'servicem8'
    }

    const { data: business } = await supabaseAdmin
      .from('businesses')
      .select('servicem8_api_key, workiz_api_token, subscription_status')
      .eq('id', businessId)
      .single()

    if (!business || business.subscription_status !== 'active') {
      return NextResponse.json({ skipped: true })
    }

    if (pipeline === 'servicem8' && business.servicem8_api_key) {
      await pollServiceM8Jobs({
        businessId,
        apiKey: business.servicem8_api_key
      })
    }

    if (pipeline === 'workiz' && business.workiz_api_token) {
      await processWorkizJobs({
        businessId,
        apiToken: business.workiz_api_token
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Pipeline job error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
