'use client'

import { useState, useEffect } from 'react'
import { Lottie } from '@/components/xk/DynamicLottie'

export default function TestLottie() {
  const [lottieData, setLottieData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log('Testing Lottie loading...')
    
    // Test loading the simple soldier animation
    fetch('/lottie/soldier-simple.json')
      .then(response => {
        console.log('Response status:', response.status)
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        return response.json()
      })
      .then(data => {
        console.log('Lottie data loaded successfully:', data)
        setLottieData(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Lottie loading failed:', err)
        setError(err.message)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-premium-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-military-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-premium-white text-lg">Loading Lottie Test...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-premium-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-premium-white mb-4">Lottie Loading Failed</h1>
          <p className="text-red-400 mb-6">{error}</p>
          <div className="bg-premium-gray p-4 rounded-lg text-left text-sm">
            <p className="text-gray-300">Debug Info:</p>
            <p className="text-gray-400">URL: /lottie/soldier-simple.json</p>
            <p className="text-gray-400">Status: Failed</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-premium-black p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-premium-white mb-8 text-center">
          Lottie Animation Test
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Test 1: Simple Soldier Animation */}
          <div className="bg-premium-gray/30 p-6 rounded-2xl border border-military-gold/20">
            <h2 className="text-xl font-bold text-military-gold mb-4">Simple Soldier Animation</h2>
            <div className="flex justify-center">
              {lottieData ? (
                <Lottie
                  animationData={lottieData}
                  loop
                  autoplay
                  style={{ height: 200, width: 200 }}
                />
              ) : (
                <div className="w-48 h-48 bg-red-500 rounded-lg flex items-center justify-center text-white">
                  No Animation Data
                </div>
              )}
            </div>
            <p className="text-center mt-4 text-gray-400">
              {lottieData ? '✅ Animation Loaded' : '❌ No Animation'}
            </p>
          </div>

          {/* Test 2: Medal Animation */}
          <div className="bg-premium-gray/30 p-6 rounded-2xl border border-military-gold/20">
            <h2 className="text-xl font-bold text-military-gold mb-4">Medal Animation</h2>
            <div className="flex justify-center">
              <div className="w-48 h-48 bg-military-gold rounded-lg flex items-center justify-center text-black text-2xl">
                🏅
              </div>
            </div>
            <p className="text-center mt-4 text-gray-400">
              Placeholder for Medal Animation
            </p>
          </div>
        </div>

        <div className="text-center mt-12">
          <a 
            href="/" 
            className="inline-block bg-military-gold hover:bg-yellow-500 text-black font-semibold px-8 py-4 rounded-xl transition-all duration-300"
          >
            Back to Home
          </a>
        </div>
      </div>
    </div>
  )
}
