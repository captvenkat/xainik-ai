'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowser } from '@/lib/supabaseBrowser'
import { 
  getDualFunnelData, 
  getDualFunnelKPIs, 
  isDualFunnelFeatureEnabled 
} from '@/lib/analytics-dual-funnel'
import HeaderBar from './HeaderBar'
import OnboardingBanner from './OnboardingBanner'
import KPICards from './KPICards'
import InboundTrend from './charts/InboundTrend'
import ConversionFunnel from './charts/ConversionFunnel'
import ChannelBars from './charts/ChannelBars'
import ReferralsTable from './ReferralsTable'
import RightRail from './RightRail'
import { Loader2, AlertCircle } from 'lucide-react'

interface DualFunnelDashboardProps {
  userId: string
  onSharePitch: () => void
  onEditPitch: () => void
}

export default function DualFunnelDashboard({ 
  userId, 
  onSharePitch, 
  onEditPitch 
}: DualFunnelDashboardProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<any>(null)
  const [kpis, setKpis] = useState<any>(null)
  const [pitches, setPitches] = useState<any[]>([])
  const [selectedPitchId, setSelectedPitchId] = useState<string>('')
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d')
  const [userProgress, setUserProgress] = useState<'step1' | 'step2' | 'step3' | 'complete'>('step1')

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true)
        setError(null)

        const supabase = createSupabaseBrowser()

        // Load user's pitches
        const { data: pitchesData, error: pitchesError } = await supabase
          .from('pitches')
          .select('*')
          .eq('user_id', userId)
          .eq('is_active', true)
          .order('created_at', { ascending: false })

        if (pitchesError) throw pitchesError

        setPitches(pitchesData || [])

        // Determine user progress
        if (pitchesData && pitchesData.length > 0) {
          setSelectedPitchId(pitchesData[0].id)
          setUserProgress('complete')
          
          // Load dashboard data
          const [dashboardData, kpisData] = await Promise.all([
            getDualFunnelData(userId, dateRange),
            getDualFunnelKPIs(userId)
          ])

          setData(dashboardData)
          setKpis(kpisData)
        } else {
          setUserProgress('step2')
        }

      } catch (err) {
        console.error('Failed to load dashboard data:', err)
        setError('Failed to load dashboard data. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      loadDashboardData()
    }
  }, [userId, dateRange])

  // Check if feature is enabled
  if (!isDualFunnelFeatureEnabled()) {
    return null // Fall back to legacy dashboard
  }

  const handlePitchChange = (pitchId: string) => {
    setSelectedPitchId(pitchId)
  }

  const handleDateRangeChange = (range: '7d' | '30d' | '90d') => {
    setDateRange(range)
  }

  const handleStepClick = (step: 'step1' | 'step2' | 'step3') => {
    switch (step) {
      case 'step1':
        router.push('/settings/profile')
        break
      case 'step2':
        router.push('/pitch/new/ai-first')
        break
      case 'step3':
        // Already on analytics tab
        break
    }
  }

  const handleRightRailAction = (action: string, data?: any) => {
    switch (action) {
      case 'share':
        onSharePitch()
        break
      case 'update_contact':
        router.push('/settings/profile')
        break
      case 'follow_up':
        // Could open a follow-up modal or redirect to contacts
        console.log('Follow up action:', data)
        break
      case 'thank_supporter':
        // Could open a thank you modal
        console.log('Thank supporter:', data)
        break
      case 'share_again':
        onSharePitch()
        break
      case 'message_supporter':
        // Could open a messaging interface
        console.log('Message supporter:', data)
        break
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your dual funnel dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Dashboard</h3>
        <p className="text-red-700 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  // Show onboarding steps if not complete
  if (userProgress !== 'complete') {
    return (
      <div className="space-y-6">
        <OnboardingBanner 
          currentStep={userProgress} 
          onStepClick={handleStepClick}
        />
        
        {userProgress === 'step1' && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-6">👤</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Complete Your Profile</h2>
              <p className="text-gray-600 mb-8">
                Add your military experience and skills to get started
              </p>
              <button
                onClick={() => router.push('/settings/profile')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Complete Profile
              </button>
            </div>
          </div>
        )}

        {userProgress === 'step2' && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-6">🚀</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Create Your First Pitch</h2>
              <p className="text-gray-600 mb-8">
                Showcase your military experience to recruiters and supporters
              </p>
              <button
                onClick={() => router.push('/pitch/new/ai-first')}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-colors font-semibold"
              >
                Create Pitch
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Full dual funnel dashboard
  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <HeaderBar
        pitches={pitches}
        selectedPitchId={selectedPitchId}
        onPitchChange={handlePitchChange}
        dateRange={dateRange}
        onDateRangeChange={handleDateRangeChange}
        onSharePitch={onSharePitch}
        onEditPitch={onEditPitch}
      />

      {/* Onboarding Banner */}
      <OnboardingBanner 
        currentStep={userProgress} 
        onStepClick={handleStepClick}
      />

      {/* KPI Cards */}
      {kpis && <KPICards data={kpis} />}

      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column - Charts and Table */}
        <div className="lg:col-span-3 space-y-6">
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Inbound Trend Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <InboundTrend data={data?.inbound || []} />
            </div>

            {/* Conversion Funnel Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <ConversionFunnel data={data?.conversion || {}} />
            </div>
          </div>

          {/* Channel Performance */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <ChannelBars data={data?.channels || []} />
          </div>

          {/* Referrals Table */}
          <ReferralsTable 
            data={data?.table || []} 
            onFilterChange={(filters) => console.log('Filters changed:', filters)}
          />
        </div>

        {/* Right Column - Supporters and Nudges */}
        <div className="lg:col-span-1">
          <RightRail
            supporters={data?.supporters || []}
            onAction={handleRightRailAction}
          />
        </div>
      </div>
    </div>
  )
}
