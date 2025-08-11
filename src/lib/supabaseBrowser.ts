'use client';
import { createBrowserClient } from '@supabase/ssr';

// Use a global variable to ensure singleton across all modules
declare global {
  var __supabaseClient: ReturnType<typeof createBrowserClient> | undefined;
}

// Ensure we only create one instance per browser session
export function createSupabaseBrowser() {
  // Check if we're in the browser
  if (typeof window === 'undefined') {
    // Server-side, create new instance
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  // Browser-side, use global singleton
  if (!globalThis.__supabaseClient) {
    console.log('🔧 Creating new Supabase client instance (global singleton)');
    globalThis.__supabaseClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          flowType: 'pkce'
        },
        realtime: {
          params: {
            eventsPerSecond: 10
          }
        }
      }
    );
  } else {
    console.log('♻️  Reusing existing Supabase client instance (global singleton)');
  }
  
  return globalThis.__supabaseClient;
}

// Export a default instance for components that need it
export const supabase = createSupabaseBrowser();
