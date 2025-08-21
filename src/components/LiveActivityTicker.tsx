'use client'

import { useState, useEffect } from 'react'
import { Eye, Heart, Share2, Star, TrendingUp, Users, Phone, Mail, Award, FileText } from 'lucide-react'
import { createSupabaseBrowser } from '@/lib/supabaseBrowser'

interface ActivityEvent {
  id: string
  type: 'new_pitch' | 'referral' | 'endorsement' | 'like' | 'view' | 'call' | 'email' | 'donation'
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

  async function fetchRealActivities(): Promise<ActivityEvent[]> {
    try {
      const supabase = createSupabaseBrowser()
      const realActivities: ActivityEvent[] = []

      // 1. Get recent pitches (simplified query)
      try {
        const { data: recentPitches, error: pitchesError } = await supabase
          .from('pitches')
          .select('id, title, created_at')
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: false })
          .limit(2)

        if (!pitchesError && recentPitches && recentPitches.length > 0) {
          recentPitches.forEach(pitch => {
            realActivities.push({
              id: `pitch-${pitch.id}`,
              type: 'new_pitch',
              message: `New pitch posted: "${pitch.title}"`,
              timestamp: new Date(pitch.created_at),
              icon: 'FileText',
              color: 'green'
            })
          })
        }
      } catch (error) {
        // Silently continue if pitches query fails
      }

      // 2. Get recent referral events (simplified query)
      try {
        const { data: referralEvents, error: referralError } = await supabase
          .from('referral_events')
          .select('id, event_type, occurred_at, platform')
          .gte('occurred_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .order('occurred_at', { ascending: false })
          .limit(3)

        if (!referralError && referralEvents && referralEvents.length > 0) {
          referralEvents.forEach(event => {
            let message = ''
            let type: ActivityEvent['type'] = 'view'
            
            switch (event.event_type) {
              case 'LINK_OPENED':
                message = `Someone opened a referral link`
                type = 'view'
                break
              case 'PITCH_VIEWED':
                message = `A veteran's pitch was viewed via referral`
                type = 'view'
                break
              case 'CALL_CLICKED':
                message = `Someone called a veteran through supporter referral`
                type = 'call'
                break
              case 'EMAIL_CLICKED':
                message = `Someone emailed a veteran through supporter referral`
                type = 'email'
                break
              case 'SHARE_RESHARED':
                message = `A veteran's pitch was shared on ${event.platform || 'social media'}`
                type = 'referral'
                break
              default:
                message = `New activity on the platform`
                type = 'view'
            }

            realActivities.push({
              id: `ref-${event.id}`,
              type,
              message,
              timestamp: new Date(event.occurred_at),
              icon: type === 'call' ? 'Phone' : type === 'email' ? 'Mail' : 'Share2',
              color: type === 'call' ? 'purple' : type === 'email' ? 'orange' : 'blue'
            })
          })
        }
      } catch (error) {
        // Silently continue if referral events query fails
      }

      // 3. Get recent endorsements (simplified query)
      try {
        const { data: recentEndorsements, error: endorsementsError } = await supabase
          .from('endorsements')
          .select('id, created_at')
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: false })
          .limit(2)

        if (!endorsementsError && recentEndorsements && recentEndorsements.length > 0) {
          recentEndorsements.forEach(endorsement => {
            realActivities.push({
              id: `endorsement-${endorsement.id}`,
              type: 'endorsement',
              message: `New endorsement for a veteran`,
              timestamp: new Date(endorsement.created_at),
              icon: 'Award',
              color: 'yellow'
            })
          })
        }
      } catch (error) {
        // Silently continue if endorsements query fails
      }

      // 4. Get recent donations (simplified query)
      try {
        const { data: recentDonations, error: donationsError } = await supabase
          .from('donations')
          .select('id, amount_cents, donor_name, created_at')
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: false })
          .limit(2)

        if (!donationsError && recentDonations && recentDonations.length > 0) {
          recentDonations.forEach(donation => {
            const donorName = donation.donor_name || 'Anonymous'
            const amount = donation.amount_cents ? (donation.amount_cents / 100).toFixed(0) : '0'
            
            realActivities.push({
              id: `donation-${donation.id}`,
              type: 'donation',
              message: `$${amount} donation from ${donorName}`,
              timestamp: new Date(donation.created_at),
              icon: 'Heart',
              color: 'red'
            })
          })
        }
      } catch (error) {
        // Silently continue if donations query fails
      }

      // Sort by timestamp and return
      return realActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 5)
    } catch (error) {
      // Error fetching real activities - return empty array
      return []
    }
  }

  // Get icon component
  const getIcon = (iconName: string) => {
    const icons: Record<string, any> = {
      Eye, Heart, Share2, Star, TrendingUp, Users, Phone, Mail, Award, FileText
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
      purple: 'text-purple-600',
      red: 'text-red-600'
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
    const loadActivities = async () => {
      const realActivities = await fetchRealActivities()
      setActivities(realActivities)
      setIsVisible(realActivities.length > 0)
    }

    loadActivities()

    // Refresh activities every 30 seconds
    const interval = setInterval(loadActivities, 30000)
    return () => clearInterval(interval)
  }, [])

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
