'use client'

import { ChannelData } from '@/lib/actions/impact/channels'
import BarChart from '../charts/BarChart'

interface ChannelPerformanceProps {
  data?: ChannelData[]
}

export default function ChannelPerformance({ data }: ChannelPerformanceProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Channel Performance</h3>
        <div className="text-center py-8">
          <p className="text-gray-500">No channel data available</p>
        </div>
      </div>
    )
  }

  // Prepare chart data
  const chartData = data.map(channel => ({
    label: channel.platform,
    value: channel.shares,
    color: getChannelColor(channel.platform)
  }))

  const totalShares = data.reduce((sum, channel) => sum + channel.shares, 0)
  const totalValue = data.reduce((sum, channel) => sum + channel.valueUsd, 0)

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Channel Performance</h3>
      
      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{totalShares}</div>
          <div className="text-sm text-gray-600">Total Shares</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {data.reduce((sum, channel) => sum + channel.opens, 0)}
          </div>
          <div className="text-sm text-gray-600">Total Opens</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {(data.reduce((sum, channel) => sum + channel.conversionRate, 0) / data.length).toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600">Avg Conversion</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">${totalValue.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Total Value</div>
        </div>
      </div>

      {/* Chart */}
      <div className="mb-6">
        <BarChart
          title="Shares by Channel"
          data={chartData}
          height={200}
        />
      </div>

      {/* Channel breakdown */}
      <div className="space-y-3">
        {data.map((channel, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getChannelColor(channel.platform) }}
              ></div>
              <div>
                <span className="font-medium text-gray-900">{channel.platform}</span>
                <p className="text-sm text-gray-600">
                  {channel.shares} shares • {channel.opens} opens • {channel.conversionRate.toFixed(1)}% conversion
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-gray-900">${channel.valueUsd.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Value generated</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function getChannelColor(platform: string): string {
  switch (platform.toLowerCase()) {
    case 'whatsapp':
      return '#25D366'
    case 'linkedin':
      return '#0077B5'
    case 'email':
      return '#EA4335'
    case 'direct':
      return '#6B7280'
    default:
      return '#3B82F6'
  }
}
