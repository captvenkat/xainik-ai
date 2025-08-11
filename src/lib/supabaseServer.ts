import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

// Singleton pattern for server client
let supabaseServerInstance: ReturnType<typeof createClient> | null = null;

export async function createSupabaseServer() {
  try {
    if (!supabaseServerInstance) {
      const cookieStore = await cookies();
      
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        throw new Error('Missing Supabase environment variables');
      }

      console.log('[SUPABASE] Creating server client with stable supabase-js...');

      // Use the stable supabase-js client instead of @supabase/ssr
      supabaseServerInstance = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
            detectSessionInUrl: false
          },
          global: {
            headers: {
              'X-Client-Info': 'xainik-server'
            }
          }
        }
      );

      console.log('[SUPABASE] Stable client created successfully');
    }
    
    return supabaseServerInstance;

  } catch (error) {
    console.error('[SUPABASE] Server client creation error:', error);
    throw error;
  }
}
