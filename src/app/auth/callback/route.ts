import { NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabaseServer';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');
  
  // Check for OAuth errors first
  if (error) {
    console.error('[AUTH] OAuth error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/auth?error=${error}`);
  }

  if (!code) {
    console.error('[AUTH] No code parameter received');
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/auth?error=missing_code`);
  }

  try {
    const supabase = await createSupabaseServer();
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (exchangeError) {
      console.error('[AUTH] exchangeCodeForSession error', exchangeError);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/auth?error=exchange_failed`);
    }

    if (!data.session) {
      console.error('[AUTH] No session created');
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/auth?error=no_session`);
    }

    // Success - redirect to dashboard (the redirect path will be handled by the client)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/veteran`);
  } catch (e) {
    console.error('[AUTH] callback crash', e);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/auth?error=callback_crash`);
  }
}
