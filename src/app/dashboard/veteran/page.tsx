'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { createSupabaseBrowser } from '@/lib/supabaseBrowser'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorState from '@/components/ErrorState'
import { Shield, Calendar, Users, Eye, Phone, Mail, FileText, Share2, RefreshCw, TrendingUp, Award, Clock, AlertTriangle, Target, Lightbulb } from 'lucide-react'
import ReferralFunnel from '@/components/ReferralFunnel'
import PlatformBreakdown from '@/components/PlatformBreakdown'
import TrendlineChart from '@/components/Trendline'
import CohortTable from '@/components/CohortTable'
import PerformanceInsights from '@/components/PerformanceInsights'
import RefreshButton from '@/components/RefreshButton'
import PitchImprovementTips from '@/components/PitchImprovementTips'

export default function VeteranDashboard() {
  const { user, profile, isLoading: authLoading, error: authError } = useAuth({ 
    requiredRole: 'veteran',
    redirectTo: '/auth?redirect=/dashboard/veteran'
  })
  
  const [metrics, setMetrics] = useState<any>(null)
  const [analytics, setAnalytics] = useState<any>(null)
  const [trendlineData, setTrendlineData] = useState<any>(null)
  const [cohortData, setCohortData] = useState<any>(null)
  const [avgTimeData, setAvgTimeData] = useState<any>(null)
  const [invoices, setInvoices] = useState<any>(null)
  const [daysUntilExpiry, setDaysUntilExpiry] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadVeteranData() {
      if (!user) return
      
      try {
        await fetchVeteranData(user.id)
      } catch (error) {
        console.error('Veteran dashboard error:', error)
        setError('Failed to load dashboard data')
      } finally {
        setIsLoading(false)
      }
    }
    
    if (!authLoading && user) {
      loadVeteranData()
    }
  }, [user, authLoading])

  async function fetchVeteranData(userId: string) {
    try {
      const supabase = createSupabaseBrowser()
      
      // Fetch veteran metrics and analytics
      const [metricsResult, analyticsResult, trendlineDataResult, cohortDataResult, avgTimeDataResult] = await Promise.all([
        fetchVeteranMetrics(userId),
        fetchVeteranAnalytics(userId),
        fetchTrendlineData(),
        fetchCohortData(),
        fetchAvgTimeData()
      ])
      
      setMetrics(metricsResult)
      setAnalytics(analyticsResult)
      setTrendlineData(trendlineDataResult)
      setCohortData(cohortDataResult)
      setAvgTimeData(avgTimeDataResult)

      // Fetch invoices
      const { data: invoicesData } = await supabase
        .from('invoices')
        .select('id, invoice_number, amount_cents, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5)

      setInvoices(invoicesData)

      // Fetch pitch data for expiry calculation
      const { data: pitchData } = await supabase
        .from('pitches')
        .select('end_date')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      // Calculate days until expiry
      if (pitchData?.end_date) {
        const daysUntil = Math.ceil((new Date(pitchData.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        setDaysUntilExpiry(daysUntil)
      }
    } catch (error) {
      console.error('Failed to fetch veteran data:', error)
    }
  }

  async function fetchVeteranMetrics(userId: string) {
    try {
      const supabase = createSupabaseBrowser()
      
      // Get veteran-specific metrics
      const [
        { count: totalPitches },
        { count: totalEndorsements },
        { data: recentActivity }
      ] = await Promise.all([
        supabase.from('pitches').select('*', { count: 'exact', head: true }).eq('user_id', userId),
        supabase.from('endorsements').select('*', { count: 'exact', head: true }).eq('user_id', userId),
        supabase.from('user_activity_log').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(5)
      ])

      return {
        totalPitches: totalPitches || 0,
        totalEndorsements: totalEndorsements || 0,
        recentActivity: recentActivity || []
      }
    } catch (error) {
      console.error('Failed to fetch veteran metrics:', error)
      return {
        totalPitches: 0,
        totalEndorsements: 0,
        recentActivity: []
      }
    }
  }

  async function fetchVeteranAnalytics(userId: string) {
    try {
      const supabase = createSupabaseBrowser()
      
      // Get veteran analytics data
      const { data: analytics } = await supabase
        .from('user_activity_log')
        .select('*')
        .eq('user_id', userId)
        .eq('activity_type', 'pitch_view')
        .order('created_at', { ascending: false })
        .limit(50)

      return {
        analytics: analytics || [],
        totalViews: analytics?.length || 0
      }
    } catch (error) {
      console.error('Failed to fetch veteran analytics:', error)
      return {
        analytics: [],
        totalViews: 0
      }
    }
  }

  async function fetchTrendlineData() {
    try {
      const supabase = createSupabaseBrowser()
      
      // Get trendline data for all pitches
      const { data: trendline } = await supabase
        .from('user_activity_log')
        .select('*')
        .eq('activity_type', 'pitch_view')
        .order('created_at', { ascending: true })
        .limit(100)

      return trendline || []
    } catch (error) {
      console.error('Failed to fetch trendline data:', error)
      return []
    }
  }

  async function fetchCohortData() {
    try {
      const supabase = createSupabaseBrowser()
      
      // Get cohort data by source
      const { data: cohorts } = await supabase
        .from('user_activity_log')
        .select('*')
        .eq('activity_type', 'pitch_view')
        .order('created_at', { ascending: false })
        .limit(100)

      return cohorts || []
    } catch (error) {
      console.error('Failed to fetch cohort data:', error)
      return []
    }
  }

  async function fetchAvgTimeData() {
    try {
      const supabase = createSupabaseBrowser()
      
      // Get average time to first contact data
      const { data: avgTime } = await supabase
        .from('user_activity_log')
        .select('*')
        .eq('activity_type', 'first_contact')
        .order('created_at', { ascending: false })
        .limit(50)

      return avgTime || []
    } catch (error) {
      console.error('Failed to fetch average time data:', error)
      return []
    }
  }

  // Show loading state
  if (authLoading || isLoading) {
    return <LoadingSpinner message="Loading Veteran Dashboard..." fullScreen />
  }

  // Show error state
  if (authError || error) {
    return <ErrorState error={authError || error || 'Unknown error'} fullScreen />
  }

  // Allow access to all authenticated users, but show different content based on role
  const isVeteran = profile?.role === 'veteran'
  const hasRole = !!profile?.role

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Veteran Dashboard</h1>
            {!isVeteran && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Preview Mode
              </span>
            )}
          </div>
          <p className="text-gray-600">
            {isVeteran 
              ? "Track your pitch performance and manage your profile"
              : "Preview of the veteran dashboard experience"
            }
          </p>
        </div>

        {/* Role Notice for Non-Veterans */}
        {!isVeteran && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Preview Mode
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    You're currently viewing the Veteran Dashboard as a {profile?.role as string}. 
                    To access full functionality, you can change your role in your profile settings.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pitch Status Widget - Only show for veterans */}
        {isVeteran && metrics?.pitch && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">My Pitch Status</h2>
              <div className="flex items-center gap-2">
                {metrics.pitch.is_active ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Inactive
                  </span>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">{metrics.pitch.title}</h3>
                <p className="text-sm text-gray-600">Plan: {metrics.pitch.plan_tier}</p>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Expires in</p>
                  <p className={`text-lg font-semibold ${(daysUntilExpiry || 0) <= 7 ? 'text-red-600' : (daysUntilExpiry || 0) <= 30 ? 'text-yellow-600' : 'text-green-600'}`}>
                    {daysUntilExpiry || 0} days
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Total Views</p>
                  <p className="text-lg font-semibold text-gray-900">{(metrics.pitch as any)?.views || 0}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Demo Content for Non-Veterans */}
        {!isVeteran && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Veteran Dashboard Preview</h2>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Demo
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Sample Pitch Title</h3>
                <p className="text-sm text-gray-600">Plan: Premium</p>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Expires in</p>
                  <p className="text-lg font-semibold text-green-600">45 days</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Total Views</p>
                  <p className="text-lg font-semibold text-gray-900">127</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rest of the dashboard content - Only show for veterans */}
        {isVeteran && (
          <>
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Endorsements</h3>
                <p className="text-sm text-gray-600">Total: {metrics?.endorsements?.total || 0}</p>
                <p className="text-sm text-gray-600">Recent: {metrics?.endorsements?.recent?.length || 0}</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Resume Requests</h3>
                <p className="text-sm text-gray-600">Total: {metrics?.resumeRequests?.length || 0}</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Invoices</h3>
                <p className="text-sm text-gray-600">Total: {invoices?.length || 0}</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Pitch Views</h3>
                <p className="text-sm text-gray-600">Total: {(metrics?.pitch as any)?.views || 0}</p>
              </div>
            </div>

            {/* Performance Insights & Goal Prompts */}
            {analytics?.performanceInsights && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Performance Insights & Goals</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Performance Insights */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-amber-500" />
                      Smart Suggestions
                    </h3>
                    <div className="space-y-2">
                      {((analytics?.performanceInsights as any)?.suggestions || []).map((suggestion: any, index: number) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-sm text-gray-700">{suggestion}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Goal Prompts */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <Target className="w-5 h-5 text-green-500" />
                      Goal Setting
                    </h3>
                    <div className="space-y-3">
                      {(analytics?.performanceInsights as any)?.lowViews && (
                        <div className="bg-white rounded-lg p-3 border-l-4 border-blue-500">
                          <p className="text-sm font-medium text-gray-900">Increase Visibility</p>
                          <p className="text-xs text-gray-600">Target: 50+ views this month</p>
                        </div>
                      )}
                      {(analytics?.performanceInsights as any)?.lowConversions && (
                        <div className="bg-white rounded-lg p-3 border-l-4 border-green-500">
                          <p className="text-sm font-medium text-gray-900">Improve Conversion</p>
                          <p className="text-xs text-gray-600">Target: 10%+ conversion rate</p>
                        </div>
                      )}
                      {!(analytics?.performanceInsights as any)?.lowViews && !(analytics?.performanceInsights as any)?.lowConversions && (
                        <div className="bg-white rounded-lg p-3 border-l-4 border-purple-500">
                          <p className="text-sm font-medium text-gray-900">Maintain Momentum</p>
                          <p className="text-xs text-gray-600">Keep engaging your network</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <a
                href={metrics?.pitch?.id ? `/pitch/${metrics.pitch.id}/edit` : '/pitch/new'}
                className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Edit Pitch</div>
                  <div className="text-sm text-gray-600">Update your profile</div>
                </div>
              </a>

              <button
                onClick={() => {
                  if (!user) return
                  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/browse?ref=${user.id}`
                  navigator.clipboard.writeText(url)
                  alert('Invite link copied to clipboard!')
                }}
                className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Share2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Invite Supporters</div>
                  <div className="text-sm text-gray-600">Share your pitch</div>
                </div>
              </button>

              <a
                href="/pricing"
                className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Renew Plan</div>
                  <div className="text-sm text-gray-600">Extend visibility</div>
                </div>
              </a>
            </div>

            {/* Analytics Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Analytics & Performance</h2>
                <RefreshButton 
                  userId={user?.id || ''}
                  role="veteran"
                  path="/dashboard/veteran"
                />
              </div>
              
              {/* Goal Prompts & Performance Tips */}
              <div className="border rounded p-4 bg-amber-50 mb-6">
                <h3 className="font-semibold mb-2">Improve your pitch</h3>
                {(() => {
                  // derive simple conversion from trend
                  const views = trendlineData?.find((s: any) => s.label === 'pitch_viewed')?.points.reduce((a: any, p: any) => a + p.value, 0) ?? 0;
                  const calls = trendlineData?.find((s: any) => s.label === 'recruiter_called')?.points.reduce((a: any, p: any) => a + p.value, 0) ?? 0;
                  const emails = trendlineData?.find((s: any) => s.label === 'recruiter_emailed')?.points.reduce((a: any, p: any) => a + p.value, 0) ?? 0;
                  const conv = views ? calls / views : 0;
                  
                  return (
                    <>
                      {views > 30 && conv < 0.10 ? (
                        <ul className="list-disc ml-5 text-sm">
                          <li>Tighten your title with a metric (e.g., "Saved ₹3Cr / yr").</li>
                          <li>Front-load outcomes in the first 120 characters.</li>
                          <li>Reorder skills so the most hireable skill is first.</li>
                        </ul>
                      ) : (
                        <p className="text-sm">Great momentum. Keep sharing your pitch with supporters.</p>
                      )}
                      {calls > 0 && emails === 0 && (
                        <p className="mt-2 text-sm">Tip: Add a clear email CTA in your pitch for off-hours outreach.</p>
                      )}
                      <p className="mt-2 text-xs text-gray-600">Avg time to first contact (last 30d): {avgTimeData?.hours || 0} hrs</p>
                    </>
                  );
                })()}
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Performance Insights */}
                <PerformanceInsights 
                  insights={analytics?.performanceInsights as any || { suggestions: [], lowViews: [], lowConversions: [] }}
                  comparativeMetrics={analytics?.comparativeMetrics as any || []}
                />
                
                {/* Trendline Chart */}
                <TrendlineChart series={trendlineData || []} />
              </div>
              
              {/* Cohort Analysis */}
              <div className="mb-8">
                <CohortTable rows={cohortData || []} />
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Recent Endorsements */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Endorsements</h3>
                {(metrics?.endorsements?.recent?.length || 0) > 0 ? (
                  <div className="space-y-4">
                    {metrics?.endorsements?.recent?.map((endorsement: any) => (
                      <div key={endorsement.id} className="border-l-4 border-blue-500 pl-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-gray-900">{endorsement.endorser_name}</span>
                          <span className="text-sm text-gray-500">
                            {new Date(endorsement.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{endorsement.message}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No endorsements yet</p>
                )}
              </div>

              {/* Resume Requests */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Resume Requests</h3>
                {(metrics?.resumeRequests?.length || 0) > 0 ? (
                  <div className="space-y-4">
                    {metrics?.resumeRequests?.slice(0, 5).map((request: any) => (
                      <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{request.recruiter_name}</p>
                          <p className="text-sm text-gray-600">{request.message}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          request.status === 'approved' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {request.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No resume requests yet</p>
                )}
              </div>
            </div>

            {/* Recent Invoices */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Invoices</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Invoice Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Plan
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {invoices && invoices.length > 0 ? (
                      invoices.map((invoice) => (
                        <tr key={invoice.id as string} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {invoice.invoice_number}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(invoice.created_at as string).toLocaleDateString('en-IN')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            Basic Plan
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ₹{((invoice.amount_cents) / 100).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <a
                              href={`/api/docs/invoice/${invoice.id}`}
                              className="text-blue-600 hover:text-blue-900 font-medium"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Download
                            </a>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                          No invoices found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Call to Action for Non-Veterans */}
        {!isVeteran && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <h3 className="text-lg font-medium text-blue-900 mb-2">
              Want to experience the full Veteran Dashboard?
            </h3>
            <p className="text-blue-700 mb-4">
              Change your role to "Veteran" in your profile settings to access all features.
            </p>
            <button
              onClick={() => window.location.href = '/role-selection'}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Change Role
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
