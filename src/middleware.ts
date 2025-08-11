import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

  // Role selection page - allow authenticated users
  if (pathname === '/role-selection') {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
            detectSessionInUrl: false
          }
        }
      );

      const accessToken = req.cookies.get('sb-access-token')?.value;
      const refreshToken = req.cookies.get('sb-refresh-token')?.value;
      
      if (!accessToken && !refreshToken) {
        const url = req.nextUrl.clone();
        url.pathname = '/auth';
        url.searchParams.set('redirect', pathname);
        return NextResponse.redirect(url);
      }
      
      // User is authenticated, allow access to role selection
      return NextResponse.next();
    } catch (error) {
      const url = req.nextUrl.clone();
      url.pathname = '/auth';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
  }

  // Protected areas (dashboards and admin)
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
    try {
      // Create a Supabase client for middleware (no cookies needed)
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
            detectSessionInUrl: false
          }
        }
      );

      // Get the authorization header from the request
      const authHeader = req.headers.get('authorization');
      
      if (authHeader) {
        // If we have an auth header, validate it
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          const url = req.nextUrl.clone();
          url.pathname = '/auth';
          url.searchParams.set('redirect', pathname);
          return NextResponse.redirect(url);
        }
        
        // User is authenticated, allow access
        return NextResponse.next();
      } else {
        // No auth header, check for access token in cookies
        const accessToken = req.cookies.get('sb-access-token')?.value;
        const refreshToken = req.cookies.get('sb-refresh-token')?.value;
        
        if (!accessToken && !refreshToken) {
          const url = req.nextUrl.clone();
          url.pathname = '/auth';
          url.searchParams.set('redirect', pathname);
          return NextResponse.redirect(url);
        }
        
        // Try to get user with the access token
        if (accessToken) {
          const { data: { user }, error } = await supabase.auth.getUser(accessToken);
          
          if (error || !user) {
            const url = req.nextUrl.clone();
            url.pathname = '/auth';
            url.searchParams.set('redirect', pathname);
            return NextResponse.redirect(url);
          }
          
          // User is authenticated, allow access
          return NextResponse.next();
        }
        
        // If we only have refresh token, redirect to auth to get a new access token
        const url = req.nextUrl.clone();
        url.pathname = '/auth';
        url.searchParams.set('redirect', pathname);
        return NextResponse.redirect(url);
      }
    } catch (error) {
      // On error, redirect to auth
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
