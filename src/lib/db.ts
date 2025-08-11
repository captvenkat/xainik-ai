import type { PostgrestError } from '@supabase/supabase-js';

type QueryResult<T> = Promise<{ data: T | null; error: PostgrestError | null }>;

export async function many<T>(q: Promise<{ data: T[] | null; error: PostgrestError | null }>): Promise<T[]> {
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function one<T>(q: Promise<{ data: T[] | null; error: PostgrestError | null }>): Promise<T | null> {
  const { data, error } = await q;
  if (error) throw error;
  return data && data.length ? data[0] || null : null;
}

export function first<T>(x: T[] | null | undefined): T | null {
  return Array.isArray(x) && x.length ? x[0] || null : null;
}

export function must<T>(v: T | null | undefined, msg = 'Not found'): T {
  if (v == null) throw new Error(msg);
  return v;
}

// Legacy helper for backward compatibility
export async function mustOne<T>(q: Promise<{ data: T[] | null; error: PostgrestError | null }>): Promise<T> {
  const row = await one(q);
  if (!row) throw new Error('Expected one row, got none');
  return row;
}
