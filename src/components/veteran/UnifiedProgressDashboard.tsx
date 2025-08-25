'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { 
  type Range, 
  type KPI, 
  type FunnelData, 
  type SupporterRow, 
  type ChannelRow, 
  type ContactRow
} from '@/lib/unifiedProgressDemo'
import { micro } from '@/lib/microcopy/progress'

interface UnifiedProgressDashboardProps {
  userId: string
}

export default function UnifiedProgressDashboard({ userId }: UnifiedProgressDashboardProps) {
  const { user, isLoading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<Range>('7d')
  const [selectedPitchId, setSelectedPitchId] = useState<string>('')
  
  // Mock data states
  const [kpiData, setKpiData] = useState<{ shares: KPI; views: KPI; contacts: KPI } | null>(null)
  const [funnelData, setFunnelData] = useState<FunnelData | null>(null)
  const [supportersData, setSupportersData] = useState<SupporterRow[] | null>(null)
  const [channelsData, setChannelsData] = useState<ChannelRow[] | null>(null)
  const [contactsData, setContactsData] = useState<ContactRow[] | null>(null)

  useEffect(() => {
    async function loadDashboardData() {
      if (authLoading || !userId) return
      
      try {
        setLoading(true)
        setError(null)
        
        // Mock data loading - in real implementation, these would be API calls
        const mockKpis = {
          shares: { value: 45, deltaPct: 15.2, spark: [] },
          views: { value: 128, deltaPct: 8.7, spark: [] },
          contacts: { value: 12, deltaPct: -3.1, spark: [] }
        }
        
        const mockFunnel = [
          { stage: 'shares', value: 45, supporterPct: 65 },
          { stage: 'views', value: 128, supporterPct: 45 },
          { stage: 'contacts', value: 12, supporterPct: 25 }
        ]
        
        const mockSupporters = [
          { name: 'Colonel Rajesh Kumar', shares: 12, views: 45, contacts: 3, lastAt: '2024-01-15T10:30:00Z' },
          { name: 'Major Priya Singh', shares: 8, views: 32, contacts: 2, lastAt: '2024-01-14T15:20:00Z' },
          { name: 'Captain Amit Patel', shares: 6, views: 28, contacts: 1, lastAt: '2024-01-13T09:15:00Z' }
        ]
        
        const mockChannels = [
          { channel: 'linkedin', shares: 20, views: 65, contacts: 8, efficiency: 3.25 },
          { channel: 'whatsapp', shares: 15, views: 45, contacts: 3, efficiency: 3.0 },
          { channel: 'email', shares: 10, views: 18, contacts: 1, efficiency: 1.8 }
        ]
        
        const mockContacts = [
          { id: '1', type: 'call', channel: 'linkedin', supporterName: 'Colonel Rajesh Kumar', status: 'open', ts: '2024-01-15T10:30:00Z' },
          { id: '2', type: 'email', channel: 'whatsapp', supporterName: 'Major Priya Singh', status: 'responded', ts: '2024-01-14T15:20:00Z' },
          { id: '3', type: 'resume', channel: 'email', supporterName: null, status: 'closed', ts: '2024-01-13T09:15:00Z' }
        ]
        
        setKpiData(mockKpis)
        setFunnelData(mockFunnel as any)
        setSupportersData(mockSupporters)
        setChannelsData(mockChannels as any)
        setContactsData(mockContacts as any)
        
      } catch (err) {
        setError('Failed to load dashboard data')
        console.error('Dashboard data error:', err)
      } finally {
        setLoading(false)
      }
    }
    
    loadDashboardData()
  }, [userId, authLoading, dateRange, selectedPitchId])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Progress Dashboard</h1>
              <p className="text-gray-600">Track your pitch performance and supporter impact</p>
            </div>
            <div className="flex gap-3">
              <select 
                value={dateRange} 
                onChange={(e) => setDateRange(e.target.value as Range)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="7d">Last 7 days</option>
                <option value="14d">Last 14 days</option>
                <option value="30d">Last 30 days</option>
                <option value="60d">Last 60 days</option>
                <option value="90d">Last 90 days</option>
              </select>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
                Share Pitch
              </button>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        {kpiData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-green-600">Shares</h3>
                <span className={`text-sm font-medium ${kpiData.shares.deltaPct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {kpiData.shares.deltaPct >= 0 ? '+' : ''}{kpiData.shares.deltaPct}%
                </span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{kpiData.shares.value}</p>
              <p className="text-sm text-gray-600 mt-1">{micro.kpis.shares}</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-blue-600">Views</h3>
                <span className={`text-sm font-medium ${kpiData.views.deltaPct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {kpiData.views.deltaPct >= 0 ? '+' : ''}{kpiData.views.deltaPct}%
                </span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{kpiData.views.value}</p>
              <p className="text-sm text-gray-600 mt-1">{micro.kpis.views}</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-purple-600">Contacts</h3>
                <span className={`text-sm font-medium ${kpiData.contacts.deltaPct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {kpiData.contacts.deltaPct >= 0 ? '+' : ''}{kpiData.contacts.deltaPct}%
                </span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{kpiData.contacts.value}</p>
              <p className="text-sm text-gray-600 mt-1">{micro.kpis.contacts}</p>
            </div>
          </div>
        )}

        {/* Funnel */}
        {funnelData && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Progress Funnel</h3>
            <p className="text-sm text-gray-600 mb-6">{micro.funnel.sharesTip}</p>
            
            <div className="space-y-4">
              {funnelData.map((stage, index) => (
                <div key={stage.stage} className="flex items-center gap-4">
                  <div className="w-24 text-sm font-medium text-gray-700 capitalize">
                    {stage.stage}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-lg font-semibold text-gray-900">{stage.value}</span>
                      {index > 0 && (
                        <span className="text-sm text-gray-500">
                          {((stage.value / (funnelData[index - 1]?.value || 1)) * 100).toFixed(1)}% conversion
                        </span>
                      )}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(stage.value / (funnelData[0]?.value || 1)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    {stage.supporterPct}% from supporters
                  </div>
                </div>
              ))}
            </div>
            
            <p className="text-xs text-gray-500 mt-4">{micro.funnel.sourceCaption}</p>
          </div>
        )}

        {/* Supporters */}
        {supportersData && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Top Supporters</h3>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">See all</button>
            </div>
            
            {supportersData.length > 0 ? (
              <div className="space-y-4">
                {supportersData.map((supporter, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">
                          {supporter.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{supporter.name}</p>
                        <p className="text-sm text-gray-600">
                          {micro.supporters.rowSuffix(supporter.shares, supporter.views, supporter.contacts)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                        {micro.supporters.thank}
                      </button>
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        {micro.supporters.askAgain}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">{micro.supporters.empty}</p>
              </div>
            )}
          </div>
        )}

        {/* Channels */}
        {channelsData && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Channel Performance</h3>
            <p className="text-sm text-gray-600 mb-6">{micro.channels.helper}</p>
            
            <div className="space-y-4">
              {channelsData.map((channel) => (
                <div key={channel.channel} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                      <span className="text-gray-600 font-semibold capitalize">{channel.channel[0]}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 capitalize">{channel.channel}</p>
                      <p className="text-sm text-gray-600">
                        {channel.shares} shares → {channel.views} views → {channel.contacts} contacts
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{channel.efficiency.toFixed(1)}</p>
                    <p className="text-sm text-gray-600">{micro.channels.efficiency}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contacts */}
        {contactsData && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Contacts</h3>
            
            {contactsData.length > 0 ? (
              <div className="space-y-4">
                {contactsData.map((contact) => (
                  <div key={contact.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        contact.status === 'open' ? 'bg-yellow-400' : 
                        contact.status === 'responded' ? 'bg-green-400' : 'bg-gray-400'
                      }`}></div>
                      <div>
                        <p className="font-medium text-gray-900 capitalize">{contact.type}</p>
                        <p className="text-sm text-gray-600">
                          via {contact.channel}
                          {contact.supporterName && ` • ${contact.supporterName}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 capitalize">{contact.status}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(contact.ts).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">{micro.contacts.empty}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
