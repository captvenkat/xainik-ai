import { createClient } from '@supabase/supabase-js'

// Re-export createClient for direct use
export { createClient }

// Browser client (anon only). Reads public env vars.
export function getBrowserSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anon) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }
  return createClient(url, anon, {
    auth: { persistSession: true, autoRefreshToken: true },
  })
}

// Server client (still anon; RLS enforced). Use when rendering on the server.
export function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anon) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }
  return createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
