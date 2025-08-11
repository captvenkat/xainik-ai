'use client';
import { createClient } from '@supabase/supabase-js';

export function createSupabaseBrowser() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    }
  );
  return supabase;
}

// Helper: start OAuth with proper redirect handling
export async function signInWithGoogle(returnTo: string = '/') {
  // Ensure we have the correct site URL
  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://xainik.com';

  // Store the return path in sessionStorage for later retrieval
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('auth_redirect', returnTo);
  }

  const { data, error } = await createSupabaseBrowser().auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${site}/auth/callback`, // This will now go to the page, not the API route
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
        response_type: 'code', // Force authorization code flow
      },
    },
  });

  if (error) {
    console.error('[AUTH] signIn error', error);
    throw error;
  }
  return data;
}
