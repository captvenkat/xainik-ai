import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // TEMPORARILY DISABLED - Let auth flow work without interference
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*']
}
