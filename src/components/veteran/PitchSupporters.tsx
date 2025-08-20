'use client'

import { useState, useEffect } from 'react'
import { createSupabaseBrowser } from '@/lib/supabaseBrowser'
import { getPitchSupporters } from '@/lib/actions/pitch-connections'
import { 
  Users, Heart, TrendingUp, Calendar, ArrowUpRight, 
  Eye, Share2, Phone, Mail, Award, Zap, Crown
} from 'lucide-react'

interface PitchSupporter {
  id: string
  supporter_id: string
  share_link: string
  created_at: string
  users: {
    id: string
    name: string
    avatar_url: string
    email: string
  }
  metrics: {
    clicks: number
    shares: number
    calls: number
    emails: number
    total_activity: number
    last_activity: string | null
  }
}

export default function PitchSupporters({ pitchId }: { pitchId: string }) {
  const [supporters, setSupporters] = useState<PitchSupporter[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadSupporters() {
      try {
        setLoading(true)
        const result = await getPitchSupporters(pitchId)
        
        if (result.success) {
          setSupporters(result.data || [])
        } else {
          setError(result.error || 'Failed to load supporters')
        }
      } catch (err) {
        console.error('Error loading supporters:', err)
        setError('Failed to load supporters')
      } finally {
        setLoading(false)
      }
    }

    if (pitchId) {
      loadSupporters()
    }
  }, [pitchId])

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <div className="text-center text-gray-500">
          <p>Error loading supporters: {error}</p>
        </div>
      </div>
    )
  }

  if (supporters.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Supporters Yet
          </h3>
          <p className="text-gray-600 mb-4">
            Share your pitch to get supporters and referrals
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Heart className="w-4 h-4" />
            <span>Supporters will appear here when they connect to your pitch</span>
          </div>
        </div>
      </div>
    )
  }

  // Sort supporters by activity (most active first)
  const sortedSupporters = [...supporters].sort((a, b) => b.metrics.total_activity - a.metrics.total_activity)

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Your Supporters
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              People actively supporting and referring your pitch
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">
              {supporters.length}
            </div>
            <div className="text-xs text-gray-500">Active Supporters</div>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {sortedSupporters.map((supporter, index) => (
          <div key={supporter.id} className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3 flex-1">
                {/* Supporter Avatar */}
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {supporter.users.name.charAt(0).toUpperCase()}
                  </div>
                  {/* Top supporter badge */}
                  {index === 0 && supporter.metrics.total_activity > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                      <Crown className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900">
                      {supporter.users.name}
                    </h4>
                    {supporter.metrics.total_activity > 5 && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                        <Award className="w-3 h-3" />
                        Top Supporter
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    Supporting since {new Date(supporter.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-lg font-bold text-green-600">
                  {supporter.metrics.total_activity}
                </div>
                <div className="text-xs text-gray-500">Activities</div>
              </div>
            </div>

            {/* Activity Metrics */}
            <div className="grid grid-cols-4 gap-4 mt-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Eye className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-semibold text-gray-900">
                    {supporter.metrics.clicks}
                  </span>
                </div>
                <div className="text-xs text-gray-500">Views</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Share2 className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-semibold text-gray-900">
                    {supporter.metrics.shares}
                  </span>
                </div>
                <div className="text-xs text-gray-500">Shares</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Phone className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-semibold text-gray-900">
                    {supporter.metrics.calls}
                  </span>
                </div>
                <div className="text-xs text-gray-500">Calls</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Mail className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-semibold text-gray-900">
                    {supporter.metrics.emails}
                  </span>
                </div>
                <div className="text-xs text-gray-500">Emails</div>
              </div>
            </div>

            {/* Last Activity */}
            {supporter.metrics.last_activity && (
              <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                <Zap className="w-4 h-4" />
                <span>
                  Last active: {new Date(supporter.metrics.last_activity).toLocaleDateString()}
                </span>
              </div>
            )}

            {/* Supporter Actions */}
            <div className="mt-4 flex items-center gap-2">
              <a
                href={`mailto:${supporter.users.email}?subject=Thank you for supporting my pitch`}
                className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
              >
                <Mail className="w-4 h-4" />
                Thank Supporter
              </a>
              <div className="inline-flex items-center gap-2 px-3 py-2 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium">
                <Share2 className="w-4 h-4" />
                {supporter.share_link ? 'Has Share Link' : 'No Share Link'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {supporters.length > 0 && (
        <div className="p-6 border-t border-gray-100 bg-gray-50">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-green-600 font-medium">
              <TrendingUp className="w-4 h-4" />
              {supporters.length} supporter{supporters.length !== 1 ? 's' : ''} actively helping you
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Keep sharing your pitch to get more supporters
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
