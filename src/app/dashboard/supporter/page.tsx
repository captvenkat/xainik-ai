import { createSupabaseServerOnly } from '@/lib/supabaseServerOnly'
import { redirect } from 'next/navigation'
import { Heart, Share2, TrendingUp, Eye, Phone, Mail, Award, Users, BarChart3 } from 'lucide-react'
import { getSupporterMetrics } from '@/lib/metrics'
import BarChart from '@/components/charts/BarChart'
import PieChart from '@/components/charts/PieChart'
import LineChart from '@/components/charts/LineChart'

export default async function SupporterDashboard() {
  const supabase = createSupabaseServerOnly()
  
  // Check authentication and role
  const supabaseClient = await supabase
  const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
  if (authError || !user) {
    redirect('/auth?redirect=/dashboard/supporter')
  }

  const { data: profile } = await supabaseClient
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'supporter') {
    redirect('/auth?redirect=/dashboard/supporter')
  }

  // Fetch supporter metrics
  const metrics = await getSupporterMetrics(user.id)

  // Calculate summary stats
  const totalReferred = metrics.totalDonations || 0
  const totalViews = metrics.recentActivity?.length || 0
  const totalCalls = 0 // Not tracked in current schema
  const totalEmails = 0 // Not tracked in current schema
  const totalEndorsements = metrics.totalEndorsements || 0

  // Prepare chart data
  const platformData = [
    { label: 'Donations', value: metrics.totalDonations || 0, color: '#25D366' },
    { label: 'Endorsements', value: metrics.totalEndorsements || 0, color: '#0077B5' },
    { label: 'Activity', value: metrics.recentActivity?.length || 0, color: '#EA4335' }
  ]

  const conversionData = [
    { label: 'Donations', value: metrics.totalDonations || 0, color: '#3B82F6' },
    { label: 'Endorsements', value: metrics.totalEndorsements || 0, color: '#10B981' },
    { label: 'Activity', value: metrics.recentActivity?.length || 0, color: '#F59E0B' }
  ]

  // Generate weekly trend data (mock for now)
  const weeklyTrendData = [
    { label: 'Week 1', value: Math.floor((metrics.totalDonations || 0) * 0.2) },
    { label: 'Week 2', value: Math.floor((metrics.totalDonations || 0) * 0.3) },
    { label: 'Week 3', value: Math.floor((metrics.totalDonations || 0) * 0.25) },
    { label: 'Week 4', value: Math.floor((metrics.totalDonations || 0) * 0.25) }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-8 h-8 text-red-600" />
            <h1 className="text-3xl font-bold text-gray-900">Supporter Dashboard</h1>
          </div>
          <p className="text-gray-600">Track your impact and help veterans succeed</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Share2 className="w-5 h-5 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Referred</p>
                <p className="text-2xl font-bold text-gray-900">{totalReferred}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">{totalViews}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Conversions</p>
                <p className="text-2xl font-bold text-gray-900">{totalCalls + totalEmails}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Endorsements</p>
                <p className="text-2xl font-bold text-gray-900">{totalEndorsements}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <a
            href="/browse"
            className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">Browse Veterans</div>
              <div className="text-sm text-gray-600">Find veterans to support</div>
            </div>
          </a>

          <a
            href="/supporter/refer"
            className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Share2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">Create Referrals</div>
              <div className="text-sm text-gray-600">Share veteran pitches</div>
            </div>
          </a>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Platform Distribution */}
          <PieChart
            title="Traffic by Platform"
            data={platformData}
            size={200}
          />

          {/* Conversion Funnel */}
          <BarChart
            title="Conversion Funnel"
            data={conversionData}
            height={250}
          />
        </div>

        {/* Weekly Trend */}
        <div className="mb-8">
          <LineChart
            title="Weekly Activity Trend"
            data={weeklyTrendData}
            height={200}
            color="#8B5CF6"
          />
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Referred Pitches */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Referred Pitches</h3>
            {metrics.recentActivity && metrics.recentActivity.length > 0 ? (
              <div className="space-y-4">
                {metrics.recentActivity.slice(0, 5).map((pitch: any) => (
                  <div key={pitch.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{pitch.activity_type}</p>
                      <p className="text-sm text-gray-600">{pitch.created_at}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-blue-600">Activity</p>
                      <p className="text-xs text-gray-500">
                        {new Date(pitch.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No referred pitches yet</p>
            )}
          </div>

          {/* Recent Endorsements */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Endorsements</h3>
            {metrics.recentActivity && metrics.recentActivity.length > 0 ? (
              <div className="space-y-4">
                {metrics.recentActivity.slice(0, 5).map((endorsement: any) => (
                  <div key={endorsement.id} className="border-l-4 border-purple-500 pl-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-900">{endorsement.activity_type}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(endorsement.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{endorsement.created_at}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No endorsements yet</p>
            )}
          </div>
        </div>

        {/* Platform Performance */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Platform Performance</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Platform
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Views
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Calls
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Emails
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conversion Rate
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {platformData.map((platform: any, index: number) => {
                  const totalActions = platform.value
                  const conversionRate = platform.value > 0 ? (platform.value / 100) * 100 : 0
                  
                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-4 h-4 rounded-full mr-3" style={{ backgroundColor: platform.color }}></div>
                          <div className="text-sm font-medium text-gray-900">{platform.label}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{platform.value}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">0</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">0</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          conversionRate >= 10 ? 'bg-green-100 text-green-800' :
                          conversionRate >= 5 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {conversionRate.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Impact Summary */}
        <div className="mt-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
          <h3 className="text-xl font-semibold mb-4">Your Impact Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{totalReferred}</p>
              <p className="text-blue-100">Veterans Supported</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">{totalViews}</p>
              <p className="text-blue-100">Total Views Generated</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">{metrics.conversions.conversionRate.toFixed(1)}%</p>
              <p className="text-blue-100">Overall Conversion Rate</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
