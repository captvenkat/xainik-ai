'use client'

import { useState } from 'react'
import { AnalyticsMetrics } from '@/lib/metrics'
import { Target, TrendingUp, Award, Lightbulb, Calendar, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react'

interface PerformanceInsightsProps {
  insights: any
  comparativeMetrics?: any
}

export default function PerformanceInsights({ insights, comparativeMetrics }: PerformanceInsightsProps) {
  const [activeTab, setActiveTab] = useState<'goals' | 'benchmarks' | 'suggestions'>('goals')
  
  const getBenchmarkColor = (yourPerformance: number, benchmark: number) => {
    if (yourPerformance >= benchmark * 0.8) return 'text-green-600'
    if (yourPerformance >= benchmark * 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }
  
  const getBenchmarkIcon = (yourPerformance: number, benchmark: number) => {
    if (yourPerformance >= benchmark * 0.8) return <CheckCircle className="w-4 h-4 text-green-600" />
    if (yourPerformance >= benchmark * 0.6) return <AlertTriangle className="w-4 h-4 text-yellow-600" />
    return <AlertTriangle className="w-4 h-4 text-red-600" />
  }
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <Target className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-900">Performance Insights & Goals</h3>
      </div>
      
      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('goals')}
          className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'goals'
              ? 'bg-white text-purple-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Target className="w-4 h-4 inline mr-2" />
          Goals
        </button>
        <button
          onClick={() => setActiveTab('benchmarks')}
          className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'benchmarks'
              ? 'bg-white text-purple-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Award className="w-4 h-4 inline mr-2" />
          Benchmarks
        </button>
        <button
          onClick={() => setActiveTab('suggestions')}
          className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'suggestions'
              ? 'bg-white text-purple-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Lightbulb className="w-4 h-4 inline mr-2" />
          Suggestions
        </button>
      </div>
      
      {/* Goals Tab */}
      {activeTab === 'goals' && (
        <div className="space-y-6">
          {/* 30-Day Goals */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-blue-600" />
              <h4 className="text-lg font-medium text-gray-900">Next 30 Days</h4>
            </div>
            <div className="space-y-3">
              {insights.goals?.next30Days?.map((goal: any, index: number) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1">
                    <p className="text-sm text-blue-900">{goal}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-blue-600 flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>
          
          {/* 90-Day Goals */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <h4 className="text-lg font-medium text-gray-900">Next 90 Days</h4>
            </div>
            <div className="space-y-3">
              {insights.goals?.next90Days?.map((goal: any, index: number) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1">
                    <p className="text-sm text-green-900">{goal}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-green-600 flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>
          
          {/* Progress Tracking */}
          {comparativeMetrics?.last30d && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h5 className="font-medium text-gray-900 mb-3">Current Progress</h5>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {comparativeMetrics.last30d.views || 0}
                  </div>
                  <div className="text-sm text-gray-600">Views (30d)</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {(comparativeMetrics.last30d.calls || 0) + (comparativeMetrics.last30d.emails || 0)}
                  </div>
                  <div className="text-sm text-gray-600">Contacts (30d)</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Benchmarks Tab */}
      {activeTab === 'benchmarks' && (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {insights.benchmarks.yourPerformance}%
            </div>
            <div className="text-sm text-gray-600">Your Current Conversion Rate</div>
          </div>
          
          <div className="space-y-4">
            {/* Industry Average */}
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <div>
                  <div className="font-medium text-gray-900">Industry Average</div>
                  <div className="text-sm text-gray-600">Typical performance in your field</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-blue-600">
                  {insights.benchmarks.industryAvg}%
                </div>
                <div className="text-sm text-gray-500">
                  {getBenchmarkIcon(insights.benchmarks.yourPerformance, insights.benchmarks.industryAvg)}
                </div>
              </div>
            </div>
            
            {/* Top Performers */}
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <div className="font-medium text-gray-900">Top Performers</div>
                  <div className="text-sm text-gray-600">Best-in-class conversion rates</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-green-600">
                  {insights.benchmarks.topPerformers}%
                </div>
                <div className="text-sm text-gray-500">
                  {getBenchmarkIcon(insights.benchmarks.yourPerformance, insights.benchmarks.topPerformers)}
                </div>
              </div>
            </div>
            
            {/* Your Performance */}
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <div>
                  <div className="font-medium text-gray-900">Your Performance</div>
                  <div className="text-sm text-gray-600">Current conversion rate</div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-lg font-semibold ${getBenchmarkColor(insights.benchmarks.yourPerformance, insights.benchmarks.industryAvg)}`}>
                  {insights.benchmarks.yourPerformance}%
                </div>
                <div className="text-sm text-gray-500">
                  {insights.benchmarks.yourPerformance >= insights.benchmarks.industryAvg ? 'Above Average' : 'Below Average'}
                </div>
              </div>
            </div>
          </div>
          
          {/* Improvement Suggestions */}
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <h5 className="font-medium text-yellow-900 mb-2">Quick Wins</h5>
            <div className="text-sm text-yellow-800">
              {insights.benchmarks.yourPerformance < insights.benchmarks.industryAvg ? (
                <p>Focus on improving your conversion rate by optimizing your pitch content and call-to-action elements.</p>
              ) : (
                <p>Great job! You're performing above industry average. Focus on reaching top performer levels.</p>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Suggestions Tab */}
      {activeTab === 'suggestions' && (
        <div className="space-y-4">
          {insights.suggestions?.map((suggestion: any, index: number) => (
            <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <Lightbulb className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-gray-900">{suggestion}</p>
              </div>
            </div>
          ))}
          
          {/* Action Items */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h5 className="font-medium text-blue-900 mb-3">Recommended Actions</h5>
            <div className="space-y-2">
              {insights.lowViews?.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-blue-800">
                  <CheckCircle className="w-4 h-4" />
                  Increase pitch sharing frequency
                </div>
              )}
              {insights.lowConversions?.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-blue-800">
                  <CheckCircle className="w-4 h-4" />
                  Optimize pitch call-to-action
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-blue-800">
                <CheckCircle className="w-4 h-4" />
                Review and update pitch content monthly
              </div>
              <div className="flex items-center gap-2 text-sm text-blue-800">
                <CheckCircle className="w-4 h-4" />
                Engage with supporters regularly
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
