'use client'

import { useEffect } from 'react'

export default function CSSOptimizer() {
  useEffect(() => {
    // Optimize CSS loading by removing unused preloads
    const preloadLinks = document.querySelectorAll('link[rel="preload"]')
    
    preloadLinks.forEach((link) => {
      const href = link.getAttribute('href')
      if (href && href.includes('.css')) {
        // Check if CSS is actually needed
        const isCritical = href.includes('critical') || href.includes('main')
        
        if (!isCritical) {
          // Remove non-critical CSS preloads to prevent warnings
          link.remove()
        }
      }
    })
  }, [])

  return null // This component doesn't render anything
}
