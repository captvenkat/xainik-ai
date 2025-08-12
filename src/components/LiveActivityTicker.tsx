'use client'

import { useState, useEffect } from 'react'
import { getRecentActivity } from '@/lib/actions/activity-server'

interface ActivityEvent {
  id: string
  event: string
  meta: any
  created_at: string
  display_text: string
}

export default function LiveActivityTicker() {
  const [activities, setActivities] = useState<ActivityEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const recentActivities = await getRecentActivity(10)
        setActivities(recentActivities.map((activity: any) => ({
          id: activity.id,
          event: activity.activity_type,
          meta: activity.activity_data || {},
          created_at: activity.created_at,
          display_text: `${activity.activity_type} - ${new Date(activity.created_at).toLocaleDateString()}`
        })))
      } catch (error) {
      } finally {
        setIsLoading(false)
      }
    }

    fetchActivities()

    // Set up real-time updates (every 30 seconds)
    const interval = setInterval(fetchActivities, 30000)

    return () => clearInterval(interval)
  }, [])

  // Add CSS for smooth scrolling animation
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes scroll {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
      
      .animate-scroll {
        animation: scroll 30s linear infinite;
      }
      
      .animate-scroll:hover {
        animation-play-state: paused;
      }
    `
    document.head.appendChild(style)

    return () => {
      // Clean up the style when component unmounts
      if (style.parentNode) {
        style.parentNode.removeChild(style)
      }
    }
  }, [])

  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
        <div className="flex items-center gap-2 text-gray-600">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">Loading recent activity...</span>
        </div>
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
        <div className="flex items-center gap-2 text-gray-600">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm font-medium">Be the first to join Xainik!</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-sm font-medium text-gray-700">Live Activity</span>
      </div>
      
      <div className="relative">
        <div className="flex items-center gap-4 animate-scroll">
          {activities.map((activity, index) => (
            <div 
              key={activity.id} 
              className="flex items-center gap-2 text-sm text-gray-600 whitespace-nowrap"
            >
              <span className="text-gray-400">•</span>
              <span>{activity.display_text}</span>
              <span className="text-gray-400">•</span>
            </div>
          ))}
          {/* Duplicate for seamless loop */}
          {activities.map((activity, index) => (
            <div 
              key={`${activity.id}-duplicate`} 
              className="flex items-center gap-2 text-sm text-gray-600 whitespace-nowrap"
            >
              <span className="text-gray-400">•</span>
              <span>{activity.display_text}</span>
              <span className="text-gray-400">•</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
