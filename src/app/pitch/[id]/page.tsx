import { createSupabaseServerOnly } from '@/lib/supabaseServerOnly'
import FullPitchView from '@/components/FullPitchView'
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
      .select('rank, service_branch, years_experience, bio, retirement_date, locations_preferred')
      .eq('user_id', pitch.user_id)
      .single()

    if (veteranError) {
      console.error('Error fetching veteran profile:', veteranError)
      // If bio column doesn't exist, try without it
      if (veteranError.message.includes('column "bio" does not exist')) {
        const { data: basicProfile } = await supabaseClient
          .from('veterans')
          .select('rank, service_branch, years_experience, retirement_date, locations_preferred')
          .eq('user_id', pitch.user_id)
          .single()
        
        if (basicProfile) {
          militaryData = {
            rank: basicProfile.rank,
            service_branch: basicProfile.service_branch,
            years_experience: basicProfile.years_experience,
            retirement_date: basicProfile.retirement_date,
            locations_preferred: basicProfile.locations_preferred || []
          }
          bio = null // Bio field doesn't exist yet

        }
      }
    } else if (veteranProfile) {
      militaryData = {
        rank: veteranProfile.rank,
        service_branch: veteranProfile.service_branch,
        years_experience: veteranProfile.years_experience,
        retirement_date: veteranProfile.retirement_date,
        locations_preferred: veteranProfile.locations_preferred || []
      }
      bio = veteranProfile.bio

    }
      } catch (error) {
      // Silent error handling for veteran profile fetch
    }

  // Check for fallback military data in user metadata if veterans table failed
  
  if (!militaryData && pitch.users?.metadata?.veteran_profile) {
    const fallbackData = pitch.users.metadata.veteran_profile

    
    militaryData = {
      rank: fallbackData.military_rank || fallbackData.rank,
      service_branch: fallbackData.service_branch,
      years_experience: fallbackData.years_experience,
      retirement_date: fallbackData.retirement_date,
      locations_preferred: fallbackData.locations_preferred || []
    }
    
    if (!bio && fallbackData.bio) {
      bio = fallbackData.bio
    }
    

  } else if (!militaryData) {

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

  // Transform pitch data for FullPitchView, preserving militaryData and bio
  const fullPitchData = {
    ...toFullPitchData(pitch as any),
    militaryData: (pitch as any).militaryData || null,
    bio: (pitch as any).bio || null
  }



  // Log referral event if referral ID is present
  if (ref) {
    try {
      await recordEvent({
        referralId: ref,
        type: 'PITCH_VIEWED',
        platform: 'web',
        userAgent: 'server-side',
        ipAddress: 'server-side'
      })
    } catch (error) {
      console.error('Failed to record referral event:', error)
    }
  }

  // ALWAYS track pitch views, even for direct visits
  // Create a direct visit event for analytics
  try {
    const supabaseClient = await createSupabaseServerOnly()
    
    // Insert a direct pitch view event into referral_events
    // We'll use a special referral_id to indicate direct visits
    const { data: directReferral } = await supabaseClient
      .from('referrals')
      .select('id')
      .eq('pitch_id', id)
      .eq('supporter_id', '00000000-0000-0000-0000-000000000000') // Special ID for direct visits
      .single()
    
    let referralId = directReferral?.id
    
    // If no direct referral exists, create one
    if (!referralId) {
      const { data: newDirectReferral } = await supabaseClient
        .from('referrals')
        .insert({
          supporter_id: '00000000-0000-0000-0000-000000000000', // Special ID for direct visits
          pitch_id: id,
          share_link: `direct-${id}`
        })
        .select('id')
        .single()
      
      referralId = newDirectReferral?.id
    }
    
    if (referralId) {
      await recordEvent({
        referralId,
        type: 'PITCH_VIEWED',
        platform: 'direct',
        userAgent: 'server-side',
        ipAddress: 'server-side'
      })
    }
  } catch (error) {
    console.error('Failed to record direct pitch view:', error)
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
