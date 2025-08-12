import { createSupabaseServerOnly } from '@/lib/supabaseServerOnly'
import ContactButtons from '@/components/ContactButtons'
import EndorsementsList from '@/components/EndorsementsList'
import LikeButton from '@/components/LikeButton'
import ReferButton from '@/components/ReferButton'
import RequestResumeButton from '@/components/RequestResumeButton'
import { recordEvent } from '@/lib/referralEvents'
import { getVeteranEndorsements, isCommunityVerified } from '@/lib/actions/endorsements'
import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'

export const revalidate = 30

async function fetchPitch(id: string) {
  const supabase = createSupabaseServerOnly()
  
  // First get the pitch
  const supabaseClient = await supabase
  const { data: pitch, error: pitchError } = await supabaseClient
    .from('pitches')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .gt('end_date', new Date().toISOString())
    .single()

  if (pitchError || !pitch) {
    return null
  }

  // Then get the veteran data
  const { data: veteran, error: veteranError } = await supabaseClient
    .from('users')
    .select('id, name, email')
    .eq('id', pitch.user_id as string)
    .single()

  // Get veteran profile
  const { data: veteranProfile } = await supabaseClient
    .from('user_profiles')
    .select('profile_data')
    .eq('user_id', pitch.user_id as string)
    .eq('profile_type', 'veteran')
    .single()

  return {
    ...pitch,
    id: pitch.id,
    veteran,
    veteran_profile: veteranProfile,
    user_id: pitch.user_id,
    title: pitch.title,
    pitch_text: pitch.pitch_text,
    skills: pitch.skills,
    created_at: pitch.created_at,
    updated_at: pitch.updated_at
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
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{pitch.title as string}</h1>
            {isVerified && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                🛡️ Community Verified
              </span>
            )}
          </div>
          <div className="text-gray-600">
            {veteranName}
            {veteranRank && ` • ${veteranRank}`}
            {veteranBranch && ` • ${veteranBranch}`}
            {veteranYears && ` • ${veteranYears} years`}
          </div>
        </div>

        {/* Main content */}
        <div className="card-premium p-6 mb-8">
          <div className="grid md:grid-cols-5 gap-6">
            <div className="md:col-span-3">
              <p className="text-gray-700 leading-relaxed mb-4">{pitch.pitch_text as string}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {(pitch.skills as string[]).map((skill: string, i: number) => (
                  <span key={i} className="px-3 py-1 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 text-xs rounded-full border border-blue-200 font-medium">
                    {skill}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
                <div><span className="font-medium text-gray-800">Experience:</span> {pitch.experience_years} years</div>
                <div><span className="font-medium text-gray-800">LinkedIn:</span> {pitch.linkedin_url ? 'Available' : 'Not provided'}</div>
                <div><span className="font-medium text-gray-800">Resume:</span> {pitch.resume_url ? 'Available' : 'Not provided'}</div>
                <div><span className="font-medium text-gray-800">Service:</span> {veteranBranch || 'Military'}</div>
              </div>
            </div>
            <div className="md:col-span-2 space-y-4">
              {/* Photo placeholder - no photo_url in live schema */}
              <div className="w-full h-56 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-2xl text-blue-600">{veteranName.charAt(0)}</span>
                  </div>
                  <p className="text-sm text-gray-600">Profile Photo</p>
                </div>
              </div>
              
              {/* Contact buttons */}
              <ContactButtons 
                phone={undefined} 
                email={pitch.veteran?.email as string} 
                referralId={ref}
                pitchId={pitch.id as string}
                veteranName={veteranName}
                pitchTitle={pitch.title as string}
              />
              
              {/* Action buttons */}
              <div className="grid grid-cols-1 gap-3">
                <LikeButton 
                  pitchId={pitch.id as string} 
                  initialCount={0}
                  userId={user?.id as string}
                />
                <ReferButton 
                  pitchId={pitch.id as string} 
                  pitchTitle={pitch.title as string} 
                  veteranName={veteranName}
                  userId={user?.id as string}
                />
                {user?.role === 'recruiter' && (
                  <RequestResumeButton
                    pitchId={pitch.id as string}
                    veteranId={pitch.user_id as string}
                    recruiterId={user.id as string}
                    veteranName={veteranName}
                    pitchTitle={pitch.title as string}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Endorsements */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Endorsements ({endorsements.length})</h2>
            {user && user.role === 'supporter' && (
              <button className="btn-secondary text-sm">
                Add Endorsement
              </button>
            )}
          </div>
          <EndorsementsList 
            endorsements={endorsements} 
            pitchId={pitch.id as string}
            userId={user?.id as string}
            userRole={user?.role as string}
          />
        </div>

        {/* Contribute */}
        <div className="card-glass p-6">
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
