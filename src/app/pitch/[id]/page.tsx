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
  
  // Get pitch with all related data
  const supabaseClient = await supabase
  const { data: pitch, error: pitchError } = await supabaseClient
    .from('pitches')
    .select(`
      *,
      user:users(id, name, email),
      endorsements:endorsements(
        id,
        text,
        rating,
        is_public,
        created_at,
        endorser_user_id
      )
    `)
    .eq('id', id)
    .eq('is_active', true)
    .single()

  if (pitchError || !pitch) {
    return null
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
    getVeteranEndorsements(pitch.veteran_id as string),
    isCommunityVerified(pitch.veteran_id as string)
  ])

  // Transform pitch data for FullPitchView
  const fullPitchData = toFullPitchData(pitch)

  // Log referral event if referral ID is present
  if (ref) {
    try {
      const headersList = await headers()
      const userAgent = headersList.get('user-agent') || 'server-side'
      const ipHash = headersList.get('x-xainik-ip-hash') || 'server-side'
      
      await recordEvent({
        referralId: ref,
        type: 'PITCH_VIEWED',
        platform: 'web',
        userAgent,
        ipAddress: ipHash
      })
    } catch (error) {
      // Don't break the UI if logging fails
    }
  }

  const veteranName = (pitch.veteran?.name as string) || 'Veteran'
  const veteranProfileData = pitch.veteran_profile?.profile_data as any
  const veteranRank = veteranProfileData?.rank || ''
  const veteranBranch = veteranProfileData?.service_branch || ''
  const veteranYears = veteranProfileData?.years_experience || ''

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Community Verification Badge */}
        {isVerified && (
          <div className="mb-6 text-center">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              🛡️ Community Verified Veteran
            </span>
          </div>
        )}

        {/* Full Pitch View */}
        <FullPitchView 
          pitch={fullPitchData}
          currentUserId={user?.id}
          onContact={() => {
            // Handle contact action
          }}
          onRequestResume={() => {
            // Handle resume request
          }}
        />

        {/* Contribute */}
        <div className="mt-8 card-glass p-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="text-gray-800 font-semibold">Support the platform</div>
            <div className="flex items-center gap-3">
              <a href="/donations" className="btn-secondary">Donate</a>
              <a href="/support-the-mission" className="btn-primary">Become a Supporter</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
