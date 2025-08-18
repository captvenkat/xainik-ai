'use client'

import { Share2, TrendingUp, Target } from 'lucide-react'

interface SimpleHeroSectionProps {
  data: {
    pitchViews: {
      total: number
      thisWeek: number
      change: string
    }
    activeOpportunities: {
      count: number
      value: number
    }
    mainAction: {
      text: string
      onClick: () => void
    }
  } | null
}

export default function SimpleHeroSection({ data }: SimpleHeroSectionProps) {
  if (!data) return null

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white shadow-lg">
      <h2 className="text-xl font-bold mb-4">Your Pitch Performance</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Pitch Views */}
        <div>
          <div className="text-3xl font-bold mb-1">
            {data.pitchViews.total.toLocaleString()}
          </div>
          <div className="text-sm opacity-90">
            people viewed your pitch this week
          </div>
          <div className="text-sm">
            {data.pitchViews.change} from last week
          </div>
        </div>

        {/* Active Opportunities */}
        <div>
          <div className="text-3xl font-bold mb-1">
            {data.activeOpportunities.count}
          </div>
          <div className="text-sm opacity-90">
            active opportunities
          </div>
          <div className="text-sm">
            worth ${data.activeOpportunities.value.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Main Action */}
      <button 
        onClick={data.mainAction.onClick}
        className="w-full bg-white text-blue-600 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
      >
        <Share2 className="w-5 h-5" />
        {data.mainAction.text}
      </button>
    </div>
  )
}
