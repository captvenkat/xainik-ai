'use client'

import { Share2, TrendingUp, Target, Sparkles } from 'lucide-react'

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
  if (!data) return null

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white shadow-lg">
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

      {/* Main Action */}
      <button 
        onClick={onSharePitch || data.mainAction.onClick}
        className="w-full bg-white text-blue-600 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
      >
        <Sparkles className="w-5 h-5" />
        {data.mainAction.text}
      </button>
    </div>
  )
}
