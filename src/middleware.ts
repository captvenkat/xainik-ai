import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Public paths: middleware must NEVER run logic on these
const PUBLIC_PATHS = [
  '/auth', '/auth/', '/auth/callback', '/auth/warmup',
  '/contact',
  '/__health', '/__debug', '/__debug/headers',
  '/favicon.ico', '/robots.txt', '/sitemap.xml',
]

// Only guard these app areas
const PROTECTED_PREFIXES = ['/dashboard', '/pitch', '/role-selection']

export function middleware(req: NextRequest) {
  const url = req.nextUrl
  const path = url.pathname
  const method = req.method

  // Always allow OPTIONS (CORS preflight)
  if (method === 'OPTIONS') return NextResponse.next()

  // Allow all public routes (no auth, no cookie checks)
  if (
    PUBLIC_PATHS.some(p => path === p || path.startsWith(p + '/')) ||
    path.startsWith('/_next') ||
    path.startsWith('/_vercel') ||
    path.startsWith('/api') ||
    path.startsWith('/assets')
  ) {
    return NextResponse.next()
  }

  // Only protect listed prefixes
  const isProtected = PROTECTED_PREFIXES.some((p) => path.startsWith(p))
  if (!isProtected) return NextResponse.next()

  // If we've got a one-shot skip guard, allow this request through
  const hasSkipGuard = url.searchParams.get('__skip_guard') === '1'
  if (hasSkipGuard) {
    // Optionally you could strip the param by redirecting to the same path without it,
    // but allowing it through avoids another redirect hop.
    return NextResponse.next()
  }

  // Read Supabase session cookies (Edge)
  const accessToken = req.cookies.get('sb-access-token')?.value
  const refreshToken = req.cookies.get('sb-refresh-token')?.value

  // Unauthenticated → /auth?redirect=<original>
  if (!accessToken && !refreshToken) {
    const to = new URL('/auth', url)
    // preserve original query and add redirect
    const original = url.pathname + (url.search || '')
    to.searchParams.set('redirect', original)
    const res = NextResponse.redirect(to)
    res.headers.set('x-route-reason', 'unauth')
    return res
  }

  // If authenticated but no profile cookie, go to warmup (NOT /auth)
  const profCookie = req.cookies.get('x-prof')?.value
  if (!profCookie) {
    // Build a redirect target with a one-shot skip flag
    const original = new URL(url) // clone
    original.searchParams.set('__skip_guard', '1')
    const redirectTarget = original.pathname + original.search

    const to = new URL('/auth/warmup', url)
    to.searchParams.set('redirect', redirectTarget)

    const res = NextResponse.redirect(to)
    res.headers.set('x-route-reason', 'need-warmup')
    return res
  }

  // Edge-safe base64url decode
  function decodeBase64Url(str: string) {
    const b64 = str.replace(/-/g, '+').replace(/_/g, '/')
    const pad = b64.length % 4 ? 4 - (b64.length % 4) : 0
    const padded = b64 + '='.repeat(pad)
    const bin = globalThis.atob(padded)
    const bytes = new Uint8Array(bin.length)
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
    return new TextDecoder().decode(bytes)
  }

  try {
    const prof = JSON.parse(decodeBase64Url(profCookie))
    const role = prof?.role as 'veteran'|'supporter'|'recruiter'|undefined
    const onboarding_complete = !!prof?.onboarding_complete

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

    // Role-based dashboard redirect from /dashboard
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

    return NextResponse.next()
  } catch {
    // Bad or stale cookie → refresh via warmup with skip guard
    const original = new URL(url)
    original.searchParams.set('__skip_guard', '1')
    const to = new URL('/auth/warmup', url)
    to.searchParams.set('redirect', original.pathname + original.search)
    const res = NextResponse.redirect(to)
    res.headers.set('x-route-reason', 'bad-prof-cookie')
    return res
  }
}

// Explicit matcher so middleware NEVER runs on /auth, assets, etc.
export const config = {
  matcher: [
    '/((dashboard|pitch|role-selection)(/.*)?)',
  ],
}
