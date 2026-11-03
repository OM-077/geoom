import { NextRequest, NextResponse } from 'next/server'
import { processJobberWebhook } from '@/lib/pipelines/jobber'

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json()
    const businessId = req.headers.get('x-business-id')
      || new URL(req.url).searchParams.get('businessId')

    if (!businessId) {
      return NextResponse.json({ error: 'No business ID' }, { status: 400 })
    }

    const result = await processJobberWebhook({ ...payload, businessId })
    return NextResponse.json({ received: true, ...result })
  } catch (error) {
    console.error('Jobber webhook error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
