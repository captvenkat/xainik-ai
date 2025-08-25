'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorState from '@/components/ErrorState'
import HeaderBar from './HeaderBar'
import KpiRow from './KpiRow'
import Funnel from './Funnel'
import SupporterSpotlight from './SupporterSpotlight'
import ChannelInsights from './ChannelInsights'
import ContactOutcomes from './ContactOutcomes'
import NudgeRail from './NudgeRail'
import { getProgressKpis, getFunnel, getTopSupporters, getChannelInsights, getContacts } from '@/lib/actions/progress'
import type { Range } from '@/lib/actions/progress'

interface UnifiedProgressDashboardProps {
  userId: string
}

export default function UnifiedProgressDashboard({ userId }: UnifiedProgressDashboardProps) {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<Range>('30d')
  const [selectedPitchId, setSelectedPitchId] = useState<string | null>(null)
  
  // Data states
  const [kpiData, setKpiData] = useState<any>(null)
  const [funnelData, setFunnelData] = useState<any>(null)
  const [supportersData, setSupportersData] = useState<any>(null)
  const [channelsData, setChannelsData] = useState<any>(null)
  const [contactsData, setContactsData] = useState<any>(null)

  useEffect(() => {
    if (userId && !authLoading) {
      loadDashboardData()
    }
  }, [userId, authLoading, dateRange, selectedPitchId])

  async function loadDashboardData() {
    try {
      setLoading(true)
      
      // Load all data in parallel
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
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return <ErrorState error={error} />
  }

  if (!user) {
    return <ErrorState error="Authentication required" />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Bar */}
        <HeaderBar 
          userId={userId}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          selectedPitchId={selectedPitchId}
          onPitchChange={setSelectedPitchId}
        />

        {/* Main Dashboard Content */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* KPI Row */}
            <KpiRow data={kpiData} />

            {/* Progress Funnel */}
            <Funnel data={funnelData} />

            {/* Supporter Spotlight */}
            <SupporterSpotlight data={supportersData} />

            {/* Channel Insights */}
            <ChannelInsights data={channelsData} />

            {/* Contact Outcomes */}
            <ContactOutcomes data={contactsData} />
          </div>

          {/* Right Column - Nudge Rail */}
          <div className="lg:col-span-1">
            <NudgeRail 
              kpiData={kpiData}
              funnelData={funnelData}
              supportersData={supportersData}
              channelsData={channelsData}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
