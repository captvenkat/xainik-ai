'use client'

import { useState, useEffect } from 'react'
import { Eye, Heart, Share2, Star, TrendingUp, Users } from 'lucide-react'
import { createSupabaseBrowser } from '@/lib/supabaseBrowser'

interface ActivityEvent {
  id: string
  type: 'view' | 'like' | 'share' | 'endorsement' | 'milestone'
  message: string
  timestamp: Date
  icon: string
  color: string
}

interface LiveActivityTickerProps {
  pitchId?: string
  className?: string
}

export default function LiveActivityTicker({ 
  pitchId, 
  className = '' 
}: LiveActivityTickerProps) {
  const [activities, setActivities] = useState<ActivityEvent[]>([])
  const [isVisible, setIsVisible] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  const supabase = createSupabaseBrowser()

  // Generate mock activities for demonstration
  const generateMockActivities = (): ActivityEvent[] => {
    const mockActivities: ActivityEvent[] = [
      {
        id: '1',
        type: 'view',
        message: 'Someone viewed your pitch!',
        timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
        icon: 'Eye',
        color: 'blue'
      },
      {
        id: '2',
        type: 'like',
        message: 'Your pitch received a like!',
        timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
        icon: 'Heart',
        color: 'pink'
      },
      {
        id: '3',
        type: 'share',
        message: 'Your pitch was shared on LinkedIn!',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        icon: 'Share2',
        color: 'orange'
      },
      {
        id: '4',
        type: 'endorsement',
        message: 'You received an endorsement!',
        timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
        icon: 'Star',
        color: 'yellow'
      },
      {
        id: '5',
        type: 'milestone',
        message: '🎉 You reached 50 views!',
        timestamp: new Date(Date.now() - 1000 * 60 * 90), // 1.5 hours ago
        icon: 'TrendingUp',
        color: 'green'
      }
    ]

    return mockActivities
  }

  // Get icon component
  const getIcon = (iconName: string) => {
    const icons: Record<string, any> = {
      Eye, Heart, Share2, Star, TrendingUp, Users
    }
    return icons[iconName] || Eye
  }

  // Get color classes
  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'text-blue-600',
      pink: 'text-pink-600',
      orange: 'text-orange-600',
      yellow: 'text-yellow-600',
      green: 'text-green-600',
      purple: 'text-purple-600'
    }
    return colors[color] || 'text-gray-600'
  }

  // Format timestamp
  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - timestamp.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return timestamp.toLocaleDateString()
  }

  useEffect(() => {
    // Initialize with mock activities
    setActivities(generateMockActivities())
    setIsVisible(true)

    // Set up real-time subscription for actual data
    if (pitchId) {
      const channel = supabase
        .channel('live_activity')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'referral_events',
            filter: `referral_id=eq.${pitchId}`
          },
          (payload) => {
            // Handle real-time activity updates
            const newActivity: ActivityEvent = {
              id: payload.new.id,
              type: 'view', // Map from event_type
              message: `New activity on your pitch!`,
              timestamp: new Date(),
              icon: 'Eye',
              color: 'blue'
            }
            
            setActivities(prev => [newActivity, ...prev.slice(0, 4)])
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [pitchId])

  useEffect(() => {
    if (activities.length === 0) return

    // Auto-rotate through activities
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activities.length)
    }, 5000) // Change every 5 seconds

    return () => clearInterval(interval)
  }, [activities.length])

  if (!isVisible || activities.length === 0) return null

  const currentActivity = activities[currentIndex]
  const Icon = currentActivity ? getIcon(currentActivity.icon) : null

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900">Live Activity</h3>
        <div className="flex space-x-1">
          {activities.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <div className={`flex-shrink-0 ${currentActivity ? getColorClasses(currentActivity.color) : ''}`}>
          {Icon && <Icon className="w-5 h-5" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-900 font-medium">
            {currentActivity?.message || 'No activity'}
          </p>
          <p className="text-xs text-gray-500">
            {currentActivity ? formatTimestamp(currentActivity.timestamp) : ''}
          </p>
        </div>
      </div>

      {/* Activity indicators */}
      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
        <span>Real-time updates</span>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Live</span>
        </div>
      </div>
    </div>
  )
}
