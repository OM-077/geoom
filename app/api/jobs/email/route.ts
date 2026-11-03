import { NextRequest, NextResponse } from 'next/server'
import { sendMondayEmail } from '@/lib/monday-email'

export async function POST(req: NextRequest) {
  try {
    const { businessId } = await req.json() as { businessId: string }
    const result = await sendMondayEmail(businessId)
    return NextResponse.json({ success: result.sent, emailId: result.emailId })
  } catch (error) {
    console.error('Email job error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
