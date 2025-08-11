'use server';

import { createSupabaseServerOnly } from '@/lib/supabaseServerOnly';

export async function updateUserRole(role: 'veteran' | 'recruiter' | 'supporter') {
  const supabase = createSupabaseServerOnly();
  
  // Get the authenticated user
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) {
    throw new Error('Not authenticated');
  }

  // Update the user's role in the users table
  const { data, error } = await supabase
    .from('users')
    .update({ role })
    .eq('id', user.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating user role:', error);
    throw new Error(`Failed to update role: ${error.message}`);
  }

  return { success: true, data };
}

// Also provide a function to get the current user's role
export async function getUserRole() {
  const supabase = createSupabaseServerOnly();
  
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) {
    return null;
  }

  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Error getting user role:', error);
    return null;
  }

  return data?.role || null;
}
