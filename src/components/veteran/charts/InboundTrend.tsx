'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface InboundTrendData {
  d: string
  shares: number
  views: number
}

interface InboundTrendProps {
  data: InboundTrendData[]
}

export default function InboundTrend({ data }: InboundTrendProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[220px] flex items-center justify-center text-gray-500">
        <div className="text-center">
          <TrendingUp className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No activity in this range</p>
        </div>
      </div>
    )
  }

  // Calculate trends
  const totalShares = data.reduce((sum, item) => sum + item.shares, 0)
  const totalViews = data.reduce((sum, item) => sum + item.views, 0)
  
  let sharesTrend = 0
  let viewsTrend = 0
  
  if (data.length > 1 && data[0] && data[data.length - 1]) {
    const firstItem = data[0]
    const lastItem = data[data.length - 1]
    if (firstItem && lastItem) {
      sharesTrend = ((lastItem.shares - firstItem.shares) / Math.max(firstItem.shares, 1)) * 100
      viewsTrend = ((lastItem.views - firstItem.views) / Math.max(firstItem.views, 1)) * 100
    }
  }

  return (
    <div className="space-y-4">
      {/* Header with metrics */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Inbound Funnel</h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Shares:</span>
            <span className="font-semibold">{totalShares}</span>
            {sharesTrend !== 0 && (
              <div className={`flex items-center gap-1 ${sharesTrend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {sharesTrend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                <span className="text-xs">{Math.abs(sharesTrend).toFixed(1)}%</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Views:</span>
            <span className="font-semibold">{totalViews}</span>
            {viewsTrend !== 0 && (
              <div className={`flex items-center gap-1 ${viewsTrend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {viewsTrend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                <span className="text-xs">{Math.abs(viewsTrend).toFixed(1)}%</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="d" 
              stroke="#6b7280"
              fontSize={12}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              }}
            />
            <YAxis stroke="#6b7280" fontSize={12} />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#1f2937',
                border: 'none',
                borderRadius: '8px',
                color: '#f9fafb'
              }}
              labelFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString('en-US', { 
                  weekday: 'short',
                  month: 'short', 
                  day: 'numeric' 
                })
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="shares" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
            />
            <Line 
              type="monotone" 
              dataKey="views" 
              stroke="#10b981" 
              strokeWidth={2}
              dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Mini breakdown */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="text-2xl font-bold text-blue-600">{totalShares}</div>
          <div className="text-xs text-blue-600">Total Shares</div>
        </div>
        <div className="bg-green-50 rounded-lg p-3">
          <div className="text-2xl font-bold text-green-600">{totalViews}</div>
          <div className="text-xs text-green-600">Total Views</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-3">
          <div className="text-2xl font-bold text-purple-600">
            {totalShares > 0 ? ((totalViews / totalShares) * 100).toFixed(1) : '0'}%
          </div>
          <div className="text-xs text-purple-600">Conversion Rate</div>
        </div>
      </div>
    </div>
  )
}
