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

// TEMPORARILY DISABLED FOR DEBUGGING
export function middleware(req: NextRequest) {
  // Just pass through everything for now
  return NextResponse.next()
}

// Explicit matcher so middleware NEVER runs on /auth, assets, etc.
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/pitch/:path*',
    '/role-selection',
  ],
}
