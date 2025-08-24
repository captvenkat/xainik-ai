'use client'

import { useState, useEffect } from 'react'
import { Brain, TrendingUp, Target, Users, RefreshCw, Loader2, CheckCircle, ArrowRight, X } from 'lucide-react'
import { createSupabaseBrowser } from '@/lib/supabaseBrowser'
import type { AIInsight } from '@/lib/openai'

interface AIInsightsProps {
  userId: string
  pitchId?: string
  className?: string
}

export default function AIInsights({ 
  userId, 
  pitchId, 
  className = '' 
}: AIInsightsProps) {
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null)
  const [selectedInsight, setSelectedInsight] = useState<AIInsight | null>(null)

  const supabase = createSupabaseBrowser()

  // Generate AI insights based on user activity and pitch performance
  const generateInsights = async () => {
    if (!pitchId) return

    setIsLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pitchId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate insights')
      }

      const data = await response.json()
      
      if (data.success) {
        setInsights(data.insights)
        setLastGenerated(new Date())
        
        if (data.warning) {
          setError(data.warning)
        }
      } else {
        throw new Error('Failed to generate insights')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to generate insights')
    } finally {
      setIsLoading(false)
    }
  }

  // Load insights on component mount if pitchId is available
  useEffect(() => {
    if (pitchId && insights.length === 0) {
      generateInsights()
    }
  }, [pitchId])

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'performance': return <TrendingUp className="w-5 h-5" />
      case 'engagement': return <Users className="w-5 h-5" />
      case 'optimization': return <Target className="w-5 h-5" />
      case 'networking': return <Users className="w-5 h-5" />
      default: return <Brain className="w-5 h-5" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'performance': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'engagement': return 'bg-green-100 text-green-700 border-green-200'
      case 'optimization': return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'networking': return 'bg-orange-100 text-orange-700 border-orange-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600'
    if (confidence >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const handleInsightClick = (insight: AIInsight) => {
    setSelectedInsight(insight)
  }

  const closeInsightDetail = () => {
    setSelectedInsight(null)
  }

  if (!pitchId) {
    return (
      <div className={`bg-gray-50 rounded-lg p-6 text-center ${className}`}>
        <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Insights</h3>
        <p className="text-gray-600">Create a pitch to get AI-powered insights and recommendations</p>
      </div>
    )
  }

  return (
    <>
      <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Brain className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">AI Insights</h3>
                <p className="text-sm text-gray-600">
                  Data-driven recommendations to optimize your job search
                </p>
              </div>
            </div>
            <button
              onClick={generateInsights}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              <span>{isLoading ? 'Analyzing...' : 'Refresh'}</span>
            </button>
          </div>
          
          {lastGenerated && (
            <p className="text-xs text-gray-500 mt-2">
              Last analyzed: {lastGenerated.toLocaleTimeString()}
            </p>
          )}
        </div>

        {error && (
          <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400">
            <p className="text-sm text-yellow-700">{error}</p>
          </div>
        )}

        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              <span className="ml-3 text-gray-600">AI is analyzing your data...</span>
            </div>
          ) : insights.length > 0 ? (
            <div className="space-y-4">
              {insights.map((insight, index) => (
                <div
                  key={index}
                  onClick={() => handleInsightClick(insight)}
                  className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 hover:shadow-sm transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${getCategoryColor(insight.category)}`}>
                        {getCategoryIcon(insight.category)}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 capitalize">
                          {insight.category} Insight
                        </h4>
                        <p className="text-sm text-gray-600">
                          {insight.insight}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-medium ${getConfidenceColor(insight.confidence)}`}>
                        {insight.confidence}% confidence
                      </span>
                      {insight.actionable && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                          Actionable
                        </span>
                      )}
                    </div>
                  </div>

                  {insight.actionable && insight.nextSteps.length > 0 && (
                    <div className="border-t border-gray-100 pt-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">Next Steps:</p>
                      <div className="space-y-1">
                        {insight.nextSteps.map((step, stepIndex) => (
                          <div key={stepIndex} className="flex items-center space-x-2 text-sm text-gray-600">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No insights yet</h4>
              <p className="text-gray-600 mb-4">
                Click "Refresh" to generate AI-powered insights based on your activity and pitch performance
              </p>
              <button
                onClick={generateInsights}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Generate Insights
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Insight Detail Modal */}
      {selectedInsight && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${getCategoryColor(selectedInsight.category)}`}>
                    {getCategoryIcon(selectedInsight.category)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 capitalize">
                      {selectedInsight.category} Insight
                    </h3>
                    <p className="text-sm text-gray-600">
                      AI-generated recommendation based on your data
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeInsightDetail}
                  className="text-gray-400 hover:text-gray-600 p-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-2">Insight</h4>
                <p className="text-gray-700 text-lg leading-relaxed">
                  {selectedInsight.insight}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-1">Confidence</h5>
                  <p className={`text-2xl font-bold ${getConfidenceColor(selectedInsight.confidence)}`}>
                    {selectedInsight.confidence}%
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-1">Actionable</h5>
                  <p className={`text-2xl font-bold ${selectedInsight.actionable ? 'text-green-600' : 'text-gray-400'}`}>
                    {selectedInsight.actionable ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>

              {selectedInsight.actionable && selectedInsight.nextSteps.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Recommended Actions</h4>
                  <div className="space-y-3">
                    {selectedInsight.nextSteps.map((step, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                        <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                          {index + 1}
                        </div>
                        <p className="text-gray-700">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeInsightDetail}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                {selectedInsight.actionable && (
                  <button
                    onClick={() => {
                      // Handle action implementation
                      closeInsightDetail()
                    }}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
                  >
                    <span>Take Action</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
