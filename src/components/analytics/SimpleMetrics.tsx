'use client'

import { TrendingUp, Phone, Share2, FileText } from 'lucide-react'

interface SimpleMetricsProps {
  data: {
    engagement: {
      value: string
      subtitle: string
      actionText: string
      action: () => void
    }
    contacts: {
      value: string
      subtitle: string
      actionText: string
      action: () => void
    }
    shares: {
      value: string
      subtitle: string
      actionText: string
      action: () => void
    }
    resumeRequests?: {
      value: string
      subtitle: string
      actionText: string
      action: () => void
    }
  } | null
}

export default function SimpleMetrics({ data }: SimpleMetricsProps) {
  if (!data) return null

  return (
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
  )
}
