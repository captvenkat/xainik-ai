'use client';
import { createBrowserClient } from '@supabase/ssr';

export function createSupabaseBrowser() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (key: string) => {
          if (typeof document === 'undefined') return '';
          const m = document.cookie.match(new RegExp('(^| )' + key + '=([^;]+)'));
          return m && m[2] ? decodeURIComponent(m[2]) : '';
        },
        set: (key: string, value: string, options: any) => {
          if (typeof document === 'undefined') return;
          document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=${options?.maxAge || 31536000}`;
        },
        remove: (key: string, options: any) => {
          if (typeof document === 'undefined') return;
          document.cookie = `${key}=; path=/; max-age=0`;
        },
      },
    }
  );
  return supabase;
}

// Helper: start OAuth (PKCE), same-tab redirect to callback with return path
export async function signInWithGoogle(returnTo: string = '/') {
  const site = process.env.NEXT_PUBLIC_SITE_URL!;
  const redirectTo = `${site}/auth/callback?redirect=${encodeURIComponent(returnTo)}`;

  const { data, error } = await createSupabaseBrowser().auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    console.error('[AUTH] signIn error', error);
    throw error;
  }
  return data;
}
