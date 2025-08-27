'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { createSupabaseBrowser } from '@/lib/supabaseBrowser'
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
import { User, FileText, BarChart3, Shield, Target, ArrowRight, CheckCircle, Plus } from 'lucide-react'
import HeaderBar from '@/components/progress/HeaderBar'
import KpiRow from '@/components/progress/KpiRow'
import Funnel from '@/components/progress/Funnel'
import SupporterSpotlight from '@/components/progress/SupporterSpotlight'
import ChannelInsights from '@/components/progress/ChannelInsights'
import ContactOutcomes from '@/components/progress/ContactOutcomes'
import NudgeRail from '@/components/progress/NudgeRail'
import VeteranProfileTab from '@/components/VeteranProfileTab'
import LoadingSpinner from '@/components/LoadingSpinner'
import { useRouter } from 'next/navigation'

interface UnifiedProgressDashboardProps {
  userId: string
}

export default function UnifiedProgressDashboard({ userId }: UnifiedProgressDashboardProps) {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'profile' | 'pitch' | 'progress'>('progress')
  const [dateRange, setDateRange] = useState<Range>('7d')
  const [selectedPitchId, setSelectedPitchId] = useState<string | null>('')
  
  // Onboarding state
  const [userProgress, setUserProgress] = useState<'step1' | 'step2' | 'step3' | 'complete'>('step1')
  const [hasProfile, setHasProfile] = useState(false)
  const [hasPitches, setHasPitches] = useState(false)
  const [isNewUser, setIsNewUser] = useState(false)
  
  // Real data states
  const [kpiData, setKpiData] = useState<{ shares: KPI; views: KPI; contacts: KPI } | null>(null)
  const [funnelData, setFunnelData] = useState<FunnelPoint[] | null>(null)
  const [supportersData, setSupportersData] = useState<SupporterRow[] | null>(null)
  const [channelsData, setChannelsData] = useState<ChannelRow[] | null>(null)
  const [contactsData, setContactsData] = useState<ContactRow[] | null>(null)

  useEffect(() => {
    async function checkUserProgress() {
      if (authLoading || !userId) return
      
      try {
        setLoading(true)
        setError(null)
        
        const supabase = createSupabaseBrowser()
        
        // Check if user has pitches
        const { data: pitches } = await supabase
          .from('pitches')
          .select('id')
          .eq('user_id', userId)
          .limit(1)

        const userHasPitches = Boolean(pitches && pitches.length > 0)
        setHasPitches(userHasPitches)
        
        // Store pitch ID for analytics
        if (pitches && pitches.length > 0 && pitches[0]?.id) {
          setSelectedPitchId(pitches[0].id)
        }

        // Check if user has completed profile
        const { data: userProfile } = await supabase
          .from('users')
          .select('name, phone, role, metadata')
          .eq('id', userId)
          .single()

        // Check if user has veteran profile data
        let userHasProfile = false
        
        // First try veterans table
        try {
          const { data: veteranData } = await supabase
            .from('veterans')
            .select('*')
            .eq('user_id', userId)
            .single()
          
          if (veteranData && (veteranData.rank || veteranData.service_branch || veteranData.bio)) {
            userHasProfile = true
          }
        } catch (veteranError) {
          console.log('Veterans table not accessible, checking user metadata')
        }
        
        // Fallback to user metadata
        if (!userHasProfile && userProfile?.metadata?.veteran_profile) {
          const fallbackData = userProfile.metadata.veteran_profile
          if (fallbackData.military_rank || fallbackData.service_branch || fallbackData.bio) {
            userHasProfile = true
          }
        }
        
        // Basic profile completion check
        if (!userHasProfile && userProfile?.name && userProfile?.phone) {
          userHasProfile = true
        }
        
        setHasProfile(userHasProfile)

        // Determine user progress and onboarding state
        if (!userHasProfile) {
          setUserProgress('step1')
          setIsNewUser(true)
          setActiveTab('profile')
        } else if (!userHasPitches) {
          setUserProgress('step2')
          setIsNewUser(true)
          setActiveTab('pitch')
        } else {
          setUserProgress('complete')
          setIsNewUser(false)
          setActiveTab('progress')
        }
        
        // Load analytics data only if user has completed onboarding
        if (userHasProfile && userHasPitches) {
          await loadDashboardData()
        }
        
      } catch (err) {
        console.error('Error checking user progress:', err)
        setError('Failed to load user progress')
      } finally {
        setLoading(false)
      }
    }

    async function loadDashboardData() {
      try {
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
        console.error('Error loading dashboard data:', err)
        setError('Failed to load dashboard data')
      }
    }

    checkUserProgress()
  }, [userId, authLoading, dateRange])

  if (authLoading) return <LoadingSpinner />
  if (error) return <div className="text-center py-12 text-red-600">{error}</div>
  if (!user) return <div className="text-center py-12 text-red-600">Authentication required</div>

  // Onboarding Flow for New Users
  if (isNewUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white text-2xl shadow-lg mx-auto mb-4">
              🦅
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to Xainik, {user.email?.split('@')[0] || 'Veteran'}!
            </h1>
            <p className="text-lg text-gray-600">
              Let's get you set up to showcase your military experience
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className={`flex items-center ${userProgress === 'step1' ? 'text-blue-600' : userProgress === 'step2' || userProgress === 'complete' ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${userProgress === 'step1' ? 'bg-blue-600 border-blue-600 text-white' : userProgress === 'step2' || userProgress === 'complete' ? 'bg-green-600 border-green-600 text-white' : 'bg-gray-200 border-gray-300'}`}>
                  {userProgress === 'step2' || userProgress === 'complete' ? <CheckCircle className="w-5 h-5" /> : '1'}
                </div>
                <span className="ml-2 font-medium">Profile</span>
              </div>
              <ArrowRight className="w-6 h-6 text-gray-400" />
              <div className={`flex items-center ${userProgress === 'step2' ? 'text-blue-600' : userProgress === 'complete' ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${userProgress === 'step2' ? 'bg-blue-600 border-blue-600 text-white' : userProgress === 'complete' ? 'bg-green-600 border-green-600 text-white' : 'bg-gray-200 border-gray-300'}`}>
                  {userProgress === 'complete' ? <CheckCircle className="w-5 h-5" /> : '2'}
                </div>
                <span className="ml-2 font-medium">Pitch</span>
              </div>
              <ArrowRight className="w-6 h-6 text-gray-400" />
              <div className={`flex items-center ${userProgress === 'complete' ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${userProgress === 'complete' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-gray-200 border-gray-300'}`}>
                  3
                </div>
                <span className="ml-2 font-medium">Analytics</span>
              </div>
            </div>
          </div>

          {/* Tab Navigation for Onboarding */}
          <div className="mb-6">
            <nav className="flex space-x-8 border-b border-gray-200 bg-white rounded-t-lg px-6 shadow-lg">
              {[
                { id: 'profile', label: 'Build Your Profile', icon: User, step: 'step1' },
                { id: 'pitch', label: 'Create Your Pitch', icon: FileText, step: 'step2' },
                { id: 'progress', label: 'View Analytics', icon: BarChart3, step: 'complete' }
              ].map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                const isCompleted = userProgress === 'step2' && tab.step === 'step1' || userProgress === 'complete'
                const isAccessible = tab.step === 'step1' || (tab.step === 'step2' && userProgress !== 'step1') || (tab.step === 'complete' && userProgress === 'complete')
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => isAccessible && setActiveTab(tab.id as any)}
                    disabled={!isAccessible}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                      isActive
                        ? 'border-blue-500 text-blue-600 bg-blue-50 rounded-t-lg'
                        : isAccessible
                        ? 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50 rounded-t-lg'
                        : 'border-transparent text-gray-300 cursor-not-allowed'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : isAccessible ? 'text-gray-400' : 'text-gray-300'}`} />
                    <span>{tab.label}</span>
                    {isCompleted && tab.step !== 'complete' && (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    )}
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Build Your Profile</h2>
                  <p className="text-gray-600">Add your military experience and skills to get started</p>
                </div>
                <VeteranProfileTab />
              </div>
            )}
            
            {activeTab === 'pitch' && (
              <div className="p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Your Pitch</h2>
                  <p className="text-gray-600">Showcase your military experience to recruiters and supporters</p>
                </div>
                <div className="text-center py-12">
                  <div className="text-6xl mb-6">🚀</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Ready to Create Your Pitch?</h3>
                  <p className="text-gray-600 mb-8">
                    Use our AI-powered pitch builder to showcase your military experience
                  </p>
                  <button
                    onClick={() => router.push('/pitch/new')}
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-8 py-3 rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-colors font-semibold flex items-center gap-2 mx-auto"
                  >
                    <Plus className="w-5 h-5" />
                    Create Your Pitch
                  </button>
                </div>
              </div>
            )}
            
            {activeTab === 'progress' && userProgress === 'complete' && (
              <div className="p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Analytics Dashboard</h2>
                  <p className="text-gray-600">Track your progress and performance</p>
                </div>
                <ProgressTabContent />
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Returning User Dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white text-2xl shadow-lg">
              🦅
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 drop-shadow-sm">
                Welcome back, {user.email?.split('@')[0] || 'Veteran'}!
              </h1>
              <p className="text-xl text-gray-700 mt-2 drop-shadow-sm">
                Your mission: Transform your military experience into civilian success
              </p>
              <div className="flex items-center gap-2 mt-3">
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-red-100 text-red-800 shadow-sm">
                  <Shield className="w-4 h-4 mr-2" />
                  Active Veteran
                </span>
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800 shadow-sm">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Profile Complete
                </span>
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800 shadow-sm">
                  <Target className="w-4 h-4 mr-2" />
                  Mission Ready
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8 border-b border-gray-200 bg-white rounded-t-lg px-6 shadow-lg">
            {[
              { id: 'profile', label: 'Profile', icon: User },
              { id: 'pitch', label: 'My Pitches', icon: FileText },
              { id: 'progress', label: 'Analytics', icon: BarChart3 }
            ].map((tab) => {
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
                  <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span>{tab.label}</span>
                  {isActive && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-b-lg shadow-lg">
          {activeTab === 'profile' && (
            <div className="p-6">
              <VeteranProfileTab />
            </div>
          )}
          
          {activeTab === 'pitch' && (
            <div className="p-6">
              <div className="text-center py-12">
                <div className="text-6xl mb-6">📝</div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Manage Your Pitches</h3>
                <p className="text-gray-600 mb-8">
                  Create new pitches or edit existing ones
                </p>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => router.push('/pitch/new')}
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-colors font-semibold flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Create New Pitch
                  </button>
                  <button
                    onClick={() => router.push('/dashboard/veteran?tab=pitches')}
                    className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
                  >
                    View All Pitches
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'progress' && (
            <div className="p-6">
              <ProgressTabContent />
            </div>
          )}
        </div>
      </div>
    </div>
  )

  function ProgressTabContent() {
    if (loading) {
      return (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your performance...</p>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        {/* Header Bar */}
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
        <Funnel data={funnelData} />

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
    )
  }
}
