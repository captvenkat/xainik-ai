import { createSupabaseServerOnly } from '@/lib/supabaseServerOnly'
import FullPitchView from '@/components/FullPitchView'
import { recordEvent } from '@/lib/referralEvents'
import { getVeteranEndorsements, isCommunityVerified } from '@/lib/actions/endorsements'
import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { toFullPitchData } from '@/lib/mappers/pitches'

export const revalidate = 30

async function fetchPitch(id: string) {
  const supabase = createSupabaseServerOnly()
  
  // Get pitch with all data using actual pitches table
  const supabaseClient = await supabase
  const { data: pitch, error: pitchError } = await supabaseClient
    .from('pitches')
    .select(`
      *,
      users!pitches_user_id_fkey(
        id,
        name,
        email,
        avatar_url,
        role,
        phone,
        metadata
      )
    `)
    .eq('id', id)
    .eq('is_active', true)
    .single()

  if (pitchError || !pitch) {
    return null
  }

  // Get military service information and bio from veterans table
  let militaryData = null
  let bio = null
  try {
    // Try to get all fields including bio (if it exists)
    const { data: veteranProfile, error: veteranError } = await supabaseClient
      .from('veterans')
      .select('rank, service_branch, years_experience, bio')
      .eq('user_id', pitch.user_id)
      .single()
    
    if (veteranError) {
      console.error('Error fetching veteran profile:', veteranError)
      // If bio column doesn't exist, try without it
      if (veteranError.message.includes('column "bio" does not exist')) {
        const { data: basicProfile } = await supabaseClient
          .from('veterans')
          .select('rank, service_branch, years_experience')
          .eq('user_id', pitch.user_id)
          .single()
        
        if (basicProfile) {
          militaryData = {
            rank: basicProfile.rank,
            service_branch: basicProfile.service_branch,
            years_experience: basicProfile.years_experience
          }
          bio = null // Bio field doesn't exist yet
        }
      }
    } else if (veteranProfile) {
      militaryData = {
        rank: veteranProfile.rank,
        service_branch: veteranProfile.service_branch,
        years_experience: veteranProfile.years_experience
      }
      bio = veteranProfile.bio
    }
  } catch (error) {
    console.error('Error fetching veteran profile:', error)
  }

  // Check for fallback military data in user metadata if veterans table failed
  if (!militaryData && pitch.users?.metadata?.veteran_profile) {
    const fallbackData = pitch.users.metadata.veteran_profile
    console.log('Using fallback military data from user metadata:', fallbackData)
    
    militaryData = {
      rank: fallbackData.military_rank || fallbackData.rank,
      service_branch: fallbackData.service_branch,
      years_experience: fallbackData.years_experience
    }
    
    if (!bio && fallbackData.bio) {
      bio = fallbackData.bio
    }
  }

  // Get endorsements
  const { data: endorsements } = await supabaseClient
    .from('endorsements')
    .select(`
      *,
      endorsers:endorser_id(
        id,
        name,
        avatar_url
      )
    `)
    .eq('veteran_id', pitch.user_id)

  // Get user info for community verification
  const { data: user } = await supabaseClient.auth.getUser()

  // Check if user is community verified (placeholder logic)
  const isCommunityVerified = false // TODO: Implement actual verification logic

  return {
    ...pitch,
    endorsements: endorsements || [],
    user: user?.user,
    isCommunityVerified,
    militaryData,
    bio
  }
}

async function fetchUser() {
  const cookieStore = await cookies()
  const supabase = createSupabaseServerOnly()
  
  const supabaseClient = await supabase
  const { data: { user }, error } = await supabaseClient.auth.getUser()
  
  if (error || !user) {
    return null
  }

  // Get user profile
  const { data: userProfile } = await supabaseClient
    .from('users')
    .select('id, name, email, role')
    .eq('id', user.id)
    .single()

  return userProfile
}

export default async function PitchDetailPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ id: string }>, 
  searchParams: Promise<{ ref?: string }> 
}) {
  const { id } = await params
  const { ref } = await searchParams
  
  const [pitch, user] = await Promise.all([
    fetchPitch(id),
    fetchUser()
  ])

  if (!pitch) {
    redirect('/not-found')
  }

  // Fetch endorsements and community verification status
  const [endorsements, isVerified] = await Promise.all([
    pitch.user_id ? getVeteranEndorsements(pitch.user_id) : Promise.resolve([]),
    pitch.user_id ? isCommunityVerified(pitch.user_id) : Promise.resolve(false)
  ])

  // Transform pitch data for FullPitchView
  const fullPitchData = toFullPitchData(pitch as any)

  // Log referral event if referral ID is present
  if (ref) {
    try {
      await recordEvent({
        referralId: ref,
        type: 'pitch_viewed',
        platform: 'web',
        userAgent: 'server-side',
        ipAddress: 'server-side'
      })
    } catch (error) {
      console.error('Failed to record referral event:', error)
    }
  }

  return (
    <FullPitchView 
      pitch={fullPitchData} 
      user={user} 
      endorsements={endorsements}
      isCommunityVerified={isVerified}
    />
  )
}
