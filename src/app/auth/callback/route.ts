import { NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabaseServer';

export async function GET(req: Request) {
  try {
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
    
    // Try the direct token exchange approach first
    try {
      console.log('[AUTH] Attempting direct token exchange...');
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/token?grant_type=authorization_code&code=${code}&redirect_uri=${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        },
      });
      
      console.log('[AUTH] Token exchange response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[AUTH] Token exchange failed:', response.status, errorText);
        throw new Error(`Token exchange failed: ${response.status} ${response.statusText}`);
      }
      
      const tokenData = await response.json();
      console.log('[AUTH] Direct token exchange successful, tokens received');
      
      // Set the session manually
      const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
      });
      
      if (sessionError) {
        console.error('[AUTH] Session creation failed:', sessionError);
        throw sessionError;
      }
      
      console.log('[AUTH] Session created successfully:', {
        userId: sessionData.session?.user.id,
        expiresAt: sessionData.session?.expires_at
      });
      
      console.log('[AUTH] Redirecting to dashboard');
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/veteran`);
      
    } catch (directError) {
      console.error('[AUTH] Direct token exchange failed, trying exchangeCodeForSession...');
      
      // Fallback to the standard method
      try {
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        
        if (exchangeError) {
          console.error('[AUTH] exchangeCodeForSession error:', exchangeError);
          throw exchangeError;
        }

        if (!data.session) {
          console.error('[AUTH] No session created');
          throw new Error('No session created');
        }

        console.log('[AUTH] Session created successfully via exchangeCodeForSession:', {
          userId: data.session.user.id,
          expiresAt: data.session.expires_at
        });
        
        console.log('[AUTH] Redirecting to dashboard');
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/veteran`);
        
      } catch (fallbackError) {
        console.error('[AUTH] Both methods failed:', { directError, fallbackError });
        throw directError; // Throw the original error
      }
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
