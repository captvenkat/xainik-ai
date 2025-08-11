'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Target, Users, Award, BarChart3, Eye, Phone, Mail, Heart, Share2, Zap, Crown, Medal, Trophy } from 'lucide-react'

interface BenchmarkData {
  category: string
  yourScore: number
  averageScore: number
  topScore: number
  percentile: number
  trend: 'up' | 'down' | 'stable'
  improvement: number
  rank: number
  totalCompetitors: number
}

interface CompetitiveBenchmarkProps {
  userId: string
  userMetrics: {
    views: number
    calls: number
    emails: number
    endorsements: number
    shares: number
    conversionRate: number
  }
  userField: string
  userExperience: string
}

export default function CompetitiveBenchmark({ userId, userMetrics, userField, userExperience }: CompetitiveBenchmarkProps) {
  const [benchmarkData, setBenchmarkData] = useState<BenchmarkData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<'all' | string>('all')
  const [showInsights, setShowInsights] = useState(true)

  useEffect(() => {
    // Simulate competitive data calculation
    const calculateBenchmarks = () => {
      // Mock competitive data - in real app, this would come from database
      const mockData: BenchmarkData[] = [
        {
          category: 'Visibility',
          yourScore: userMetrics.views,
          averageScore: Math.round(userMetrics.views * (0.6 + Math.random() * 0.8)),
          topScore: Math.round(userMetrics.views * (1.5 + Math.random() * 1.5)),
          percentile: Math.min(95, Math.max(5, Math.round((userMetrics.views / (userMetrics.views * 2)) * 100))),
          trend: Math.random() > 0.5 ? 'up' : 'down',
          improvement: Math.round((userMetrics.views * 0.1) + (Math.random() * 20)),
          rank: Math.floor(Math.random() * 50) + 1,
          totalCompetitors: 150
        },
        {
          category: 'Engagement',
          yourScore: userMetrics.calls + userMetrics.emails,
          averageScore: Math.round((userMetrics.calls + userMetrics.emails) * (0.5 + Math.random() * 1.0)),
          topScore: Math.round((userMetrics.calls + userMetrics.emails) * (2.0 + Math.random() * 2.0)),
          percentile: Math.min(95, Math.max(5, Math.round(((userMetrics.calls + userMetrics.emails) / ((userMetrics.calls + userMetrics.emails) * 3)) * 100))),
          trend: Math.random() > 0.5 ? 'up' : 'down',
          improvement: Math.round(((userMetrics.calls + userMetrics.emails) * 0.15) + (Math.random() * 15)),
          rank: Math.floor(Math.random() * 50) + 1,
          totalCompetitors: 150
        },
        {
          category: 'Conversion Rate',
          yourScore: userMetrics.conversionRate,
          averageScore: Math.round((userMetrics.conversionRate * (0.7 + Math.random() * 0.6)) * 100) / 100,
          topScore: Math.round((userMetrics.conversionRate * (1.8 + Math.random() * 1.2)) * 100) / 100,
          percentile: Math.min(95, Math.max(5, Math.round((userMetrics.conversionRate / (userMetrics.conversionRate * 2.5)) * 100))),
          trend: Math.random() > 0.5 ? 'up' : 'down',
          improvement: Math.round((userMetrics.conversionRate * 0.2 + Math.random() * 5) * 100) / 100,
          rank: Math.floor(Math.random() * 50) + 1,
          totalCompetitors: 150
        },
        {
          category: 'Network Strength',
          yourScore: userMetrics.endorsements,
          averageScore: Math.round(userMetrics.endorsements * (0.4 + Math.random() * 1.2)),
          topScore: Math.round(userMetrics.endorsements * (2.5 + Math.random() * 2.0)),
          percentile: Math.min(95, Math.max(5, Math.round((userMetrics.endorsements / (userMetrics.endorsements * 3.5)) * 100))),
          trend: Math.random() > 0.5 ? 'up' : 'down',
          improvement: Math.round((userMetrics.endorsements * 0.25) + (Math.random() * 8)),
          rank: Math.floor(Math.random() * 50) + 1,
          totalCompetitors: 150
        },
        {
          category: 'Content Virality',
          yourScore: userMetrics.shares,
          averageScore: Math.round(userMetrics.shares * (0.3 + Math.random() * 1.4)),
          topScore: Math.round(userMetrics.shares * (3.0 + Math.random() * 2.5)),
          percentile: Math.min(95, Math.max(5, Math.round((userMetrics.shares / (userMetrics.shares * 4.5)) * 100))),
          trend: Math.random() > 0.5 ? 'up' : 'down',
          improvement: Math.round((userMetrics.shares * 0.3) + (Math.random() * 12)),
          rank: Math.floor(Math.random() * 50) + 1,
          totalCompetitors: 150
        }
      ]

      setBenchmarkData(mockData)
      setIsLoading(false)
    }

    const timer = setTimeout(calculateBenchmarks, 1500)
    return () => clearTimeout(timer)
  }, [userMetrics])

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-600" />
      default:
        return <BarChart3 className="w-4 h-4 text-blue-600" />
    }
  }

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'text-green-600'
      case 'down':
        return 'text-red-600'
      default:
        return 'text-blue-600'
    }
  }

  const getPercentileColor = (percentile: number) => {
    if (percentile >= 80) return 'text-green-600'
    if (percentile >= 60) return 'text-blue-600'
    if (percentile >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getRankBadge = (rank: number) => {
    if (rank === 1) return { icon: <Crown className="w-4 h-4 text-yellow-500" />, color: 'bg-yellow-100 text-yellow-800' }
    if (rank <= 3) return { icon: <Medal className="w-4 h-4 text-orange-500" />, color: 'bg-orange-100 text-orange-800' }
    if (rank <= 10) return { icon: <Trophy className="w-4 h-4 text-purple-500" />, color: 'bg-purple-100 text-purple-800' }
    return { icon: <Award className="w-4 h-4 text-blue-500" />, color: 'bg-blue-100 text-blue-800' }
  }

  const getInsightMessage = (data: BenchmarkData) => {
    if (data.percentile >= 80) {
      return `Excellent! You're in the top ${100 - data.percentile}% of ${userField} veterans. Keep up the momentum!`
    } else if (data.percentile >= 60) {
      return `Good performance! You're above average. Focus on the ${data.improvement} improvement target to reach the top tier.`
    } else if (data.percentile >= 40) {
      return `You have potential! Work on the ${data.improvement} improvement target to move into the top half.`
    } else {
      return `Room for growth! Focus on the ${data.improvement} improvement target to catch up with peers.`
    }
  }

  const filteredData = selectedCategory === 'all' 
    ? benchmarkData 
    : benchmarkData.filter(data => data.category === selectedCategory)

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Competitive Benchmarking</h3>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Competitive Benchmarking</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
              {userField}
            </span>
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
              {userExperience}
            </span>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">
          Compare your performance against {benchmarkData[0]?.totalCompetitors || 150} veterans in your field
        </p>

        {/* Category Filter */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              selectedCategory === 'all'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All Metrics
          </button>
          {benchmarkData.map(data => (
            <button
              key={data.category}
              onClick={() => setSelectedCategory(data.category)}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                selectedCategory === data.category
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {data.category}
            </button>
          ))}
        </div>
      </div>

      {/* Benchmark Data */}
      <div className="p-6">
        {filteredData.map((data) => {
          const rankBadge = getRankBadge(data.rank)
          
          return (
            <div key={data.category} className="mb-6 last:mb-0">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-medium text-gray-900">{data.category}</h4>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${rankBadge.color}`}>
                    {rankBadge.icon} Rank #{data.rank}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPercentileColor(data.percentile)}`}>
                    Top {data.percentile}%
                  </span>
                </div>
              </div>

              {/* Score Comparison */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">{data.yourScore}</div>
                  <div className="text-sm text-blue-600">Your Score</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-gray-600">{data.averageScore}</div>
                  <div className="text-sm text-gray-600">Average</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <div className="text-lg font-bold text-yellow-600">{data.topScore}</div>
                  <div className="text-sm text-yellow-600">Top Score</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>Your Position</span>
                  <span>{data.yourScore} / {data.topScore}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(data.yourScore / data.topScore) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Trend & Improvement */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {getTrendIcon(data.trend)}
                  <span className={`text-sm ${getTrendColor(data.trend)}`}>
                    {data.trend === 'up' ? 'Improving' : data.trend === 'down' ? 'Declining' : 'Stable'}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Improvement Target</div>
                  <div className="text-lg font-semibold text-green-600">+{data.improvement}</div>
                </div>
              </div>

              {/* AI Insights */}
              {showInsights && (
                <div className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border-l-4 border-purple-400">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-900">AI Insight</span>
                  </div>
                  <p className="text-sm text-purple-800">{getInsightMessage(data)}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer Actions */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowInsights(!showInsights)}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            <Zap className="w-4 h-4" />
            {showInsights ? 'Hide' : 'Show'} AI Insights
          </button>
          <div className="text-sm text-gray-600">
            Data updated daily • {benchmarkData[0]?.totalCompetitors || 150} active competitors
          </div>
        </div>
      </div>
    </div>
  )
}
