'use client'

import { TrendingUp, Eye, Phone, Mail } from 'lucide-react'
import BarChart from './charts/BarChart'

interface ReferralFunnelProps {
  data: {
    opens: number
    views: number
    calls: number
    emails: number
  }
  title?: string
  showChart?: boolean
}

export default function ReferralFunnel({ data, title = "Referral Funnel", showChart = true }: ReferralFunnelProps) {
  const totalOpens = data.opens
  const totalViews = data.views
  const totalCalls = data.calls
  const totalEmails = data.emails
  const totalConversions = totalCalls + totalEmails

  const openToViewRate = totalOpens > 0 ? (totalViews / totalOpens) * 100 : 0
  const viewToConversionRate = totalViews > 0 ? (totalConversions / totalViews) * 100 : 0
  const overallConversionRate = totalOpens > 0 ? (totalConversions / totalOpens) * 100 : 0

  const chartData = [
    { label: 'Opens', value: totalOpens, color: '#3B82F6' },
    { label: 'Views', value: totalViews, color: '#10B981' },
    { label: 'Calls', value: totalCalls, color: '#F59E0B' },
    { label: 'Emails', value: totalEmails, color: '#EF4444' }
  ]

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{totalOpens}</div>
          <div className="text-sm text-gray-600">Opens</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{totalViews}</div>
          <div className="text-sm text-gray-600">Views</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">{totalCalls}</div>
          <div className="text-sm text-gray-600">Calls</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{totalEmails}</div>
          <div className="text-sm text-gray-600">Emails</div>
        </div>
      </div>

      {/* Conversion Rates */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Open to View</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">{openToViewRate.toFixed(1)}%</div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-900">View to Conversion</span>
          </div>
          <div className="text-2xl font-bold text-green-600">{viewToConversionRate.toFixed(1)}%</div>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">Overall Conversion</span>
          </div>
          <div className="text-2xl font-bold text-purple-600">{overallConversionRate.toFixed(1)}%</div>
        </div>
      </div>

      {/* Chart */}
      {showChart && (
        <div className="mt-6">
          <BarChart
            title="Funnel Breakdown"
            data={chartData}
            height={200}
          />
        </div>
      )}

      {/* Detailed Breakdown */}
      <div className="mt-6 space-y-3">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="font-medium">Opens</span>
          </div>
          <div className="text-right">
            <div className="font-bold">{totalOpens}</div>
            <div className="text-sm text-gray-600">100%</div>
          </div>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="font-medium">Views</span>
          </div>
          <div className="text-right">
            <div className="font-bold">{totalViews}</div>
            <div className="text-sm text-gray-600">{openToViewRate.toFixed(1)}%</div>
          </div>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="font-medium">Calls</span>
          </div>
          <div className="text-right">
            <div className="font-bold">{totalCalls}</div>
            <div className="text-sm text-gray-600">{totalViews > 0 ? ((totalCalls / totalViews) * 100).toFixed(1) : 0}%</div>
          </div>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="font-medium">Emails</span>
          </div>
          <div className="text-right">
            <div className="font-bold">{totalEmails}</div>
            <div className="text-sm text-gray-600">{totalViews > 0 ? ((totalEmails / totalViews) * 100).toFixed(1) : 0}%</div>
          </div>
        </div>
      </div>
    </div>
  )
}
