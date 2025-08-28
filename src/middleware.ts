import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl
  const path = url.pathname

  // Only protect dashboard routes
  if (!path.startsWith('/dashboard')) {
    return NextResponse.next()
  }

  // Check for authentication cookies
  const accessToken = request.cookies.get('sb-access-token')?.value
  const refreshToken = request.cookies.get('sb-refresh-token')?.value

  // If no auth tokens, redirect to simple auth
  if (!accessToken && !refreshToken) {
    const to = new URL('/auth/simple', url)
    to.searchParams.set('redirect', url.pathname)
    return NextResponse.redirect(to)
  }

  // Allow access to dashboard
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*']
}
