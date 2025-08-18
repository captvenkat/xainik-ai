'use client'

import { Activity } from 'lucide-react'

interface SimpleActivityFeedProps {
  data: {
    items: {
      icon: string
      text: string
      time: string
    }[]
  } | null
}

export default function SimpleActivityFeed({ data }: SimpleActivityFeedProps) {
  if (!data) return null

  return (
    <div className="bg-white rounded-xl shadow-sm border">
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        <p className="text-sm text-gray-600 mt-1">
          Latest activity on your pitch
        </p>
      </div>
      
      <div className="divide-y divide-gray-200">
        {data.items.map((item, index) => (
          <div key={index} className="p-6">
            <div className="flex items-start gap-3">
              <div className="text-2xl">{item.icon}</div>
              <div className="flex-1">
                <p className="text-gray-900">{item.text}</p>
                <p className="text-sm text-gray-500 mt-1">{item.time}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {data.items.length === 0 && (
        <div className="p-6 text-center">
          <Activity className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">No recent activity</p>
        </div>
      )}
    </div>
  )
}
