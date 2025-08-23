'use client'

import { useState, useEffect } from 'react'
import { generateMockEvents, getEventMessage, MockEvent } from '@/lib/mockData'
import { Star, Share2, Phone, FileText, CheckCircle, Handshake } from 'lucide-react'

interface LiveCommunityEventsProps {
  className?: string
}

export default function LiveCommunityEvents({ className = '' }: LiveCommunityEventsProps) {
  const [events, setEvents] = useState<MockEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load mock events (in production, this would come from API)
    const mockEvents = generateMockEvents(8)
    setEvents(mockEvents)
    setIsLoading(false)
  }, [])

  const getEventIcon = (eventType: MockEvent['type']) => {
    switch (eventType) {
      case 'endorsement_added':
        return <Star className="w-4 h-4 text-yellow-500" />
      case 'referral_shared':
        return <Share2 className="w-4 h-4 text-blue-500" />
      case 'recruiter_called':
        return <Phone className="w-4 h-4 text-green-500" />
      case 'resume_requested':
        return <FileText className="w-4 h-4 text-purple-500" />
      case 'resume_approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'veteran_joined':
        return <Handshake className="w-4 h-4 text-indigo-500" />
      default:
        return <Star className="w-4 h-4 text-gray-500" />
    }
  }

  if (isLoading) {
    return (
      <div className={`space-y-3 ${className}`}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 text-base md:text-lg text-gray-400">
            <div className="w-4 h-4 bg-gray-200 rounded-full animate-pulse"></div>
            <span>Loading community activity...</span>
          </div>
        ))}
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className={`space-y-4 text-base md:text-lg text-gray-500 text-center ${className}`}>
        <p>Waiting for new activity...</p>
        <p>Community members will appear here as they engage</p>
        <p>Be the first to make a connection!</p>
      </div>
    )
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {events.slice(0, 8).map((event) => (
        <div key={event.id} className="flex items-center gap-3 text-base md:text-lg text-gray-700">
          {getEventIcon(event.type)}
          <span className="font-medium">
            {getEventMessage(event)}
          </span>
          <span className="text-sm text-gray-500 ml-auto">
            {event.timestamp.toLocaleTimeString('en-IN', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        </div>
      ))}
    </div>
  )
}
