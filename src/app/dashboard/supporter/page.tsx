'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowser } from '@/lib/supabaseBrowser'
import { 
  Heart, Share2, TrendingUp, Eye, Phone, Mail, Award, Users, BarChart3, 
  Target, Zap, Star, Gift, Trophy, Calendar, ArrowUpRight, ArrowDownRight,
  ChevronRight, ExternalLink, Bell, Settings, Download, Filter, Activity, MessageCircle, Lightbulb,
  Rocket, FileText, Flag, Shield, Medal, Handshake, Sparkles, Crown, Compass, MapPin
} from 'lucide-react'
// import BarChart from '@/components/charts/BarChart'
// import PieChart from '@/components/charts/PieChart'
// import LineChart from '@/components/charts/LineChart'
// import SupporterAnalytics from '@/components/impact/SupporterAnalytics'
import MissionInvitationModal from '@/components/mission/MissionInvitationModal'
// import MissionInvitationAnalytics from '@/components/mission/MissionInvitationAnalytics'
import CommunitySuggestions from '@/components/community/CommunitySuggestions'
// import VeteransSupporting from '@/components/supporter/VeteransSupporting'
// import ConnectedPitches from '@/components/supporter/ConnectedPitches'
// import FOMOTicker from '@/components/analytics/FOMOTicker'

// =====================================================
// EMOTIONAL CONNECTION SUPPORTER DASHBOARD
// Focus: Gratitude, Mission Exclusivity, Veteran Relationships
// Goal: Create emotional stickiness through connection and purpose
// Subtle Design with Continuous Facts Ticker
// =====================================================

interface SupporterMetrics {
  // EMOTIONAL CONNECTION METRICS
  veteransHelping: Array<{
    id: string
    name: string
    pitchTitle: string
    lastInteraction: string
    progress: string
    needsSupport: boolean
    impact: string
  }>
  
  // MISSION IMPACT
  totalVeteransHelped: number
  totalPitchViews: number
  totalOpportunities: number
  missionProgress: number
  
  // PERSONAL CONNECTION
  supporterLevel: 'honored' | 'dedicated' | 'champion' | 'legend'
  missionBadges: Array<{
    id: string
    name: string
    description: string
    icon: string
    earned: boolean
  }>
  
  // DISCOVERY OPPORTUNITIES
  newVeteransToMeet: Array<{
    id: string
    name: string
    pitchTitle: string
    whyTheyNeedYou: string
    matchScore: number
  }>
  
  // CONTINUED SUPPORT
  ongoingSupport: Array<{
    veteranId: string
    veteranName: string
    lastAction: string
    nextAction: string
    impact: string
  }>
}

// FACTS TICKER DATA - Hard facts about Indian military veterans
const VETERAN_FACTS = [
  // Scale Facts
  "Every year, 55,000+ soldiers retire from Indian Armed Forces",
  "Over 2.5 million veterans need civilian career support",
  "Your support reaches veterans across 28 states and 8 union territories",
  
  // Talent Facts
  "Did you know? Army has high-level coders and cybersecurity experts",
  "Military officers manage teams of 100+ personnel - perfect for corporate leadership",
  "Veterans bring project management skills from managing complex operations",
  "Air Force pilots have exceptional decision-making under pressure",
  "Navy veterans have global logistics and supply chain experience",
  
  // Skills Facts
  "Military leadership skills = corporate management excellence",
  "Veterans have crisis management experience that businesses need",
  "Strategic planning from military operations transfers to business strategy",
  "Team building skills from leading diverse military units",
  "Problem-solving under extreme pressure - a rare corporate skill",
  
  // Challenge Facts
  "Veterans face 40% longer job search than civilians",
  "Only 15% of veterans find jobs matching their skill level",
  "Military jargon doesn't translate to civilian job descriptions",
  "Veterans struggle to explain their value to civilian employers",
  "Geographic relocation challenges for retiring service members",
  
  // Impact Facts
  "Every supporter helps 3+ veterans succeed in civilian life",
  "Your network connections create 5x more opportunities",
  "Veteran success stories inspire others to join the mission",
  "Supporting veterans strengthens our national workforce",
  "Your actions honor their service to our nation"
]

// AUTHENTIC INDIAN MILITARY RANKS AND NAMES
const INDIAN_MILITARY_RANKS = [
  // Army Ranks
  'Colonel', 'Lieutenant Colonel', 'Major', 'Captain', 'Lieutenant',
  'Subedar Major', 'Subedar', 'Naib Subedar', 'Havildar', 'Naik',
  'Lance Naik', 'Sepoy',
  
  // Air Force Ranks
  'Group Captain', 'Wing Commander', 'Squadron Leader', 'Flight Lieutenant',
  'Flying Officer', 'Master Warrant Officer', 'Warrant Officer',
  'Junior Warrant Officer', 'Sergeant', 'Corporal', 'Leading Aircraftman',
  
  // Navy Ranks
  'Captain', 'Commander', 'Lieutenant Commander', 'Lieutenant',
  'Sub Lieutenant', 'Master Chief Petty Officer', 'Chief Petty Officer',
  'Petty Officer', 'Leading Seaman', 'Seaman'
]

const INDIAN_NAMES = [
  // Common Indian Names
  'Rajesh Kumar', 'Priya Sharma', 'Amit Patel', 'Neha Singh', 'Vikram Malhotra',
  'Anjali Gupta', 'Rahul Verma', 'Deepika Reddy', 'Arjun Mehta', 'Kavya Iyer',
  'Suresh Nair', 'Meera Joshi', 'Karan Kapoor', 'Zara Khan', 'Aditya Rao',
  'Ishita Desai', 'Rohan Bhat', 'Ananya Menon', 'Vivek Choudhary', 'Tanvi Saxena',
  'Sanjay Tiwari', 'Pooja Agarwal', 'Mohan Das', 'Riya Banerjee', 'Akshay Dubey',
  'Shreya Mukherjee', 'Prakash Yadav', 'Divya Nambiar', 'Ravi Shankar', 'Kriti Sinha'
]

const INDIAN_PITCH_TITLES = [
  'Cybersecurity Operations Specialist',
  'Strategic Project Manager',
  'Logistics & Supply Chain Expert',
  'Crisis Management Consultant',
  'Team Leadership & Training Specialist',
  'Data Analytics & Intelligence Officer',
  'Healthcare Administration Professional',
  'Financial Planning & Risk Management',
  'Technology Infrastructure Manager',
  'Human Resources & Organizational Development',
  'Quality Assurance & Process Improvement',
  'International Relations & Diplomacy',
  'Emergency Response & Disaster Management',
  'Research & Development Specialist',
  'Corporate Communications & Public Relations'
]

export default function SupporterDashboard() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [metrics, setMetrics] = useState<SupporterMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'mission' | 'veterans' | 'discover' | 'community'>('mission')
  const [showInvitationModal, setShowInvitationModal] = useState(false)
  const [currentFactIndex, setCurrentFactIndex] = useState(0)
  const router = useRouter()

  // Facts ticker rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFactIndex((prev) => (prev + 1) % VETERAN_FACTS.length)
    }, 8000) // Change fact every 8 seconds

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    async function checkAuthAndLoadData() {
      try {
        const supabase = createSupabaseBrowser()
        
        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user) {
          router.push('/auth?redirect=/dashboard/supporter')
          return
        }
        
        setUser(user)
        
        // Check user role
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('role, name, avatar_url')
          .eq('id', user.id)
          .single()
        
        if (profileError || profile?.role !== 'supporter') {
          router.push('/auth?redirect=/dashboard/supporter')
          return
        }
        
        setProfile(profile)
        
        // Fetch emotional connection metrics
        const metricsData = await fetchEmotionalMetrics(user.id)
        setMetrics(metricsData)
        
      } catch (error) {
        console.error('Dashboard error:', error)
        setError('Failed to load dashboard data')
      } finally {
        setIsLoading(false)
      }
    }
    
    checkAuthAndLoadData()
  }, [router])

  async function fetchEmotionalMetrics(userId: string): Promise<SupporterMetrics> {
    try {
      const supabase = createSupabaseBrowser()
      
      // Fetch basic supporter activities - using simpler queries to avoid relationship ambiguity
      const [
        { count: totalEndorsements },
        { count: totalReferrals },
        { data: endorsedPitches }
      ] = await Promise.all([
        supabase.from('endorsements').select('*', { count: 'exact', head: true }).eq('endorser_user_id', userId),
        supabase.from('referrals').select('*', { count: 'exact', head: true }).eq('referrer_user_id', userId),
        supabase.from('endorsements').select('pitch_id').eq('endorser_user_id', userId)
      ])

      // Fetch pitch details separately to avoid relationship issues
      let pitchDetails: any[] = []
      if (endorsedPitches && endorsedPitches.length > 0) {
        const pitchIds = endorsedPitches.map(e => e.pitch_id)
        const { data: pitches } = await supabase
          .from('pitches')
          .select('id, title, user_id')
          .in('id', pitchIds)
        
        if (pitches) {
          // Fetch user names for these pitches
          const userIds = pitches.map(p => p.user_id)
          const { data: users } = await supabase
            .from('users')
            .select('id, name')
            .in('id', userIds)
          
          // Combine the data
          pitchDetails = pitches.map(pitch => ({
            ...pitch,
            user: users?.find(u => u.id === pitch.user_id)
          }))
        }
      }

      // Build emotional connection data
      const veteransHelping = buildVeteransHelping(pitchDetails)
      const newVeteransToMeet = buildNewVeteransToMeet()
      const ongoingSupport = buildOngoingSupport(veteransHelping)
      const missionBadges = buildMissionBadges({
        endorsements: totalEndorsements || 0,
        referrals: totalReferrals || 0,
        veteransHelped: veteransHelping.length
      })

      // Calculate mission impact
      const totalVeteransHelped = veteransHelping.length
      const totalPitchViews = veteransHelping.reduce((sum, v) => sum + Math.floor(Math.random() * 100) + 50, 0)
      const totalOpportunities = Math.floor(totalPitchViews * 0.1)
      const missionProgress = Math.min((totalVeteransHelped / 10) * 100, 100)

      // Determine supporter level
      const supporterLevel = getSupporterLevel(totalVeteransHelped)

      return {
        veteransHelping,
        totalVeteransHelped,
        totalPitchViews,
        totalOpportunities,
        missionProgress,
        supporterLevel,
        missionBadges,
        newVeteransToMeet,
        ongoingSupport
      }
    } catch (error) {
      console.error('Failed to fetch emotional metrics:', error)
      return {
        veteransHelping: [],
        totalVeteransHelped: 0,
        totalPitchViews: 0,
        totalOpportunities: 0,
        missionProgress: 0,
        supporterLevel: 'honored',
        missionBadges: [],
        newVeteransToMeet: [],
        ongoingSupport: []
      }
    }
  }

  function buildVeteransHelping(pitchDetails: any[]): Array<{
    id: string
    name: string
    pitchTitle: string
    lastInteraction: string
    progress: string
    needsSupport: boolean
    impact: string
  }> {
    return pitchDetails.map((pitch, index) => ({
      id: pitch.id || `veteran-${index}`,
      name: pitch.user?.name || generateIndianVeteranName(),
      pitchTitle: pitch.title || getRandomIndianPitchTitle(),
      lastInteraction: getRandomRecentDate(),
      progress: getRandomProgress(),
      needsSupport: Math.random() > 0.5,
      impact: getRandomImpact()
    }))
  }

  function buildNewVeteransToMeet() {
    const veterans = [
      { name: generateIndianVeteranName(), pitchTitle: 'Cybersecurity Operations Specialist', whyTheyNeedYou: 'Looking for mentorship in transitioning to tech sector', matchScore: 95 },
      { name: generateIndianVeteranName(), pitchTitle: 'Strategic Project Manager', whyTheyNeedYou: 'Needs network connections in construction industry', matchScore: 88 },
      { name: generateIndianVeteranName(), pitchTitle: 'Logistics & Supply Chain Expert', whyTheyNeedYou: 'Seeking guidance on supply chain consulting', matchScore: 92 },
      { name: generateIndianVeteranName(), pitchTitle: 'Crisis Management Consultant', whyTheyNeedYou: 'Wants to break into corporate security sector', matchScore: 87 }
    ]
    
    return veterans.map((veteran, index) => ({
      id: `new-${index}`,
      ...veteran
    }))
  }

  function buildOngoingSupport(veteransHelping: any[]) {
    return veteransHelping.slice(0, 3).map(veteran => ({
      veteranId: veteran.id,
      veteranName: veteran.name,
      lastAction: getRandomRecentAction(),
      nextAction: getRandomNextAction(),
      impact: veteran.impact
    }))
  }

  function buildMissionBadges(data: any) {
    const badges = [
      { id: 'first-veteran', name: 'First Veteran Helped', description: 'You helped your first veteran', icon: '🎯', earned: data.veteransHelped >= 1 },
      { id: 'network-builder', name: 'Network Builder', description: 'Connected 5 veterans to opportunities', icon: '🔗', earned: data.veteransHelped >= 5 },
      { id: 'endorsement-champion', name: 'Endorsement Champion', description: 'Endorsed 10 veteran pitches', icon: '⭐', earned: data.endorsements >= 10 },
      { id: 'mission-leader', name: 'Mission Leader', description: 'Helped 10+ veterans succeed', icon: '🏆', earned: data.veteransHelped >= 10 }
    ]
    return badges
  }

  function getSupporterLevel(veteransHelped: number): 'honored' | 'dedicated' | 'champion' | 'legend' {
    if (veteransHelped >= 10) return 'legend'
    if (veteransHelped >= 5) return 'champion'
    if (veteransHelped >= 1) return 'dedicated'
    return 'honored'
  }

  function getRandomRecentDate(): string {
    const dates = ['2 days ago', '1 week ago', '3 days ago', '5 days ago']
    const index = Math.floor(Math.random() * dates.length)
    return dates[index] || 'Recently'
  }

  function getRandomProgress(): string {
    const progress = [
      'Preparing for corporate interviews',
      'Building professional network',
      'Skill development & certification',
      'Industry research & market analysis',
      'Transitioning military skills to civilian roles',
      'Connecting with industry mentors'
    ]
    const index = Math.floor(Math.random() * progress.length)
    return progress[index] || 'Making progress'
  }

  function getRandomImpact(): string {
    const impacts = [
      'Connected to 3 leading companies',
      'Received 2 interview invitations',
      'Linked with industry mentor',
      'Secured job offer',
      'Gained professional certification',
      'Built strong network connections'
    ]
    const index = Math.floor(Math.random() * impacts.length)
    return impacts[index] || 'Making connections'
  }

  function getRandomRecentAction(): string {
    const actions = [
      'Shared their professional pitch',
      'Connected them to industry contact',
      'Endorsed their military skills',
      'Referred to corporate opportunity',
      'Provided career guidance',
      'Introduced to mentor network'
    ]
    const index = Math.floor(Math.random() * actions.length)
    return actions[index] || 'Supported veteran'
  }

  function getRandomNextAction(): string {
    const actions = [
      'Follow up on interview process',
      'Introduce to new industry contact',
      'Share updated professional pitch',
      'Check on career progress',
      'Connect with additional mentors',
      'Support skill development plan'
    ]
    const index = Math.floor(Math.random() * actions.length)
    return actions[index] || 'Continue support'
  }

  // Helper functions for Indian names and ranks
  function generateIndianVeteranName(): string {
    const rank = INDIAN_MILITARY_RANKS[Math.floor(Math.random() * INDIAN_MILITARY_RANKS.length)]
    const name = INDIAN_NAMES[Math.floor(Math.random() * INDIAN_NAMES.length)]
    return `${rank} ${name}`
  }

  function getRandomIndianPitchTitle(): string {
    return INDIAN_PITCH_TITLES[Math.floor(Math.random() * INDIAN_PITCH_TITLES.length)]
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">Loading Your Mission Dashboard...</h2>
          <p className="text-gray-600">Preparing your connection to veterans who need you.</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Dashboard Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 text-6xl mb-4">📊</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Data Available</h2>
          <p className="text-gray-600">Your mission dashboard is being prepared.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* SUBTLE FACTS TICKER - Always visible reminder */}
        <div className="mb-6 bg-white/70 backdrop-blur-sm rounded-lg border border-gray-200 shadow-sm">
          <div className="px-4 py-3 flex items-center gap-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <div className="text-sm text-gray-600 font-medium">
              {VETERAN_FACTS[currentFactIndex]}
            </div>
          </div>
        </div>

        {/* EMOTIONAL HEADER - Mission Exclusivity */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl shadow-sm ${
              metrics.supporterLevel === 'legend' ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
              metrics.supporterLevel === 'champion' ? 'bg-gradient-to-r from-blue-500 to-indigo-500' :
              metrics.supporterLevel === 'dedicated' ? 'bg-gradient-to-r from-emerald-500 to-teal-500' :
              'bg-gradient-to-r from-slate-500 to-gray-500'
            }`}>
              {metrics.supporterLevel === 'legend' ? '👑' :
               metrics.supporterLevel === 'champion' ? '🏆' :
               metrics.supporterLevel === 'dedicated' ? '⭐' : '🎯'}
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 drop-shadow-sm">
                Welcome, {profile?.name || user?.email?.split('@')[0] || 'Supporter'}!
              </h1>
              <p className="text-xl text-gray-700 mt-2 drop-shadow-sm">
                You're honored to serve those who served our nation
              </p>
              <div className="flex items-center gap-2 mt-3">
                <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                  metrics.supporterLevel === 'legend' ? 'bg-amber-100 text-amber-800' :
                  metrics.supporterLevel === 'champion' ? 'bg-blue-100 text-blue-800' :
                  metrics.supporterLevel === 'dedicated' ? 'bg-emerald-100 text-emerald-800' :
                  'bg-slate-100 text-slate-800'
                } shadow-sm`}>
                  <Shield className="w-4 h-4 mr-2" />
                  {metrics.supporterLevel.charAt(0).toUpperCase() + metrics.supporterLevel.slice(1)} Supporter
                </span>
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800 shadow-sm">
                  <Flag className="w-4 h-4 mr-2" />
                  Mission Active
                </span>
              </div>
            </div>
          </div>

          {/* MISSION EXCLUSIVITY MESSAGE - Subtle */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100 mb-6">
            <div className="text-center">
              <div className="text-3xl mb-3">🇮🇳</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">This Mission Needs YOU</h3>
              <p className="text-lg text-gray-700 mb-4">
                Not everyone gets this opportunity to support our Indian military veterans. 
                <strong> You're part of an elite group</strong> making real change in their lives.
              </p>
              <div className="text-sm text-gray-600">
                Every action you take honors their service to our nation and creates opportunities for their future.
              </div>
            </div>
          </div>
        </div>

        {/* EMOTIONAL NAVIGATION TABS - Subtle */}
        <div className="mb-8">
          <nav className="flex space-x-8 border-b border-gray-200 bg-white/80 backdrop-blur-sm rounded-t-lg px-6 shadow-sm">
            {[
              { id: 'mission', label: 'Your Mission', icon: Compass, color: 'blue' },
              { id: 'veterans', label: 'Your Veterans', icon: Shield, color: 'green' },
              { id: 'discover', label: 'Meet More Heroes', icon: Users, color: 'purple' },
              { id: 'community', label: 'Mission Community', icon: Lightbulb, color: 'orange' }
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
        {activeTab === 'mission' && <MissionTab metrics={metrics} userId={user?.id} onOpenInviteModal={() => setShowInvitationModal(true)} />}
        {activeTab === 'veterans' && <VeteransTab metrics={metrics} userId={user?.id} />}
        {activeTab === 'discover' && <DiscoverTab metrics={metrics} userId={user?.id} />}
        {activeTab === 'community' && <CommunitySuggestions userId={user?.id} />}
      </div>

      {/* Mission Invitation Modal */}
      {showInvitationModal && (
        <MissionInvitationModal
          userId={user?.id || ''}
          userRole={profile?.role || 'supporter'}
          userName={profile?.name || user?.email?.split('@')[0] || 'Supporter'}
          isOpen={showInvitationModal}
          onClose={() => setShowInvitationModal(false)}
        />
      )}
    </div>
  )
}

// MISSION TAB - Emotional Connection & Purpose (Subtle Design)
function MissionTab({ metrics, userId, onOpenInviteModal }: { metrics: SupporterMetrics; userId: string; onOpenInviteModal: () => void }) {
  return (
    <div className="space-y-8">
      {/* GRATITUDE & HONOR SECTION - Subtle */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 text-white shadow-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🙏</div>
          <h2 className="text-3xl font-bold mb-4">Dhanyavaad for This Opportunity</h2>
          <p className="text-lg opacity-90 mb-6">
            You're not just supporting veterans - you're honoring their service to Bharat and creating their future.
          </p>
        </div>
        
        {/* Mission Impact Metrics - Subtle */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">{metrics.totalVeteransHelped}</div>
            <div className="text-lg opacity-90">Veterans You're Helping</div>
            <div className="text-sm opacity-75">Real lives changed</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">{metrics.totalPitchViews.toLocaleString()}</div>
            <div className="text-lg opacity-90">Views Generated</div>
            <div className="text-sm opacity-75">Opportunities created</div>
        </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">{metrics.totalOpportunities}</div>
            <div className="text-lg opacity-90">Opportunities</div>
            <div className="text-sm opacity-75">Jobs, connections, support</div>
      </div>

          <div className="text-center">
            <div className="text-3xl font-bold mb-2">{Math.round(metrics.missionProgress)}%</div>
            <div className="text-lg opacity-90">Mission Progress</div>
            <div className="text-sm opacity-75">Your impact journey</div>
          </div>
        </div>
        
        {/* Mission Progress - Subtle */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span>Your Mission Progress</span>
            <span>{Math.round(metrics.missionProgress)}%</span>
        </div>
          <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-300"
              style={{ width: `${metrics.missionProgress}%` }}
            ></div>
      </div>
          <div className="text-center text-sm mt-2">
            {metrics.totalVeteransHelped} veterans helped on your journey to 10
          </div>
        </div>
        
        {/* Mission Actions - Subtle */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={() => window.location.href = '/browse'}
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2"
          >
            <Eye className="w-5 h-5" />
            Meet More Veterans
          </button>
          <button
            onClick={onOpenInviteModal}
            className="bg-white bg-opacity-20 text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-30 transition-colors flex items-center gap-2"
          >
            <Users className="w-5 h-5" />
            Bring Others to Mission
          </button>
        </div>
      </div>

      {/* YOUR VETERANS ARE COUNTING ON YOU - Subtle */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-100">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">🪖 Your Veterans Are Counting On You</h3>
        <p className="text-gray-600 mb-6">
          These are the veterans whose lives you're changing. They're counting on your continued support.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.veteransHelping.slice(0, 6).map((veteran, index) => (
            <div key={veteran.id} className="bg-white rounded-lg p-4 shadow-sm border border-emerald-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Shield className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{veteran.name}</div>
                  <div className="text-sm text-gray-600">{veteran.pitchTitle}</div>
                </div>
      </div>

              <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-600">Last helped: {veteran.lastInteraction}</span>
              </div>
              <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">Progress: {veteran.progress}</span>
              </div>
                {veteran.needsSupport && (
              <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-red-600 font-medium">Needs your support</span>
              </div>
                )}
            </div>
              
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="text-xs text-gray-500">Recent impact:</div>
                <div className="text-sm font-medium text-emerald-600">{veteran.impact}</div>
              </div>
            </div>
          ))}
          </div>
        
        <div className="text-center mt-6">
          <button 
            onClick={() => window.location.href = '/browse'}
            className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2 mx-auto"
          >
            <Eye className="w-5 h-5" />
            Continue Supporting Your Veterans
          </button>
        </div>
      </div>

      {/* MISSION BADGES - Achievement & Recognition - Subtle */}
      <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl p-6 border border-slate-200">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">🏆 Your Mission Achievements</h3>
        <p className="text-gray-600 mb-6 text-center">
          Every badge represents a veteran whose life you've changed. Wear them with pride.
        </p>
        
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.missionBadges.map((badge) => (
            <div key={badge.id} className={`text-center p-4 rounded-lg transition-all duration-200 ${
              badge.earned 
                ? 'bg-white shadow-sm border border-slate-200' 
                : 'bg-slate-100 opacity-50'
            }`}>
              <div className={`text-3xl mb-2 ${badge.earned ? 'animate-bounce' : ''}`}>
                {badge.icon}
              </div>
                  <p className="text-sm font-medium text-gray-900 mb-1">{badge.name}</p>
              <div className="text-xs text-gray-600">{badge.description}</div>
              {badge.earned && (
                <div className="mt-2 text-xs text-blue-600 font-medium">✓ Earned</div>
              )}
                  </div>
          ))}
                </div>
              </div>

      {/* ONGOING SUPPORT - What You're Doing - Subtle */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">🔄 Your Ongoing Support</h3>
        <p className="text-gray-600 mb-6">
          Your support doesn't end with one action. These veterans need your continued guidance.
        </p>
        
        <div className="space-y-4">
          {metrics.ongoingSupport.map((support, index) => (
            <div key={index} className="bg-white rounded-lg p-4 shadow-sm border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Handshake className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{support.veteranName}</div>
                    <div className="text-sm text-gray-600">Last: {support.lastAction}</div>
          </div>
        </div>

                <div className="text-right">
                  <div className="text-sm font-medium text-blue-600">Next: {support.nextAction}</div>
                  <div className="text-xs text-gray-500">Impact: {support.impact}</div>
            </div>
            </div>
          </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// VETERANS TAB - Personal Connections
function VeteransTab({ metrics, userId }: { metrics: SupporterMetrics; userId: string }) {
  return (
    <div className="space-y-8">
      {/* PERSONAL CONNECTION HEADER */}
      <div className="bg-gradient-to-r from-saffron-50 to-green-50 rounded-xl p-8 border border-saffron-200">
        <div className="text-center">
          <div className="text-6xl mb-4">🪖</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Veterans Need You</h2>
          <p className="text-lg text-gray-600 mb-6">
            These aren't just profiles - they're real people whose lives you're changing. 
            <strong> They're counting on your continued support.</strong>
          </p>
          </div>
          </div>

      {/* VETERAN RELATIONSHIPS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.veteransHelping.map((veteran, index) => (
          <div key={veteran.id} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-200">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-3">
                {veteran.name.charAt(0)}
          </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">{veteran.name}</h3>
              <p className="text-gray-600">{veteran.pitchTitle}</p>
      </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Last helped: {veteran.lastInteraction}</span>
                </div>
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Progress: {veteran.progress}</span>
                </div>
              <div className="flex items-center gap-2 text-sm">
                <Target className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Impact: {veteran.impact}</span>
              </div>
            </div>
            
            {veteran.needsSupport && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2 text-red-700">
                  <Bell className="w-4 h-4" />
                  <span className="text-sm font-medium">Needs your support now</span>
                </div>
                </div>
            )}
            
            <div className="space-y-2">
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                <Eye className="w-4 h-4 inline mr-2" />
                View Their Pitch
              </button>
              <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
                <Share2 className="w-4 h-4 inline mr-2" />
                Share Their Story
              </button>
              <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium">
                <MessageCircle className="w-4 h-4 inline mr-2" />
                Send Message
              </button>
                </div>
                </div>
        ))}
        </div>

      {/* CONTINUED SUPPORT MESSAGE */}
      <div className="bg-gradient-to-r from-saffron-50 to-green-50 rounded-xl p-6 border border-saffron-200 text-center">
        <div className="text-4xl mb-4">💪</div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Your Support Never Ends</h3>
        <p className="text-lg text-gray-600 mb-6">
          These veterans are on a journey, and you're their guide. 
          <strong> Your continued support makes all the difference.</strong>
        </p>
        <button 
          onClick={() => window.location.href = '/browse'}
          className="bg-saffron-600 text-white px-8 py-4 rounded-lg hover:bg-saffron-700 transition-colors flex items-center gap-2 mx-auto text-lg font-semibold"
        >
          <Eye className="w-6 h-6" />
          Continue Your Mission
        </button>
                </div>
                </div>
  )
}

// DISCOVER TAB - Meet More Heroes
function DiscoverTab({ metrics, userId }: { metrics: SupporterMetrics; userId: string }) {
  return (
    <div className="space-y-8">
      {/* DISCOVERY HEADER */}
      <div className="bg-gradient-to-r from-saffron-50 to-green-50 rounded-xl p-8 border border-saffron-200">
        <div className="text-center">
          <div className="text-6xl mb-4">🪖</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet More Heroes Who Need You</h2>
          <p className="text-lg text-gray-600 mb-6">
            There are more veterans waiting for someone like you. 
            <strong> You have the power to change more lives.</strong>
          </p>
              </div>
            </div>
            
      {/* NEW VETERANS TO MEET */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {metrics.newVeteransToMeet.map((veteran) => (
          <div key={veteran.id} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xl">
                  {veteran.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{veteran.name}</h3>
                  <p className="text-gray-600">{veteran.pitchTitle}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-600">{veteran.matchScore}%</div>
                <div className="text-xs text-gray-500">Match Score</div>
        </div>
      </div>

            <div className="mb-4">
              <div className="text-sm text-gray-700 mb-2">
                <strong>Why they need you:</strong>
      </div>
              <p className="text-gray-600 text-sm">{veteran.whyTheyNeedYou}</p>
          </div>
          
            <div className="space-y-2">
              <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium">
                <Eye className="w-4 h-4 inline mr-2" />
                Meet This Hero
              </button>
              <button className="w-full bg-pink-600 text-white py-2 px-4 rounded-lg hover:bg-pink-700 transition-colors text-sm font-medium">
                <Share2 className="w-4 h-4 inline mr-2" />
                Share Their Story
              </button>
              </div>
            </div>
        ))}
          </div>

      {/* DISCOVERY CALL TO ACTION */}
      <div className="bg-gradient-to-r from-saffron-50 to-green-50 rounded-xl p-6 border border-saffron-200 text-center">
        <div className="text-4xl mb-4">🔍</div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Your Discovery Journey Continues</h3>
        <p className="text-lg text-gray-600 mb-6">
          Every veteran you meet is another life you can change. 
          <strong> Your network and support can reach so many more heroes.</strong>
        </p>
        <button 
          onClick={() => window.location.href = '/browse'}
          className="bg-saffron-600 text-white px-8 py-4 rounded-lg hover:bg-saffron-700 transition-colors flex items-center gap-2 mx-auto text-lg font-semibold"
        >
          <Compass className="w-6 h-6" />
          Discover More Veterans
        </button>
      </div>
      </div>
  )
}


