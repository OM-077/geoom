import { NextRequest, NextResponse } from 'next/server'
import {
  validateDriverToken,
  getDriverJobs,
  markDriverSmsSent
} from '@/lib/driver-engine'

export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const validation = await validateDriverToken(params.token)
    if (!validation.valid || !validation.businessId) {
      return NextResponse.json(
        { error: 'Invalid or expired driver link' },
        { status: 401 }
      )
    }

    const { jobs } = await getDriverJobs(validation.businessId)

    return NextResponse.json({
      valid: true,
      businessName: validation.businessName,
      trade: validation.trade,
      jobs
    })
  } catch (error) {
    console.error('Driver token GET error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const validation = await validateDriverToken(params.token)
    if (!validation.valid || !validation.businessId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { requestId } = await req.json()
    await markDriverSmsSent(requestId, validation.businessId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Driver token POST error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
