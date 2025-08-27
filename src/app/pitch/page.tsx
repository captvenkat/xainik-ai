import { redirect } from 'next/navigation'
import { createSupabaseServerOnly } from '@/lib/supabaseServerOnly'

export default async function PitchPage() {
  try {
    const supabase = await createSupabaseServerOnly()
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      // Not authenticated - redirect to browse page to see public pitches
      redirect('/browse')
    }
    
    // Check if user has existing pitches
    const { data: existingPitches, error: pitchesError } = await supabase
      .from('pitches')
      .select('id, title, is_active')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .limit(1)
    
    if (pitchesError) {
      console.error('Error checking existing pitches:', pitchesError)
      redirect('/browse')
    }
    
    if (existingPitches && existingPitches.length > 0) {
      // User has pitches - redirect to their dashboard
      redirect('/dashboard/veteran')
    } else {
      // User has no pitches - redirect to create new pitch
      redirect('/pitch/new')
    }
    
  } catch (error) {
    console.error('Error in pitch page:', error)
    // Fallback to browse page
    redirect('/browse')
  }
}
