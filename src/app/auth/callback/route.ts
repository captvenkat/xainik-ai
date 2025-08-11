import { NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabaseServer';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('redirect') || '/dashboard/veteran';

  if (!code) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/auth?error=missing_code`);
  }

  try {
    const supabase = await createSupabaseServer();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error('[AUTH] exchangeCodeForSession error', error);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/auth?error=exchange_failed`);
    }
    // success → send them on
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}${next}`);
  } catch (e) {
    console.error('[AUTH] callback crash', e);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/auth?error=callback_crash`);
  }
}
