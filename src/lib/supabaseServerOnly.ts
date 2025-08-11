import { createClient } from '@supabase/supabase-js';

// Singleton pattern for server-only client
let supabaseServerOnlyInstance: ReturnType<typeof createClient> | null = null;

export function createSupabaseServerOnly() {
  if (!supabaseServerOnlyInstance) {
    supabaseServerOnlyInstance = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { 
        auth: { 
          persistSession: false, 
          autoRefreshToken: false, 
          detectSessionInUrl: false 
        },
        global: {
          headers: {
            'X-Client-Info': 'xainik-server-only'
          }
        }
      }
    );
  }
  return supabaseServerOnlyInstance;
}
