import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Role-based route protection
const roleRoutes = {
  '/dashboard/veteran': ['veteran'],
  '/dashboard/recruiter': ['recruiter'],
  '/dashboard/admin': ['admin'],
  '/dashboard/supporter': ['supporter'],
  '/pitch/new': ['veteran'],
  '/endorse': ['supporter'],
  '/supporter': ['supporter']
}

// Public routes that don't require authentication
const PUBLIC_PATHS = [
  '/',
  '/browse',
  '/pricing',
  '/donations',
  '/support',
  '/about',
  '/contact',
  '/support-the-mission',
  '/terms',
  '/privacy',
  '/auth',
  '/api/razorpay/webhook',
  '/api/cron/expire'
]

// Public prefixes that don't require authentication
const PUBLIC_PREFIXES = [
  '/pitch/',
  '/r/',
  '/api/'
]

function isPublic(path: string) {
  if (PUBLIC_PATHS.includes(path)) return true;
  return PUBLIC_PREFIXES.some(p => path.startsWith(p));
}

export async function middleware(req: NextRequest) {
  let res = NextResponse.next()
  
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
    "connect-src 'self' https://api.supabase.co https://*.supabase.co https://checkout.razorpay.com",
    "frame-src https://checkout.razorpay.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; '))

  // Check if route requires authentication
  const pathname = req.nextUrl.pathname
  
  // Allow public routes and prefixes
  if (isPublic(pathname)) {
    return res
  }

  // Check role-based access
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => req.cookies.set(name, value))
          res = NextResponse.next({
            request: {
              headers: req.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) => res.cookies.set(name, value, options))
        },
      },
    }
  )
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    // Redirect to auth if not authenticated
    const redirectUrl = new URL('/auth', req.url)
    redirectUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Get user role
  const { data: userProfile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const userRole = userProfile?.role

  // Check role-based route access
  for (const [route, allowedRoles] of Object.entries(roleRoutes)) {
    if (pathname.startsWith(route)) {
      if (!userRole || !allowedRoles.includes(userRole)) {
        // Redirect to appropriate dashboard or auth
        const redirectUrl = new URL('/auth', req.url)
        redirectUrl.searchParams.set('error', 'insufficient_permissions')
        redirectUrl.searchParams.set('redirectTo', pathname)
        return NextResponse.redirect(redirectUrl)
      }
      break
    }
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
