import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Public paths — no auth required
const PUBLIC_PATHS = [
  '/',
  '/login',
  '/signup',
  '/referral',          // referral landing (NOT /invite)
  '/score',             // public preview scan pages /score/[city]/[trade]
  '/api/webhooks',      // all webhook routes
  '/api/billing',       // DodoPayments webhook
  '/api/cron',          // cron jobs (auth by CRON_SECRET header)
  '/api/pipelines',     // FSM webhooks (jobber, housecall, servicem8, workiz)
  '/api/social-card',   // OG image generator (public)
  '/_next',
  '/favicon',
  '/robots.txt',
  '/sitemap.xml',
  '/llms.txt'
]

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(path => pathname.startsWith(path))
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const { pathname } = req.nextUrl

  // Always allow public paths
  if (isPublicPath(pathname)) return res

  // Auth check via Supabase
  const supabase = createMiddlewareClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|llms.txt).*)'
  ]
}
