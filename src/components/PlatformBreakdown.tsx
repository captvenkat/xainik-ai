'use client'

import { BarChart3, TrendingUp } from 'lucide-react'
import BarChart from './charts/BarChart'
import PieChart from './charts/PieChart'

interface PlatformData {
  platform: string
  views: number
  calls: number
  emails: number
}

interface PlatformBreakdownProps {
  data: PlatformData[]
  title?: string
  showChart?: boolean
  chartType?: 'bar' | 'pie'
}

export default function PlatformBreakdown({ 
  data, 
  title = "Platform Breakdown", 
  showChart = true,
  chartType = 'bar'
}: PlatformBreakdownProps) {
  const totalViews = data.reduce((sum, p) => sum + (p?.views || 0), 0)
  const totalCalls = data.reduce((sum, p) => sum + (p?.calls || 0), 0)
  const totalEmails = data.reduce((sum, p) => sum + (p?.emails || 0), 0)
  const totalConversions = totalCalls + totalEmails

  const overallConversionRate = totalViews > 0 ? (totalConversions / totalViews) * 100 : 0

  // Prepare chart data
  const barChartData = data.map(platform => ({
    label: platform.platform,
    value: (platform?.views || 0) + (platform?.calls || 0) + (platform?.emails || 0),
    color: getPlatformColor(platform.platform)
  }))

  const pieChartData = data.map(platform => ({
    label: platform.platform,
    value: (platform?.views || 0) + (platform?.calls || 0) + (platform?.emails || 0),
    color: getPlatformColor(platform.platform)
  }))

  function getPlatformColor(platform: string): string {
    switch (platform.toLowerCase()) {
      case 'whatsapp': return '#25D366'
      case 'linkedin': return '#0077B5'
      case 'facebook': return '#1877F2'
      case 'twitter': return '#1DA1F2'
      case 'telegram': return '#0088CC'
      case 'instagram': return '#E4405F'
      case 'email': return '#EA4335'
      case 'mobile': return '#FF6B35'
      case 'web': return '#6366F1'
      default: return '#6B7280'
    }
  }

  function getPlatformIcon(platform: string): string {
    switch (platform.toLowerCase()) {
      case 'whatsapp': return '💬'
      case 'linkedin': return '💼'
      case 'facebook': return '📘'
      case 'twitter': return '🐦'
      case 'telegram': return '📱'
      case 'instagram': return '📷'
      case 'email': return '📧'
      case 'mobile': return '📱'
      case 'web': return '🌐'
      default: return '📊'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{totalViews}</div>
          <div className="text-sm text-gray-600">Total Views</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{totalConversions}</div>
          <div className="text-sm text-gray-600">Total Conversions</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{overallConversionRate.toFixed(1)}%</div>
          <div className="text-sm text-gray-600">Conversion Rate</div>
        </div>
      </div>

      {/* Chart */}
      {showChart && (
        <div className="mb-6">
          {chartType === 'pie' ? (
            <PieChart
              title="Traffic by Platform"
              data={pieChartData}
              size={200}
            />
          ) : (
            <BarChart
              title="Platform Performance"
              data={barChartData}
              height={200}
            />
          )}
        </div>
      )}

      {/* Platform Details */}
      <div className="space-y-4">
        {data.map((platform) => {
          const platformTotal = (platform?.views || 0) + (platform?.calls || 0) + (platform?.emails || 0)
          const platformConversionRate = (platform?.views || 0) > 0 ? (((platform?.calls || 0) + (platform?.emails || 0)) / (platform?.views || 1)) * 100 : 0
          
          return (
            <div key={platform.platform} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getPlatformIcon(platform.platform)}</span>
                  <div>
                    <h4 className="font-medium text-gray-900">{platform.platform}</h4>
                    <p className="text-sm text-gray-600">{platformTotal} total interactions</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-purple-600">{platformConversionRate.toFixed(1)}%</div>
                  <div className="text-sm text-gray-600">conversion rate</div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-blue-600">{platform?.views || 0}</div>
                  <div className="text-xs text-gray-600">Views</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-yellow-600">{platform?.calls || 0}</div>
                  <div className="text-xs text-gray-600">Calls</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-red-600">{platform?.emails || 0}</div>
                  <div className="text-xs text-gray-600">Emails</div>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Views</span>
                  <span>{(platform?.views || 0) > 0 ? (((platform?.views || 0) / platformTotal) * 100).toFixed(1) : 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${(platform?.views || 0) > 0 ? ((platform?.views || 0) / platformTotal) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Performance Insights */}
      {data.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span className="font-medium text-blue-900">Performance Insights</span>
          </div>
          <div className="text-sm text-blue-800">
            {(() => {
              const bestPlatform = data.reduce((best, current) => {
                const currentRate = (current?.views || 0) > 0 ? (((current?.calls || 0) + (current?.emails || 0)) / (current?.views || 1)) * 100 : 0
                const bestRate = (best?.views || 0) > 0 ? (((best?.calls || 0) + (best?.emails || 0)) / (best?.views || 1)) * 100 : 0
                return currentRate > bestRate ? current : best
              })
              
              const bestRate = (bestPlatform?.views || 0) > 0 ? (((bestPlatform?.calls || 0) + (bestPlatform?.emails || 0)) / (bestPlatform?.views || 1)) * 100 : 0
              
              return (
                <p>
                  <strong>{bestPlatform.platform}</strong> is your top-performing platform with a{' '}
                  <strong>{bestRate.toFixed(1)}%</strong> conversion rate. 
                  {bestRate > 10 ? ' Excellent performance!' : bestRate > 5 ? ' Good performance!' : ' Consider optimizing your approach.'}
                </p>
              )
            })()}
          </div>
        </div>
      )}
    </div>
  )
}
