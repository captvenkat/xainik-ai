import { Suspense } from 'react'
import { getServerSupabase } from '@/lib/supabaseClient'
import { redirect } from 'next/navigation'
import { Heart, Share2, Star, TrendingUp, Eye, Phone, Mail } from 'lucide-react'
import DashboardCards from '@/components/DashboardCards'
import { getSupporterMetrics } from '@/lib/metrics'

export default async function SupporterDashboard() {
  const supabase = getServerSupabase()
  
  // Check authentication and role
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/login?redirect=/dashboard/supporter')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'supporter') {
    redirect('/dashboard')
  }

  // Fetch supporter metrics
  const metrics = await getSupporterMetrics(user.id)

  // Fetch donation receipts
  const { data: receipts } = await supabase
    .from('receipts')
    .select('id, number, amount, is_anonymous, created_at')
    .eq('donor_email', user.email)
    .order('created_at', { ascending: false })
    .limit(10)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-8 h-8 text-red-600" />
            <h1 className="text-3xl font-bold text-gray-900">Supporter Dashboard</h1>
          </div>
          <p className="text-gray-600">Track your impact and help veterans find opportunities</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <a
            href="/browse"
            className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Eye className="w-5 h-5 text-blue-600" />
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
              <div className="font-medium text-gray-900">Share Veterans</div>
              <div className="text-sm text-gray-600">Create referral links</div>
            </div>
          </a>

          <button
            onClick={() => {
              // TODO: Implement endorse functionality
              alert('Endorse functionality coming soon!')
            }}
            className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">Endorse Veterans</div>
              <div className="text-sm text-gray-600">Show your support</div>
            </div>
          </button>
        </div>

        {/* Dashboard Widgets */}
        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardCards metrics={metrics} role="supporter" />
        </Suspense>

        {/* Donation Receipts Table */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Donation Receipts</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Receipt Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {receipts && receipts.length > 0 ? (
                    receipts.map((receipt) => (
                      <tr key={receipt.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {receipt.number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(receipt.created_at).toLocaleDateString('en-IN')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ₹{(receipt.amount / 100).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            receipt.is_anonymous 
                              ? 'bg-gray-100 text-gray-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {receipt.is_anonymous ? 'Anonymous' : 'Named'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <a
                            href={`/api/docs/receipt/${receipt.id}`}
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
                        No donation receipts found
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
      {Array.from({ length: 3 }).map((_, i) => (
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
