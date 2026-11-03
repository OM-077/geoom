import { NextRequest, NextResponse } from 'next/server'
import { processHousecallWebhook } from '@/lib/pipelines/housecall'

export async function POST(
  req: NextRequest,
  { params }: { params: { businessId: string } }
) {
  try {
    const payload = await req.json()
    const result = await processHousecallWebhook({
      ...payload,
      businessId: params.businessId
    })
    return NextResponse.json({ received: true, ...result })
  } catch (error) {
    console.error('HCP webhook error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
