'use client'

import { useState } from 'react'
import { AnalyticsMetrics } from '@/lib/metrics'
import { Target, TrendingUp, Award, Lightbulb, Calendar, CheckCircle, AlertTriangle, ArrowRight, Plus, Settings, Zap, BookOpen } from 'lucide-react'

interface PerformanceInsightsProps {
  insights: any
  comparativeMetrics?: any
}

export default function PerformanceInsights({ insights, comparativeMetrics }: PerformanceInsightsProps) {
  const [activeTab, setActiveTab] = useState<'goals' | 'benchmarks' | 'suggestions'>('goals')
  const [showGoalForm, setShowGoalForm] = useState(false)
  const [newGoal, setNewGoal] = useState('')
  
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

  const handleSetGoal = () => {
    if (newGoal.trim()) {
      // Here you would typically save the goal to the database
      console.log('Setting new goal:', newGoal)
      alert(`Goal set: ${newGoal}`)
      setNewGoal('')
      setShowGoalForm(false)
    }
  }

  const handleTakeAction = (action: string) => {
    console.log('Taking action:', action)
    alert(`Action taken: ${action}`)
  }

  const handleImplementSuggestion = (suggestion: string) => {
    console.log('Implementing suggestion:', suggestion)
    alert(`Implementing: ${suggestion}`)
  }
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Performance Insights & Goals</h3>
        </div>
        <button
          onClick={() => setShowGoalForm(!showGoalForm)}
          className="flex items-center gap-2 px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Goal
        </button>
      </div>
      
      {/* Goal Form */}
      {showGoalForm && (
        <div className="mb-6 p-4 bg-purple-50 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-purple-600" />
            <h4 className="font-medium text-purple-900">Set New Goal</h4>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              placeholder="e.g., Get 50 pitch views this month"
              className="flex-1 px-3 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={handleSetGoal}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Set Goal
            </button>
            <button
              onClick={() => setShowGoalForm(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      
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
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h4 className="text-lg font-medium text-gray-900">Next 30 Days</h4>
              </div>
              <button
                onClick={() => handleTakeAction('View All Goals')}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View All
              </button>
            </div>
            <div className="space-y-3">
              {insights.goals?.next30Days?.map((goal: any, index: number) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1">
                    <p className="text-sm text-blue-900">{goal}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleTakeAction(`Track Progress: ${goal}`)}
                      className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors"
                    >
                      Track
                    </button>
                    <ArrowRight className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  </div>
                </div>
              ))}
              {(!insights.goals?.next30Days || insights.goals.next30Days.length === 0) && (
                <div className="text-center py-4 text-gray-500">
                  <Target className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No goals set for next 30 days</p>
                  <button
                    onClick={() => setShowGoalForm(true)}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Set your first goal
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* 90-Day Goals */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <h4 className="text-lg font-medium text-gray-900">Next 90 Days</h4>
              </div>
              <button
                onClick={() => handleTakeAction('View Long-term Goals')}
                className="text-sm text-green-600 hover:text-green-800 font-medium"
              >
                View All
              </button>
            </div>
            <div className="space-y-3">
              {insights.goals?.next90Days?.map((goal: any, index: number) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1">
                    <p className="text-sm text-green-900">{goal}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleTakeAction(`Track Progress: ${goal}`)}
                      className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 transition-colors"
                    >
                      Track
                    </button>
                    <ArrowRight className="w-4 h-4 text-green-600 flex-shrink-0" />
                  </div>
                </div>
              ))}
              {(!insights.goals?.next90Days || insights.goals.next90Days.length === 0) && (
                <div className="text-center py-4 text-gray-500">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No long-term goals set</p>
                  <button
                    onClick={() => setShowGoalForm(true)}
                    className="mt-2 text-sm text-green-600 hover:text-green-800 font-medium"
                  >
                    Set long-term goals
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Benchmarks Tab */}
      {activeTab === 'benchmarks' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-gray-900">Your Performance vs Benchmarks</h4>
            <button
              onClick={() => handleTakeAction('View Detailed Benchmarks')}
              className="text-sm text-purple-600 hover:text-purple-800 font-medium"
            >
              View Details
            </button>
          </div>
          
          <div className="space-y-4">
            {comparativeMetrics?.map((metric: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {getBenchmarkIcon(metric.yourPerformance || 0, metric.benchmark || 1)}
                  <div>
                    <p className="font-medium text-gray-900">{metric.label}</p>
                    <p className="text-sm text-gray-600">
                      Your: {metric.yourPerformance || 0} | Benchmark: {metric.benchmark || 0}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleTakeAction(`Improve ${metric.label}`)}
                  className="text-xs bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 transition-colors"
                >
                  Improve
                </button>
              </div>
            ))}
            {(!comparativeMetrics || comparativeMetrics.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                <Award className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">No benchmark data available</p>
                <button
                  onClick={() => handleTakeAction('Generate Benchmarks')}
                  className="mt-2 text-sm text-purple-600 hover:text-purple-800 font-medium"
                >
                  Generate benchmarks
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Suggestions Tab */}
      {activeTab === 'suggestions' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-gray-900">AI-Powered Suggestions</h4>
            <button
              onClick={() => handleTakeAction('Get More Suggestions')}
              className="text-sm text-amber-600 hover:text-amber-800 font-medium"
            >
              Get More
            </button>
          </div>
          
          <div className="space-y-4">
            {insights.suggestions?.map((suggestion: any, index: number) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                <Lightbulb className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-amber-900">{suggestion}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleImplementSuggestion(suggestion)}
                    className="text-xs bg-amber-600 text-white px-3 py-1 rounded hover:bg-amber-700 transition-colors"
                  >
                    Implement
                  </button>
                  <button
                    onClick={() => handleTakeAction(`Learn More: ${suggestion}`)}
                    className="text-xs bg-amber-100 text-amber-700 px-3 py-1 rounded hover:bg-amber-200 transition-colors"
                  >
                    Learn
                  </button>
                </div>
              </div>
            ))}
            {(!insights.suggestions || insights.suggestions.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                <Lightbulb className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">No suggestions available</p>
                <button
                  onClick={() => handleTakeAction('Generate Suggestions')}
                  className="mt-2 text-sm text-amber-600 hover:text-amber-800 font-medium"
                >
                  Generate suggestions
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleTakeAction('View Performance Report')}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              <BookOpen className="w-4 h-4" />
              View Report
            </button>
            <button
              onClick={() => handleTakeAction('Customize Goals')}
              className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-800 font-medium"
            >
              <Settings className="w-4 h-4" />
              Customize
            </button>
          </div>
          <button
            onClick={() => handleTakeAction('Get AI Insights')}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
          >
            <Zap className="w-4 h-4" />
            Get AI Insights
          </button>
        </div>
      </div>
    </div>
  )
}
