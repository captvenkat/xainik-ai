import { Suspense } from 'react'
import { getServerSupabase } from '@/lib/supabaseClient'
import { redirect } from 'next/navigation'
import { Users, Phone, Mail, FileText, Star, Filter, Plus } from 'lucide-react'
import DashboardCards from '@/components/DashboardCards'
import { getRecruiterMetrics } from '@/lib/metrics'

export default async function RecruiterDashboard() {
  const supabase = getServerSupabase()
  
  // Check authentication and role
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/login?redirect=/dashboard/recruiter')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'recruiter') {
    redirect('/dashboard')
  }

  // Fetch recruiter metrics
  const metrics = await getRecruiterMetrics(user.id)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-8 h-8 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-900">Recruiter Dashboard</h1>
          </div>
          <p className="text-gray-600">Manage your shortlisted veterans and track interactions</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <a
            href="/browse"
            className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Filter className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">Browse Veterans</div>
              <div className="text-sm text-gray-600">Find new talent</div>
            </div>
          </a>

          <a
            href="/shortlist"
            className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">View Shortlist</div>
              <div className="text-sm text-gray-600">Manage saved veterans</div>
            </div>
          </a>

          <a
            href="/browse"
            className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Plus className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">Browse Veterans</div>
              <div className="text-sm text-gray-600">Find new talent</div>
            </div>
          </a>
        </div>

        {/* Dashboard Widgets */}
        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardCards metrics={metrics} role="recruiter" />
        </Suspense>
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
