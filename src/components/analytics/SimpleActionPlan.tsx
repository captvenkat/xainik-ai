'use client'

import { CheckCircle, Clock, TrendingUp } from 'lucide-react'

interface SimpleActionPlanProps {
  data: {
    actions: {
      title: string
      impact: string
      time: string
      action: () => void
    }[]
  } | null
}

export default function SimpleActionPlan({ data }: SimpleActionPlanProps) {
  if (!data) return null

  return (
    <div className="bg-white rounded-xl shadow-sm border">
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
        <p className="text-sm text-gray-600 mt-1">
          Complete these to improve your pitch performance
        </p>
      </div>
      
      <div className="divide-y divide-gray-200">
        {data.actions.map((action, index) => (
          <div key={index} className="p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-1">{action.title}</h4>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span>{action.impact}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>{action.time}</span>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={action.action}
                className="ml-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Do This
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
