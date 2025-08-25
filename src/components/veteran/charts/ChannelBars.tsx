'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
import { BarChart3, Share2, Eye } from 'lucide-react'

interface ChannelBarsData {
  channel: string
  shares: number
  views: number
}

interface ChannelBarsProps {
  data: ChannelBarsData[]
}

export default function ChannelBars({ data }: ChannelBarsProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[220px] flex items-center justify-center text-gray-500">
        <div className="text-center">
          <BarChart3 className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No channel data in this range</p>
        </div>
      </div>
    )
  }

  // Calculate totals
  const totalShares = data.reduce((sum, item) => sum + item.shares, 0)
  const totalViews = data.reduce((sum, item) => sum + item.views, 0)
  
  // Find top performing channel
  if (data.length === 0) {
    return (
      <div className="h-[220px] flex items-center justify-center text-gray-500">
        <div className="text-center">
          <BarChart3 className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No channel data in this range</p>
        </div>
      </div>
    )
  }
  
  const firstItem = data[0]!
  const topChannel = data.reduce((top: ChannelBarsData, current: ChannelBarsData) => 
    (current.shares + current.views) > (top.shares + top.views) ? current : top
  , firstItem)

  // Colors for different channels
  const channelColors: Record<string, string> = {
    'linkedin': '#0077b5',
    'whatsapp': '#25d366',
    'facebook': '#1877f2',
    'twitter': '#1da1f2',
    'email': '#ea4335',
    'telegram': '#0088cc',
    'instagram': '#e4405f',
    'default': '#6b7280'
  }

  return (
    <div className="space-y-4">
      {/* Header with metrics */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Channel Performance</h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-blue-600" />
            <span className="text-gray-600">Total Shares:</span>
            <span className="font-semibold">{totalShares}</span>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-green-600" />
            <span className="text-gray-600">Total Views:</span>
            <span className="font-semibold">{totalViews}</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={data} 
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="channel" 
              stroke="#6b7280"
              fontSize={12}
              tickFormatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
            />
            <YAxis stroke="#6b7280" fontSize={12} />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#1f2937',
                border: 'none',
                borderRadius: '8px',
                color: '#f9fafb'
              }}
              formatter={(value: number, name: string) => [
                value.toLocaleString(),
                name === 'shares' ? 'Shares' : 'Views'
              ]}
            />
            <Legend />
            <Bar 
              dataKey="shares" 
              stackId="a" 
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="views" 
              stackId="a" 
              fill="#10b981"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Channel breakdown */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">Top Channel</div>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 border border-blue-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: channelColors[topChannel.channel] || channelColors.default }}
                />
                <span className="font-semibold capitalize">{topChannel.channel}</span>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">
                  {topChannel.shares + topChannel.views}
                </div>
                <div className="text-xs text-gray-600">total actions</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">Performance</div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">
                {totalShares > 0 ? ((totalViews / totalShares) * 100).toFixed(1) : '0'}%
              </div>
              <div className="text-xs text-gray-600">share-to-view rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Channel insights */}
      <div className="bg-gray-50 rounded-lg p-3">
        <div className="text-xs text-gray-600 mb-2">Channel Insights:</div>
        <div className="space-y-1 text-xs">
          {data.some(channel => channel.channel === 'linkedin' && channel.shares > 0) && (
            <div className="text-blue-600">💼 LinkedIn is great for professional networking</div>
          )}
          {data.some(channel => channel.channel === 'whatsapp' && channel.views > 0) && (
            <div className="text-green-600">📱 WhatsApp shows high engagement - keep using it</div>
          )}
          {data.some(channel => channel.channel === 'email' && channel.shares > 0) && (
            <div className="text-red-600">📧 Email sharing is effective for formal contacts</div>
          )}
          {data.length > 3 && (
            <div className="text-purple-600">🎯 Multi-channel approach is working well</div>
          )}
        </div>
      </div>
    </div>
  )
}
