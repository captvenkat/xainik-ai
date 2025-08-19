'use client'

import { CheckCircle, Clock, TrendingUp, AlertTriangle, Target, Zap } from 'lucide-react'

interface SimpleActionPlanProps {
  data: {
    actions: {
      title: string
      impact: string
      time: string
      priority: 'critical' | 'high' | 'medium'
      reason: string
      action: () => void
    }[]
    summary?: {
      totalViews: number
      conversionRate: string
      supporterCount: number
      endorsementCount: number
      hasPhoto: boolean
      hasRecentActivity: boolean
    }
  } | null
}

export default function SimpleActionPlan({ data }: SimpleActionPlanProps) {
  if (!data) return null

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200'
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'medium': return 'text-blue-600 bg-blue-50 border-blue-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return <AlertTriangle className="w-4 h-4" />
      case 'high': return <Target className="w-4 h-4" />
      case 'medium': return <Zap className="w-4 h-4" />
      default: return <TrendingUp className="w-4 h-4" />
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border">
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold text-gray-900">Your Mentor's Advice</h3>
        <p className="text-sm text-gray-600 mt-1">
          Simple steps to get you hired faster
        </p>
      </div>
      
      <div className="divide-y divide-gray-200">
        {data.actions.map((action, index) => (
          <div key={index} className="p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(action.priority)}`}>
                    {getPriorityIcon(action.priority)}
                    <span className="capitalize">{action.priority}</span>
                  </div>
                  <h4 className="font-medium text-gray-900">{action.title}</h4>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="font-medium">{action.impact}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>{action.time}</span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-700 bg-blue-50 rounded-lg p-3 border-l-4 border-blue-400">
                  💡 {action.reason}
                </p>
              </div>
              
              <button 
                onClick={action.action}
                className="ml-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                <CheckCircle className="w-4 h-4" />
                Let's Do This
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {data.summary && (
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="text-xs text-gray-600">
            <strong>Quick check:</strong> {data.summary.totalViews} people have seen your pitch • {data.summary.supporterCount} supporter{data.summary.supporterCount === 1 ? '' : 's'} in your network
          </div>
        </div>
      )}
    </div>
  )
}
