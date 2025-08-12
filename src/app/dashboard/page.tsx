import { createSupabaseServerOnly } from '@/lib/supabaseServerOnly'
import { redirect } from 'next/navigation'

export default async function DashboardRedirect() {
  const supabase = await createSupabaseServerOnly()
  
  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/auth?redirect=/dashboard')
  }

  // Get user role and redirect to appropriate dashboard
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile?.role) {
    // User has no role, redirect to role selection
    redirect('/role-selection')
  }

  // Redirect to role-specific dashboard
  redirect(`/dashboard/${profile.role}`)
}
