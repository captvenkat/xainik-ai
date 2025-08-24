'use client'

import { TrendingUp, Phone, Share2, FileText } from 'lucide-react'

interface SimpleMetricsProps {
  data: {
    engagement: {
      value: string
      subtitle: string
      actionText: string
      action: () => void
      isMockData?: boolean
    }
    contacts: {
      value: string
      subtitle: string
      actionText: string
      action: () => void
      isMockData?: boolean
    }
    shares: {
      value: string
      subtitle: string
      actionText: string
      action: () => void
      isMockData?: boolean
    }
    resumeRequests?: {
      value: string
      subtitle: string
      actionText: string
      action: () => void
      isMockData?: boolean
    }
    isMockData?: boolean
  } | null
}

export default function SimpleMetrics({ data }: SimpleMetricsProps) {
  if (!data) return null

  return (
    <div className="space-y-4">
      {/* Mock Data Banner */}
      {data.isMockData && (
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-4 text-center">
          <div className="flex items-center justify-center gap-3">
            <div className="text-2xl">📊</div>
            <div>
              <div className="font-semibold text-amber-800">Demo Metrics</div>
              <div className="text-sm text-amber-700">
                These are example metrics. Create your pitch and start sharing to see your real performance data!
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Engagement */}
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {data.engagement.value}
                {data.engagement.isMockData && (
                  <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                    Demo
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-600">
                {data.engagement.subtitle}
              </div>
            </div>
          </div>
          <button 
            onClick={data.engagement.action}
            className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors"
          >
            {data.engagement.actionText}
          </button>
        </div>

        {/* Contacts */}
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Phone className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {data.contacts.value}
                {data.contacts.isMockData && (
                  <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                    Demo
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-600">
                {data.contacts.subtitle}
              </div>
            </div>
          </div>
          <button 
            onClick={data.contacts.action}
            className="text-green-600 text-sm font-medium hover:text-green-700 transition-colors"
          >
            {data.contacts.actionText}
          </button>
        </div>

        {/* Shares */}
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Share2 className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {data.shares.value}
                {data.shares.isMockData && (
                  <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                    Demo
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-600">
                {data.shares.subtitle}
              </div>
            </div>
          </div>
          <button 
            onClick={data.shares.action}
            className="text-purple-600 text-sm font-medium hover:text-purple-700 transition-colors"
          >
            {data.shares.actionText}
          </button>
        </div>

        {/* Resume Requests */}
        {data.resumeRequests && (
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {data.resumeRequests.value}
                  {data.resumeRequests.isMockData && (
                    <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                      Demo
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  {data.resumeRequests.subtitle}
                </div>
              </div>
            </div>
            <button 
              onClick={data.resumeRequests.action}
              className="text-orange-600 text-sm font-medium hover:text-orange-700 transition-colors"
            >
              {data.resumeRequests.actionText}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
