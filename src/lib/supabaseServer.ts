import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function createSupabaseServer() {
  try {
    const cookieStore = await cookies();
    
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error('Missing Supabase environment variables');
    }

    console.log('[SUPABASE] Creating server client with URL:', process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 30) + '...');

    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name: string) {
            try {
              const value = cookieStore.get(name)?.value;
              console.log(`[SUPABASE] Cookie get ${name}:`, value ? 'present' : 'missing');
              return value;
            } catch (error) {
              console.error('[SUPABASE] Cookie get error:', error);
              return undefined;
            }
          },
          set(name: string, value: string, options: any) {
            try {
              console.log(`[SUPABASE] Cookie set ${name}:`, value.substring(0, 20) + '...');
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
              console.log(`[SUPABASE] Cookie remove ${name}`);
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
