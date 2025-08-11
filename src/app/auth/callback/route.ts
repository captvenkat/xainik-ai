import { NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabaseServer';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');
  const errorCode = url.searchParams.get('error_code');
  const errorDescription = url.searchParams.get('error_description');
  
  console.log('[AUTH] Callback received:', { 
    code: code ? 'present' : 'missing', 
    error, 
    errorCode,
    errorDescription,
    url: req.url 
  });
  
  // Check for OAuth errors first
  if (error) {
    console.error('[AUTH] OAuth error:', { error, errorCode, errorDescription });
    
    // Handle specific OAuth errors
    if (errorCode === 'flow_state_not_found') {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/auth?error=state_mismatch&message=${encodeURIComponent('Authentication session expired. Please try again.')}`);
    }
    
    if (errorCode === 'bad_oauth_state') {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/auth?error=invalid_state&message=${encodeURIComponent('Invalid authentication state. Please try again.')}`);
    }
    
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/auth?error=${error}&code=${errorCode || ''}&description=${encodeURIComponent(errorDescription || '')}`);
  }

  if (!code) {
    console.error('[AUTH] No code parameter received');
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/auth?error=missing_code`);
  }

  try {
    console.log('[AUTH] Creating Supabase server client...');
    const supabase = await createSupabaseServer();
    
    console.log('[AUTH] Exchanging code for session...');
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (exchangeError) {
      console.error('[AUTH] exchangeCodeForSession error:', exchangeError);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/auth?error=exchange_failed&details=${encodeURIComponent(exchangeError.message)}`);
    }

    if (!data.session) {
      console.error('[AUTH] No session created');
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/auth?error=no_session`);
    }

    console.log('[AUTH] Session created successfully, redirecting to dashboard');
    // Success - redirect to dashboard (the redirect path will be handled by the client)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/veteran`);
  } catch (e) {
    console.error('[AUTH] Callback crash:', e);
    
    // Try to get more specific error information
    let errorMessage = 'callback_crash';
    if (e instanceof Error) {
      errorMessage = `callback_crash: ${e.message}`;
    }
    
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/auth?error=${encodeURIComponent(errorMessage)}`);
  }
}
