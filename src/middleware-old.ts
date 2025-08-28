import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const url = req.nextUrl
  const path = url.pathname

  // Always allow OPTIONS (CORS preflight)
  if (req.method === 'OPTIONS') return NextResponse.next()

  // Allow all public routes (no auth, no cookie checks)
  if (
    path.startsWith('/_next') ||
    path.startsWith('/_vercel') ||
    path.startsWith('/api') ||
    path.startsWith('/assets') ||
    path.startsWith('/auth') ||
    path.startsWith('/contact') ||
    path.startsWith('/__health') ||
    path.startsWith('/__debug') ||
    path === '/favicon.ico' ||
    path === '/robots.txt' ||
    path === '/sitemap.xml'
  ) {
    return NextResponse.next()
  }

  // Only protect dashboard and pitch routes
  if (!path.startsWith('/dashboard') && !path.startsWith('/pitch') && path !== '/role-selection') {
    return NextResponse.next()
  }

  // If we've got a one-shot skip guard, allow this request through
  const hasSkipGuard = url.searchParams.get('__skip_guard') === '1'
  if (hasSkipGuard) {
    return NextResponse.next()
  }

  // Read Supabase session cookies (Edge)
  const accessToken = req.cookies.get('sb-access-token')?.value
  const refreshToken = req.cookies.get('sb-refresh-token')?.value

  // Unauthenticated → /auth?redirect=<original>
  if (!accessToken && !refreshToken) {
    const to = new URL('/auth', url)
    const original = url.pathname + (url.search || '')
    to.searchParams.set('redirect', original)
    const res = NextResponse.redirect(to)
    res.headers.set('x-route-reason', 'unauth')
    return res
  }

  // If authenticated but no profile cookie, go to warmup
  const profCookie = req.cookies.get('x-prof')?.value
  if (!profCookie) {
    const to = new URL('/auth/warmup', url)
    to.searchParams.set('redirect', url.pathname + (url.search || ''))
    const res = NextResponse.redirect(to)
    res.headers.set('x-route-reason', 'need-warmup')
    return res
  }

  // Try to decode the profile cookie
  try {
    const prof = JSON.parse(Buffer.from(profCookie, 'base64').toString('utf-8'))
    const role = prof?.r as 'veteran'|'supporter'|'recruiter'|undefined
    const onboarding_complete = !!prof?.oc

    // Role selection required
    if (!role && path !== '/role-selection') {
      const to = new URL('/role-selection', url)
      const res = NextResponse.redirect(to)
      res.headers.set('x-route-reason', 'need-role')
      return res
    }

    // Veteran first-run Magic Mode
    if (role === 'veteran' && !onboarding_complete && !path.startsWith('/pitch/new')) {
      const to = new URL('/pitch/new', url)
      const res = NextResponse.redirect(to)
      res.headers.set('x-route-reason', 'need-onboarding')
      return res
    }

    // Handle /dashboard root path - redirect to role-specific dashboard
    if (path === '/dashboard') {
      const nextPath =
        role === 'veteran' ? '/dashboard/veteran' :
        role === 'recruiter' ? '/dashboard/recruiter' :
        '/dashboard/supporter'
      const to = new URL(nextPath, url)
      const res = NextResponse.redirect(to)
      res.headers.set('x-route-reason', 'role-redirect')
      return res
    }

    // Allow access to role-specific dashboards and other protected routes
    return NextResponse.next()
  } catch {
    // Bad or stale cookie → refresh via warmup
    const to = new URL('/auth/warmup', url)
    to.searchParams.set('redirect', url.pathname + (url.search || ''))
    const res = NextResponse.redirect(to)
    res.headers.set('x-route-reason', 'bad-prof-cookie')
    return res
  }
}

// Explicit matcher so middleware NEVER runs on /auth, assets, etc.
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/pitch/:path*',
    '/role-selection',
  ],
}
