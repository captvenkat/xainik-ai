import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createHash } from 'crypto'

const PROTECTED = ['/dashboard', '/pitch/new', '/shortlist'];

function hashIP(ipAddress: string): string {
  const salt = process.env.IP_HASH_SALT || 'default-salt-change-in-production'
  return createHash('sha256')
    .update(ipAddress + salt)
    .digest('hex')
}

function getClientIP(req: NextRequest): string {
  // Try to get IP from various headers
  const forwarded = req.headers.get('x-forwarded-for')
  const realIP = req.headers.get('x-real-ip')
  const cfConnectingIP = req.headers.get('cf-connecting-ip')
  
  if (forwarded && forwarded.length > 0) {
    const parts = forwarded.split(',')
    if (parts.length > 0 && parts[0]) {
      return parts[0].trim()
    }
  }
  if (realIP && realIP.length > 0) {
    return realIP
  }
  if (cfConnectingIP && cfConnectingIP.length > 0) {
    return cfConnectingIP
  }
  
  return 'unknown'
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const url = req.nextUrl;
  
  // Avoid hash token leakage: if URL contains #access_token, strip it
  if (url.hash && url.hash.includes('access_token=')) {
    url.hash = '';
    return NextResponse.redirect(url);
  }
  
  // Add security headers
  res.headers.set('X-Frame-Options', 'DENY')
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  
  // Add CSP header
  res.headers.set('Content-Security-Policy', [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://checkout.razorpay.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self'",
    "connect-src 'self' https://api.supabase.co https://*.supabase.co https://checkout.razorpay.com https://api.resend.com wss://*.supabase.co ws://*.supabase.co",
    "frame-src https://checkout.razorpay.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; '))

  // Handle referral tracking
  const pathname = req.nextUrl.pathname
  const searchParams = req.nextUrl.searchParams
  const ref = searchParams.get('ref')
  
  // Set referral cookie if ref parameter is present
  if (ref && pathname.startsWith('/pitch/')) {
    // Hash the IP address for privacy
    const clientIP = getClientIP(req)
    const ipHash = hashIP(clientIP)
    
    // Set referral cookie with 30-day expiry
    res.cookies.set('xainik_ref', ref, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/'
    })
    
    // Set IP hash cookie for debouncing
    res.cookies.set('xainik_ip_hash', ipHash, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/'
    })
    
    // Add headers for server-side access
    res.headers.set('x-xainik-ref', ref)
    res.headers.set('x-xainik-ip-hash', ipHash)
  }
  
  // Pass referral data to all requests
  const existingRef = req.cookies.get('xainik_ref')?.value
  const existingIpHash = req.cookies.get('xainik_ip_hash')?.value
  
  if (existingRef) {
    res.headers.set('x-xainik-ref', existingRef)
  }
  if (existingIpHash) {
    res.headers.set('x-xainik-ip-hash', existingIpHash)
  }

  // Gate protected routes
  if (PROTECTED.some(p => pathname.startsWith(p))) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => {
            const cookies: { name: string; value: string }[] = [];
            req.cookies.getAll().forEach(cookie => {
              cookies.push({ name: cookie.name, value: cookie.value });
            });
            return cookies;
          },
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) => {
              res.cookies.set(name, value, options);
            });
          }
        }
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      const redirect = new URL('/auth', req.url);
      redirect.searchParams.set('next', req.nextUrl.pathname + req.nextUrl.search);
      return NextResponse.redirect(redirect);
    }
  }

  return res
}

export const config = {
  matcher: ['/((?!_next|static|public|api/webhooks|sitemap|robots).*)']
};
