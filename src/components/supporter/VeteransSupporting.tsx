'use client'

import { useState, useEffect } from 'react'
import { createSupabaseBrowser } from '@/lib/supabaseBrowser'
import { 
  Users, Eye, Heart, Share2, TrendingUp, Award, Target, 
  Calendar, MapPin, Briefcase, Star, ExternalLink
} from 'lucide-react'

// =====================================================
// VETERANS YOU'RE SUPPORTING COMPONENT
// Professional Stripe-level design showing supporter impact
// =====================================================

interface Veteran {
  id: string
  name: string
  title: string
  location: string
  company: string
  photo_url?: string
  pitch_title?: string
  pitch_text?: string
  views_count?: number
  likes_count?: number
  shares_count?: number
  endorsements_count?: number
  created_at?: string
  last_activity?: string
  interaction_type: 'endorsed' | 'engaged'
  interaction_date?: string
}

interface SupporterImpact {
  totalVeterans: number
  totalViews: number
  totalLikes: number
  totalShares: number
  totalEndorsements: number
  recentActivity: any[]
}

interface VeteransSupportingProps {
  userId: string
}

export default function VeteransSupporting({ userId }: VeteransSupportingProps) {
  const [veterans, setVeterans] = useState<Veteran[]>([])
  const [impact, setImpact] = useState<SupporterImpact | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (userId) {
      fetchVeteransSupporting()
    }
  }, [userId])

  async function fetchVeteransSupporting() {
    try {
      setLoading(true)
      const supabase = createSupabaseBrowser()

      // Fetch veterans the supporter has endorsed
      const { data: endorsements } = await supabase
        .from('endorsements')
        .select('veteran_id, created_at')
        .eq('endorser_user_id', userId)

      // Get veteran details for endorsed veterans
      const endorsedVeteranIds = endorsements?.map(e => e.veteran_id) || []
      const { data: endorsedVeterans } = await supabase
        .from('users')
        .select('id, name, title, location, company, photo_url')
        .in('id', endorsedVeteranIds)

      // Fetch pitches the supporter has interacted with
      const { data: pitchInteractions } = await supabase
        .from('user_activity_log')
        .select('pitch_id, created_at')
        .eq('user_id', userId)
        .in('activity_type', ['pitch_viewed', 'pitch_liked', 'pitch_shared'])

      // Get pitch details for interactions
      const pitchIds = pitchInteractions?.map(p => p.pitch_id).filter(Boolean) || []
      const { data: pitches } = await supabase
        .from('pitches')
        .select('id, title, pitch_text, user_id, views_count, likes_count, shares_count')
        .in('id', pitchIds)

      // Get user details for pitch creators
      const pitchUserIds = pitches?.map(p => p.user_id).filter(Boolean) || []
      const { data: pitchUsers } = await supabase
        .from('users')
        .select('id, name, title, location, company, photo_url')
        .in('id', pitchUserIds)

      // Combine and deduplicate veterans
      const veteranMap = new Map()
      
      // Add endorsed veterans
      endorsedVeterans?.forEach(veteran => {
        veteranMap.set(veteran.id, {
          ...veteran,
          interaction_type: 'endorsed',
          interaction_date: endorsements?.find(e => e.veteran_id === veteran.id)?.created_at
        })
      })

      // Add veterans from pitch interactions
      pitches?.forEach(pitch => {
        const pitchUser = pitchUsers?.find(u => u.id === pitch.user_id)
        if (pitchUser && !veteranMap.has(pitchUser.id)) {
          veteranMap.set(pitchUser.id, {
            ...pitchUser,
            interaction_type: 'engaged',
            interaction_date: pitchInteractions?.find(p => p.pitch_id === pitch.id)?.created_at,
            pitch_title: pitch.title,
            pitch_text: pitch.pitch_text,
            views_count: pitch.views_count,
            likes_count: pitch.likes_count,
            shares_count: pitch.shares_count
          })
        }
      })

      const veteransList = Array.from(veteranMap.values())
      setVeterans(veteransList)

      // Calculate impact metrics
      const totalViews = veteransList.reduce((sum, v) => sum + (v.views_count || 0), 0)
      const totalLikes = veteransList.reduce((sum, v) => sum + (v.likes_count || 0), 0)
      const totalShares = veteransList.reduce((sum, v) => sum + (v.shares_count || 0), 0)
      const totalEndorsements = endorsements?.length || 0

      setImpact({
        totalVeterans: veteransList.length,
        totalViews,
        totalLikes,
        totalShares,
        totalEndorsements,
        recentActivity: []
      })

    } catch (error) {
      console.error('Error fetching veterans supporting:', error)
      setError('Failed to load veterans data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="text-center py-8">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Hero Impact Section */}
      <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-xl p-6 border border-red-100">
        <div className="text-center mb-6">
          <div className="text-4xl mb-4">🦅</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Your Veteran Impact Network</h3>
          <p className="text-gray-600">Every interaction creates opportunities. See the heroes you're helping succeed.</p>
        </div>
        
        {/* Impact Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-white rounded-lg shadow-sm border border-red-100">
            <div className="text-2xl font-bold text-red-600 mb-1">{impact?.totalVeterans || 0}</div>
            <div className="text-sm text-gray-600">Heroes Supported</div>
          </div>
          
          <div className="text-center p-4 bg-white rounded-lg shadow-sm border border-green-100">
            <div className="text-2xl font-bold text-green-600 mb-1">{impact?.totalViews || 0}</div>
            <div className="text-sm text-gray-600">Pitches Viewed</div>
          </div>
          
          <div className="text-center p-4 bg-white rounded-lg shadow-sm border border-purple-100">
            <div className="text-2xl font-bold text-purple-600 mb-1">{impact?.totalLikes || 0}</div>
            <div className="text-sm text-gray-600">Likes Given</div>
          </div>
          
          <div className="text-center p-4 bg-white rounded-lg shadow-sm border border-orange-100">
            <div className="text-2xl font-bold text-orange-600 mb-1">{impact?.totalEndorsements || 0}</div>
            <div className="text-sm text-gray-600">Endorsements</div>
          </div>
        </div>
      </div>

      {/* Veterans List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-red-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900">Heroes You're Supporting</h4>
          </div>
          <p className="text-sm text-gray-600">These veterans are building their futures with your support. Every interaction matters.</p>
        </div>
        
        {veterans.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🦅</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Support Heroes?</h3>
            <p className="text-gray-600 mb-4">Your first endorsement could change a veteran's life. Start building your impact network today.</p>
            <a
              href="/browse"
              className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              <Users className="w-4 h-4" />
              Discover Veterans
            </a>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {veterans.map((veteran) => (
              <div key={veteran.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-4">
                  {/* Veteran Avatar */}
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {veteran.photo_url ? (
                      <img 
                        src={veteran.photo_url} 
                        alt={veteran.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      veteran.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  
                  {/* Veteran Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h5 className="font-semibold text-gray-900">{veteran.name}</h5>
                        <p className="text-sm text-gray-600">{veteran.title}</p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {veteran.location}
                          </span>
                          {veteran.company && (
                            <span className="flex items-center gap-1">
                              <Briefcase className="w-3 h-3" />
                              {veteran.company}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Interaction Badge */}
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        veteran.interaction_type === 'endorsed' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {veteran.interaction_type === 'endorsed' ? 'Endorsed' : 'Engaged'}
                      </span>
                    </div>
                    
                    {/* Pitch Info - Enhanced */}
                    {veteran.pitch_title && (
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mt-3 border border-blue-100">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center">
                            <Target className="w-2.5 h-2.5 text-blue-600" />
                          </div>
                          <h6 className="font-semibold text-gray-900">Their Pitch</h6>
                        </div>
                        <h6 className="font-medium text-blue-900 mb-2">{veteran.pitch_title}</h6>
                        <p className="text-sm text-gray-700 line-clamp-2">{veteran.pitch_text}</p>
                      </div>
                    )}
                    
                    {/* Engagement Metrics */}
                    <div className="flex items-center gap-6 mt-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {veteran.views_count || 0} views
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        {veteran.likes_count || 0} likes
                      </span>
                      <span className="flex items-center gap-1">
                        <Share2 className="w-4 h-4" />
                        {veteran.shares_count || 0} shares
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4" />
                        {veteran.endorsements_count || 0} endorsements
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons - Enhanced */}
                <div className="flex items-center gap-3 mt-4">
                  <a
                    href={`/pitch/${veteran.id}`}
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Full Pitch
                  </a>
                  <button className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
                    <Heart className="w-4 h-4" />
                    Endorse
                  </button>
                  <button className="inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium">
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
