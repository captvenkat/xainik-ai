'use client';
import { useEffect } from 'react';
import { createSupabaseBrowser } from '@/lib/supabaseBrowser';

// Use the singleton client
const supabase = createSupabaseBrowser();

export default function AuthSessionWatcher() {
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e: string, _session: any) => {
      // session cookies are managed by server; this is just to trigger UI updates if needed
    });
    return () => sub.subscription.unsubscribe();
  }, []);
  return null;
}
