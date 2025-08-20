'use client'

import { useState, useEffect } from 'react'
import { createSupabaseBrowser } from '@/lib/supabaseBrowser'
import { getSupporterConnections } from '@/lib/actions/pitch-connections'
import { 
  Eye, Share2, Phone, Mail, TrendingUp, Users, Calendar, 
  ArrowUpRight, ExternalLink, Heart, Award, Zap
} from 'lucide-react'
import Link from 'next/link'

interface ConnectedPitch {
  id: string
  pitch_id: string
  share_link: string
  created_at: string
  pitches: {
    id: string
    title: string
    user_id: string
    users: {
      id: string
      name: string
      avatar_url: string
    }
  }
  metrics: {
    clicks: number
    shares: number
    calls: number
    emails: number
    total_activity: number
  }
}

export default function ConnectedPitches({ supporterId }: { supporterId: string }) {
  const [connections, setConnections] = useState<ConnectedPitch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadConnections() {
      try {
        setLoading(true)
        const result = await getSupporterConnections(supporterId)
        
        if (result.success) {
          setConnections(result.data || [])
        } else {
          setError(result.error || 'Failed to load connections')
        }
      } catch (err) {
        console.error('Error loading connections:', err)
        setError('Failed to load connections')
      } finally {
        setLoading(false)
      }
    }

    if (supporterId) {
      loadConnections()
    }
  }, [supporterId])

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-lg"></div>
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
          <p>Error loading connections: {error}</p>
        </div>
      </div>
    )
  }

  if (connections.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Connected Pitches Yet
          </h3>
          <p className="text-gray-600 mb-4">
            Start supporting veterans by connecting to their pitches
          </p>
          <Link
            href="/showcase"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Users className="w-4 h-4" />
            Browse Veterans
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Connected Pitches
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Veterans you're supporting and referring
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">
              {connections.length}
            </div>
            <div className="text-xs text-gray-500">Active Connections</div>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {connections.map((connection) => (
          <div key={connection.id} className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {connection.pitches.users.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {connection.pitches.title}
                    </h4>
                    <p className="text-sm text-gray-600">
                      by {connection.pitches.users.name}
                    </p>
                  </div>
                </div>

                {/* Activity Metrics */}
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Eye className="w-4 h-4 text-blue-500" />
                      <span className="text-lg font-bold text-gray-900">
                        {connection.metrics.clicks}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">Views</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Share2 className="w-4 h-4 text-green-500" />
                      <span className="text-lg font-bold text-gray-900">
                        {connection.metrics.shares}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">Shares</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Phone className="w-4 h-4 text-purple-500" />
                      <span className="text-lg font-bold text-gray-900">
                        {connection.metrics.calls}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">Calls</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Mail className="w-4 h-4 text-orange-500" />
                      <span className="text-lg font-bold text-gray-900">
                        {connection.metrics.emails}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">Emails</div>
                  </div>
                </div>

                {/* Connection Date */}
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Connected {new Date(connection.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2 ml-4">
                <Link
                  href={`/pitch/${connection.pitch_id}`}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                >
                  <Eye className="w-4 h-4" />
                  View Pitch
                </Link>
                <Link
                  href={`/pitch/${connection.pitch_id}?ref=${connection.id}`}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
                >
                  <Share2 className="w-4 h-4" />
                  Share Link
                </Link>
              </div>
            </div>

            {/* Activity Badge */}
            {connection.metrics.total_activity > 0 && (
              <div className="mt-3 flex items-center gap-2">
                <div className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                  <Zap className="w-3 h-3" />
                  {connection.metrics.total_activity} activities
                </div>
                <div className="text-xs text-gray-500">
                  Last activity: {new Date(connection.created_at).toLocaleDateString()}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {connections.length > 0 && (
        <div className="p-6 border-t border-gray-100 bg-gray-50">
          <div className="text-center">
            <Link
              href="/showcase"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <Users className="w-4 h-4" />
              Find More Veterans to Support
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
