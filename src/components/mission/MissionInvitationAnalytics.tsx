'use client'

import { useState, useEffect } from 'react'
import { createSupabaseBrowser } from '@/lib/supabaseBrowser'
import { 
  Users, Share2, TrendingUp, Heart, Star, Award, 
  ArrowUpRight, ArrowDownRight, Calendar, Target
} from 'lucide-react'

// =====================================================
// MISSION INVITATION ANALYTICS
// Shows invitation impact and network growth
// =====================================================

interface MissionInvitationData {
  total_invitations: number
  pending_invitations: number
  accepted_invitations: number
  declined_invitations: number
  expired_invitations: number
  total_registrations: number
  veteran_registrations: number
  recruiter_registrations: number
  supporter_registrations: number
  last_invitation_at: string | null
  first_invitation_at: string | null
}

interface MissionInvitationAnalyticsProps {
  userId: string
}

export default function MissionInvitationAnalytics({ userId }: MissionInvitationAnalyticsProps) {
  const [data, setData] = useState<MissionInvitationData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchInvitationAnalytics()
  }, [userId])

  async function fetchInvitationAnalytics() {
    try {
      setIsLoading(true)
      setError(null)
      
      const supabase = createSupabaseBrowser()
      
      // Get invitation analytics from the view
      const { data: analytics, error } = await supabase
        .from('mission_invitation_summary')
        .select('*')
        .eq('inviter_id', userId)
        .single()

      if (error) {
        throw new Error(error.message)
      }

      setData(analytics)
      
    } catch (error) {
      console.error('Failed to fetch invitation analytics:', error)
      setError('Failed to load invitation analytics')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
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
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchInvitationAnalytics}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!data || data.total_invitations === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Start Inviting People</h3>
          <p className="text-gray-600 mb-4">
            Share the mission with your network and see your impact grow
          </p>
          <div className="text-sm text-gray-500">
            Your invitation analytics will appear here
          </div>
        </div>
      </div>
    )
  }

  const acceptanceRate = data.total_invitations > 0 
    ? Math.round((data.accepted_invitations / data.total_invitations) * 100) 
    : 0

  const registrationRate = data.total_invitations > 0 
    ? Math.round((data.total_registrations / data.total_invitations) * 100) 
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Your Mission Impact</h3>
            <p className="text-gray-600">See how your invitations are growing the community</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-blue-600 mb-1">{data.total_invitations}</div>
            <div className="text-sm text-gray-600 mb-2">Total Invitations</div>
            <div className="text-xs text-blue-600 font-medium">
              {data.last_invitation_at ? 'Last sent ' + new Date(data.last_invitation_at).toLocaleDateString() : 'No recent activity'}
            </div>
          </div>
          
          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-green-600 mb-1">{data.total_registrations}</div>
            <div className="text-sm text-gray-600 mb-2">People Joined</div>
            <div className="text-xs text-green-600 font-medium">
              {registrationRate}% success rate
            </div>
          </div>
          
          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-purple-600 mb-1">{acceptanceRate}%</div>
            <div className="text-sm text-gray-600 mb-2">Acceptance Rate</div>
            <div className="text-xs text-purple-600 font-medium">
              {data.accepted_invitations} accepted
            </div>
          </div>
          
          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-orange-600 mb-1">{data.pending_invitations}</div>
            <div className="text-sm text-gray-600 mb-2">Pending</div>
            <div className="text-xs text-orange-600 font-medium">
              Awaiting response
            </div>
          </div>
        </div>
      </div>

      {/* Role Breakdown */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Community Growth by Role</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-100">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-600 mb-1">{data.veteran_registrations}</div>
            <div className="text-sm text-gray-600 mb-2">Veterans</div>
            <div className="text-xs text-green-600 font-medium">
              Looking for opportunities
            </div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Star className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-600 mb-1">{data.recruiter_registrations}</div>
            <div className="text-sm text-gray-600 mb-2">Recruiters</div>
            <div className="text-xs text-blue-600 font-medium">
              Hiring talent
            </div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg border border-purple-100">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Heart className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-600 mb-1">{data.supporter_registrations}</div>
            <div className="text-sm text-gray-600 mb-2">Supporters</div>
            <div className="text-xs text-purple-600 font-medium">
              Helping the mission
            </div>
          </div>
        </div>
      </div>

      {/* Invitation Timeline */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Invitation Timeline</h3>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>
              {data.first_invitation_at 
                ? `Started ${new Date(data.first_invitation_at).toLocaleDateString()}`
                : 'No invitations yet'
              }
            </span>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Share2 className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-900">Invitations Sent</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-gray-900">{data.total_invitations}</div>
              <div className="text-xs text-gray-500">Total</div>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
              <span className="text-sm font-medium text-gray-900">People Joined</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-green-600">{data.total_registrations}</div>
              <div className="text-xs text-gray-500">{registrationRate}% success</div>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <Target className="w-4 h-4 text-orange-600" />
              </div>
              <span className="text-sm font-medium text-gray-900">Pending Response</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-orange-600">{data.pending_invitations}</div>
              <div className="text-xs text-gray-500">Awaiting</div>
            </div>
          </div>
        </div>
      </div>

      {/* Impact Summary */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Award className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Mission Impact Summary</h3>
          <p className="text-gray-600 mb-4">
            You've helped {data.total_registrations} people join the mission to support veterans
          </p>
          <div className="text-sm text-purple-600 font-medium">
            Keep inviting people to grow the community!
          </div>
        </div>
      </div>
    </div>
  )
}
