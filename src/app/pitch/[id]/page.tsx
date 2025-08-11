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
  const { data, error } = await supabase
    .from('pitches')
    .select(`
      *,
      veteran:users!pitches_veteran_id_fkey(
        id,
        name,
        email,
        phone,
        veterans!veterans_user_id_fkey(
          rank,
          service_branch,
          years_experience,
          location_current,
          locations_preferred
        )
      )
    `)
    .eq('id', id)
    .eq('is_active', true)
    .gt('plan_expires_at', new Date().toISOString())
    .single()

  if (error) {
    return null
  }
  
  return data
}

async function fetchUser() {
  const cookieStore = await cookies()
  const supabase = createSupabaseServerOnly()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }

  // Get user profile
  const { data: userProfile } = await supabase
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
    getVeteranEndorsements(pitch.veteran_id),
    isCommunityVerified(pitch.veteran_id)
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

  const veteranName = pitch.veteran?.name || 'Veteran'
  const veteranRank = pitch.veteran_profile?.rank
  const veteranBranch = pitch.veteran_profile?.service_branch
  const veteranYears = pitch.veteran_profile?.years_experience

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{pitch.title}</h1>
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
              <p className="text-gray-700 leading-relaxed mb-4">{pitch.pitch_text}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {pitch.skills.map((skill: string, i: number) => (
                  <span key={i} className="px-3 py-1 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 text-xs rounded-full border border-blue-200 font-medium">
                    {skill}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
                <div><span className="font-medium text-gray-800">Job Type:</span> {pitch.job_type}</div>
                <div><span className="font-medium text-gray-800">Availability:</span> {pitch.availability}</div>
                <div><span className="font-medium text-gray-800">Location:</span> {pitch.location}</div>
                <div><span className="font-medium text-gray-800">Service:</span> {veteranBranch || 'Military'}</div>
              </div>
            </div>
            <div className="md:col-span-2 space-y-4">
              {/* Photo */}
              {pitch.photo_url && (
                <img src={pitch.photo_url} alt={veteranName} className="w-full h-56 object-cover rounded-xl" />
              )}
              
              {/* Contact buttons */}
              <ContactButtons 
                phone={pitch.phone} 
                email={pitch.veteran?.email} 
                referralId={ref}
                pitchId={pitch.id}
                veteranName={veteranName}
                pitchTitle={pitch.title}
              />
              
              {/* Action buttons */}
              <div className="grid grid-cols-1 gap-3">
                <LikeButton 
                  pitchId={pitch.id} 
                  initialCount={pitch.likes_count || 0}
                  userId={user?.id}
                />
                <ReferButton 
                  pitchId={pitch.id} 
                  pitchTitle={pitch.title} 
                  veteranName={veteranName}
                  userId={user?.id}
                />
                {user?.role === 'recruiter' && (
                  <RequestResumeButton
                    pitchId={pitch.id}
                    veteranId={pitch.veteran_id}
                    recruiterId={user.id}
                    veteranName={veteranName}
                    pitchTitle={pitch.title}
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
            pitchId={pitch.id}
            userId={user?.id}
            userRole={user?.role}
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
