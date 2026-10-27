import { NextRequest, NextResponse } from 'next/server'
import { getReferralByCode } from '@/lib/referral-engine'

export async function GET(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const result = await getReferralByCode(params.code)
    if (!result.valid) {
      return NextResponse.json({ valid: false }, { status: 404 })
    }
    return NextResponse.json({ valid: true, referrerName: result.referrerName })
  } catch (error) {
    console.error('Referral code error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
