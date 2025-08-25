'use client'

import { Lightbulb, Share, TrendingUp, Users } from 'lucide-react'

interface NudgeRailProps {
  kpiData: any
  funnelData: any
  supportersData: any
  channelsData: any
}

export default function NudgeRail({ kpiData, funnelData, supportersData, channelsData }: NudgeRailProps) {
  // Generate simple nudges
  const nudges = []
  
  if (kpiData?.views?.value > 10 && kpiData?.contacts?.value < 2) {
    nudges.push({
      title: 'High Views, Low Contacts',
      description: 'Many views, few contacts — follow up.',
      action: 'Follow Up',
      icon: TrendingUp,
      color: 'orange'
    })
  }

  if (supportersData?.length === 0) {
    nudges.push({
      title: 'Invite Supporters',
      description: 'Get more people to share your pitch.',
      action: 'Invite',
      icon: Users,
      color: 'purple'
    })
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-yellow-600" />
          <h3 className="text-lg font-semibold text-gray-900">Smart Suggestions</h3>
        </div>
        
        <div className="space-y-4">
          {nudges.map((nudge, index) => {
            const Icon = nudge.icon
            return (
              <div key={index} className="p-4 rounded-lg border bg-blue-50 border-blue-200">
                <div className="flex items-start gap-3">
                  <Icon className="w-5 h-5 mt-0.5 text-blue-600" />
                  <div>
                    <h4 className="font-medium text-blue-900 mb-1">{nudge.title}</h4>
                    <p className="text-sm text-blue-700 mb-2">{nudge.description}</p>
                    <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
                      {nudge.action} →
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {nudges.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Lightbulb className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-sm">No suggestions right now</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Total Views</span>
            <span className="text-sm font-semibold">{kpiData?.views?.value || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Total Contacts</span>
            <span className="text-sm font-semibold">{kpiData?.contacts?.value || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Supporters</span>
            <span className="text-sm font-semibold">{supportersData?.length || 0}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
