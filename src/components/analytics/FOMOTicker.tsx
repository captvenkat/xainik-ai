'use client'

import { useState, useEffect } from 'react'
import { createSupabaseBrowser } from '@/lib/supabaseBrowser'
import { 
  Heart, Users, TrendingUp, Zap, Star, Award, 
  ArrowRight, Eye, Share2, Phone, Mail
} from 'lucide-react'

interface FOMOEvent {
  id: string
  event: string
  meta: any
  created_at: string
}

export default function FOMOTicker() {
  const [events, setEvents] = useState<FOMOEvent[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    async function loadFOMOEvents() {
      try {
        const supabase = createSupabaseBrowser()
        const realEvents: FOMOEvent[] = []
        
        // Get recent referral events
        try {
          const { data: referralEvents, error: referralError } = await supabase
            .from('referral_events')
            .select('id, event_type, occurred_at, platform')
            .gte('occurred_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
            .order('occurred_at', { ascending: false })
            .limit(5)

          if (!referralError && referralEvents && referralEvents.length > 0) {
            referralEvents.forEach(event => {
              realEvents.push({
                id: `ref-${event.id}`,
                event: event.event_type,
                meta: {
                  platform: event.platform
                },
                created_at: event.occurred_at
              })
            })
          }
        } catch (error) {
          // Silently continue if referral events query fails
        }

        // Get recent endorsements
        try {
          const { data: recentEndorsements, error: endorsementsError } = await supabase
            .from('endorsements')
            .select('id, created_at')
            .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
            .order('created_at', { ascending: false })
            .limit(3)

          if (!endorsementsError && recentEndorsements && recentEndorsements.length > 0) {
            recentEndorsements.forEach(endorsement => {
              realEvents.push({
                id: `endorsement-${endorsement.id}`,
                event: 'supporter_endorse',
                meta: {},
                created_at: endorsement.created_at
              })
            })
          }
        } catch (error) {
          // Silently continue if endorsements query fails
        }

        // Get recent donations
        try {
          const { data: recentDonations, error: donationsError } = await supabase
            .from('donations')
            .select('id, amount, donor_name, created_at')
            .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
            .order('created_at', { ascending: false })
            .limit(2)

          if (!donationsError && recentDonations && recentDonations.length > 0) {
            recentDonations.forEach(donation => {
              realEvents.push({
                id: `donation-${donation.id}`,
                event: 'donation_received',
                meta: {
                  amount: donation.amount,
                  donor_name: donation.donor_name || 'Anonymous'
                },
                created_at: donation.created_at
              })
            })
          }
        } catch (error) {
          // Silently continue if donations query fails
        }

        // Get recent new pitches
        try {
          const { data: recentPitches, error: pitchesError } = await supabase
            .from('pitches')
            .select('id, title, created_at')
            .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
            .order('created_at', { ascending: false })
            .limit(2)

          if (!pitchesError && recentPitches && recentPitches.length > 0) {
            recentPitches.forEach(pitch => {
              realEvents.push({
                id: `pitch-${pitch.id}`,
                event: 'new_pitch_posted',
                meta: {
                  title: pitch.title
                },
                created_at: pitch.created_at
              })
            })
          }
        } catch (error) {
          // Silently continue if pitches query fails
        }

        // Sort by timestamp and take top 8
        const sortedEvents = realEvents
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 8)

        setEvents(sortedEvents)
      } catch (error) {
        // Error loading FOMO events - set empty array
        setEvents([])
      }
    }

    loadFOMOEvents()

    // Refresh events every 30 seconds
    const interval = setInterval(loadFOMOEvents, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (events.length === 0) return

    // Rotate through events every 4 seconds
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % events.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [events.length])

  if (events.length === 0) {
    return null
  }

  const currentEvent = events[currentIndex]
  if (!currentEvent) return null

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'supporter_connected_to_pitch':
      case 'LINK_OPENED':
        return <Heart className="w-4 h-4 text-red-500" />
      case 'supporter_view':
      case 'PITCH_VIEWED':
        return <Eye className="w-4 h-4 text-blue-500" />
      case 'supporter_share':
      case 'SHARE_RESHARED':
        return <Share2 className="w-4 h-4 text-green-500" />
      case 'supporter_call':
      case 'CALL_CLICKED':
        return <Phone className="w-4 h-4 text-purple-500" />
      case 'supporter_email':
      case 'EMAIL_CLICKED':
        return <Mail className="w-4 h-4 text-orange-500" />
      case 'supporter_endorse':
        return <Award className="w-4 h-4 text-yellow-500" />
      case 'donation_received':
        return <Heart className="w-4 h-4 text-pink-500" />
      case 'new_pitch_posted':
        return <TrendingUp className="w-4 h-4 text-green-500" />
      default:
        return <Zap className="w-4 h-4 text-blue-500" />
    }
  }

  const getEventMessage = (event: FOMOEvent) => {
    const timeAgo = getTimeAgo(event.created_at)
    
    switch (event.event) {
      case 'LINK_OPENED':
        return `Someone opened a referral link for "${event.meta?.pitch_title || 'a veteran'}"`
      case 'PITCH_VIEWED':
        return `A veteran's pitch was viewed via supporter referral`
      case 'SHARE_RESHARED':
        return `A veteran's pitch was shared on ${event.meta?.platform || 'social media'}`
      case 'CALL_CLICKED':
        return `Someone called a veteran through supporter referral`
      case 'EMAIL_CLICKED':
        return `Someone emailed a veteran through supporter referral`
      case 'supporter_endorse':
        return `New endorsement for ${event.meta?.veteran_name || 'a veteran'}`
      case 'donation_received':
        return `New donation of ₹${event.meta?.amount} to support veterans`
      case 'new_pitch_posted':
        return `New pitch posted: "${event.meta?.title}"`
      default:
        return `New activity on the platform`
    }
  }

  const getTimeAgo = (timestamp: string) => {
    const now = new Date()
    const eventTime = new Date(timestamp)
    const diffInSeconds = Math.floor((now.getTime() - eventTime.getTime()) / 1000)

    if (diffInSeconds < 60) return 'just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-lg p-4 mb-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-blue-600 font-semibold">
          <TrendingUp className="w-5 h-5" />
          <span className="text-sm">Live Activity</span>
        </div>
        
        <div className="flex-1 flex items-center gap-2 text-sm text-gray-700">
          {getEventIcon(currentEvent.event)}
          <span>{getEventMessage(currentEvent)}</span>
          <span className="text-gray-500">• {getTimeAgo(currentEvent.created_at)}</span>
        </div>

        <div className="flex items-center gap-1">
          {events.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Urgency Message */}
      <div className="mt-3 flex items-center gap-2 text-xs text-gray-600">
        <Star className="w-3 h-3 text-yellow-500" />
        <span>
          {events.length} activities in the last 24 hours • Join the movement!
        </span>
      </div>
    </div>
  )
}

// Mini FOMO ticker for smaller spaces
export function MiniFOMOTicker() {
  const [events, setEvents] = useState<FOMOEvent[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    async function loadFOMOEvents() {
      try {
        const supabase = createSupabaseBrowser()
        const realEvents: FOMOEvent[] = []
        
        // Get recent referral events for mini ticker
        try {
          const { data: referralEvents, error: referralError } = await supabase
            .from('referral_events')
            .select('id, event_type, occurred_at, platform')
            .gte('occurred_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
            .order('occurred_at', { ascending: false })
            .limit(3)

          if (!referralError && referralEvents && referralEvents.length > 0) {
            referralEvents.forEach(event => {
              realEvents.push({
                id: `ref-${event.id}`,
                event: event.event_type,
                meta: {
                  platform: event.platform
                },
                created_at: event.occurred_at
              })
            })
          }
        } catch (error) {
          // Silently continue if referral events query fails
        }

        // Get recent endorsements
        try {
          const { data: recentEndorsements, error: endorsementsError } = await supabase
            .from('endorsements')
            .select('id, created_at')
            .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
            .order('created_at', { ascending: false })
            .limit(2)

          if (!endorsementsError && recentEndorsements && recentEndorsements.length > 0) {
            recentEndorsements.forEach(endorsement => {
              realEvents.push({
                id: `endorsement-${endorsement.id}`,
                event: 'supporter_endorse',
                meta: {},
                created_at: endorsement.created_at
              })
            })
          }
        } catch (error) {
          // Silently continue if endorsements query fails
        }

        // Get recent donations
        try {
          const { data: recentDonations, error: donationsError } = await supabase
            .from('donations')
            .select('id, amount, donor_name, created_at')
            .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
            .order('created_at', { ascending: false })
            .limit(2)

          if (!donationsError && recentDonations && recentDonations.length > 0) {
            recentDonations.forEach(donation => {
              realEvents.push({
                id: `donation-${donation.id}`,
                event: 'donation_received',
                meta: {
                  amount: donation.amount,
                  donor_name: donation.donor_name || 'Anonymous'
                },
                created_at: donation.created_at
              })
            })
          }
        } catch (error) {
          // Silently continue if donations query fails
        }

        // Get recent pitches
        try {
          const { data: recentPitches, error: pitchesError } = await supabase
            .from('pitches')
            .select('id, title, created_at')
            .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
            .order('created_at', { ascending: false })
            .limit(2)

          if (!pitchesError && recentPitches && recentPitches.length > 0) {
            recentPitches.forEach(pitch => {
              realEvents.push({
                id: `pitch-${pitch.id}`,
                event: 'new_pitch_posted',
                meta: {
                  pitch_title: pitch.title
                },
                created_at: pitch.created_at
              })
            })
          }
        } catch (error) {
          // Silently continue if pitches query fails
        }

        setEvents(realEvents)
      } catch (error) {
        // Error loading FOMO events - set empty array
        setEvents([])
      }
    }

    loadFOMOEvents()
    const interval = setInterval(loadFOMOEvents, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (events.length === 0) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % events.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [events.length])

  if (events.length === 0) {
    return null
  }

  const currentEvent = events[currentIndex]
  if (!currentEvent) return null

  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-100 rounded-lg p-3">
      <div className="flex items-center gap-2 text-sm">
        <Zap className="w-4 h-4 text-green-600" />
        <span className="text-gray-700 font-medium">
          {currentEvent.event.includes('LINK_OPENED') || currentEvent.event.includes('PITCH_VIEWED') 
            ? 'New supporter activity' 
            : 'Platform activity'}
        </span>
        <span className="text-gray-500">• {getTimeAgo(currentEvent.created_at)}</span>
      </div>
    </div>
  )
}

function getTimeAgo(timestamp: string) {
  const now = new Date()
  const eventTime = new Date(timestamp)
  const diffInSeconds = Math.floor((now.getTime() - eventTime.getTime()) / 1000)

  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  return `${Math.floor(diffInSeconds / 86400)}d ago`
}