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
        phone
      )
    `)
    .eq('id', id)
    .eq('is_active', true)
    .single()

  if (pitchError || !pitch) {
    return null
  }

  // Increment view count
  try {
    await supabaseClient.rpc('increment_pitch_views', { pitch_id: id })
  } catch (error) {
    console.error('Failed to increment view count:', error)
  }

  return pitch
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
