'use client'

import { useState, useEffect } from 'react'
import { getSupporterPerformanceList } from '@/lib/analytics'
import { getPitchSupporters } from '@/lib/actions/pitch-connections'
import { Users, Eye, Phone, Mail, Share2, TrendingUp, Crown, Award, Calendar } from 'lucide-react'

interface SupporterPerformanceListProps {
  veteranId: string
}

export default function SupporterPerformanceList({ veteranId }: SupporterPerformanceListProps) {
  const [supporterData, setSupporterData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [pitchId, setPitchId] = useState<string>('')

  useEffect(() => {
    loadSupporterData()
  }, [veteranId])

  async function loadSupporterData() {
    try {
      setLoading(true)
      
      // First get the veteran's pitch ID
      const { createSupabaseBrowser } = await import('@/lib/supabaseBrowser')
      const supabase = createSupabaseBrowser()
      
      const { data: pitches } = await supabase
        .from('pitches')
        .select('id')
        .eq('user_id', veteranId)
        .limit(1)
      
      if (pitches && pitches.length > 0) {
        const currentPitchId = pitches[0]?.id
        if (!currentPitchId) {
          console.error('No pitch found for veteran')
          return
        }
        setPitchId(currentPitchId)
        
        // Get real supporter data using our new connection system
        const result = await getPitchSupporters(currentPitchId)
        if (result.success) {
          setSupporterData(result.data || [])
        } else {
          console.error('Failed to load pitch supporters:', result.error)
        }
      }
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

  // Transform our new connection data to the existing format
  const transformedData = supporterData.map(supporter => ({
    supporterId: supporter.supporter_id,
    supporterName: supporter.users.name,
    supporterEmail: supporter.users.email,
    pitchTitle: 'Your Pitch',
    sharedAt: supporter.created_at,
    lastActivity: supporter.metrics.last_activity || supporter.created_at,
    metrics: {
      totalViews: supporter.metrics.clicks,
      totalCalls: supporter.metrics.calls,
      totalEmails: supporter.metrics.emails,
      totalShares: supporter.metrics.shares,
      totalActions: supporter.metrics.total_activity,
      conversionRate: supporter.metrics.total_activity > 0 ? 
        ((supporter.metrics.calls + supporter.metrics.emails) / supporter.metrics.total_activity * 100) : 0
    },
    platforms: {
      'LinkedIn': Math.floor(supporter.metrics.shares * 0.4),
      'Email': Math.floor(supporter.metrics.shares * 0.4),
      'WhatsApp': Math.floor(supporter.metrics.shares * 0.2)
    },
    isTopSupporter: supporter.metrics.total_activity > 5
  }))

  // Fallback mock data for demo when no real supporters exist
  const mockSupporterData = [
    {
      supporterId: 'mock-1',
      supporterName: 'Priya Sharma',
      supporterEmail: 'priya.sharma@techcorp.com',
      pitchTitle: 'Senior Software Engineer',
      sharedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      lastActivity: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      metrics: {
        totalViews: 45,
        totalCalls: 3,
        totalEmails: 2,
        totalShares: 8,
        totalActions: 5,
        conversionRate: 11.1
      },
      platforms: {
        'LinkedIn': 25,
        'Email': 15,
        'WhatsApp': 5
      }
    },
    {
      supporterId: 'mock-2',
      supporterName: 'Amit Patel',
      supporterEmail: 'amit.patel@startup.io',
      pitchTitle: 'Senior Software Engineer',
      sharedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      lastActivity: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      metrics: {
        totalViews: 32,
        totalCalls: 1,
        totalEmails: 4,
        totalShares: 6,
        totalActions: 5,
        conversionRate: 15.6
      },
      platforms: {
        'LinkedIn': 20,
        'Slack': 8,
        'Email': 4
      }
    },
    {
      supporterId: 'mock-3',
      supporterName: 'Neha Singh',
      supporterEmail: 'neha.singh@enterprise.com',
      pitchTitle: 'Senior Software Engineer',
      sharedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      lastActivity: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      metrics: {
        totalViews: 28,
        totalCalls: 2,
        totalEmails: 1,
        totalShares: 4,
        totalActions: 3,
        conversionRate: 10.7
      },
      platforms: {
        'LinkedIn': 18,
        'Teams': 6,
        'Email': 4
      }
    }
  ]

  const displayData = transformedData.length > 0 ? transformedData : mockSupporterData
  const isMockData = supporterData.length === 0

  return (
    <div className="bg-white rounded-xl shadow-sm border">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Supporter Performance</h3>
            <p className="text-sm text-gray-600 mt-1">
              {displayData.length} supporter{displayData.length !== 1 ? 's' : ''} sharing your pitch
            </p>
          </div>
          {isMockData && (
            <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
              Demo Data
            </div>
          )}
        </div>
      </div>
      
      <div className="divide-y divide-gray-200">
        {displayData.map((supporter, index) => (
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
