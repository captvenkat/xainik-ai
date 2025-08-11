import { NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabaseServer';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');
    const errorCode = url.searchParams.get('error_code');
    const errorDescription = url.searchParams.get('error_description');
    
    // Check for hash fragment tokens (implicit grant fallback)
    const hash = req.url.split('#')[1];
    let accessToken = null;
    let refreshToken = null;
    
    if (hash) {
      console.log('[AUTH] Hash fragment detected, parsing tokens...');
      const params = new URLSearchParams(hash);
      accessToken = params.get('access_token');
      refreshToken = params.get('refresh_token');
      
      if (accessToken) {
        console.log('[AUTH] Access token found in hash fragment');
        console.log('[AUTH] Token length:', accessToken.length);
        console.log('[AUTH] Token preview:', accessToken.substring(0, 20) + '...');
      }
    }
    
    console.log('[AUTH] Callback received:', { 
      code: code ? 'present' : 'missing', 
      error, 
      errorCode,
      errorDescription,
      hasHash: !!hash,
      hasAccessToken: !!accessToken,
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

    // If we have an access token from hash fragment, use it directly
    if (accessToken && refreshToken) {
      console.log('[AUTH] Using tokens from hash fragment...');
      
      try {
        const supabase = await createSupabaseServer();
        
        // Set the session with the tokens we received
        const { data, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        
        if (sessionError) {
          console.error('[AUTH] Session creation failed:', sessionError);
          return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/auth?error=session_creation_failed&details=${encodeURIComponent(sessionError.message)}`);
        }
        
        if (!data.session) {
          console.error('[AUTH] No session created from tokens');
          return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/auth?error=no_session_from_tokens`);
        }
        
        console.log('[AUTH] Session created successfully from tokens:', {
          userId: data.session.user.id,
          expiresAt: data.session.expires_at
        });
        
        console.log('[AUTH] Redirecting to dashboard (token flow)');
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/veteran`);
        
      } catch (tokenError) {
        console.error('[AUTH] Token-based session creation failed:', tokenError);
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/auth?error=token_session_failed&details=${encodeURIComponent(tokenError instanceof Error ? tokenError.message : 'Unknown error')}`);
      }
    }

    // Standard authorization code flow
    if (!code) {
      console.error('[AUTH] No code parameter received and no tokens in hash');
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/auth?error=missing_code`);
    }

    console.log('[AUTH] Environment check:', {
      hasUrl: !!process.env.NEXT_PUBLIC_SITE_URL,
      hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      url: process.env.NEXT_PUBLIC_SITE_URL?.substring(0, 20) + '...',
    });

    console.log('[AUTH] Creating Supabase server client...');
    const supabase = await createSupabaseServer();
    console.log('[AUTH] Supabase client created successfully');
    
    console.log('[AUTH] Exchanging code for session...');
    console.log('[AUTH] Code length:', code.length);
    console.log('[AUTH] Code preview:', code.substring(0, 10) + '...');
    
    // Use the stable exchangeCodeForSession method
    try {
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      
      if (exchangeError) {
        console.error('[AUTH] exchangeCodeForSession error:', exchangeError);
        console.error('[AUTH] Error details:', {
          message: exchangeError.message,
          status: exchangeError.status,
          name: exchangeError.name
        });
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/auth?error=exchange_failed&details=${encodeURIComponent(exchangeError.message)}`);
      }

      if (!data.session) {
        console.error('[AUTH] No session created');
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/auth?error=no_session`);
      }

      console.log('[AUTH] Session created successfully:', {
        userId: data.session.user.id,
        expiresAt: data.session.expires_at
      });
      
      console.log('[AUTH] Redirecting to dashboard (code flow)');
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/veteran`);
      
    } catch (exchangeError) {
      console.error('[AUTH] exchangeCodeForSession exception:', exchangeError);
      console.error('[AUTH] Exception details:', {
        message: exchangeError instanceof Error ? exchangeError.message : 'Unknown error',
        stack: exchangeError instanceof Error ? exchangeError.stack : 'No stack trace'
      });
      
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/auth?error=exchange_exception&details=${encodeURIComponent(exchangeError instanceof Error ? exchangeError.message : 'Unknown error')}`);
    }
    
  } catch (e) {
    console.error('[AUTH] Callback crash:', e);
    console.error('[AUTH] Error stack:', e instanceof Error ? e.stack : 'No stack trace');
    
    // Try to get more specific error information
    let errorMessage = 'callback_crash';
    if (e instanceof Error) {
      errorMessage = `callback_crash: ${e.message}`;
    }
    
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/auth?error=${encodeURIComponent(errorMessage)}`);
  }
}
