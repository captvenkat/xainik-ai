import { createSupabaseServerOnly } from '@/lib/supabaseServerOnly'
import { redirect } from 'next/navigation'
import { 
  Users, 
  FileText, 
  Heart, 
  TrendingUp, 
  Activity,
  Shield,
  AlertTriangle,
  Download,
  Eye,
  Calendar
} from 'lucide-react'
import Link from 'next/link'
import type { Database } from '@/types/supabase'

type User = Database['public']['Tables']['users']['Row']
type Pitch = Database['public']['Tables']['pitches']['Row']
type Endorsement = Database['public']['Tables']['endorsements']['Row']
type Receipt = Database['public']['Tables']['receipts']['Row']
type ResumeRequest = Database['public']['Tables']['resume_requests']['Row']
type ActivityLog = Database['public']['Tables']['activity_log']['Row']

// Server component for Users tab
async function UsersTab() {
  const supabase = createSupabaseServerOnly()
  
  const { data: users } = await supabase
    .from('users')
    .select('id, email, role, created_at')
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Users ({users?.length || 0})</h3>
        <Link 
          href="/api/admin/export/users.csv"
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users?.map((user: Pick<User, 'id' | 'email' | 'role' | 'created_at'>, index: number) => (
                <tr key={`user-${index}-${user?.id || 'unknown'}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {typeof user?.id === 'string' ? user.id.substring(0, 8) + '...' : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user?.email || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user?.role === 'admin' ? 'bg-red-100 text-red-800' :
                      user?.role === 'veteran' ? 'bg-blue-100 text-blue-800' :
                      user?.role === 'recruiter' ? 'bg-green-100 text-green-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {user?.role || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// Server component for Pitches tab
async function PitchesTab() {
  const supabase = createSupabaseServerOnly()
  
  const { data: pitches } = await supabase
    .from('pitches')
    .select('id, title, plan_tier, created_at')
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Pitches ({pitches?.length || 0})</h3>
        <Link 
          href="/api/admin/export/pitches.csv"
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pitch ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan Tier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pitches?.map((pitch: Pick<Pitch, 'id' | 'title' | 'plan_tier' | 'created_at'>, index: number) => (
                <tr key={`pitch-${index}-${pitch?.id || 'unknown'}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {typeof pitch?.id === 'string' ? pitch.id.substring(0, 8) + '...' : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{pitch?.title || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      pitch?.plan_tier ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {pitch?.plan_tier || 'Free'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {pitch?.created_at ? new Date(pitch.created_at).toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// Server component for Endorsements tab
async function EndorsementsTab() {
  const supabase = createSupabaseServerOnly()
  
  const { data: endorsements } = await supabase
    .from('endorsements')
    .select('id, text, created_at')
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Endorsements ({endorsements?.length || 0})</h3>
        <Link 
          href="/api/admin/export/endorsements.csv"
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Endorsement ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Text</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {endorsements?.map((endorsement: Pick<Endorsement, 'id' | 'text' | 'created_at'>, index: number) => (
                <tr key={`endorsement-${index}-${endorsement?.id || 'unknown'}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {typeof endorsement?.id === 'string' ? endorsement.id.substring(0, 8) + '...' : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {endorsement?.text || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {endorsement?.created_at ? new Date(endorsement.created_at).toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// Server component for Donations tab
async function DonationsTab() {
  const supabase = createSupabaseServerOnly()
  
  const { data: donations } = await supabase
    .from('receipts')
    .select('id, amount_paise, donor_name, donor_email, anonymous, created_at')
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Donations ({donations?.length || 0})</h3>
        <Link 
          href="/api/admin/export/donations.csv"
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Donor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Anonymous</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {donations?.map((donation: Pick<Receipt, 'id' | 'amount_paise' | 'donor_name' | 'donor_email' | 'anonymous' | 'created_at'>, index: number) => (
                <tr key={`donation-${index}-${donation?.id || 'unknown'}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {donation?.anonymous ? 'Anonymous' : donation?.donor_name || 'N/A'}
                      </div>
                      {!donation?.anonymous && (
                        <div className="text-sm text-gray-500">{donation?.donor_email || 'N/A'}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                    ₹{donation?.amount_paise ? (donation.amount_paise / 100).toFixed(2) : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      donation?.anonymous ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {donation?.anonymous ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {donation?.created_at ? new Date(donation.created_at).toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// Server component for Resume Requests tab
async function ResumeRequestsTab() {
  const supabase = createSupabaseServerOnly()
  
  const { data: requests } = await supabase
    .from('resume_requests')
    .select('id, recruiter_id, pitch_id, status, created_at')
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Resume Requests ({requests?.length || 0})</h3>
        <Link 
          href="/api/admin/export/resume-requests.csv"
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recruiter ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pitch ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests?.map((request: Pick<ResumeRequest, 'id' | 'recruiter_id' | 'pitch_id' | 'status' | 'created_at'>, index: number) => (
                <tr key={`request-${index}-${request?.id || 'unknown'}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {typeof request?.id === 'string' ? request.id.substring(0, 8) + '...' : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {typeof request?.recruiter_id === 'string' ? request.recruiter_id.substring(0, 8) + '...' : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {typeof request?.pitch_id === 'string' ? request.pitch_id.substring(0, 8) + '...' : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      request?.status === 'approved' ? 'bg-green-100 text-green-800' :
                      request?.status === 'declined' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {request?.status || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {request?.created_at ? new Date(request.created_at).toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// Server component for Activity tab
async function ActivityTab() {
  const supabase = createSupabaseServerOnly()
  
  const { data: activities } = await supabase
    .from('activity_log')
    .select('id, event_type, event_data, created_at')
    .order('created_at', { ascending: false })
    .limit(50)

  const getActivityDescription = (event: { event_type: string; event_data: unknown }) => {
    try {
      if (typeof event.event_data === 'object' && event.event_data !== null) {
        const data = event.event_data as Record<string, unknown>
        if (data.description) return String(data.description)
        if (data.message) return String(data.message)
        if (data.text) return String(data.text)
      }
      return event.event_type
    } catch {
      return event.event_type
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Activity Log ({activities?.length || 0})</h3>
        <Link 
          href="/api/admin/export/activity.csv"
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {activities?.map((activity: Pick<ActivityLog, 'id' | 'event_type' | 'event_data' | 'created_at'>, index: number) => (
                <tr key={`activity-${index}-${activity?.id || 'unknown'}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {typeof activity?.id === 'string' ? activity.id.substring(0, 8) + '...' : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{activity?.event_type || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {getActivityDescription(activity)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {activity?.created_at ? new Date(activity.created_at).toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// Server component for Suspicious Activity tab
async function SuspiciousActivityTab() {
  const supabase = createSupabaseServerOnly()
  
  // Get recent activity to analyze for suspicious patterns
  const { data: recentActivity } = await supabase
    .from('activity_log')
    .select('event_type, created_at')
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
    .order('created_at', { ascending: false })

  // Analyze activity patterns
  const eventsInWindow = recentActivity || []
  const eventCounts = eventsInWindow.reduce((acc, event) => {
    acc[event.event_type] = (acc[event.event_type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Define suspicious patterns
  const suspiciousPatterns = [
    {
      name: 'High Login Attempts',
      description: 'Multiple login attempts in short time',
      severity: 'medium',
      count: eventCounts['auth.login'] || 0,
      threshold: 10
    },
    {
      name: 'Multiple Failed Payments',
      description: 'Multiple failed payment attempts',
      severity: 'high',
      count: eventCounts['payment.failed'] || 0,
      threshold: 5
    },
    {
      name: 'Bulk Data Access',
      description: 'Multiple data export requests',
      severity: 'medium',
      count: eventCounts['data.export'] || 0,
      threshold: 20
    }
  ]

  const flags = suspiciousPatterns.filter(pattern => pattern.count > pattern.threshold)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Suspicious Activity Monitoring</h3>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-500">Last 24 hours</span>
        </div>
      </div>

      {/* Activity Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Events</p>
              <p className="text-2xl font-bold text-gray-900">{eventsInWindow.length}</p>
            </div>
            <Activity className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Event Types</p>
              <p className="text-2xl font-bold text-gray-900">{Object.keys(eventCounts).length}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Flags Raised</p>
              <p className="text-2xl font-bold text-red-600">{flags.length}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Event Type Breakdown */}
      <div className="bg-white rounded-lg shadow p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Event Type Breakdown</h4>
        <div className="space-y-3">
          {Object.entries(eventCounts).map(([eventType, count]) => (
            <div key={eventType} className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">{eventType}</span>
              <span className="text-sm text-gray-500">{count} events</span>
            </div>
          ))}
        </div>
      </div>

      {/* Suspicious Activity Flags */}
      {flags.length > 0 ? (
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="text-lg font-medium text-red-900 mb-4">⚠️ Suspicious Activity Detected</h4>
          <div className="space-y-4">
            {flags.map((flag, index) => (
              <div key={index} className="border-l-4 border-red-500 pl-4 py-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium text-red-900">{flag.name}</h5>
                    <p className="text-sm text-red-700">{flag.description}</p>
                    <p className="text-xs text-red-600">
                      {flag.count} events (threshold: {flag.threshold})
                    </p>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    flag.severity === 'high' ? 'bg-red-100 text-red-800' :
                    flag.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {flag.severity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center">
            <Shield className="h-6 w-6 text-green-600 mr-2" />
            <div>
              <h4 className="text-lg font-medium text-green-900">All Clear</h4>
              <p className="text-green-700">No suspicious activity detected in the last 24 hours.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default async function AdminPage({
  searchParams
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const supabase = createSupabaseServerOnly()
  
  // Check if user is authenticated and has admin role
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    redirect('/auth')
  }

  // Check if user has admin role
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    redirect('/dashboard')
  }

  const resolvedSearchParams = await searchParams
  const activeTab = resolvedSearchParams.tab || 'users'

  const tabs = [
    { id: 'users', label: 'Users', icon: Users, component: UsersTab },
    { id: 'pitches', label: 'Pitches', icon: FileText, component: PitchesTab },
    { id: 'endorsements', label: 'Endorsements', icon: Heart, component: EndorsementsTab },
    { id: 'donations', label: 'Donations', icon: TrendingUp, component: DonationsTab },
    { id: 'resume-requests', label: 'Resume Requests', icon: FileText, component: ResumeRequestsTab },
    { id: 'activity', label: 'Activity Log', icon: Activity, component: ActivityTab },
    { id: 'suspicious', label: 'Suspicious Activity', icon: Shield, component: SuspiciousActivityTab }
  ]

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || UsersTab

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">Monitor and manage platform activity</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8 border-b border-gray-200">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <Link
                  key={tab.id}
                  href={`/admin?tab=${tab.id}`}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <ActiveComponent />
          </div>
        </div>
      </div>
    </div>
  )
}
