'use client'

import { BarChart, TrendingUp } from 'lucide-react'
import { micro } from '@/lib/microcopy/progress'
import type { ChannelRow } from '@/lib/actions/progress'

interface ChannelInsightsProps {
  data: ChannelRow[] | null
}

export default function ChannelInsights({ data }: ChannelInsightsProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Channel Insights</h3>
        <div className="text-center py-8 text-gray-500">
          <BarChart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium mb-2">No channel data yet</p>
          <p className="text-sm">Share your pitch to see channel insights.</p>
        </div>
      </div>
    )
  }

  const maxViews = Math.max(...data.map(channel => channel.views))
  const maxContacts = Math.max(...data.map(channel => channel.contacts))

  const channelLabels = {
    whatsapp: 'WhatsApp',
    linkedin: 'LinkedIn',
    facebook: 'Facebook',
    email: 'Email',
    twitter: 'Twitter',
    direct: 'Direct'
  }

  const channelColors = {
    whatsapp: 'bg-green-500',
    linkedin: 'bg-blue-500',
    facebook: 'bg-blue-600',
    email: 'bg-gray-500',
    twitter: 'bg-blue-400',
    direct: 'bg-gray-400'
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Channel Insights</h3>
      <p className="text-sm text-gray-600 mb-6">{micro.channels.helper}</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div>
          <h4 className="font-medium text-gray-900 mb-4">Views & Contacts by Channel</h4>
          <div className="space-y-3">
            {data.map((channel) => (
              <div key={channel.channel} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    {channelLabels[channel.channel as keyof typeof channelLabels]}
                  </span>
                  <div className="text-right text-sm">
                    <div className="text-gray-900">{channel.views} views</div>
                    <div className="text-gray-500">{channel.contacts} contacts</div>
                  </div>
                </div>
                
                <div className="flex gap-1 h-4">
                  {/* Views bar */}
                  <div
                    className={`${channelColors[channel.channel as keyof typeof channelColors]} rounded-sm`}
                    style={{ 
                      width: `${maxViews > 0 ? (channel.views / maxViews) * 100 : 0}%` 
                    }}
                    title={`${channel.views} views`}
                  ></div>
                  
                  {/* Contacts bar */}
                  <div
                    className="bg-purple-500 rounded-sm"
                    style={{ 
                      width: `${maxContacts > 0 ? (channel.contacts / maxContacts) * 100 : 0}%` 
                    }}
                    title={`${channel.contacts} contacts`}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Efficiency Tile */}
        <div>
          <h4 className="font-medium text-gray-900 mb-4">Channel Efficiency</h4>
          <p className="text-sm text-gray-600 mb-4" title={micro.channels.efficiency}>
            {micro.channels.efficiency}
          </p>
          
          <div className="space-y-3">
            {data.map((channel) => (
              <div key={channel.channel} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 ${channelColors[channel.channel as keyof typeof channelColors]} rounded-full`}></div>
                  <span className="text-sm font-medium text-gray-700">
                    {channelLabels[channel.channel as keyof typeof channelLabels]}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-900">
                    {channel.efficiency.toFixed(1)}
                  </span>
                  <span className="text-xs text-gray-500">views/share</span>
                  {channel.efficiency > 2 && (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Efficiency Summary */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">Best Performing</span>
              <span className="text-sm text-blue-700">
                {data.reduce((best, current) => 
                  current.efficiency > best.efficiency ? current : best
                ).channel}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
