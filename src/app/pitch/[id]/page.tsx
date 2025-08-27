import { createSupabaseServerOnly } from '@/lib/supabaseServerOnly'
import FullPitchView from '@/components/FullPitchView'
import { getVeteranEndorsements, isCommunityVerified } from '@/lib/actions/endorsements'
import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { toFullPitchData } from '@/lib/mappers/pitches'
import { Metadata } from 'next'

export const revalidate = 30

// Generate metadata for SEO and social sharing
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}): Promise<Metadata> {
  const { id } = await params
  const supabase = createSupabaseServerOnly()
  const supabaseClient = await supabase
  
  // Fetch pitch data for metadata
  const { data: pitch } = await supabaseClient
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

  if (!pitch) {
    return {
      title: 'Pitch Not Found - Xainik',
      description: 'This veteran pitch could not be found.'
    }
  }

  const veteranName = pitch.users?.name || 'Veteran'
  const pitchTitle = pitch.title || 'Veteran Pitch'
  const pitchDescription = pitch.description || `Check out ${veteranName}'s professional pitch on Xainik`
  
  // Get military data for richer description
  const { data: veteranProfile } = await supabaseClient
    .from('veterans')
    .select('rank, service_branch, years_experience')
    .eq('user_id', pitch.user_id)
    .single()

  const militaryInfo = veteranProfile ? 
    `${veteranProfile.rank} ${veteranProfile.service_branch} veteran with ${veteranProfile.years_experience} years experience` : 
    'Military veteran'

  const fullDescription = `${militaryInfo} looking for opportunities. ${pitchDescription}`

  // Generate OG image URL
  const ogImageUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://xainik.com'}/api/og/pitch?id=${id}&title=${encodeURIComponent(pitchTitle)}&name=${encodeURIComponent(veteranName)}`

  return {
    title: `${pitchTitle} by ${veteranName} - Xainik`,
    description: fullDescription,
    keywords: ['veteran', 'military', 'job', 'career', 'opportunity', 'pitch', 'referral'],
    authors: [{ name: veteranName }],
    openGraph: {
      title: `${pitchTitle} by ${veteranName}`,
      description: fullDescription,
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://xainik.com'}/pitch/${id}`,
      siteName: 'Xainik - Veteran Success Foundation',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${pitchTitle} by ${veteranName}`,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${pitchTitle} by ${veteranName}`,
      description: fullDescription,
      images: [ogImageUrl],
      creator: '@xainik',
      site: '@xainik',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://xainik.com'}/pitch/${id}`,
    },
  }
}

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



  // Note: Tracking is now handled by the new tracking system in FullPitchView component
  // The new system uses /api/track-event with user_id as central source of truth

  return (
    <div data-pitch-id={id} data-user-id={pitch.user_id}>
      <FullPitchView 
        pitch={fullPitchData} 
        user={user} 
        endorsements={endorsements}
        isCommunityVerified={isVerified}
      />
    </div>
  )
}
