import { NextRequest, NextResponse } from 'next/server'
import { exchangeJobberCode } from '@/lib/pipelines/jobber'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')

  if (!code || !state) {
    return NextResponse.redirect(
      new URL('/settings?error=jobber_failed', req.url)
    )
  }

  const result = await exchangeJobberCode(code, state)

  if (result.success) {
    return NextResponse.redirect(
      new URL('/settings?connected=jobber', req.url)
    )
  }

  return NextResponse.redirect(
    new URL('/settings?error=jobber_failed', req.url)
  )
}
