'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Target, Calendar, Zap, BarChart3, AlertTriangle } from 'lucide-react'

interface PredictiveData {
  predictedViews: number
  predictedCalls: number
  predictedEmails: number
  confidence: number
  trendDirection: 'up' | 'down' | 'stable'
  nextMilestone: string
  estimatedDaysToMilestone: number
  riskFactors: string[]
  opportunities: string[]
}

interface PredictiveAnalyticsProps {
  currentMetrics: {
    views: number
    calls: number
    emails: number
    endorsements: number
  }
  historicalData: Array<{
    date: string
    views: number
    calls: number
    emails: number
  }>
}

export default function PredictiveAnalytics({ currentMetrics, historicalData }: PredictiveAnalyticsProps) {
  const [predictiveData, setPredictiveData] = useState<PredictiveData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate AI prediction calculation
    const calculatePredictions = () => {
      if (historicalData.length < 7) {
        setPredictiveData(null)
        setIsLoading(false)
        return
      }

      // Calculate trend-based predictions
      const recentTrend = historicalData.slice(-7)
      const olderTrend = historicalData.slice(-14, -7)
      
      const recentAvg = {
        views: recentTrend.reduce((sum, day) => sum + (day?.views || 0), 0) / 7,
        calls: recentTrend.reduce((sum, day) => sum + (day?.calls || 0), 0) / 7,
        emails: recentTrend.reduce((sum, day) => sum + (day?.emails || 0), 0) / 7
      }
      
      const olderAvg = {
        views: olderTrend.reduce((sum, day) => sum + (day?.views || 0), 0) / 7,
        calls: olderTrend.reduce((sum, day) => sum + (day?.calls || 0), 0) / 7,
        emails: olderTrend.reduce((sum, day) => sum + (day?.emails || 0), 0) / 7
      }

      // Calculate growth rates
      const growthRates = {
        views: (olderAvg?.views || 0) > 0 ? ((recentAvg?.views || 0) - (olderAvg?.views || 0)) / (olderAvg?.views || 1) : 0,
        calls: (olderAvg?.calls || 0) > 0 ? ((recentAvg?.calls || 0) - (olderAvg?.calls || 0)) / (olderAvg?.calls || 1) : 0,
        emails: (olderAvg?.emails || 0) > 0 ? ((recentAvg?.emails || 0) - (olderAvg?.emails || 0)) / (olderAvg?.emails || 1) : 0
      }

      // Predict next 30 days
      const predictedViews = Math.max(0, Math.round((recentAvg?.views || 0) * 30 * (1 + (growthRates?.views || 0) * 0.5)))
      const predictedCalls = Math.max(0, Math.round((recentAvg?.calls || 0) * 30 * (1 + (growthRates?.calls || 0) * 0.5)))
      const predictedEmails = Math.max(0, Math.round((recentAvg?.emails || 0) * 30 * (1 + (growthRates?.emails || 0) * 0.5)))

      // Determine trend direction
      const avgGrowth = ((growthRates?.views || 0) + (growthRates?.calls || 0) + (growthRates?.emails || 0)) / 3
      const trendDirection: 'up' | 'down' | 'stable' = avgGrowth > 0.1 ? 'up' : avgGrowth < -0.1 ? 'down' : 'stable'

      // Calculate confidence based on data consistency
      const variance = historicalData.slice(-7).reduce((sum, day) => {
        const deviation = Math.abs((day?.views || 0) - (recentAvg?.views || 0))
        return sum + deviation
      }, 0) / 7
      
              const confidence = Math.max(60, Math.min(95, 100 - (variance / (recentAvg?.views || 1)) * 100))

      // Generate insights
      const riskFactors: string[] = []
      const opportunities: string[] = []

      if ((growthRates?.views || 0) < -0.2) {
        riskFactors.push('Declining visibility - consider increasing pitch sharing')
      }
      if ((growthRates?.calls || 0) < -0.3) {
        riskFactors.push('Call engagement dropping - review contact information')
      }
      if ((growthRates?.emails || 0) < -0.3) {
        riskFactors.push('Email engagement declining - optimize pitch content')
      }

      if ((growthRates?.views || 0) > 0.2) {
        opportunities.push('Strong visibility growth - capitalize on momentum')
      }
      if ((growthRates?.calls || 0) > 0.3) {
        opportunities.push('High call engagement - focus on conversion optimization')
      }
      if ((growthRates?.emails || 0) > 0.3) {
        opportunities.push('Strong email engagement - build on success')
      }

      // Calculate next milestone
      const currentTotal = (currentMetrics?.views || 0) + (currentMetrics?.calls || 0) + (currentMetrics?.emails || 0)
      const nextMilestone = currentTotal < 50 ? '50 total engagements' :
                           currentTotal < 100 ? '100 total engagements' :
                           currentTotal < 200 ? '200 total engagements' : '500 total engagements'
      
      const milestoneTarget = nextMilestone.includes('50') ? 50 :
                             nextMilestone.includes('100') ? 100 :
                             nextMilestone.includes('200') ? 200 : 500
      
      const estimatedDaysToMilestone = Math.ceil((milestoneTarget - currentTotal) / Math.max(1, (recentAvg?.views || 0) + (recentAvg?.calls || 0) + (recentAvg?.emails || 0)))

      setPredictiveData({
        predictedViews,
        predictedCalls,
        predictedEmails,
        confidence: Math.round(confidence),
        trendDirection,
        nextMilestone,
        estimatedDaysToMilestone,
        riskFactors,
        opportunities
      })
      
      setIsLoading(false)
    }

    const timer = setTimeout(calculatePredictions, 1000)
    return () => clearTimeout(timer)
  }, [currentMetrics, historicalData])

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <Zap className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">AI-Powered Predictions</h3>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    )
  }

  if (!predictiveData) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <Zap className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">AI-Powered Predictions</h3>
        </div>
        <div className="text-center py-8">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Need more data for AI predictions</p>
          <p className="text-sm text-gray-400">Check back in a few days</p>
        </div>
      </div>
    )
  }

  const getTrendIcon = (direction: 'up' | 'down' | 'stable') => {
    switch (direction) {
      case 'up':
        return <TrendingUp className="w-5 h-5 text-green-600" />
      case 'down':
        return <TrendingDown className="w-5 h-5 text-red-600" />
      default:
        return <BarChart3 className="w-5 h-5 text-blue-600" />
    }
  }

  const getTrendColor = (direction: 'up' | 'down' | 'stable') => {
    switch (direction) {
      case 'up':
        return 'text-green-600'
      case 'down':
        return 'text-red-600'
      default:
        return 'text-blue-600'
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <Zap className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-900">AI-Powered Predictions</h3>
        <div className="ml-auto flex items-center gap-2">
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            predictiveData.confidence >= 80 ? 'bg-green-100 text-green-800' :
            predictiveData.confidence >= 60 ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {predictiveData.confidence}% Confidence
          </div>
        </div>
      </div>

      {/* Trend Overview */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          {getTrendIcon(predictiveData.trendDirection)}
          <div>
            <h4 className="font-medium text-gray-900">30-Day Forecast</h4>
            <p className={`text-sm ${getTrendColor(predictiveData.trendDirection)}`}>
              {predictiveData.trendDirection === 'up' ? 'Growing' : 
               predictiveData.trendDirection === 'down' ? 'Declining' : 'Stable'} trend detected
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{predictiveData.predictedViews}</div>
            <div className="text-sm text-blue-600">Predicted Views</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{predictiveData.predictedCalls}</div>
            <div className="text-sm text-green-600">Predicted Calls</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{predictiveData.predictedEmails}</div>
            <div className="text-sm text-purple-600">Predicted Emails</div>
          </div>
        </div>
      </div>

      {/* Next Milestone */}
      <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
        <div className="flex items-center gap-3 mb-3">
          <Target className="w-5 h-5 text-purple-600" />
          <h4 className="font-medium text-gray-900">Next Milestone</h4>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold text-purple-600">{predictiveData.nextMilestone}</p>
            <p className="text-sm text-gray-600">Estimated time to reach</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-purple-600">{predictiveData.estimatedDaysToMilestone}</div>
            <div className="text-sm text-gray-600">days</div>
          </div>
        </div>
      </div>

      {/* Risk Factors & Opportunities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Risk Factors */}
        {predictiveData.riskFactors.length > 0 && (
          <div className="p-4 bg-red-50 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h4 className="font-medium text-red-900">Risk Factors</h4>
            </div>
            <div className="space-y-2">
              {predictiveData.riskFactors.map((factor, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-red-800">{factor}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Opportunities */}
        {predictiveData.opportunities.length > 0 && (
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <h4 className="font-medium text-green-900">Opportunities</h4>
            </div>
            <div className="space-y-2">
              {predictiveData.opportunities.map((opportunity, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-green-800">{opportunity}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* AI Insights Footer */}
      <div className="mt-6 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Zap className="w-4 h-4" />
          <span>AI predictions updated daily based on your performance patterns</span>
        </div>
      </div>
    </div>
  )
}
