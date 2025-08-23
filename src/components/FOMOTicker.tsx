'use client'

import { useState, useEffect, useRef } from 'react'
import { generateMockEvents, getEventMessage, MockEvent } from '@/lib/mockData'

interface FOMOTickerProps {
  className?: string
}

export default function FOMOTicker({ className = '' }: FOMOTickerProps) {
  const [events, setEvents] = useState<MockEvent[]>([])
  const [isPaused, setIsPaused] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handleChange)

    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    // Generate mock events with the exact specified lines
    const tickerLines = [
      "Ravi shares 3 referrals today",
      "An Infosys recruiter opens Col. Singh's pitch",
      "7 supporters boost 56 veterans this week",
      "10 recruiters join the platform this month",
      "23 referral messages go out today",
      "Two recruiters download Capt. Nair's pitch",
      "Meera endorses 5 veterans in one click",
      "Every veteran profile is updated within 90 days",
      "Auto-sent messages arrive in under 2 seconds",
      "A recruiter schedules a call from a referral",
      "Anil's referral note opens at 3 companies",
      "Supporters share across 15+ networks"
    ]
    
    // Create more realistic mock events with varied types and timestamps
    const mockEvents = tickerLines.map((message, index) => {
      const eventTypes: MockEvent['type'][] = ['endorsement_added', 'referral_shared', 'recruiter_called', 'resume_requested', 'veteran_joined']
      const actors = ['Ravi', 'Meera', 'Col. Singh', 'Capt. Nair', 'Anil', 'Infosys Recruiter', 'System']
      
      const eventType = eventTypes[index % eventTypes.length]!
      const actor = actors[index % actors.length]!
      
      return {
        id: `ticker-${index}`,
        type: eventType,
        actor: actor,
        target: message, // Use target instead of message
        timestamp: new Date(Date.now() - (index * 300000)) // 5 minutes apart
      }
    })
    
    setEvents(mockEvents)
  }, [])

  useEffect(() => {
    if (events.length === 0 || prefersReducedMotion) return

    const interval = setInterval(() => {
      if (!isPaused) {
        setCurrentIndex((prev) => (prev + 1) % events.length)
      }
    }, 6000) // Slower motion: change every 6 seconds

    return () => clearInterval(interval)
  }, [events.length, isPaused, prefersReducedMotion])

  const handleMouseEnter = () => setIsPaused(true)
  const handleMouseLeave = () => setIsPaused(false)

  // If feed empty, show soft placeholders
  if (events.length === 0) {
    return (
      <div className={`${className}`}>
        <div className="flex items-center gap-3 py-2">
          <div className="flex-shrink-0">
            <div className="w-2 h-2 bg-blue-300 rounded-full animate-pulse"></div>
          </div>
          <span className="text-xs font-medium text-blue-500">Live Activity</span>
          <div className="flex-1"></div>
          <div className="text-xs text-blue-400">Loading...</div>
        </div>
        
        <div className="py-1">
          <div className="text-xs text-blue-400">
            <span className="opacity-60">Meera endorsed Capt. Arjun Singh</span>
            <span className="mx-3">•</span>
            <span className="opacity-60">Col. Sharma's pitch opened 23 times today</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      className={`${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
    >
      <div className="flex items-center gap-3 py-2">
        <div className="flex-shrink-0">
          <div className="w-2 h-2 bg-blue-300 rounded-full animate-pulse"></div>
        </div>
        <span className="text-xs font-medium text-blue-500">Live Activity</span>
        <div className="flex-1"></div>
        <div className="flex space-x-1">
          {events.slice(0, 5).map((_, index) => (
            <div
              key={index}
              className={`w-1 h-1 rounded-full transition-colors ${
                index === currentIndex ? 'bg-blue-400' : 'bg-blue-200'
              }`}
            />
          ))}
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="overflow-hidden"
        aria-live="polite"
        aria-label="Recent activity"
      >
        <div 
          className={`flex transition-transform duration-1500 ${
            prefersReducedMotion ? '' : 'transform-gpu'
          }`}
          style={{
            transform: prefersReducedMotion ? 'none' : `translateX(-${currentIndex * 100}%)`
          }}
        >
          {events.map((event, index) => (
            <div
              key={event.id}
              className="flex-shrink-0 w-full flex items-center gap-3 text-xs text-blue-500 py-1"
            >
              <span className="font-medium opacity-80">
                {event.target}
              </span>
              <span className="text-blue-400 text-xs opacity-60">
                {event.timestamp.toLocaleTimeString('en-IN', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
          ))}
        </div>
      </div>

      {prefersReducedMotion && (
        <div className="py-2 flex justify-between items-center">
          <button
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            className="text-xs text-blue-400 hover:text-blue-600 disabled:opacity-50 px-2 py-1 rounded transition-colors"
            disabled={currentIndex === 0}
          >
            ← Previous
          </button>
          <span className="text-xs text-blue-400 opacity-60">
            {currentIndex + 1} of {events.length}
          </span>
          <button
            onClick={() => setCurrentIndex(prev => (prev + 1) % events.length)}
            className="text-xs text-blue-400 hover:text-blue-600 px-2 py-1 rounded transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}
