'use client'

import { useState, useEffect } from 'react'
import { Bell, X, CheckCircle, Star, TrendingUp, Users, Eye, Heart, Share2, Mail, Phone, RefreshCw, Loader2 } from 'lucide-react'
import { createSupabaseBrowser } from '@/lib/supabaseBrowser'
import type { SmartNotification } from '@/lib/openai'

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
  const [notifications, setNotifications] = useState<SmartNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [error, setError] = useState('')
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null)

  const supabase = createSupabaseBrowser()

  // Generate smart notifications based on user activity
  const generateSmartNotifications = async () => {
    if (!pitchId) return

    setIsLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/ai/smart-notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pitchId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate notifications')
      }

      const data = await response.json()
      
      if (data.success) {
        setNotifications(data.notifications)
        setLastGenerated(new Date())
        setUnreadCount(data.notifications.length)
        
        if (data.warning) {
          setError(data.warning)
        }
      } else {
        throw new Error('Failed to generate notifications')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to generate notifications')
    } finally {
      setIsLoading(false)
    }
  }

  // Load notifications on component mount if pitchId is available
  useEffect(() => {
    if (pitchId && notifications.length === 0) {
      generateSmartNotifications()
    }
  }, [pitchId])

  const markAsRead = (notificationIndex: number) => {
    setNotifications(prev => 
      prev.map((notification, index) => 
        index === notificationIndex ? { ...notification, read: true } : notification
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notification => ({ ...notification, read: true })))
    setUnreadCount(0)
  }

  const getNotificationIcon = (icon: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'Star': <Star className="w-5 h-5" />,
      'TrendingUp': <TrendingUp className="w-5 h-5" />,
      'Users': <Users className="w-5 h-5" />,
      'Eye': <Eye className="w-5 h-5" />,
      'Heart': <Heart className="w-5 h-5" />,
      'Share2': <Share2 className="w-5 h-5" />,
      'Mail': <Mail className="w-5 h-5" />,
      'Phone': <Phone className="w-5 h-5" />,
      'CheckCircle': <CheckCircle className="w-5 h-5" />
    }
    return iconMap[icon] || <Bell className="w-5 h-5" />
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-red-500 bg-red-50'
      case 'high': return 'border-orange-500 bg-orange-50'
      case 'medium': return 'border-blue-500 bg-blue-50'
      case 'low': return 'border-green-500 bg-green-50'
      default: return 'border-gray-500 bg-gray-50'
    }
  }

  const getPriorityTextColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-700'
      case 'high': return 'text-orange-700'
      case 'medium': return 'text-blue-700'
      case 'low': return 'text-green-700'
      default: return 'text-gray-700'
    }
  }

  const handleNotificationAction = (notification: SmartNotification) => {
    if (notification.actionUrl) {
      window.open(notification.actionUrl, '_blank')
    }
  }

  if (!pitchId) {
    return (
      <div className={`bg-gray-50 rounded-lg p-6 text-center ${className}`}>
        <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Smart Notifications</h3>
        <p className="text-gray-600">Create a pitch to get AI-powered smart notifications</p>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Bell className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">AI Smart Notifications</h3>
              <p className="text-sm text-gray-600">
                Intelligent insights and actionable reminders
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {unreadCount > 0 && (
              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                {unreadCount} new
              </span>
            )}
            <button
              onClick={generateSmartNotifications}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              <span>{isLoading ? 'Generating...' : 'Refresh'}</span>
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              {isExpanded ? <X className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
            </button>
          </div>
        </div>
        
        {lastGenerated && (
          <p className="text-xs text-gray-500 mt-2">
            Last updated: {lastGenerated.toLocaleTimeString()}
          </p>
        )}
      </div>

      {error && (
        <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400">
          <p className="text-sm text-yellow-700">{error}</p>
        </div>
      )}

      {isExpanded && (
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
              <span className="ml-3 text-gray-600">AI is analyzing your activity...</span>
            </div>
          ) : notifications.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-900">Recent Notifications</h4>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-purple-600 hover:text-purple-800"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
              
              {notifications.map((notification, index) => (
                <div
                  key={index}
                  className={`border-l-4 p-4 rounded-r-lg ${getPriorityColor(notification.priority)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className={`p-2 rounded-lg ${getPriorityColor(notification.priority)}`}>
                        {getNotificationIcon(notification.icon)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h5 className={`font-medium ${getPriorityTextColor(notification.priority)}`}>
                            {notification.title}
                          </h5>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityTextColor(notification.priority)} bg-white/50`}>
                            {notification.priority}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{notification.message}</p>
                        {notification.actionUrl && notification.actionText && (
                          <button
                            onClick={() => handleNotificationAction(notification)}
                            className="text-sm text-purple-600 hover:text-purple-800 font-medium"
                          >
                            {notification.actionText} →
                          </button>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => markAsRead(index)}
                      className="text-gray-400 hover:text-gray-600 p-1"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No notifications yet</h4>
              <p className="text-gray-600 mb-4">
                Click "Refresh" to generate AI-powered smart notifications based on your activity
              </p>
              <button
                onClick={generateSmartNotifications}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Generate Notifications
              </button>
            </div>
          )}
        </div>
      )}

      {/* Notification Summary (always visible) */}
      {!isExpanded && notifications.length > 0 && (
        <div className="p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {unreadCount > 0 ? `${unreadCount} new notifications` : 'All caught up!'}
              </span>
            </div>
            <button
              onClick={() => setIsExpanded(true)}
              className="text-sm text-purple-600 hover:text-purple-800"
            >
              View all
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
