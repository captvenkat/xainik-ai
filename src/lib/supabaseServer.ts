import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function createSupabaseServer() {
  try {
    const cookieStore = await cookies();
    
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error('Missing Supabase environment variables');
    }

    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name: string) {
            try {
              return cookieStore.get(name)?.value;
            } catch (error) {
              console.error('[SUPABASE] Cookie get error:', error);
              return undefined;
            }
          },
          set(name: string, value: string, options: any) {
            try {
              cookieStore.set({
                name,
                value,
                ...options,
              });
            } catch (error) {
              console.error('[SUPABASE] Cookie set error:', error);
            }
          },
          remove(name: string, options: any) {
            try {
              cookieStore.set({
                name,
                value: '',
                ...options,
                maxAge: 0,
              });
            } catch (error) {
              console.error('[SUPABASE] Cookie remove error:', error);
            }
          },
        },
      }
    );
  } catch (error) {
    console.error('[SUPABASE] Server client creation error:', error);
    throw error;
  }
}
