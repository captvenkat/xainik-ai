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
  
  // Get pitch with user data using specific relationship
  const supabaseClient = await supabase
  const { data: pitch, error: pitchError } = await supabaseClient
    .from('pitches')
    .select(`
      *,
      users!pitches_user_id_fkey (
        id,
        name,
        email,
        role
      )
    `)
    .eq('id', id)
    .eq('is_active', true)
    .single()

  if (pitchError || !pitch) {
    return null
  }

  // Fetch veterans data separately since there's no direct relationship
  const { data: veterans } = await supabaseClient
    .from('veterans')
    .select('bio')
    .eq('user_id', pitch.user_id)
    .limit(1)

  return {
    ...pitch,
    veterans: veterans || []
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
    getVeteranEndorsements(pitch.user_id as string),
    isCommunityVerified(pitch.user_id as string)
  ])

  // Transform pitch data for FullPitchView
  const fullPitchData = toFullPitchData(pitch as any)

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

  // Note: veteran relationship data not available in simplified query
  const veteranName = 'Veteran'
  const veteranRank = ''
  const veteranBranch = ''
  const veteranYears = ''

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Community Verification Badge */}
        {isVerified && (
          <div className="mb-8 text-center">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200 shadow-sm">
              🛡️ Community Verified Veteran
            </span>
          </div>
        )}

        {/* Full Pitch View */}
        <FullPitchView 
          pitch={fullPitchData}
          currentUserId={user?.id}
        />

        {/* Support Section */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 md:p-12 text-white shadow-2xl">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Support Our Mission
            </h3>
            <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
              Help us connect more veterans with meaningful opportunities. Your support enables us to maintain and expand this platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/donations" 
                className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Make a Donation
              </a>
              <a 
                href="/support-the-mission" 
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 rounded-2xl font-semibold transition-all duration-300"
              >
                Become a Supporter
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
