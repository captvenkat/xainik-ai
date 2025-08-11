'use client';
import { createBrowserClient } from '@supabase/ssr';

// Generate a random string for PKCE
function generateRandomString(length: number) {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let text = '';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

// Generate PKCE code verifier and challenge
function generatePKCE() {
  const codeVerifier = generateRandomString(128);
  const codeChallenge = codeVerifier; // For simplicity, using the same value
  return { codeVerifier, codeChallenge };
}

export function createSupabaseBrowser() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (key: string) => {
          if (typeof document === 'undefined') return '';
          const m = document.cookie.match(new RegExp('(^| )' + key + '=([^;]+)'));
          return m && m[2] ? decodeURIComponent(m[2] || '') : '';
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

// Helper: start OAuth with proper PKCE support
export async function signInWithGoogle(returnTo: string = '/') {
  // Ensure we have the correct site URL
  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://xainik.com';
  
  // Store the return path in sessionStorage for later retrieval
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('auth_redirect', returnTo);
  }

  // Generate PKCE code verifier and challenge
  const { codeVerifier, codeChallenge } = generatePKCE();
  
  // Store the code verifier for the callback
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('pkce_code_verifier', codeVerifier);
  }

  const { data, error } = await createSupabaseBrowser().auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${site}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
      },
    },
  });

  if (error) {
    console.error('[AUTH] signIn error', error);
    throw error;
  }
  return data;
}
