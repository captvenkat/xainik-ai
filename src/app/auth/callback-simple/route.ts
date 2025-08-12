import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');
    const errorCode = url.searchParams.get('error_code');
    const errorDescription = url.searchParams.get('error_description');
    
    return NextResponse.json({
      code: code ? 'present' : 'missing', 
      error, 
      errorCode,
      errorDescription,
      url: req.url 
    });
    
    // Check for OAuth errors first
    if (error) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/auth?error=${error}&code=${errorCode || ''}&description=${encodeURIComponent(errorDescription || '')}`);
    }

    if (!code) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/auth?error=missing_code`);
    }

    
    // For now, just redirect to dashboard without doing anything
    // This will help us see if the issue is with the route itself or with Supabase
    
    const response = NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/veteran`);
    
    // Add some headers to see if they help
    response.headers.set('X-Callback-Status', 'success');
    response.headers.set('X-Code-Length', (code?.length || 0).toString());
    
    return response;
    
  } catch (e) {
    
    let errorMessage = 'callback_crash';
    if (e instanceof Error) {
      errorMessage = `callback_crash: ${e.message}`;
    }
    
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/auth?error=${encodeURIComponent(errorMessage)}`);
  }
}
