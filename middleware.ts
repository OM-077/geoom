import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()
  const path = req.nextUrl.pathname

  const publicPaths = ['/audit', '/auth', '/driver', '/invite', '/api']
  const isPublic = publicPaths.some(p => path.startsWith(p))

  const protectedPaths = [
    '/dashboard', '/onboarding', '/copilot',
    '/engine', '/reviews', '/competitors', '/settings'
  ]
  const isProtected = protectedPaths.some(p => path.startsWith(p))

  if (isPublic) return res
  if (!session && isProtected) {
    return NextResponse.redirect(new URL('/auth', req.url))
  }
  if (session && path === '/auth') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }
  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$).*)']
}
