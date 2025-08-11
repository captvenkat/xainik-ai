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
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  } else {
    console.log('♻️  Reusing existing Supabase client instance (global singleton)');
  }
  
  return globalThis.__supabaseClient;
}

// Reset function for testing (development only)
export function resetSupabaseClient() {
  if (process.env.NODE_ENV === 'development') {
    globalThis.__supabaseClient = undefined;
  }
}
