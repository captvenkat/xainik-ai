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
        
        // Note: activity_log table doesn't exist in live schema
        // Get recent activity events
        // const { data: recentEvents } = await supabase
        //   .from('activity_log')
        //   .select('*')
        //   .order('created_at', { ascending: false })
        //   .limit(10)

        // For now, use mock events
        const mockEvents: FOMOEvent[] = [
          {
            id: '1',
            event: 'supporter_connected_to_pitch',
            meta: { supporter_id: 'mock', pitch_id: 'mock' },
            created_at: new Date().toISOString()
          }
        ]
        setEvents(mockEvents)
      } catch (error) {
        console.error('Error loading FOMO events:', error)
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
        return <Heart className="w-4 h-4 text-red-500" />
      case 'supporter_view':
        return <Eye className="w-4 h-4 text-blue-500" />
      case 'supporter_share':
        return <Share2 className="w-4 h-4 text-green-500" />
      case 'supporter_call':
        return <Phone className="w-4 h-4 text-purple-500" />
      case 'supporter_email':
        return <Mail className="w-4 h-4 text-orange-500" />
      case 'supporter_endorse':
        return <Award className="w-4 h-4 text-yellow-500" />
      default:
        return <Zap className="w-4 h-4 text-blue-500" />
    }
  }

  const getEventMessage = (event: FOMOEvent) => {
    const timeAgo = getTimeAgo(event.created_at)
    
    switch (event.event) {
      case 'supporter_connected_to_pitch':
        return `Someone just connected to support a veteran's pitch`
      case 'supporter_view':
        return `A supporter viewed a veteran's pitch`
      case 'supporter_share':
        return `A supporter shared a veteran's pitch`
      case 'supporter_call':
        return `Someone called a veteran through supporter referral`
      case 'supporter_email':
        return `Someone emailed a veteran through supporter referral`
      case 'supporter_endorse':
        return `A supporter endorsed a veteran's pitch`
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
          {events.length} people active in the last hour • Join the movement!
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
        
        // Note: activity_log table doesn't exist in live schema
        // const { data: recentEvents } = await supabase
        //   .from('activity_log')
        //   .select('*')
        //   .order('created_at', { ascending: false })
        //   .limit(5)

        // For now, use mock events
        const mockEvents: FOMOEvent[] = [
          {
            id: '1',
            event: 'supporter_connected_to_pitch',
            meta: { supporter_id: 'mock', pitch_id: 'mock' },
            created_at: new Date().toISOString()
          }
        ]
        setEvents(mockEvents)
      } catch (error) {
        console.error('Error loading FOMO events:', error)
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
          {currentEvent.event.includes('supporter') ? 'New supporter activity' : 'Platform activity'}
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
