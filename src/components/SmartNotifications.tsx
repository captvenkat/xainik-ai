'use client'

import { useState, useEffect } from 'react'
import { Bell, X, CheckCircle, Star, TrendingUp, Users, Eye, Heart, Share2, Mail, Phone } from 'lucide-react'
import { createSupabaseBrowser } from '@/lib/supabaseBrowser'

interface Notification {
  id: string
  type: 'milestone' | 'achievement' | 'alert' | 'reminder'
  title: string
  message: string
  icon: string
  color: string
  timestamp: Date
  read: boolean
  actionUrl?: string
}

interface SmartNotificationsProps {
  userId: string
  pitchId?: string
  className?: string
}

export default function SmartNotifications({ 
  userId, 
  pitchId, 
  className = '' 
}: SmartNotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const supabase = createSupabaseBrowser()

  // Generate smart notifications based on user activity
  const generateSmartNotifications = async () => {
    if (!pitchId) return

    try {
      setIsLoading(true)
      
      // Fetch user metrics
      const { data: pitch } = await supabase
        .from('pitches')
        .select('views_count, likes_count, shares_count, endorsements_count')
        .eq('id', pitchId)
        .single()

      if (!pitch) return

      const newNotifications: Notification[] = []

      // Milestone notifications
      if (pitch.views_count === 10) {
        newNotifications.push({
          id: 'milestone-10-views',
          type: 'milestone',
          title: '🎉 First 10 Views!',
          message: 'Your pitch has been viewed 10 times! Keep sharing to reach more people.',
          icon: 'Eye',
          color: 'blue',
          timestamp: new Date(),
          read: false
        })
      }

      if (pitch.likes_count === 5) {
        newNotifications.push({
          id: 'milestone-5-likes',
          type: 'milestone',
          title: '❤️ 5 Likes Achieved!',
          message: 'People are loving your pitch! You\'ve received 5 likes.',
          icon: 'Heart',
          color: 'pink',
          timestamp: new Date(),
          read: false
        })
      }

      if (pitch.shares_count === 3) {
        newNotifications.push({
          id: 'milestone-3-shares',
          type: 'milestone',
          title: '📤 3 Shares!',
          message: 'Your pitch has been shared 3 times! Your network is helping you grow.',
          icon: 'Share2',
          color: 'orange',
          timestamp: new Date(),
          read: false
        })
      }

      if (pitch.endorsements_count === 2) {
        newNotifications.push({
          id: 'milestone-2-endorsements',
          type: 'milestone',
          title: '⭐ 2 Endorsements!',
          message: 'You\'ve received 2 endorsements! Your credibility is growing.',
          icon: 'Star',
          color: 'yellow',
          timestamp: new Date(),
          read: false
        })
      }

      // Achievement notifications
      if ((pitch.views_count || 0) >= 50 && (pitch.likes_count || 0) >= 10) {
        newNotifications.push({
          id: 'achievement-popular',
          type: 'achievement',
          title: '🏆 Popular Pitch Badge',
          message: 'Your pitch is gaining traction! You\'ve earned the Popular Pitch badge.',
          icon: 'TrendingUp',
          color: 'green',
          timestamp: new Date(),
          read: false
        })
      }

      // Smart reminders
      if ((pitch.views_count || 0) > 0 && (pitch.shares_count || 0) === 0) {
        newNotifications.push({
          id: 'reminder-share',
          type: 'reminder',
          title: '💡 Share Your Pitch',
          message: 'People are viewing your pitch! Share it on social media to reach more people.',
          icon: 'Share2',
          color: 'blue',
          timestamp: new Date(),
          read: false,
          actionUrl: '/dashboard/veteran'
        })
      }

      if ((pitch.likes_count || 0) > 0 && (pitch.endorsements_count || 0) === 0) {
        newNotifications.push({
          id: 'reminder-endorsements',
          type: 'reminder',
          title: '💡 Request Endorsements',
          message: 'People like your pitch! Ask them for endorsements to build credibility.',
          icon: 'Star',
          color: 'yellow',
          timestamp: new Date(),
          read: false
        })
      }

      // Add new notifications to state
      setNotifications(prev => [...newNotifications, ...prev])
      setUnreadCount(prev => prev + newNotifications.length)

    } catch (error) {
      console.error('Error generating smart notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Mark notification as read
  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    )
    setUnreadCount(0)
  }

  // Get icon component
  const getIcon = (iconName: string) => {
    const icons: Record<string, any> = {
      Eye, Heart, Share2, Star, TrendingUp, Users, Mail, Phone, CheckCircle
    }
    return icons[iconName] || Bell
  }

  // Get color classes
  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-600',
      pink: 'bg-pink-100 text-pink-600',
      orange: 'bg-orange-100 text-orange-600',
      yellow: 'bg-yellow-100 text-yellow-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600'
    }
    return colors[color] || 'bg-gray-100 text-gray-600'
  }

  useEffect(() => {
    if (pitchId) {
      generateSmartNotifications()
    }
  }, [pitchId])

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-800 transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2">Generating smart notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>No notifications yet</p>
                <p className="text-sm">We'll notify you about milestones and achievements!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => {
                  const Icon = getIcon(notification.icon)
                  return (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 transition-colors ${
                        !notification.read ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`flex-shrink-0 p-2 rounded-full ${getColorClasses(notification.color)}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {notification.title}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-2">
                                {notification.timestamp.toLocaleTimeString()}
                              </p>
                            </div>
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="text-xs text-blue-600 hover:text-blue-800"
                              >
                                Mark read
                              </button>
                            )}
                          </div>
                          {notification.actionUrl && (
                            <button
                              onClick={() => {
                                window.open(notification.actionUrl, '_blank')
                                markAsRead(notification.id)
                              }}
                              className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium"
                            >
                              Take action →
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <p className="text-xs text-gray-500 text-center">
                Smart notifications help you track your progress and achievements
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
