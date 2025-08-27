'use client'

import React from 'react'
import { Share2, TrendingUp, Target, Sparkles, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface SimpleHeroSectionProps {
  data: {
    pitchViews: {
      total: number
      thisWeek: number
      change: string
      isMockData?: boolean
    }
    networkReach: {
      count: number
      potential: number
      description: string
      isMockData?: boolean
    }
    potentialOpportunities: {
      count: number
      quality: string
      description: string
      isMockData?: boolean
    }
    mainAction: {
      text: string
      onClick: () => void
    }
    isMockData?: boolean
  } | null
  onSharePitch?: () => void
}

export default function SimpleHeroSection({ data, onSharePitch }: SimpleHeroSectionProps) {
  const router = useRouter()
  
  if (!data) return null

  // Progressive approach: determine user's current step
  const hasPitches = data.pitchViews.total > 0 && !data.pitchViews.isMockData
  const hasShared = data.networkReach.count > 0 && !data.networkReach.isMockData
  
  let mainActionText = 'Smart Share'
  let mainActionIcon = Share2
  let mainActionHandler = onSharePitch
  let buttonVariant = 'bg-white text-blue-600 hover:bg-gray-100'
  
  if (!hasPitches) {
    // Step 1: Create your first pitch
    mainActionText = 'Create Your First Pitch'
    mainActionIcon = Plus
    mainActionHandler = () => router.push('/pitch/new')
    buttonVariant = 'bg-gradient-to-r from-purple-500 to-violet-500 text-white hover:from-purple-600 hover:to-violet-600'
  } else if (!hasShared) {
    // Step 2: Smart Share your pitch
    mainActionText = 'Smart Share Your Pitch'
    mainActionIcon = Share2
    mainActionHandler = onSharePitch
    buttonVariant = 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600'
  }
  // Step 3: Full dashboard (default case above)

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white shadow-lg">
      {/* Progress Steps Indicator */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <div className={`flex items-center gap-2 ${!hasPitches ? 'opacity-100' : 'opacity-60'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            !hasPitches ? 'bg-yellow-400 text-yellow-900' : 'bg-green-400 text-green-900'
          }`}>
            {!hasPitches ? '1' : '✓'}
          </div>
          <span className="text-sm font-medium">Create Pitch</span>
        </div>
        
        <div className="w-8 h-1 bg-white opacity-30 rounded"></div>
        
        <div className={`flex items-center gap-2 ${!hasPitches ? 'opacity-40' : !hasShared ? 'opacity-100' : 'opacity-60'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            !hasPitches ? 'bg-gray-400 text-gray-600' : !hasShared ? 'bg-yellow-400 text-yellow-900' : 'bg-green-400 text-green-900'
          }`}>
            {!hasPitches ? '2' : !hasShared ? '2' : '✓'}
          </div>
          <span className="text-sm font-medium">Smart Share</span>
        </div>
        
        <div className="w-8 h-1 bg-white opacity-30 rounded"></div>
        
        <div className={`flex items-center gap-2 ${!hasPitches || !hasShared ? 'opacity-40' : 'opacity-100'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            !hasPitches || !hasShared ? 'bg-gray-400 text-gray-600' : 'bg-blue-400 text-blue-900'
          }`}>
            {!hasPitches || !hasShared ? '3' : '✓'}
          </div>
          <span className="text-sm font-medium">Track Results</span>
        </div>
      </div>

      {/* Mock Data Message */}
      {data.isMockData && (
        <div className="bg-yellow-400 text-yellow-900 rounded-lg p-3 mb-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <div className="text-lg">🎯</div>
            <div>
              <div className="font-semibold">Demo Data</div>
              <div className="text-sm">Create your first pitch and start sharing to see real-time stats!</div>
            </div>
          </div>
        </div>
      )}
      
      <h2 className="text-xl font-bold mb-4">Your Pitch Performance</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Pitch Views */}
        <div>
          <div className="text-3xl font-bold mb-1">
            {data.pitchViews.isMockData ? '0' : data.pitchViews.total.toLocaleString()}
          </div>
          <div className="text-sm opacity-90">
            people viewed your pitch this week
          </div>
          <div className="text-sm">
            {data.pitchViews.isMockData ? 'Mock Data' : data.pitchViews.change} from last week
          </div>
        </div>

        {/* Network Reach */}
        <div>
          <div className="text-3xl font-bold mb-1">
            {data.networkReach.isMockData ? '0' : data.networkReach.count}
          </div>
          <div className="text-sm opacity-90">
            {data.networkReach.description}
          </div>
          <div className="text-sm">
            potential to reach {data.networkReach.isMockData ? '50+' : data.networkReach.potential.toLocaleString()}+
          </div>
        </div>

        {/* Potential Opportunities */}
        <div>
          <div className="text-3xl font-bold mb-1">
            {data.potentialOpportunities.isMockData ? '10' : data.potentialOpportunities.count}
          </div>
          <div className="text-sm opacity-90">
            {data.potentialOpportunities.description}
          </div>
          <div className="text-sm">
            {data.potentialOpportunities.isMockData ? 'Mock Data' : data.potentialOpportunities.quality} quality
          </div>
        </div>
      </div>

      {/* Main Action Button */}
      <button 
        onClick={mainActionHandler}
        className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 ${buttonVariant}`}
      >
        {React.createElement(mainActionIcon, { className: "w-5 h-5" })}
        {mainActionText}
      </button>

      {/* Progress Message */}
      {!hasPitches && (
        <div className="text-center mt-4 text-blue-100 text-sm">
          🚀 Start here! Create your first pitch to unlock smart sharing
        </div>
      )}
      {hasPitches && !hasShared && (
        <div className="text-center mt-4 text-blue-100 text-sm">
          📤 Great! Now share your pitch to grow your network
        </div>
      )}
      {hasPitches && hasShared && (
        <div className="text-center mt-4 text-blue-100 text-sm">
          🎉 You're all set! Track your results and optimize
        </div>
      )}
    </div>
  )
}
