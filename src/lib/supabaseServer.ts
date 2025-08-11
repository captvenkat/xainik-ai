import { cookies, headers } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function createSupabaseServer() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (key) => cookieStore.get(key)?.value,
        set: (key, value, options) => {
          cookieStore.set(key, value, { ...options, httpOnly: true, sameSite: 'lax', secure: true });
        },
        remove: (key, options) => {
          cookieStore.set(key, '', { ...options, maxAge: 0 });
          cookieStore.delete(key);
        }
      }
    }
  );
}
