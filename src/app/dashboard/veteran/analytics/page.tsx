'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowser } from '@/lib/supabaseBrowser'
import { useAuth } from '@/lib/hooks/useAuth'
import AppContainer from '@/components/AppContainer'
import BottomNav from '@/components/BottomNav'
import { BarChart3, Eye, Heart, Share, TrendingUp, Users } from 'lucide-react'

export default function VeteranAnalyticsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [analytics, setAnalytics] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) {
      loadAnalytics()
    }
  }, [user])

  const loadAnalytics = async () => {
    try {
      const supabase = createSupabaseBrowser()
      
      // Get user's pitch
      const { data: pitches } = await supabase
        .from('pitches')
        .select('*')
        .eq('user_id', user?.id)
        .limit(1)

      if (pitches && pitches.length > 0) {
        // For now, we'll show mock analytics data
        // In a real implementation, you'd query analytics tables
        setAnalytics({
          pitch: pitches[0],
          metrics: {
            total_views: 156,
            total_likes: 23,
            total_shares: 8,
            total_endorsements: 5,
            conversion_rate: 12.5,
            engagement_rate: 23.1
          },
          recent_activity: [
            {
              id: '1',
              type: 'view',
              description: 'Someone viewed your pitch',
              time: '2 hours ago'
            },
            {
              id: '2',
              type: 'like',
              description: 'Colonel Kumar liked your pitch',
              time: '4 hours ago'
            },
            {
              id: '3',
              type: 'share',
              description: 'Your pitch was shared on LinkedIn',
              time: '1 day ago'
            }
          ],
          top_performers: [
            {
              platform: 'LinkedIn',
              views: 89,
              shares: 5
            },
            {
              platform: 'WhatsApp',
              views: 45,
              shares: 2
            },
            {
              platform: 'Direct',
              views: 22,
              shares: 1
            }
          ]
        })
      }
    } catch (error) {
      console.error('Error loading analytics:', error)
      setError('Failed to load analytics')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <AppContainer>
        <div className="py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your analytics...</p>
          </div>
        </div>
        <BottomNav />
      </AppContainer>
    )
  }

  if (!analytics) {
    return (
      <AppContainer>
        <div className="py-8 pb-20">
          <div className="text-center">
            <div className="text-gray-400 text-6xl mb-4">📊</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No analytics yet</h3>
            <p className="text-gray-600 mb-6">
              Create and share your pitch to start seeing analytics
            </p>
            <button
              onClick={() => router.push('/pitch/new')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Pitch
            </button>
          </div>
        </div>
        <BottomNav />
      </AppContainer>
    )
  }

  return (
    <AppContainer>
      <div className="py-8 pb-20">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Track your pitch performance and engagement</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{analytics.metrics.total_views}</div>
                <div className="text-sm text-gray-600">Total Views</div>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{analytics.metrics.total_likes}</div>
                <div className="text-sm text-gray-600">Likes</div>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{analytics.metrics.total_shares}</div>
                <div className="text-sm text-gray-600">Shares</div>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Share className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{analytics.metrics.total_endorsements}</div>
                <div className="text-sm text-gray-600">Endorsements</div>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{analytics.metrics.conversion_rate}%</div>
              <div className="text-sm text-gray-600">Conversion Rate</div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{analytics.metrics.engagement_rate}%</div>
              <div className="text-sm text-gray-600">Engagement Rate</div>
            </div>
          </div>
        </div>

        {/* Platform Performance */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Performance</h3>
          <div className="space-y-3">
            {analytics.top_performers.map((platform: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-sm font-medium">
                    {platform.platform.charAt(0)}
                  </div>
                  <span className="font-medium text-gray-900">{platform.platform}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>{platform.views} views</span>
                  <span>{platform.shares} shares</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {analytics.recent_activity.map((activity: any) => (
              <div key={activity.id} className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.description}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}
      </div>

      <BottomNav />
    </AppContainer>
  )
}
