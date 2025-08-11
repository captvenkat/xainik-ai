import { NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabaseServer';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') || '/';
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  console.log('🔐 Auth callback received:', { code: !!code, next, error, errorDescription });

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error in callback:', { error, errorDescription });
    return NextResponse.redirect(new URL(`/auth/error?error=${encodeURIComponent(error)}&description=${encodeURIComponent(errorDescription || '')}`, req.url));
  }

  if (!code) {
    console.error('No code parameter in callback');
    return NextResponse.redirect(new URL('/auth/error?error=no_code', req.url));
  }

  try {
    const supabase = await createSupabaseServer();
    console.log('🔄 Exchanging code for session...');
    
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (exchangeError) {
      console.error('Auth exchange error:', exchangeError);
      return NextResponse.redirect(new URL(`/auth/error?error=exchange_failed&details=${encodeURIComponent(exchangeError.message)}`, req.url));
    }

    if (!data?.user) {
      console.error('No user data after exchange');
      return NextResponse.redirect(new URL('/auth/error?error=no_user', req.url));
    }

    console.log('✅ Auth exchange successful for user:', data.user.email);
    
    // Optional: role routing
    const profile = data?.user ?? null;
    const to = next.startsWith('/') ? next : '/';
    
    console.log('🔄 Redirecting to:', to);
    return NextResponse.redirect(new URL(to, req.url));
    
  } catch (error) {
    console.error('Unexpected error in auth callback:', error);
    return NextResponse.redirect(new URL(`/auth/error?error=unexpected&details=${encodeURIComponent(String(error))}`, req.url));
  }
}
