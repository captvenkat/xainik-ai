import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = [
  '/', '/browse', '/pricing', '/donations', '/auth', '/auth/callback', '/about', '/contact', '/terms', '/privacy'
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

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

  // Let client-side auth handle all protected routes
  // This prevents middleware conflicts with client-side authentication
  return NextResponse.next();
}

export const config = {
  matcher: ['/(.*)'],
};
