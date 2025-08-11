import { createSupabaseServerOnly } from '@/lib/supabaseServerOnly'
import { redirect } from 'next/navigation'
import { Shield, Calendar, Users, Eye, Phone, Mail, FileText, Share2, RefreshCw, TrendingUp, Award, Clock, AlertTriangle, Target, Lightbulb } from 'lucide-react'
import { getVeteranMetrics, getVeteranAnalytics, getTrendlineAllPitches, getCohortsBySource, getAvgTimeToFirstContact } from '@/lib/metrics'
import { getCachedVeteranAnalytics } from '@/lib/actions/analytics'
import ReferralFunnel from '@/components/ReferralFunnel'
import PlatformBreakdown from '@/components/PlatformBreakdown'
import TrendlineChart from '@/components/Trendline'
import CohortTable from '@/components/CohortTable'
import PerformanceInsights from '@/components/PerformanceInsights'
import RefreshButton from '@/components/RefreshButton'
import PitchImprovementTips from '@/components/PitchImprovementTips'

export default async function VeteranDashboard() {
  const supabase = createSupabaseServerOnly()
  
  // Check authentication and role
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/auth?redirect=/dashboard/veteran')
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'veteran') {
    redirect('/dashboard')
  }

  // Fetch veteran metrics and analytics (using cached analytics)
  const [metrics, analytics] = await Promise.all([
    getVeteranMetrics(user.id),
    getCachedVeteranAnalytics(user.id)
  ])

  // Fetch additional data for new components
  const [trendlineData, cohortData, avgTimeData] = await Promise.all([
    getTrendlineAllPitches({ window: 30 }),
    getCohortsBySource({ window: 30 }),
    getAvgTimeToFirstContact({ window: 30 })
  ])

  // Fetch invoices
  const { data: invoices } = await supabase
    .from('invoices')
    .select('id, number, amount, plan_tier, plan_meta, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  // Calculate days until expiry
  const daysUntilExpiry = metrics.pitch?.plan_expires_at 
    ? Math.ceil((new Date(metrics.pitch.plan_expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Veteran Dashboard</h1>
          </div>
          <p className="text-gray-600">Track your pitch performance and manage your profile</p>
        </div>

        {/* Pitch Status Widget */}
        {metrics.pitch && (
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
                  {daysUntilExpiry !== null ? (
                    <p className={`text-lg font-semibold ${daysUntilExpiry <= 7 ? 'text-red-600' : daysUntilExpiry <= 30 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {daysUntilExpiry} days
                    </p>
                  ) : (
                    <p className="text-lg font-semibold text-gray-600">No expiry</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Endorsements</p>
                  <p className="text-lg font-semibold text-blue-600">{metrics.endorsements.total}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Performance Insights & Goal Prompts */}
        {analytics.performanceInsights && (
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
                  {analytics.performanceInsights.suggestions.map((suggestion: string, index: number) => (
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
                  {analytics.performanceInsights.lowViews && (
                    <div className="bg-white rounded-lg p-3 border-l-4 border-blue-500">
                      <p className="text-sm font-medium text-gray-900">Increase Visibility</p>
                      <p className="text-xs text-gray-600">Target: 50+ views this month</p>
                    </div>
                  )}
                  {analytics.performanceInsights.lowConversions && (
                    <div className="bg-white rounded-lg p-3 border-l-4 border-green-500">
                      <p className="text-sm font-medium text-gray-900">Improve Conversion</p>
                      <p className="text-xs text-gray-600">Target: 10%+ conversion rate</p>
                    </div>
                  )}
                  {!analytics.performanceInsights.lowViews && !analytics.performanceInsights.lowConversions && (
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
            href={metrics.pitch?.id ? `/pitch/${metrics.pitch.id}/edit` : '/pitch/new'}
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
              userId={user.id}
              role="veteran"
              path="/dashboard/veteran"
            />
          </div>
          
          {/* Goal Prompts & Performance Tips */}
          <div className="border rounded p-4 bg-amber-50 mb-6">
            <h3 className="font-semibold mb-2">Improve your pitch</h3>
            {(() => {
              // derive simple conversion from trend
              const views = trendlineData.find(s => s.label === 'pitch_viewed')?.points.reduce((a, p) => a + p.value, 0) ?? 0;
              const calls = trendlineData.find(s => s.label === 'recruiter_called')?.points.reduce((a, p) => a + p.value, 0) ?? 0;
              const emails = trendlineData.find(s => s.label === 'recruiter_emailed')?.points.reduce((a, p) => a + p.value, 0) ?? 0;
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
                  <p className="mt-2 text-xs text-gray-600">Avg time to first contact (last 30d): {avgTimeData.hours} hrs</p>
                </>
              );
            })()}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Performance Insights */}
            <PerformanceInsights 
              insights={analytics.performanceInsights}
              comparativeMetrics={analytics.comparativeMetrics}
            />
            
            {/* Trendline Chart */}
            <TrendlineChart series={trendlineData} />
          </div>
          
          {/* Cohort Analysis */}
          <div className="mb-8">
            <CohortTable rows={cohortData} />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Endorsements */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Endorsements</h3>
            {metrics.endorsements.recent.length > 0 ? (
              <div className="space-y-4">
                {metrics.endorsements.recent.map((endorsement) => (
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
            {metrics.resumeRequests.length > 0 ? (
              <div className="space-y-4">
                {metrics.resumeRequests.slice(0, 5).map((request) => (
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
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {invoice.number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(invoice.created_at).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {invoice.plan_tier}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ₹{(invoice.amount / 100).toFixed(2)}
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
      </div>
    </div>
  )
}
