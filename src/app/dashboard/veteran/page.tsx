import { Suspense } from 'react'
import { getServerSupabase } from '@/lib/supabaseClient'
import { redirect } from 'next/navigation'
import { Shield, Calendar, Users, Eye, Phone, Mail, FileText, Share2, RefreshCw, TrendingUp, Award, Clock, AlertTriangle } from 'lucide-react'
import { getVeteranMetrics } from '@/lib/metrics'
import BarChart from '@/components/charts/BarChart'
import PieChart from '@/components/charts/PieChart'
import LineChart from '@/components/charts/LineChart'

export default async function VeteranDashboard() {
  const supabase = getServerSupabase()
  
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

  // Fetch veteran metrics
  const metrics = await getVeteranMetrics(user.id)

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

        {/* Dashboard Widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Referral Funnel Chart */}
          <BarChart
            title="Referral Performance (Last 30 Days)"
            data={[
              { label: 'Opens', value: metrics.referrals.last30d.opens, color: '#3B82F6' },
              { label: 'Views', value: metrics.referrals.last30d.views, color: '#10B981' },
              { label: 'Calls', value: metrics.referrals.last30d.calls, color: '#F59E0B' },
              { label: 'Emails', value: metrics.referrals.last30d.emails, color: '#EF4444' }
            ]}
            height={250}
          />

          {/* Platform Distribution */}
          <PieChart
            title="Traffic by Platform"
            data={metrics.referrals.topPlatforms.map(p => ({
              label: p.platform,
              value: p.count
            }))}
            size={200}
          />
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
