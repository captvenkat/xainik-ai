'use client'

import { useState, useEffect } from 'react'
import { getVeteranOutreachData } from '@/lib/analytics'
import { User, Share2, Mail, MessageCircle, TrendingUp } from 'lucide-react'

interface VeteranOutreachListProps {
  veteranId: string
}

export default function VeteranOutreachList({ veteranId }: VeteranOutreachListProps) {
  const [outreachData, setOutreachData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOutreachData()
  }, [veteranId])

  async function loadOutreachData() {
    try {
      setLoading(true)
      const data = await getVeteranOutreachData(veteranId)
      setOutreachData(data)
    } catch (error) {
      console.error('Failed to load outreach data:', error)
    } finally {
      setLoading(false)
    }
  }

  function getActivityIcon(activityType: string): React.ReactNode {
    switch (activityType) {
      case 'pitch_shared':
        return <Share2 className="w-4 h-4 text-blue-600" />
      case 'direct_outreach':
        return <Mail className="w-4 h-4 text-green-600" />
      case 'network_contact':
        return <MessageCircle className="w-4 h-4 text-purple-600" />
      default:
        return <User className="w-4 h-4 text-gray-600" />
    }
  }

  function getActivityTitle(activityType: string): string {
    switch (activityType) {
      case 'pitch_shared':
        return 'Shared Pitch'
      case 'direct_outreach':
        return 'Direct Outreach'
      case 'network_contact':
        return 'Network Contact'
      default:
        return 'Activity'
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading your outreach data...</p>
      </div>
    )
  }

  if (!outreachData || outreachData.activities.length === 0) {
    return (
      <div className="text-center py-8">
        <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No outreach activities yet.</p>
        <p className="text-sm text-gray-500 mt-2">Start sharing your pitch to see your efforts here!</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Your Outreach Efforts</h3>
            <p className="text-sm text-gray-600 mt-1">
              {outreachData.summary.totalOutreach} outreach activities
            </p>
          </div>
          {outreachData.isMockData && (
            <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
              Demo Data
            </div>
          )}
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {outreachData.activities.map((activity: any, index: number) => (
          <div key={activity.id || index} className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  {getActivityIcon(activity.activity_type)}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">
                    {getActivityTitle(activity.activity_type)}
                  </h4>
                  <span className="text-sm text-gray-500">
                    {new Date(activity.created_at).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {activity.platform}
                  </span>
                  <span className="text-gray-400">•</span>
                  <span className="text-sm text-gray-600">
                    {activity.target}
                  </span>
                </div>
                
                {activity.result && (
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-700 font-medium">
                      {activity.result}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Platform Summary */}
      {Object.keys(outreachData.summary.platforms).length > 0 && (
        <div className="p-6 bg-gray-50 border-t">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Platform Breakdown</h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(outreachData.summary.platforms).map(([platform, count]) => (
              <span key={platform} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {platform} ({count as number})
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
