import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { applyRateLimit } from './middleware/rateLimit'

const PUBLIC_PATHS = [
  '/', '/browse', '/pricing', '/donations', '/auth', '/auth/callback', '/auth/warmup', '/auth/signout', '/about', '/contact', '/terms', '/privacy', '/waitlist'
]

const PROTECTED_PREFIXES = ['/dashboard', '/pitch', '/role-selection']

export async function middleware(req: NextRequest) {
  const url = req.nextUrl
  const path = url.pathname

  // Apply rate limiting to API endpoints
  if (path.startsWith('/api/')) {
    // Contact form - strict rate limiting
    if (path === '/api/contact') {
      const rateLimitResult = applyRateLimit(req, 'contactForm')
      if (rateLimitResult) return rateLimitResult
    }
    
    // Waitlist endpoints
    if (path === '/api/waitlist/join') {
      const rateLimitResult = applyRateLimit(req, 'waitlistJoin')
      if (rateLimitResult) return rateLimitResult
    }
    
    if (path === '/api/waitlist/share') {
      const rateLimitResult = applyRateLimit(req, 'waitlistShare')
      if (rateLimitResult) return rateLimitResult
    }
    
    // Resume request endpoints
    if (path.startsWith('/api/resume/')) {
      const rateLimitResult = applyRateLimit(req, 'resumeRequest')
      if (rateLimitResult) return rateLimitResult
    }
    
    // AI generation endpoints
    if (path.startsWith('/api/ai/')) {
      const rateLimitResult = applyRateLimit(req, 'aiPitchGeneration')
      if (rateLimitResult) return rateLimitResult
    }
    
    // General API rate limiting
    const generalRateLimit = applyRateLimit(req, 'general')
    if (generalRateLimit) return generalRateLimit
  }

  // Allow all static and public paths
  if (
    PUBLIC_PATHS.some(p => path === p) ||
    path.startsWith('/_next') ||
    path.startsWith('/api/') ||
    path.startsWith('/images') ||
    path.startsWith('/favicon') ||
    path.startsWith('/robots') ||
    path.startsWith('/sitemap')
  ) {
    return NextResponse.next()
  }

  // Only apply auth logic to protected paths
  const isProtected = PROTECTED_PREFIXES.some((p) => path.startsWith(p))
  if (!isProtected) return NextResponse.next()

  const accessToken = req.cookies.get('sb-access-token')?.value
  const refreshToken = req.cookies.get('sb-refresh-token')?.value

  if (!accessToken && !refreshToken) {
    url.pathname = '/auth'
    url.searchParams.set('redirect', path)
    const res = NextResponse.redirect(url)
    res.headers.set('x-route-reason', 'unauth')
    return res
  }

  const profCookie = req.cookies.get('x-prof')?.value
  if (!profCookie) {
    url.pathname = '/auth/warmup'
    url.searchParams.set('redirect', path)
    const res = NextResponse.redirect(url)
    res.headers.set('x-route-reason', 'need-warmup')
    return res
  }

  try {
    function decodeBase64Url(str: string) {
      const b64 = str.replace(/-/g, '+').replace(/_/g, '/')
      const pad = b64.length % 4 ? 4 - (b64.length % 4) : 0
      const padded = b64 + '='.repeat(pad)
      // Web APIs are available in Edge runtime
      const bin = globalThis.atob(padded)
      const bytes = new Uint8Array(bin.length)
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
      return new TextDecoder().decode(bytes)
    }
    const prof = JSON.parse(decodeBase64Url(profCookie))
    const role = prof?.role as 'veteran'|'supporter'|'recruiter'|undefined
    const status = prof?.status as 'pending'|'approved'|'blocked'|undefined
    const onboarding_complete = !!prof?.onboarding_complete

    // Waitlist gate (toggle with env)
    const requireApproval = process.env.NEXT_PUBLIC_REQUIRE_APPROVAL !== 'false'
    if (requireApproval && status !== 'approved' && path !== '/waitlist') {
      url.pathname = '/waitlist'
      const res = NextResponse.redirect(url)
      res.headers.set('x-route-reason', 'not-approved')
      return res
    }

    // Role selection required
    if (!role && path !== '/role-selection') {
      url.pathname = '/role-selection'
      const res = NextResponse.redirect(url)
      res.headers.set('x-route-reason', 'need-role')
      return res
    }

    // Veteran first-run Magic Mode
    if (role === 'veteran' && !onboarding_complete && !path.startsWith('/pitch/new')) {
      url.pathname = '/pitch/new'
      const res = NextResponse.redirect(url)
      res.headers.set('x-route-reason', 'need-onboarding')
      return res
    }

    // Role-based dashboard redirect from /dashboard
    if (path === '/dashboard') {
      url.pathname =
        role === 'veteran' ? '/dashboard/veteran' :
        role === 'recruiter' ? '/dashboard/recruiter' :
        '/dashboard/supporter'
      const res = NextResponse.redirect(url)
      res.headers.set('x-route-reason', 'role-redirect')
      return res
    }

    return NextResponse.next()
  } catch {
    url.pathname = '/auth/warmup'
    url.searchParams.set('redirect', path)
    const res = NextResponse.redirect(url)
    res.headers.set('x-route-reason', 'bad-prof-cookie')
    return res
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/pitch/:path*',
    '/role-selection',
  ],
}
