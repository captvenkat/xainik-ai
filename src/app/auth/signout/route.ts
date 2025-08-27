import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export async function POST() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { 
      cookies: { 
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      } 
    }
  )
  await supabase.auth.signOut()
  
  // Create response with redirect
  const response = NextResponse.redirect(new URL('/auth', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'))
  
  // Expire the profile cookie in the response
  response.cookies.set('x-prof', '', { path: '/', maxAge: 0, httpOnly: true })
  
  return response
}
