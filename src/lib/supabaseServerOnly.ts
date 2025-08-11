import { createClient } from '@supabase/supabase-js'

// Server-only client (no cookies, no SSR) - use for server-side operations
export function createSupabaseServerOnly() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    }
  )
}
