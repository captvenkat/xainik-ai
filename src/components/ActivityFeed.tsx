'use client'

import { useState, useEffect } from 'react'
import { Activity, Eye, Phone, Mail, Heart, Share2, TrendingUp, AlertTriangle, Clock, Zap, Bell, CheckCircle } from 'lucide-react'

interface ActivityEvent {
  id: string
  type: 'view' | 'call' | 'email' | 'endorsement' | 'share' | 'milestone'
  title: string
  description: string
  timestamp: string
  metadata?: {
    platform?: string
    location?: string
    device?: string
    source?: string
  }
  aiInsight?: string
  priority: 'low' | 'medium' | 'high'
  isRead: boolean
}

interface ActivityFeedProps {
  userId: string
  recentActivity: ActivityEvent[]
}

export default function ActivityFeed({ userId, recentActivity }: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityEvent[]>(recentActivity)
  const [filter, setFilter] = useState<'all' | 'unread' | 'high-priority'>('all')
  const [isExpanded, setIsExpanded] = useState(false)
  const [aiInsights, setAiInsights] = useState<string[]>([])

  useEffect(() => {
    // Simulate real-time activity updates
    const interval = setInterval(() => {
      // Generate AI insights based on activity patterns
      generateAIInsights()
    }, 30000) // Every 30 seconds

    return () => clearInterval(interval)
  }, [activities])

  const generateAIInsights = () => {
    const insights: string[] = []
    
    // Analyze recent activity patterns
    const recentViews = activities.filter(a => a.type === 'view' && isRecent(a.timestamp, 1)).length
    const recentCalls = activities.filter(a => a.type === 'call' && isRecent(a.timestamp, 1)).length
    const recentEmails = activities.filter(a => a.type === 'email' && isRecent(a.timestamp, 1)).length
    
    if (recentViews > 5 && recentCalls === 0 && recentEmails === 0) {
      insights.push('High visibility but low engagement - consider optimizing your call-to-action')
    }
    
    if (recentCalls > recentEmails * 2) {
      insights.push('Phone calls are your strongest conversion method - ensure your number is prominent')
    }
    
    if (recentEmails > recentCalls * 2) {
      insights.push('Email engagement is high - consider adding more detailed contact information')
    }
    
    if (insights.length > 0) {
      setAiInsights(insights)
    }
  }

  const isRecent = (timestamp: string, hours: number) => {
    const eventTime = new Date(timestamp).getTime()
    const now = new Date().getTime()
    return (now - eventTime) < (hours * 60 * 60 * 1000)
  }

  const getActivityIcon = (type: ActivityEvent['type']) => {
    switch (type) {
      case 'view':
        return <Eye className="w-4 h-4 text-blue-600" />
      case 'call':
        return <Phone className="w-4 h-4 text-green-600" />
      case 'email':
        return <Mail className="w-4 h-4 text-purple-600" />
      case 'endorsement':
        return <Heart className="w-4 h-4 text-red-600" />
      case 'share':
        return <Share2 className="w-4 h-4 text-orange-600" />
      case 'milestone':
        return <TrendingUp className="w-4 h-4 text-indigo-600" />
      default:
        return <Activity className="w-4 h-4 text-gray-600" />
    }
  }

  const getPriorityColor = (priority: ActivityEvent['priority']) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50'
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50'
      default:
        return 'border-l-blue-500 bg-blue-50'
    }
  }

  const getPriorityIcon = (priority: ActivityEvent['priority']) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-red-600" />
      case 'medium':
        return <Clock className="w-4 h-4 text-yellow-600" />
      default:
        return <CheckCircle className="w-4 h-4 text-blue-600" />
    }
  }

  const markAsRead = (activityId: string) => {
    setActivities(prev => prev.map(activity => 
      activity.id === activityId ? { ...activity, isRead: true } : activity
    ))
  }

  const markAllAsRead = () => {
    setActivities(prev => prev.map(activity => ({ ...activity, isRead: true })))
  }

  const filteredActivities = activities.filter(activity => {
    if (filter === 'unread') return !activity.isRead
    if (filter === 'high-priority') return activity.priority === 'high'
    return true
  })

  const unreadCount = activities.filter(a => !a.isRead).length
  const highPriorityCount = activities.filter(a => a.priority === 'high').length

  return (
    <div className="bg-white rounded-xl shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Real-time Activity Feed</h3>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                {unreadCount} new
              </span>
            )}
            {highPriorityCount > 0 && (
              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                {highPriorityCount} urgent
              </span>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              filter === 'all'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All Activities
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              filter === 'unread'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setFilter('high-priority')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              filter === 'high-priority'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            High Priority ({highPriorityCount})
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 mt-4">
          <button
            onClick={markAllAsRead}
            className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Mark all as read
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 font-medium"
          >
            {isExpanded ? 'Show less' : 'Show more'}
          </button>
        </div>
      </div>

      {/* AI Insights Banner */}
      {aiInsights.length > 0 && (
        <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-purple-600" />
            <h4 className="font-medium text-purple-900">AI Insights</h4>
          </div>
          <div className="space-y-1">
            {aiInsights.map((insight, index) => (
              <p key={index} className="text-sm text-purple-800">{insight}</p>
            ))}
          </div>
        </div>
      )}

      {/* Activity List */}
      <div className="max-h-96 overflow-y-auto">
        {filteredActivities.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredActivities.slice(0, isExpanded ? undefined : 8).map((activity) => (
              <div
                key={activity.id}
                className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                  !activity.isRead ? 'bg-blue-50' : ''
                }`}
                onClick={() => markAsRead(activity.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-medium text-gray-900">{activity.title}</h4>
                      <div className="flex items-center gap-2">
                        {getPriorityIcon(activity.priority)}
                        <span className="text-xs text-gray-500">
                          {isRecent(activity.timestamp, 1) ? 'Just now' :
                           isRecent(activity.timestamp, 24) ? 'Today' :
                           new Date(activity.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                    
                    {/* Metadata */}
                    {activity.metadata && (
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        {activity.metadata.platform && (
                          <span>via {activity.metadata.platform}</span>
                        )}
                        {activity.metadata.location && (
                          <span>📍 {activity.metadata.location}</span>
                        )}
                        {activity.metadata.device && (
                          <span>📱 {activity.metadata.device}</span>
                        )}
                      </div>
                    )}
                    
                    {/* AI Insight */}
                    {activity.aiInsight && (
                      <div className="mt-2 p-2 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                        <div className="flex items-center gap-2">
                          <Zap className="w-3 h-3 text-yellow-600" />
                          <p className="text-xs text-yellow-800">{activity.aiInsight}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Read Status Indicator */}
                  {!activity.isRead && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No activities found</p>
            <p className="text-sm text-gray-400">Check back later for updates</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Live updates every 30 seconds</span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Connected</span>
          </div>
        </div>
      </div>
    </div>
  )
}
