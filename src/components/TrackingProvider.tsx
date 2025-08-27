'use client'

import { useEffect } from 'react'
import { enableAutoTracking, enableRealTimeTracking } from '@/lib/tracking'

interface TrackingProviderProps {
  children: React.ReactNode
}

export function TrackingProvider({ children }: TrackingProviderProps) {
  useEffect(() => {
    // Initialize universal tracking
    enableAutoTracking()
    enableRealTimeTracking()
    
    // Add pixel tracking for all page views
    const trackPageView = async () => {
      const pitchId = window.location.pathname.match(/\/pitch\/([^\/]+)(?:\/|$)/)?.[1]
      // Skip tracking for special routes like /pitch/new, /pitch/edit, etc.
      if (pitchId && ['new', 'edit', 'create'].includes(pitchId)) {
        return
      }
      const referralId = new URLSearchParams(window.location.search).get('ref')
      
      if (pitchId) {
        try {
          // Get pitch owner user ID from the page data
          const pitchElement = document.querySelector('[data-pitch-id]')
          const userId = pitchElement?.getAttribute('data-user-id')
          
          if (userId) {
            // Create pixel tracking URL with user ID
            const params = new URLSearchParams({
              event: 'PITCH_VIEWED',
              pitch: pitchId,
              user: userId,
              ...(referralId && { ref: referralId }),
              platform: 'web'
            })
            
            const pixelUrl = `/api/track-event?${params}`
            
            // Create invisible image for pixel tracking
            const img = new Image()
            img.src = pixelUrl
            img.style.display = 'none'
            document.body.appendChild(img)
            
            // Clean up after tracking
            setTimeout(() => {
              if (img.parentNode) {
                img.parentNode.removeChild(img)
              }
            }, 1000)
          }
        } catch (error) {
          console.error('Error in pixel tracking:', error)
        }
      }
    }

    // Track initial page view
    trackPageView()
    
    // Track on route changes (for SPA navigation)
    const handleRouteChange = () => {
      setTimeout(trackPageView, 100) // Small delay to ensure route is updated
    }
    
    // Listen for popstate events (browser back/forward)
    window.addEventListener('popstate', handleRouteChange)
    
    // Track on page visibility change (user returns to tab)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        trackPageView()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    // Cleanup
    return () => {
      window.removeEventListener('popstate', handleRouteChange)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  return <>{children}</>
}
