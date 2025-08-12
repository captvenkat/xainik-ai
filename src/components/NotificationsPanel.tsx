'use client'

import { useState, useEffect } from 'react'
import { Bell, Check, Trash2, Filter, Search } from 'lucide-react'
import { createSupabaseBrowser } from '@/lib/supabaseBrowser'

interface Notification {
  id: string
  type: string
  payload_json: any
  created_at: string
  read_at: string | null
  channel: string
  status: string
}

export default function NotificationsPanel() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchNotifications()
  }, [])

  async function fetchNotifications() {
    try {
      const supabase = createSupabaseBrowser()
      
      // Get user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch all notifications
      const { data: notificationsData } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (notificationsData) {
        setNotifications(notificationsData as any)
      }
    } catch (error) {
    } finally {
      setIsLoading(false)
    }
  }

  async function markAsRead(notificationId: string) {
    try {
      const supabase = createSupabaseBrowser()
      
      await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId)

      // Update local state
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, read_at: new Date().toISOString() }
            : n
        )
      )
    } catch (error) {
    }
  }

  async function markAllAsRead() {
    try {
      const supabase = createSupabaseBrowser()
      
      // Get user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .is('read_at', null)

      // Update local state
      setNotifications(prev => 
        prev.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() }))
      )
    } catch (error) {
    }
  }

  async function deleteNotification(notificationId: string) {
    try {
      const supabase = createSupabaseBrowser()
      
      await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)

      // Update local state
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
    } catch (error) {
    }
  }

  function formatNotificationText(notification: Notification): string {
    const payload = notification.payload_json || {}
    
    switch (notification.type) {
      case 'resume_request_received':
        return `${payload.recruiter_name} requested your resume`
      case 'resume_request_approved':
        return `Your resume request was approved`
      case 'resume_request_declined':
        return `Your resume request was declined`
      case 'endorsement_received':
        return `${payload.endorser_name} endorsed your pitch`
      case 'endorsement_verified_badge':
        return '🎉 You earned the Community Verified Badge!'
      case 'referral_accepted':
        return `${payload.veteran_name} accepted your referral`
      case 'plan_expiry_warning':
        return `Your plan expires in ${payload.days_left} days`
      case 'plan_expired':
        return 'Your plan has expired'
      default:
        return 'You have a new notification'
    }
  }

  function formatTimeAgo(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    
    return date.toLocaleDateString()
  }

  function getNotificationIcon(type: string): string {
    switch (type) {
      case 'resume_request_received':
        return '📄'
      case 'resume_request_approved':
        return '✅'
      case 'resume_request_declined':
        return '❌'
      case 'endorsement_received':
        return '👍'
      case 'endorsement_verified_badge':
        return '🏆'
      case 'referral_accepted':
        return '🤝'
      case 'plan_expiry_warning':
        return '⚠️'
      case 'plan_expired':
        return '⏰'
      default:
        return '🔔'
    }
  }

  // Filter and search notifications
  const filteredNotifications = notifications
    .filter(notification => {
      if (filter === 'unread') return !notification.read_at
      if (filter === 'read') return notification.read_at
      return true
    })
    .filter(notification => {
      if (!searchTerm) return true
      const text = formatNotificationText(notification).toLowerCase()
      return text.includes(searchTerm.toLowerCase())
    })

  const unreadCount = notifications.filter(n => !n.read_at).length

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Bell className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-sm px-2 py-1 rounded-full font-medium">
              {unreadCount} unread
            </span>
          )}
        </div>
        
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            {/* Filter Buttons */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  filter === 'all' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  filter === 'unread' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Unread
              </button>
              <button
                onClick={() => setFilter('read')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  filter === 'read' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Read
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Mark All Read */}
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">
            Loading notifications...
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchTerm || filter !== 'all' 
              ? 'No notifications match your filters'
              : 'No notifications yet'
            }
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-6 hover:bg-gray-50 transition-colors ${
                  !notification.read_at ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="text-2xl">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 font-medium">
                          {formatNotificationText(notification)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatTimeAgo(notification.created_at)}
                        </p>
                        
                        {/* Additional details */}
                        {notification.payload_json?.message && (
                          <p className="text-sm text-gray-600 mt-2">
                            "{notification.payload_json.message}"
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 ml-4">
                        {!notification.read_at && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-2 text-gray-400 hover:text-green-600 transition-colors rounded-lg hover:bg-gray-100"
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-gray-100"
                          title="Delete notification"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination or Load More */}
      {filteredNotifications.length >= 50 && (
        <div className="mt-6 text-center">
          <button className="px-4 py-2 text-blue-600 hover:text-blue-800 font-medium">
            Load more notifications
          </button>
        </div>
      )}
    </div>
  )
}
