'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { 
  type Range, 
  type KPI, 
  type FunnelPoint, 
  type SupporterRow, 
  type ChannelRow, 
  type ContactRow,
  getProgressKpis,
  getFunnel,
  getTopSupporters,
  getChannelInsights,
  getContacts
} from '@/lib/actions/progress'
import { micro } from '@/lib/microcopy/progress'
import { User, FileText, BarChart3, Shield, Target } from 'lucide-react'
import HeaderBar from '@/components/progress/HeaderBar'
import KpiRow from '@/components/progress/KpiRow'
import Funnel from '@/components/progress/Funnel'
import SupporterSpotlight from '@/components/progress/SupporterSpotlight'
import ChannelInsights from '@/components/progress/ChannelInsights'
import ContactOutcomes from '@/components/progress/ContactOutcomes'
import NudgeRail from '@/components/progress/NudgeRail'
import VeteranProfileTab from '@/components/VeteranProfileTab'
import LoadingSpinner from '@/components/LoadingSpinner'

interface UnifiedProgressDashboardProps {
  userId: string
}

export default function UnifiedProgressDashboard({ userId }: UnifiedProgressDashboardProps) {
  const { user, isLoading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'profile' | 'pitch' | 'progress'>('progress')
  const [dateRange, setDateRange] = useState<Range>('7d')
  const [selectedPitchId, setSelectedPitchId] = useState<string | null>('')
  
  // Real data states
  const [kpiData, setKpiData] = useState<{ shares: KPI; views: KPI; contacts: KPI } | null>(null)
  const [funnelData, setFunnelData] = useState<FunnelPoint[] | null>(null)
  const [supportersData, setSupportersData] = useState<SupporterRow[] | null>(null)
  const [channelsData, setChannelsData] = useState<ChannelRow[] | null>(null)
  const [contactsData, setContactsData] = useState<ContactRow[] | null>(null)

  useEffect(() => {
    async function loadDashboardData() {
      if (authLoading || !userId) return
      
      try {
        setLoading(true)
        setError(null)
        
        // Real API calls
        const [kpis, funnel, supporters, channels, contacts] = await Promise.all([
          getProgressKpis(userId, dateRange),
          getFunnel(userId, dateRange),
          getTopSupporters(userId, dateRange),
          getChannelInsights(userId, dateRange),
          getContacts(userId, dateRange)
        ])
        
        setKpiData(kpis)
        setFunnelData(funnel)
        setSupportersData(supporters)
        setChannelsData(channels)
        setContactsData(contacts)
        
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
    return <LoadingSpinner />
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

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User, description: 'Complete your veteran profile' },
    { id: 'pitch', label: 'Pitch', icon: FileText, description: 'Create and manage your pitches' },
    { id: 'progress', label: 'Progress', icon: BarChart3, description: 'Track your success metrics' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Header with Veteran Badge */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white text-2xl shadow-lg">
              🦅
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 drop-shadow-sm">
                Welcome, {user?.email?.split('@')[0] || 'Veteran'}!
              </h1>
              <p className="text-xl text-gray-700 mt-2 drop-shadow-sm">
                Your mission: Transform your military experience into civilian success
              </p>
              <div className="flex items-center gap-2 mt-3">
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-red-100 text-red-800 shadow-sm">
                  <Shield className="w-4 h-4 mr-2" />
                  Active Veteran
                </span>
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800 shadow-sm">
                  <Target className="w-4 h-4 mr-2" />
                  Mission Ready
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Progressive Flow Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8 border-b border-gray-200 bg-white rounded-t-lg px-6 shadow-lg">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                    isActive
                      ? 'border-blue-500 text-blue-600 bg-blue-50 rounded-t-lg'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50 rounded-t-lg'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-b-lg shadow-lg">
          {activeTab === 'profile' && (
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Profile</h2>
                <p className="text-gray-600">Build a compelling veteran profile to attract recruiters and supporters</p>
              </div>
              <VeteranProfileTab />
            </div>
          )}

          {activeTab === 'pitch' && (
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Your Pitch</h2>
                <p className="text-gray-600">Craft powerful pitches that showcase your military experience and value</p>
              </div>
              {/* Pitch management content would go here */}
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Pitch Management</h3>
                <p className="text-gray-600 mb-4">Create and manage your professional pitches</p>
                <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                  Create New Pitch
                </button>
              </div>
            </div>
          )}

          {activeTab === 'progress' && (
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Track Your Progress</h2>
                <p className="text-gray-600">Monitor your pitch performance and supporter impact</p>
              </div>
              
              {/* Header Bar with Smart Share Hub */}
              <HeaderBar
                userId={userId}
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
                selectedPitchId={selectedPitchId}
                onPitchChange={setSelectedPitchId}
              />

              {/* KPI Row */}
              <KpiRow data={kpiData} />

              {/* Progress Funnel */}
              {funnelData && (
                <Funnel data={funnelData} />
              )}

              {/* Supporter Spotlight */}
              <SupporterSpotlight data={supportersData} />

              {/* Channel Insights */}
              <ChannelInsights data={channelsData} />

              {/* Contact Outcomes */}
              <ContactOutcomes data={contactsData} />

              {/* Nudge Rail */}
              <NudgeRail 
                kpiData={kpiData}
                funnelData={funnelData}
                supportersData={supportersData}
                channelsData={channelsData}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
