'use client';
import { createBrowserClient } from '@supabase/ssr';

// Use a global variable to ensure singleton across all modules
declare global {
  var __supabaseClient: ReturnType<typeof createBrowserClient> | undefined;
}

// Ensure we only create one instance per browser session
export function createSupabaseBrowser() {
  if (globalThis.__supabaseClient) {
    return globalThis.__supabaseClient;
  }

  globalThis.__supabaseClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        debug: process.env.NODE_ENV === 'development',
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        storageKey: 'supabase-auth-token'
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    }
  );

  return globalThis.__supabaseClient;
}

// Export a default instance for components that need it
export const supabase = createSupabaseBrowser();
