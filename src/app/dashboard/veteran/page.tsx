import { Suspense } from 'react'
import { getServerSupabase } from '@/lib/supabaseClient'
import { redirect } from 'next/navigation'
import { Shield, Calendar, Users, Eye, Phone, Mail, FileText, Share2, RefreshCw } from 'lucide-react'
import DashboardCards from '@/components/DashboardCards'
import { getVeteranMetrics } from '@/lib/metrics'

export default async function VeteranDashboard() {
  const supabase = getServerSupabase()
  
  // Check authentication and role
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/login?redirect=/dashboard/veteran')
  }

  const { data: profile } = await supabase
    .from('profiles')
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
    .limit(10)

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
        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardCards metrics={metrics} />
        </Suspense>

        {/* Invoices Table */}
        <div className="mt-8">
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
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  )
}
