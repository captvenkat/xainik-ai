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
    // Load mock events
    const mockEvents = generateMockEvents(15)
    setEvents(mockEvents)
  }, [])

  useEffect(() => {
    if (events.length === 0 || prefersReducedMotion) return

    const interval = setInterval(() => {
      if (!isPaused) {
        setCurrentIndex((prev) => (prev + 1) % events.length)
      }
    }, 4000) // Change every 4 seconds

    return () => clearInterval(interval)
  }, [events.length, isPaused, prefersReducedMotion])

  const handleMouseEnter = () => setIsPaused(true)
  const handleMouseLeave = () => setIsPaused(false)

  if (events.length === 0) return null

  return (
    <div 
      className={`bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="flex-shrink-0">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
        </div>
        <h3 className="text-sm font-medium text-blue-900">Live Activity</h3>
        <div className="flex-1"></div>
        <div className="flex space-x-1">
          {events.slice(0, 5).map((_, index) => (
            <div
              key={index}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                index === currentIndex ? 'bg-blue-600' : 'bg-blue-300'
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
          className={`flex transition-transform duration-1000 ${
            prefersReducedMotion ? '' : 'transform-gpu'
          }`}
          style={{
            transform: prefersReducedMotion ? 'none' : `translateX(-${currentIndex * 100}%)`
          }}
        >
          {events.map((event, index) => (
            <div
              key={event.id}
              className="flex-shrink-0 w-full flex items-center gap-3 text-sm text-blue-800"
            >
              <span className="font-medium">
                {getEventMessage(event)}
              </span>
              <span className="text-blue-600 text-xs">
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
        <div className="mt-3 flex justify-between">
          <button
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            className="text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50"
            disabled={currentIndex === 0}
          >
            ← Previous
          </button>
          <span className="text-xs text-blue-600">
            {currentIndex + 1} of {events.length}
          </span>
          <button
            onClick={() => setCurrentIndex(prev => (prev + 1) % events.length)}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}
