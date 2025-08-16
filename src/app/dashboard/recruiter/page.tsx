'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowser } from '@/lib/supabaseBrowser'
import { Briefcase, Users, Phone, Mail, FileText, TrendingUp, Eye, Calendar, Plus, Download, Filter, BarChart3, Save, Lightbulb, MessageCircle } from 'lucide-react'
import BarChart from '@/components/charts/BarChart'
import PieChart from '@/components/charts/PieChart'
import LineChart from '@/components/charts/LineChart'
import SavedFiltersClient from '@/components/SavedFiltersClient'
import MissionInvitationModal from '@/components/mission/MissionInvitationModal'
import MissionInvitationAnalytics from '@/components/mission/MissionInvitationAnalytics'
import CommunitySuggestions from '@/components/community/CommunitySuggestions'

export default function RecruiterDashboard() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [metrics, setMetrics] = useState<any>(null)
  const [analytics, setAnalytics] = useState<any>(null)
  const [savedFilters, setSavedFilters] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'mission' | 'community'>('overview')
  const router = useRouter()

  const fetchRecruiterData = useCallback(async (userId: string) => {
    try {
      const supabase = createSupabaseBrowser()
      
      // Fetch recruiter metrics, analytics, and saved filters
      const [metricsResult, analyticsResult, savedFiltersResult] = await Promise.all([
        fetchRecruiterMetrics(userId),
        fetchRecruiterAnalytics(userId),
        fetchSavedFilters(userId)
      ])
      
      setMetrics(metricsResult)
      setAnalytics(analyticsResult)
      setSavedFilters(savedFiltersResult)
    } catch (error) {
      console.error('Failed to fetch recruiter data:', error)
    }
  }, [])

  useEffect(() => {
    async function checkAuthAndLoadData() {
      try {
        const supabase = createSupabaseBrowser()
        
        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
          router.push('/auth?redirect=/dashboard/recruiter')
          return
        }
        
        setUser(user)
        
        // Check user role
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('role, name')
          .eq('id', user.id)
          .single()
        
        if (profileError || profile?.role !== 'recruiter') {
          router.push('/auth?redirect=/dashboard/recruiter')
          return
        }
        
        setProfile(profile)
        
        // Fetch recruiter data
        await fetchRecruiterData(user.id)
        
      } catch (error) {
        console.error('Recruiter dashboard error:', error)
        setError('Failed to load dashboard data')
      } finally {
        setIsLoading(false)
      }
    }
    
    checkAuthAndLoadData()
  }, [router, fetchRecruiterData])



  async function fetchRecruiterMetrics(userId: string) {
    try {
      const supabase = createSupabaseBrowser()
      
      // Get recruiter-specific metrics
      const [
        { count: savedFilters },
        { count: resumeRequests },
        { data: recentActivity }
      ] = await Promise.all([
        supabase.from('recruiter_saved_filters').select('*', { count: 'exact', head: true }).eq('recruiter_id', userId),
        supabase.from('resume_requests').select('*', { count: 'exact', head: true }).eq('recruiter_user_id', userId),
        supabase.from('user_activity_log').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(5)
      ])

      return {
        savedFilters: savedFilters || 0,
        resumeRequests: resumeRequests || 0,
        recentActivity: recentActivity || []
      }
    } catch (error) {
      console.error('Failed to fetch recruiter metrics:', error)
      return {
        savedFilters: 0,
        resumeRequests: 0,
        recentActivity: []
      }
    }
  }

  async function fetchRecruiterAnalytics(userId: string) {
    try {
      const supabase = createSupabaseBrowser()
      
      // Get recruiter analytics data
      const { data: analytics } = await supabase
        .from('user_activity_log')
        .select('*')
        .eq('user_id', userId)
        .eq('activity_type', 'recruiter_action')
        .order('created_at', { ascending: false })
        .limit(50)

      return {
        analytics: analytics || [],
        totalActions: analytics?.length || 0
      }
    } catch (error) {
      console.error('Failed to fetch recruiter analytics:', error)
      return {
        analytics: [],
        totalActions: 0
      }
    }
  }

  async function fetchSavedFilters(userId: string) {
    try {
      const supabase = createSupabaseBrowser()
      
      const { data: filters, error } = await supabase
        .from('recruiter_saved_filters')
        .select('id, name, filters, created_at')
        .eq('recruiter_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        return [];
      }
      return filters || [];
    } catch (error) {
      console.error('Failed to fetch saved filters:', error)
      return []
    }
  }



  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">Loading Recruiter Dashboard...</h2>
          <p className="text-gray-600">Please wait while we load your data.</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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

  // Calculate summary stats
  const totalShortlisted = metrics?.savedFilters || 0
  const totalContacted = analytics?.totalActions || 0
  const pendingResumeRequests = metrics?.resumeRequests || 0
  const totalNotes = metrics?.recentActivity?.length || 0

  // Prepare chart data
  const contactTypeData = [
    { label: 'Actions', value: analytics?.totalActions || 0, color: '#10B981' },
    { label: 'Filters', value: metrics?.savedFilters || 0, color: '#3B82F6' }
  ]

  const resumeRequestStatusData = [
    { label: 'Pending', value: metrics?.resumeRequests || 0, color: '#F59E0B' },
    { label: 'Completed', value: analytics?.totalActions || 0, color: '#10B981' },
    { label: 'Total', value: (metrics?.resumeRequests || 0) + (analytics?.totalActions || 0), color: '#EF4444' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Briefcase className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome, {profile?.name || user?.email?.split('@')[0] || 'Recruiter'}!
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {profile?.role || 'User'}
                </span>
              </div>
            </div>
          </div>
          <p className="text-gray-600">Track your candidate pipeline and manage connections</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Overview
                </div>
              </button>
              <button
                onClick={() => setActiveTab('mission')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'mission'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Mission Invitations
                </div>
              </button>
              <button
                onClick={() => setActiveTab('community')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'community'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Community
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Shortlisted</p>
                    <p className="text-2xl font-bold text-gray-900">{totalShortlisted}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Phone className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Contacted</p>
                    <p className="text-2xl font-bold text-gray-900">{totalContacted}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                    <p className="text-2xl font-bold text-gray-900">{pendingResumeRequests}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Notes</p>
                    <p className="text-2xl font-bold text-gray-900">{totalNotes}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Saved Filters & CSV Download */}
            <SavedFiltersClient initialFilters={savedFilters.map((filter: any) => ({
              id: filter.id,
              name: filter.name,
              filters: filter.filters,
              created_at: filter.created_at
            }))} />

            {/* Quick Actions & Reports */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <a
                href="/browse"
                className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Eye className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Browse Veterans</div>
                  <div className="text-sm text-gray-600">Find new candidates</div>
                </div>
              </a>

              <a
                href="/shortlist"
                className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">View Shortlist</div>
                  <div className="text-sm text-gray-600">Manage candidates</div>
                </div>
              </a>

              <a
                href="/api/admin/export/pitches.csv"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Download className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Export Pitches</div>
                  <div className="text-sm text-gray-600">Download CSV</div>
                </div>
              </a>

              <a
                href="/api/admin/export/activity.csv"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Activity Report</div>
                  <div className="text-sm text-gray-600">Download CSV</div>
                </div>
              </a>
            </div>

            {/* Performance Trends */}
            {analytics.activityTrend && analytics.activityTrend.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Activity Trends (Last 30 Days)</h2>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <span className="text-sm text-gray-600">Daily Activity</span>
                  </div>
                </div>
                <LineChart
                  data={analytics?.analytics?.map((item: any) => ({
                    label: item.label,
                    value: item.value
                  }))}
                  height={300}
                  color="#3B82F6"
                />
              </div>
            )}

            {/* Dashboard Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Contact Type Distribution */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Type Distribution</h3>
                <PieChart
                  data={contactTypeData}
                  size={300}
                />
              </div>

              {/* Resume Request Status */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Resume Request Status</h3>
                <BarChart
                  data={resumeRequestStatusData.map(item => ({
                    label: item.label,
                    value: item.value
                  }))}
                  height={300}
                />
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Recent Contacts */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Contacts</h3>
                {metrics.recentActivity && metrics.recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {metrics.recentActivity.slice(0, 5).map((contact: any) => (
                      <div key={contact.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{contact.activity_type}</p>
                          <p className="text-sm text-gray-600">{contact.created_at}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Activity
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(contact.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No recent contacts</p>
                )}
              </div>

              {/* Recent Notes */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Notes</h3>
                {metrics.recentActivity && metrics.recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {metrics.recentActivity.slice(0, 5).map((note: any) => (
                      <div key={note.id} className="border-l-4 border-blue-500 pl-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-gray-900">{note.activity_type}</span>
                          <span className="text-sm text-gray-500">
                            {new Date(note.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{note.created_at}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No notes yet</p>
                )}
              </div>
            </div>

            {/* Shortlisted Candidates */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Shortlisted Candidates</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Candidate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pitch Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Skills
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {metrics.recentActivity && metrics.recentActivity.length > 0 ? (
                      metrics.recentActivity.slice(0, 5).map((candidate: any) => (
                        <tr key={candidate.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{candidate.activity_type}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{candidate.created_at}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              {['Activity', 'Log', 'Entry'].slice(0, 3).map((skill: any, index: any) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                >
                                  {skill}
                                </span>
                              ))}
                              {false && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  +{candidate.skills.length - 3}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              <div>N/A</div>
                              <div className="text-gray-500">N/A</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                                                      <span className="text-gray-400">
                                <Phone className="w-4 h-4" />
                              </span>
                              <span className="text-gray-400">
                                <Mail className="w-4 h-4" />
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                          No shortlisted candidates yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'mission' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Mission Invitations</h2>
              <p className="text-gray-600 mb-6">
                Invite other recruiters and professionals to join the mission and help veterans succeed. Track your invitation success and build your network.
              </p>
              <MissionInvitationModal userId={user?.id} userRole="recruiter" />
            </div>
            <MissionInvitationAnalytics userId={user?.id} />
          </div>
        )}

        {activeTab === 'community' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Community Suggestions</h2>
              <p className="text-gray-600 mb-6">
                Help shape the platform's future by submitting suggestions and voting on improvements. Your voice matters in building a better experience for all users.
              </p>
            </div>
            <CommunitySuggestions userId={user?.id} />
          </div>
        )}
      </div>
    </div>
  )
}