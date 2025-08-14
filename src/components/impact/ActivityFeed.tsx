'use client'

import { useState, useEffect } from 'react'
import { Clock, Users, Phone, DollarSign, TrendingUp, Eye } from 'lucide-react'

interface ActivityItem {
  id: string
  type: 'referral' | 'call' | 'outcome' | 'share' | 'view'
  title: string
  description: string
  timestamp: string
  value?: number
  supporter?: string
}

interface ActivityFeedProps {
  pitchId?: string
}

export default function ActivityFeed({ pitchId }: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading activity data
    const timer = setTimeout(() => {
      setActivities(getMockActivities())
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [pitchId])

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'referral':
        return <Users className="w-4 h-4 text-blue-500" />
      case 'call':
        return <Phone className="w-4 h-4 text-green-500" />
      case 'outcome':
        return <DollarSign className="w-4 h-4 text-yellow-500" />
      case 'share':
        return <TrendingUp className="w-4 h-4 text-purple-500" />
      case 'view':
        return <Eye className="w-4 h-4 text-gray-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'referral':
        return 'border-l-blue-500 bg-blue-50'
      case 'call':
        return 'border-l-green-500 bg-green-50'
      case 'outcome':
        return 'border-l-yellow-500 bg-yellow-50'
      case 'share':
        return 'border-l-purple-500 bg-purple-50'
      case 'view':
        return 'border-l-gray-500 bg-gray-50'
      default:
        return 'border-l-gray-500 bg-gray-50'
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-start gap-3">
                <div className="w-4 h-4 bg-gray-200 rounded-full mt-1"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No recent activity</p>
          <p className="text-sm text-gray-400 mt-2">Activity will appear as your pitch gains traction</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
      
      <div className="space-y-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className={`flex items-start gap-3 p-3 rounded-lg border-l-4 ${getActivityColor(activity.type)}`}
          >
            <div className="flex-shrink-0 mt-1">
              {getActivityIcon(activity.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                {activity.value && (
                  <span className="text-sm font-medium text-green-600">
                    +${activity.value.toLocaleString()}
                  </span>
                )}
              </div>
              
              <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
              
              {activity.supporter && (
                <p className="text-xs text-gray-500 mt-1">
                  by {activity.supporter}
                </p>
              )}
              
              <p className="text-xs text-gray-400 mt-2">
                {new Date(activity.timestamp).toLocaleDateString()} at{' '}
                {new Date(activity.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function getMockActivities(): ActivityItem[] {
  return [
    {
      id: '1',
      type: 'outcome',
      title: 'Job Offer Received',
      description: 'Successfully secured a job offer through supporter referral',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      value: 85000,
      supporter: 'Sarah Johnson'
    },
    {
      id: '2',
      type: 'call',
      title: 'Follow-up Call Scheduled',
      description: 'Scheduled a follow-up call with potential employer',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      supporter: 'Mike Chen'
    },
    {
      id: '3',
      type: 'share',
      title: 'Pitch Shared on LinkedIn',
      description: 'Your pitch was shared by a supporter on LinkedIn',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      supporter: 'David Wilson'
    },
    {
      id: '4',
      type: 'referral',
      title: 'New Supporter Referral',
      description: 'A new supporter was added to your network',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      supporter: 'Lisa Rodriguez'
    },
    {
      id: '5',
      type: 'view',
      title: 'Pitch Viewed',
      description: 'Your pitch received 5 new views from supporter network',
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
    }
  ]
}
