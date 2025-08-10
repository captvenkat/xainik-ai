import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// DB shape normalizers and guards
export function first<T>(arr: T[] | null | undefined): T | null {
  return Array.isArray(arr) && arr.length > 0 ? arr[0] : null;
}

export async function many<T>(q: Promise<{ data: T[] | null; error: any }>): Promise<T[]> {
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function one<T>(q: Promise<{ data: T[] | null; error: any }>): Promise<T | null> {
  const { data, error } = await q;
  if (error) throw error;
  return data && data.length ? data[0] : null;
}

export async function mustOne<T>(q: Promise<{ data: T[] | null; error: any }>): Promise<T> {
  const row = await one(q);
  if (!row) throw new Error('Expected one row, got none');
  return row;
}

// Legacy helper for backward compatibility - keeping for existing code
export function firstLegacy<T>(data: T[] | null): T | null {
  if (!data || data.length === 0) return null
  return data[0] || null
}
