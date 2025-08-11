import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createSupabaseServer } from '@/lib/supabaseServer';

const PUBLIC_PATHS = [
  '/', '/browse', '/pricing', '/donations', '/auth', '/auth/callback'
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // public & static
  if (
    PUBLIC_PATHS.some(p => pathname === p) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/razorpay/webhook') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/robots') ||
    pathname.startsWith('/sitemap')
  ) {
    return NextResponse.next();
  }

  // Protected areas (dashboards)
  if (pathname.startsWith('/dashboard')) {
    const supabase = await createSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      const url = req.nextUrl.clone();
      url.pathname = '/auth';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/(.*)'],
};
