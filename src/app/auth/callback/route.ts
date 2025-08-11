import { NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabaseServer';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') || '/';

  if (!code) {
    // fallback for accidental implicit flows with hash – redirect to clean page
    return NextResponse.redirect(new URL('/', req.url));
  }

  const supabase = await createSupabaseServer();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error('Auth exchange error:', error);
    return NextResponse.redirect(new URL('/auth/error', req.url));
  }

  // Optional: role routing
  const profile = data?.user ?? null;
  const to = next.startsWith('/') ? next : '/';
  return NextResponse.redirect(new URL(to, req.url));
}
