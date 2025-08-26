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
        
        // Get recent tracking events
        try {
          const { data: trackingEvents, error: trackingError } = await supabase
            .from('tracking_events')
            .select('id, event_type, occurred_at, platform')
            .gte('occurred_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
            .order('occurred_at', { ascending: false })
            .limit(5)

          if (!trackingError && trackingEvents && trackingEvents.length > 0) {
            trackingEvents.forEach(event => {
              realEvents.push({
                id: `track-${event.id}`,
                event: event.event_type,
                meta: {
                  platform: event.platform
                },
                created_at: event.occurred_at
              })
            })
          }
        } catch (error) {
          // Silently continue if tracking events query fails
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
            .select('id, amount_cents, donor_name, created_at')
            .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
            .order('created_at', { ascending: false })
            .limit(2)

          if (!donationsError && recentDonations && recentDonations.length > 0) {
            recentDonations.forEach(donation => {
              realEvents.push({
                id: `donation-${donation.id}`,
                event: 'donation_received',
                meta: {
                  amount: donation.amount_cents,
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
        return <Phone className="w-4 h-4 text-green-600" />
      case 'supporter_email':
      case 'EMAIL_CLICKED':
        return <Mail className="w-4 h-4 text-blue-600" />
      case 'supporter_endorse':
        return <Award className="w-4 h-4 text-yellow-500" />
      case 'donation_received':
        return <Heart className="w-4 h-4 text-red-500" />
      case 'new_pitch_posted':
        return <Star className="w-4 h-4 text-purple-500" />
      default:
        return <Zap className="w-4 h-4 text-gray-500" />
    }
  }

  const getEventMessage = (event: FOMOEvent) => {
    switch (event.event) {
      case 'LINK_OPENED':
        return 'Someone opened a referral link'
      case 'PITCH_VIEWED':
        return 'A veteran pitch was viewed'
      case 'SHARE_RESHARED':
        return 'A pitch was shared on social media'
      case 'CALL_CLICKED':
        return 'Someone clicked to call a veteran'
      case 'EMAIL_CLICKED':
        return 'Someone clicked to email a veteran'
      case 'supporter_endorse':
        return 'A supporter endorsed a veteran'
      case 'donation_received':
        const amount = event.meta?.amount ? `₹${event.meta.amount / 100}` : '₹100'
        return `${event.meta?.donor_name || 'Anonymous'} donated ${amount}`
      case 'new_pitch_posted':
        return `New pitch posted: "${event.meta?.title || 'Veteran Profile'}"`
      default:
        return 'New activity on the platform'
    }
  }

  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-100 rounded-lg p-3">
      <div className="flex items-center gap-2 text-sm">
        {getEventIcon(currentEvent.event)}
        <span className="text-gray-700 font-medium">
          {getEventMessage(currentEvent)}
        </span>
        <span className="text-gray-500">• {getTimeAgo(currentEvent.created_at)}</span>
      </div>
    </div>
  )
}

export function MiniFOMOTicker() {
  const [events, setEvents] = useState<FOMOEvent[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    async function loadFOMOEvents() {
      try {
        const supabase = createSupabaseBrowser()
        const realEvents: FOMOEvent[] = []
        
        // Get recent tracking events
        try {
          const { data: trackingEvents, error: trackingError } = await supabase
            .from('tracking_events')
            .select('id, event_type, occurred_at, platform')
            .gte('occurred_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
            .order('occurred_at', { ascending: false })
            .limit(3)

          if (!trackingError && trackingEvents && trackingEvents.length > 0) {
            trackingEvents.forEach(event => {
              realEvents.push({
                id: `track-${event.id}`,
                event: event.event_type,
                meta: {
                  platform: event.platform
                },
                created_at: event.occurred_at
              })
            })
          }
        } catch (error) {
          // Silently continue if tracking events query fails
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
            .select('id, amount_cents, donor_name, created_at')
            .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
            .order('created_at', { ascending: false })
            .limit(2)

          if (!donationsError && recentDonations && recentDonations.length > 0) {
            recentDonations.forEach(donation => {
              realEvents.push({
                id: `donation-${donation.id}`,
                event: 'donation_received',
                meta: {
                  amount: donation.amount_cents,
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
  const time = new Date(timestamp)
  const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return 'Just now'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes}m ago`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours}h ago`
  } else {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days}d ago`
  }
}