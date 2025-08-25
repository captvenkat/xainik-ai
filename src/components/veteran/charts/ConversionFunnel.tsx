'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Target, TrendingUp } from 'lucide-react'

interface ConversionFunnelData {
  stage: string
  value: number
  color: string
  conversionRate?: number
}

interface ConversionFunnelProps {
  data: {
    views: number
    likes: number
    forwards: number
    contacts: number
    resumes: number
    hires: number
  }
}

export default function ConversionFunnel({ data }: ConversionFunnelProps) {
  if (!data || Object.values(data).every(val => val === 0)) {
    return (
      <div className="h-[220px] flex items-center justify-center text-gray-500">
        <div className="text-center">
          <Target className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No conversion data in this range</p>
        </div>
      </div>
    )
  }

  // Transform data for the chart
  const funnelData: ConversionFunnelData[] = [
    { stage: 'Views', value: data.views, color: '#3b82f6' },
    { stage: 'Likes', value: data.likes, color: '#ef4444' },
    { stage: 'Forwards', value: data.forwards, color: '#8b5cf6' },
    { stage: 'Contacts', value: data.contacts, color: '#f59e0b' },
    { stage: 'Resumes', value: data.resumes, color: '#10b981' },
    { stage: 'Hires', value: data.hires, color: '#059669' }
  ]

  // Calculate conversion rates
  funnelData.forEach((item, index) => {
    if (index === 0) {
      item.conversionRate = 100
    } else {
      const previousItem = funnelData[index - 1]
      if (previousItem) {
        const previousValue = previousItem.value
        item.conversionRate = previousValue > 0 ? (item.value / previousValue) * 100 : 0
      } else {
        item.conversionRate = 0
      }
    }
  })

  // Calculate overall conversion rate
  const overallConversionRate = data.views > 0 ? (data.hires / data.views) * 100 : 0

  return (
    <div className="space-y-4">
      {/* Header with metrics */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Conversion Funnel</h3>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">Overall:</span>
          <span className="font-semibold text-green-600">{overallConversionRate.toFixed(1)}%</span>
          <TrendingUp className="w-4 h-4 text-green-600" />
        </div>
      </div>

      {/* Chart */}
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={funnelData} 
            layout="horizontal"
            margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              type="number" 
              stroke="#6b7280"
              fontSize={12}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <YAxis 
              type="category" 
              dataKey="stage" 
              stroke="#6b7280"
              fontSize={12}
              width={70}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#1f2937',
                border: 'none',
                borderRadius: '8px',
                color: '#f9fafb'
              }}
              formatter={(value: number, name: string, props: any) => [
                value.toLocaleString(),
                `${props.payload.stage} (${props.payload.conversionRate?.toFixed(1)}% conversion)`
              ]}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {funnelData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Conversion metrics */}
      <div className="grid grid-cols-3 gap-3 text-center text-sm">
        <div className="bg-blue-50 rounded-lg p-2">
          <div className="text-lg font-bold text-blue-600">{data.views}</div>
          <div className="text-xs text-blue-600">Total Views</div>
        </div>
        <div className="bg-orange-50 rounded-lg p-2">
          <div className="text-lg font-bold text-orange-600">{data.contacts}</div>
          <div className="text-xs text-orange-600">Contacts</div>
        </div>
        <div className="bg-green-50 rounded-lg p-2">
          <div className="text-lg font-bold text-green-600">{data.hires}</div>
          <div className="text-xs text-green-600">Hires</div>
        </div>
      </div>

      {/* Key insights */}
      <div className="bg-gray-50 rounded-lg p-3">
        <div className="text-xs text-gray-600 mb-2">Key Insights:</div>
        <div className="space-y-1 text-xs">
          {data.views > 0 && data.contacts === 0 && (
            <div className="text-amber-600">⚠️ High views but no contacts - optimize your contact information</div>
          )}
          {data.contacts > 0 && data.resumes === 0 && (
            <div className="text-blue-600">💡 Contacts generated - consider enabling resume sharing</div>
          )}
          {data.hires > 0 && (
            <div className="text-green-600">🎉 Congratulations! Your pitch is converting to hires</div>
          )}
          {overallConversionRate > 5 && (
            <div className="text-green-600">🚀 Excellent conversion rate! Keep up the great work</div>
          )}
        </div>
      </div>
    </div>
  )
}
