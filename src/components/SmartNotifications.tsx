'use client'

import { useState, useEffect } from 'react'
import { Bell, AlertTriangle, CheckCircle, Info, Star, TrendingUp, Target, Clock, Zap, Settings, X, Filter, Users } from 'lucide-react'

interface Notification {
  id: string
  type: 'success' | 'warning' | 'info' | 'achievement' | 'reminder'
  title: string
  message: string
  timestamp: string
  priority: 'low' | 'medium' | 'high'
  category: 'performance' | 'engagement' | 'networking' | 'system' | 'milestone'
  isRead: boolean
  actionRequired: boolean
  actionUrl?: string
  actionText?: string
  aiGenerated: boolean
  expiresAt?: string
}

interface SmartNotificationsProps {
  userId: string
  userMetrics: {
    views: number
    calls: number
    emails: number
    endorsements: number
    shares: number
    lastActivity: string
  }
}

export default function SmartNotifications({ userId, userMetrics }: SmartNotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filter, setFilter] = useState<'all' | 'unread' | 'high-priority' | 'action-required'>('all')
  const [showSettings, setShowSettings] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    // Generate smart notifications based on user metrics
    generateSmartNotifications()
  }, [userMetrics])

  const generateSmartNotifications = () => {
    const newNotifications: Notification[] = []
    const now = new Date()
    const lastActivity = new Date(userMetrics?.lastActivity || Date.now())
    const daysSinceActivity = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))

    // Performance-based notifications
          if (userMetrics?.views === 0) {
      newNotifications.push({
        id: '1',
        type: 'info',
        title: 'Welcome to Your Dashboard!',
        message: 'Start by sharing your pitch to get your first views and begin building your network.',
        timestamp: now.toISOString(),
        priority: 'high',
        category: 'performance',
        isRead: false,
        actionRequired: true,
        actionUrl: '/pitch/new',
        actionText: 'Create Pitch',
        aiGenerated: true
      })
          } else if (userMetrics?.views > 0 && userMetrics?.calls === 0 && userMetrics?.emails === 0) {
      newNotifications.push({
        id: '2',
        type: 'warning',
        title: 'High Visibility, Low Engagement',
        message: 'Your pitch is getting views but no calls or emails. Consider optimizing your contact information and call-to-action.',
        timestamp: now.toISOString(),
        priority: 'medium',
        category: 'performance',
        isRead: false,
        actionRequired: false,
        aiGenerated: true
      })
    }

    // Milestone notifications
          if (userMetrics?.views >= 10 && userMetrics?.views < 50) {
      newNotifications.push({
        id: '3',
        type: 'achievement',
        title: 'First Milestone Reached! 🎉',
        message: `Congratulations! You've reached ${userMetrics?.views || 0} pitch views. Keep sharing to reach 50 views and unlock new features.`,
        timestamp: now.toISOString(),
        priority: 'medium',
        category: 'milestone',
        isRead: false,
        actionRequired: false,
        aiGenerated: true
      })
    }

          if (userMetrics?.endorsements >= 3) {
      newNotifications.push({
        id: '4',
        type: 'success',
        title: 'Network Growing Strong!',
        message: `You've received ${userMetrics?.endorsements || 0} endorsements. Your network is expanding - keep building relationships!`,
        timestamp: now.toISOString(),
        priority: 'low',
        category: 'networking',
        isRead: false,
        actionRequired: false,
        aiGenerated: true
      })
    }

    // Engagement reminders
    if (daysSinceActivity > 3) {
      newNotifications.push({
        id: '5',
        type: 'reminder',
        title: 'Stay Active in Your Network',
        message: `It's been ${daysSinceActivity} days since your last activity. Regular engagement helps maintain visibility and connections.`,
        timestamp: now.toISOString(),
        priority: 'medium',
        category: 'engagement',
        isRead: false,
        actionRequired: false,
        aiGenerated: true
      })
    }

    // Performance insights
          if (userMetrics?.views > 20) {
        const conversionRate = (((userMetrics?.calls || 0) + (userMetrics?.emails || 0)) / (userMetrics?.views || 1)) * 100
      if (conversionRate < 5) {
        newNotifications.push({
          id: '6',
          type: 'warning',
          title: 'Optimization Opportunity',
          message: `Your conversion rate is ${conversionRate.toFixed(1)}%. Consider improving your pitch content or contact methods to increase engagement.`,
          timestamp: now.toISOString(),
          priority: 'medium',
          category: 'performance',
          isRead: false,
          actionRequired: false,
          aiGenerated: true
        })
      } else if (conversionRate > 15) {
        newNotifications.push({
          id: '7',
          type: 'success',
          title: 'Excellent Conversion Rate!',
          message: `Your ${conversionRate.toFixed(1)}% conversion rate is above average! Keep optimizing to maintain this performance.`,
          timestamp: now.toISOString(),
          priority: 'low',
          category: 'performance',
          isRead: false,
          actionRequired: false,
          aiGenerated: true
        })
      }
    }

    // System notifications
    newNotifications.push({
      id: '8',
      type: 'info',
      title: 'New Dashboard Features Available',
      message: 'Check out the new AI-powered insights and competitive benchmarking tools to optimize your performance.',
      timestamp: now.toISOString(),
      priority: 'low',
      category: 'system',
      isRead: false,
      actionRequired: false,
      aiGenerated: false
    })

    setNotifications(newNotifications)
    setUnreadCount(newNotifications.filter(n => !n.isRead).length)
  }

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />
      case 'achievement':
        return <Star className="w-5 h-5 text-yellow-500" />
      case 'reminder':
        return <Clock className="w-5 h-5 text-blue-600" />
      default:
        return <Info className="w-5 h-5 text-blue-600" />
    }
  }

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50'
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50'
      default:
        return 'border-l-blue-500 bg-blue-50'
    }
  }

  const getCategoryIcon = (category: Notification['category']) => {
    switch (category) {
      case 'performance':
        return <TrendingUp className="w-4 h-4" />
      case 'engagement':
        return <Target className="w-4 h-4" />
      case 'networking':
        return <Users className="w-4 h-4" />
      case 'system':
        return <Settings className="w-4 h-4" />
      case 'milestone':
        return <Star className="w-4 h-4" />
      default:
        return <Info className="w-4 h-4" />
    }
  }

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(notification => 
      notification.id === notificationId ? { ...notification, isRead: true } : notification
    ))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notification => ({ ...notification, isRead: true })))
    setUnreadCount(0)
  }

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== notificationId))
  }

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.isRead
    if (filter === 'high-priority') return notification.priority === 'high'
    if (filter === 'action-required') return notification.actionRequired
    return true
  })

  const highPriorityCount = notifications.filter(n => n.priority === 'high').length
  const actionRequiredCount = notifications.filter(n => n.actionRequired).length

  return (
    <div className="bg-white rounded-xl shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Smart Notifications</h3>
            {unreadCount > 0 && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-lg font-bold text-blue-600">{notifications.length}</div>
            <div className="text-sm text-blue-600">Total</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-lg font-bold text-yellow-600">{highPriorityCount}</div>
            <div className="text-sm text-yellow-600">High Priority</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-lg font-bold text-red-600">{actionRequiredCount}</div>
            <div className="text-sm text-red-600">Action Required</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-lg font-bold text-green-600">{notifications.filter(n => n.aiGenerated).length}</div>
            <div className="text-sm text-green-600">AI Generated</div>
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
            All
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
          <button
            onClick={() => setFilter('action-required')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              filter === 'action-required'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Action Required ({actionRequiredCount})
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

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {filteredNotifications.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredNotifications.slice(0, isExpanded ? undefined : 6).map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gray-50 transition-colors ${
                  !notification.isRead ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Notification Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  {/* Notification Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-900">{notification.title}</h4>
                      <div className="flex items-center gap-2">
                        {notification.aiGenerated && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                            <Zap className="w-3 h-3 inline mr-1" />
                            AI
                          </span>
                        )}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(notification.priority).split(' ')[1]}`}>
                          {notification.priority}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(notification.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{notification.message}</p>
                    
                    {/* Category & Action */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(notification.category)}
                        <span className="text-xs text-gray-500 capitalize">{notification.category}</span>
                      </div>
                      
                      {notification.actionRequired && notification.actionUrl && (
                        <a
                          href={notification.actionUrl}
                          className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors"
                        >
                          {notification.actionText || 'Take Action'}
                        </a>
                      )}
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center gap-1">
                    {!notification.isRead && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="p-1 text-blue-600 hover:text-blue-800 rounded"
                        title="Mark as read"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="p-1 text-gray-400 hover:text-red-600 rounded"
                      title="Delete notification"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No notifications found</p>
            <p className="text-sm text-gray-400">You're all caught up!</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>AI-powered insights updated in real-time</span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Smart monitoring active</span>
          </div>
        </div>
      </div>
    </div>
  )
}
