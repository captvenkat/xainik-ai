'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { createSupabaseBrowser } from '@/lib/supabaseBrowser'
import KpiRow from '@/components/impact/KpiRow'
import FunnelCard from '@/components/impact/FunnelCard'
import ChannelPerformance from '@/components/impact/ChannelPerformance'
import SupporterLeaderboard from '@/components/impact/SupporterLeaderboard'
import KeywordChips from '@/components/impact/KeywordChips'
import ActivityFeed from '@/components/impact/ActivityFeed'
import NudgePanel from '@/components/impact/NudgePanel'
import { getImpactKpis } from '@/lib/actions/impact/kpis'
import { getFunnel } from '@/lib/actions/impact/funnel'
import { getChannelPerformance } from '@/lib/actions/impact/channels'
import { getSupporterImpact } from '@/lib/actions/impact/supporters'
import { getKeywordSuggestions } from '@/lib/actions/impact/keywords'
import { getNudges } from '@/lib/actions/impact/nudges'

export default function ImpactPage() {
  const { user } = useAuth()
  const [pitchId, setPitchId] = useState<string | null>(null)
  const [pitchTitle, setPitchTitle] = useState<string>('')
  const [veteranName, setVeteranName] = useState<string>('')
  const [loading, setLoading] = useState(true)
  
  // Data states
  const [kpis, setKpis] = useState<any>(null)
  const [funnel, setFunnel] = useState<any>(null)
  const [channels, setChannels] = useState<any>(null)
  const [supporters, setSupporters] = useState<any>(null)
  const [keywords, setKeywords] = useState<any>(null)
  const [nudges, setNudges] = useState<any>(null)

  useEffect(() => {
    const loadUserPitch = async () => {
      if (!user) return

      try {
        const supabase = createSupabaseBrowser()
        const { data: pitch } = await supabase
          .from('pitches')
          .select('id, title, user_id')
          .eq('user_id', user.id)
          .single()

        if (pitch) {
          setPitchId(pitch.id)
          setPitchTitle(pitch.title)
          
          // Get user name
          const { data: profile } = await supabase
            .from('users')
            .select('name')
            .eq('id', user.id)
            .single()
          
          setVeteranName(profile?.name || 'Veteran')
        }
      } catch (error) {
        console.error('Error loading user pitch:', error)
      }
    }

    loadUserPitch()
  }, [user])

  useEffect(() => {
    const loadImpactData = async () => {
      if (!pitchId) return

      setLoading(true)
      try {
        // Load all data in parallel
        const [kpisData, funnelData, channelsData, supportersData, keywordsData, nudgesData] = await Promise.all([
          getImpactKpis(pitchId),
          getFunnel(pitchId),
          getChannelPerformance(pitchId),
          getSupporterImpact(pitchId),
          getKeywordSuggestions(pitchId),
          getNudges(pitchId)
        ])

        setKpis(kpisData)
        setFunnel(funnelData)
        setChannels(channelsData)
        setSupporters(supportersData)
        setKeywords(keywordsData)
        setNudges(nudgesData)
      } catch (error) {
        console.error('Error loading impact data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadImpactData()
  }, [pitchId])

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please sign in to view your impact analytics.</p>
        </div>
      </div>
    )
  }

  if (!pitchId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No pitch found. Please create a pitch first.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Impact Analytics</h1>
          <p className="text-gray-600 mt-2">
            Track your pitch performance and supporter engagement
          </p>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left column - Main content */}
          <div className="lg:col-span-3 space-y-8">
            {/* KPIs */}
            <KpiRow data={kpis} />

            {/* Funnel */}
            <FunnelCard data={funnel} />

            {/* Channel Performance */}
            <ChannelPerformance data={channels} />

            {/* Supporter Leaderboard */}
            <SupporterLeaderboard data={supporters} />

            {/* Keywords */}
            <KeywordChips data={keywords} pitchId={pitchId} />

            {/* Activity Feed */}
            <ActivityFeed pitchId={pitchId} />
          </div>

          {/* Right column - Sticky Nudge Panel */}
          <div className="lg:col-span-1">
            <NudgePanel 
              data={nudges} 
              pitchId={pitchId}
              pitchTitle={pitchTitle}
              veteranName={veteranName}
              userId={user.id}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
