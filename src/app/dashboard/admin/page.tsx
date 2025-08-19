'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowser } from '@/lib/supabaseBrowser'
import { 
  Users, 
  FileText, 
  Heart, 
  TrendingUp, 
  Activity,
  Shield,
  AlertTriangle,
  Download
} from 'lucide-react'
import Link from 'next/link'

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [recentUsers, setRecentUsers] = useState<any[]>([])
  const [recentPitches, setRecentPitches] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function checkAuthAndLoadData() {
      try {
        const supabase = createSupabaseBrowser()
        
        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
          router.push('/auth')
          return
        }
        
        setUser(user)
        
        // Check admin access
        const { data: profile } = await supabase
          .from('users')
          .select('role, name')
          .eq('id', user.id)
          .single()

        if (profile?.role !== 'admin') {
          router.push('/dashboard/veteran')
          return
        }
        
        setProfile(profile)
        
        // Fetch admin data
        await fetchAdminData()
        
      } catch (error) {
        console.error('Admin dashboard error:', error)
        setError('Failed to load dashboard data')
      } finally {
        setIsLoading(false)
      }
    }
    
    checkAuthAndLoadData()
  }, [router])

  async function fetchAdminData() {
    try {
      const supabase = createSupabaseBrowser()
      
      // Fetch admin data
      const [
        { count: totalUsers },
        { count: totalPitches },
        { count: totalEndorsements },
        { count: totalDonations },
        { count: resumeRequests },
        { count: suspiciousFlags }
      ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('pitches').select('*', { count: 'exact', head: true }),
        supabase.from('endorsements').select('*', { count: 'exact', head: true }),
        supabase.from('donations').select('*', { count: 'exact', head: true }),
        supabase.from('resume_requests').select('*', { count: 'exact', head: true }),
        // Note: user_activity_log table doesn't exist in live schema
        Promise.resolve({ count: 0, error: null })
      ])

      setStats({
        totalUsers: totalUsers || 0,
        totalPitches: totalPitches || 0,
        totalEndorsements: totalEndorsements || 0,
        totalDonations: totalDonations || 0,
        resumeRequests: resumeRequests || 0,
        suspiciousFlags: suspiciousFlags || 0
      })

      // Note: user_activity_log table doesn't exist in live schema
      const activity = null

      setRecentActivity(activity || [])

      // Fetch recent users
      const { data: users } = await supabase
        .from('users')
        .select('id, name, email, role, created_at')
        .order('created_at', { ascending: false })
        .limit(5)

      setRecentUsers(users || [])

      // Fetch recent pitches
      const { data: pitches } = await supabase
        .from('pitches')
        .select('id, title, user:users(name), created_at')
        .order('created_at', { ascending: false })
        .limit(5)

      setRecentPitches(pitches || [])
    } catch (error) {
      console.error('Failed to fetch admin data:', error)
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">Loading Admin Dashboard...</h2>
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-8 h-8 text-red-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome, {profile?.name || user?.email?.split('@')[0] || 'Admin'}!
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  {profile?.role || 'User'}
                </span>
              </div>
            </div>
          </div>
          <p className="text-gray-600">Monitor platform activity and manage users</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Pitches</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalPitches || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Heart className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Endorsements</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalEndorsements || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Donations</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalDonations || 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
                  <Activity className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentActivity?.map((activity) => (
                    <div key={activity.id as string} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{activity.activity_type}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(activity.created_at as string).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            {/* Admin Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Admin Actions</h3>
              <div className="space-y-3">
                <Link 
                  href="/api/admin/export/invoices.csv"
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Export Invoices
                </Link>
                <Link 
                  href="/api/admin/export/receipts.csv"
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Export Receipts
                </Link>
                <Link 
                  href="/api/cron/archive-payment-events"
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <Activity className="h-4 w-4" />
                  Archive Events
                </Link>
              </div>
            </div>

            {/* Alerts */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Alerts</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-orange-600">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm">{stats?.suspiciousFlags || 0} suspicious activities</span>
                </div>
                <div className="flex items-center gap-2 text-blue-600">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm">{stats?.resumeRequests || 0} pending resume requests</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Data */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Recent Users */}
          <div className="bg-white rounded-xl shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Recent Users</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentUsers?.map((user) => (
                  <div key={user.id as string} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{user.name || 'Anonymous'}</p>
                      <p className="text-sm text-gray-500">{user.email as string}</p>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(user.created_at as string).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Pitches */}
          <div className="bg-white rounded-xl shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Recent Pitches</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentPitches?.map((pitch) => (
                  <div key={pitch.id as string} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{pitch.title as string}</p>
                      <p className="text-sm text-gray-500">by {(pitch as any).user?.name || 'Unknown'}</p>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(pitch.created_at as string).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
