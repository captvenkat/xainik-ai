import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    console.log('[CALLBACK-SIMPLE] Starting simple callback...');
    
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');
    const errorCode = url.searchParams.get('error_code');
    const errorDescription = url.searchParams.get('error_description');
    
    console.log('[CALLBACK-SIMPLE] Parameters received:', { 
      code: code ? 'present' : 'missing', 
      error, 
      errorCode,
      errorDescription,
      url: req.url 
    });
    
    // Check for OAuth errors first
    if (error) {
      console.error('[CALLBACK-SIMPLE] OAuth error:', { error, errorCode, errorDescription });
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/auth?error=${error}&code=${errorCode || ''}&description=${encodeURIComponent(errorDescription || '')}`);
    }

    if (!code) {
      console.error('[CALLBACK-SIMPLE] No code parameter received');
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/auth?error=missing_code`);
    }

    console.log('[CALLBACK-SIMPLE] Code received, length:', code.length);
    console.log('[CALLBACK-SIMPLE] Code preview:', code.substring(0, 10) + '...');
    
    // For now, just redirect to dashboard without doing anything
    // This will help us see if the issue is with the route itself or with Supabase
    console.log('[CALLBACK-SIMPLE] Redirecting to dashboard (simple mode)');
    
    const response = NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/veteran`);
    
    // Add some headers to see if they help
    response.headers.set('X-Callback-Status', 'success');
    response.headers.set('X-Code-Length', code.length.toString());
    
    return response;
    
  } catch (e) {
    console.error('[CALLBACK-SIMPLE] Callback crash:', e);
    console.error('[CALLBACK-SIMPLE] Error stack:', e instanceof Error ? e.stack : 'No stack trace');
    
    let errorMessage = 'callback_crash';
    if (e instanceof Error) {
      errorMessage = `callback_crash: ${e.message}`;
    }
    
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/auth?error=${encodeURIComponent(errorMessage)}`);
  }
}
