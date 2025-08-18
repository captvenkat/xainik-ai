'use client'

import { useState, useEffect } from 'react'
import { getSupporterPerformanceList } from '@/lib/analytics'
import { Users, Eye, Phone, Mail, Share2, TrendingUp } from 'lucide-react'

interface SupporterPerformanceListProps {
  veteranId: string
}

export default function SupporterPerformanceList({ veteranId }: SupporterPerformanceListProps) {
  const [supporterData, setSupporterData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSupporterData()
  }, [veteranId])

  async function loadSupporterData() {
    try {
      setLoading(true)
      const data = await getSupporterPerformanceList(veteranId)
      setSupporterData(data)
    } catch (error) {
      console.error('Failed to load supporter data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading supporter data...</p>
      </div>
    )
  }

  if (supporterData.length === 0) {
    return (
      <div className="text-center py-8">
        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No supporters have shared your pitch yet.</p>
        <p className="text-sm text-gray-500 mt-2">Share your pitch to get started!</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border">
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold text-gray-900">Supporter Performance</h3>
        <p className="text-sm text-gray-600 mt-1">
          {supporterData.length} supporter{supporterData.length !== 1 ? 's' : ''} sharing your pitch
        </p>
      </div>
      
      <div className="divide-y divide-gray-200">
        {supporterData.map((supporter, index) => (
          <div key={supporter.supporterId} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-medium text-gray-900">{supporter.supporterName}</h4>
                <p className="text-sm text-gray-600">{supporter.supporterEmail}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Shared {supporter.pitchTitle} on {new Date(supporter.sharedAt).toLocaleDateString()}
                </p>
              </div>
              
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  {supporter.metrics.totalViews}
                </div>
                <div className="text-sm text-gray-600">views generated</div>
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Phone className="w-4 h-4 text-green-600" />
                  <div className="text-lg font-semibold text-gray-900">
                    {supporter.metrics.totalCalls}
                  </div>
                </div>
                <div className="text-xs text-gray-600">calls</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <div className="text-lg font-semibold text-gray-900">
                    {supporter.metrics.totalEmails}
                  </div>
                </div>
                <div className="text-xs text-gray-600">emails</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Share2 className="w-4 h-4 text-purple-600" />
                  <div className="text-lg font-semibold text-gray-900">
                    {supporter.metrics.totalShares}
                  </div>
                </div>
                <div className="text-xs text-gray-600">shares</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <TrendingUp className="w-4 h-4 text-orange-600" />
                  <div className="text-lg font-semibold text-gray-900">
                    {supporter.metrics.conversionRate.toFixed(1)}%
                  </div>
                </div>
                <div className="text-xs text-gray-600">conversion</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-gray-500">Platforms:</span>
              {Object.entries(supporter.platforms).map(([platform, count]) => (
                <span key={platform} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {platform} ({count as number})
                </span>
              ))}
            </div>
            
            <div className="text-xs text-gray-500">
              Last activity: {new Date(supporter.lastActivity).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
