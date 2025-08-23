import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { applyRateLimit } from './middleware/rateLimit';

const PUBLIC_PATHS = [
  '/', '/browse', '/pricing', '/donations', '/auth', '/auth/callback', '/about', '/contact', '/terms', '/privacy'
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Apply rate limiting to API endpoints
  if (pathname.startsWith('/api/')) {
    // Contact form - strict rate limiting
    if (pathname === '/api/contact') {
      const rateLimitResult = applyRateLimit(req, 'contactForm')
      if (rateLimitResult) return rateLimitResult
    }
    
    // Waitlist endpoints
    if (pathname === '/api/waitlist/join') {
      const rateLimitResult = applyRateLimit(req, 'waitlistJoin')
      if (rateLimitResult) return rateLimitResult
    }
    
    if (pathname === '/api/waitlist/share') {
      const rateLimitResult = applyRateLimit(req, 'waitlistShare')
      if (rateLimitResult) return rateLimitResult
    }
    
    // Resume request endpoints
    if (pathname.startsWith('/api/resume/')) {
      const rateLimitResult = applyRateLimit(req, 'resumeRequest')
      if (rateLimitResult) return rateLimitResult
    }
    
    // AI generation endpoints
    if (pathname.startsWith('/api/ai/')) {
      const rateLimitResult = applyRateLimit(req, 'aiPitchGeneration')
      if (rateLimitResult) return rateLimitResult
    }
    
    // General API rate limiting
    const generalRateLimit = applyRateLimit(req, 'general')
    if (generalRateLimit) return generalRateLimit
  }

  // Allow all static and public paths
  if (
    PUBLIC_PATHS.some(p => pathname === p) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/robots') ||
    pathname.startsWith('/sitemap')
  ) {
    return NextResponse.next();
  }

  // Allow dashboard routes to be handled by client-side auth
  if (pathname.startsWith('/dashboard/')) {
    return NextResponse.next();
  }

  // Let client-side auth handle all other protected routes
  // This prevents middleware conflicts with client-side authentication
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
