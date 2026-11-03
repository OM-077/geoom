import { NextRequest, NextResponse } from 'next/server'
import { exchangeGBPCode } from '@/lib/gbp-oauth'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')

  if (!code || !state) {
    return NextResponse.redirect(
      new URL('/dashboard?error=gbp_failed', req.url)
    )
  }

  const result = await exchangeGBPCode(code, state)

  if (result.success) {
    return NextResponse.redirect(
      new URL('/dashboard?connected=gbp', req.url)
    )
  }

  return NextResponse.redirect(
    new URL('/dashboard?error=gbp_failed', req.url)
  )
}
