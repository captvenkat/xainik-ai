import { getServerSupabase } from '@/lib/supabaseClient'
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

// Server component for Users tab
async function UsersTab() {
  const supabase = getServerSupabase()
  
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
              {users?.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.id.substring(0, 8)}...</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === 'admin' ? 'bg-red-100 text-red-800' :
                      user.role === 'veteran' ? 'bg-blue-100 text-blue-800' :
                      user.role === 'recruiter' ? 'bg-green-100 text-green-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {user.role || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
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
  const supabase = getServerSupabase()
  
  const { data: pitches } = await supabase
    .from('pitches')
    .select('id, title, is_active, plan_tier, plan_expires_at, veteran_id, created_at')
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pitch</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Veteran ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pitches?.map((pitch) => (
                <tr key={pitch.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{pitch.title}</div>
                      <div className="text-sm text-gray-500">ID: {pitch.id.substring(0, 8)}...</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {pitch.veteran_id?.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      pitch.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {pitch.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {pitch.plan_tier || 'None'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(pitch.created_at).toLocaleDateString()}
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
  const supabase = getServerSupabase()
  
  const { data: endorsements } = await supabase
    .from('endorsements')
    .select('id, veteran_id, endorser_id, created_at')
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Veteran ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Endorser ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {endorsements?.map((endorsement) => (
                <tr key={endorsement.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {endorsement.id.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {endorsement.veteran_id?.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {endorsement.endorser_id?.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(endorsement.created_at).toLocaleDateString()}
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
  const supabase = getServerSupabase()
  
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
              {donations?.map((donation) => (
                <tr key={donation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {donation.anonymous ? 'Anonymous' : donation.donor_name}
                      </div>
                      {!donation.anonymous && (
                        <div className="text-sm text-gray-500">{donation.donor_email}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                    ₹{(donation.amount_paise / 100).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      donation.anonymous ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {donation.anonymous ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(donation.created_at).toLocaleDateString()}
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
  const supabase = getServerSupabase()
  
  const { data: requests } = await supabase
    .from('resume_requests')
    .select('id, recruiter_id, veteran_id, pitch_id, status, created_at')
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Veteran ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pitch ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests?.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {request.id.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {request.recruiter_id?.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {request.veteran_id?.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {request.pitch_id?.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      request.status === 'approved' ? 'bg-green-100 text-green-800' :
                      request.status === 'declined' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(request.created_at).toLocaleDateString()}
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
  const supabase = getServerSupabase()
  
  const { data: activities } = await supabase
    .from('activity_log')
    .select('id, event_type, event_data, created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  const getActivityDescription = (event: { event_type: string; event_data: unknown }) => {
    const data = event.event_data as Record<string, any> || {}
    switch (event.event_type) {
      case 'veteran_joined':
        return `${data.veteran_name || 'A veteran'} joined the platform`
      case 'pitch_referred':
        return `${data.supporter_name || 'Someone'} referred ${data.veteran_name || 'a veteran'}`
      case 'recruiter_called':
        return `${data.recruiter_name || 'A recruiter'} called ${data.veteran_name || 'a veteran'}`
      case 'endorsement_added':
        return `${data.endorser_name || 'Someone'} endorsed ${data.veteran_name || 'a veteran'}`
      case 'like_added':
        return `Someone liked "${data.pitch_title || 'a pitch'}"`
      case 'donation_received':
        return `Received ₹${(data.amount || 0) / 100} donation`
      default:
        return event.event_type
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Activity Feed ({activities?.length || 0})</h3>
        <Link 
          href="/api/admin/export/activity.csv"
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-y-auto max-h-96">
          <div className="p-4 space-y-3">
            {activities?.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{getActivityDescription(activity)}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(activity.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Server component for Suspicious Activity tab
async function SuspiciousActivityTab() {
  const supabase = getServerSupabase()
  
  // Get activity data for analysis
  const { data: activities } = await supabase
    .from('activity_log')
    .select('id, event_type, event_data, created_at')
    .order('created_at', { ascending: false })
    .limit(1000)

  // Analyze for suspicious patterns
  const flags: any[] = []
  
  if (activities && activities.length > 0) {
    // Group activities by IP hash (if available in event_data)
    const ipActivity = new Map<string, { calls: number; emails: number; referrals: number; lastActivity: Date }>()
    
    activities.forEach(activity => {
      const data = activity.event_data as Record<string, any> || {}
      const ipHash = data.ip_hash || 'unknown'
      
      if (!ipActivity.has(ipHash)) {
        ipActivity.set(ipHash, { calls: 0, emails: 0, referrals: 0, lastActivity: new Date(activity.created_at) })
      }
      
      const ipData = ipActivity.get(ipHash)!
      
      switch (activity.event_type) {
        case 'recruiter_called':
          ipData.calls++
          break
        case 'email_sent':
          ipData.emails++
          break
        case 'pitch_referred':
          ipData.referrals++
          break
      }
      
      if (new Date(activity.created_at) > ipData.lastActivity) {
        ipData.lastActivity = new Date(activity.created_at)
      }
    })
    
    // Check for suspicious patterns
    ipActivity.forEach((data, ipHash) => {
      // Flag excessive calls (>10 in 24 hours)
      if (data.calls > 10) {
        flags.push({
          type: 'excessive_calls',
          severity: 'high',
          description: `IP ${ipHash.substring(0, 8)}... made ${data.calls} calls`,
          ipHash,
          count: data.calls,
          lastActivity: data.lastActivity
        })
      }
      
      // Flag excessive emails (>20 in 24 hours)
      if (data.emails > 20) {
        flags.push({
          type: 'excessive_emails',
          severity: 'medium',
          description: `IP ${ipHash.substring(0, 8)}... sent ${data.emails} emails`,
          ipHash,
          count: data.emails,
          lastActivity: data.lastActivity
        })
      }
      
      // Flag referral bursts (>50 referrals in 24 hours)
      if (data.referrals > 50) {
        flags.push({
          type: 'referral_burst',
          severity: 'high',
          description: `IP ${ipHash.substring(0, 8)}... made ${data.referrals} referrals`,
          ipHash,
          count: data.referrals,
          lastActivity: data.lastActivity
        })
      }
    })
    
    // Check for rapid-fire activity (multiple events in short time)
    const rapidFireThreshold = 5 // events per minute
    const timeWindow = 60 * 1000 // 1 minute in ms
    
    for (let i = 0; i < activities.length - rapidFireThreshold; i++) {
      const activity = activities[i]
      if (!activity) continue
      
      const currentTime = new Date(activity.created_at).getTime()
      const eventsInWindow = activities.slice(i, i + rapidFireThreshold + 1)
        .filter(event => {
          if (!event) return false
          const eventTime = new Date(event.created_at).getTime()
          return eventTime - currentTime <= timeWindow
        })
      
      if (eventsInWindow.length > rapidFireThreshold) {
        flags.push({
          type: 'rapid_fire',
          severity: 'medium',
          description: `${eventsInWindow.length} events in 1 minute`,
          eventTypes: eventsInWindow.map(e => e?.event_type || 'unknown'),
          timestamp: new Date(activity.created_at)
        })
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Suspicious Activity ({flags.length})</h3>
        <div className="flex gap-2">
          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">High: {flags.filter(f => f.severity === 'high').length}</span>
          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Medium: {flags.filter(f => f.severity === 'medium').length}</span>
        </div>
      </div>
      
      {flags.length === 0 ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <div className="text-green-600 font-medium">No suspicious activity detected</div>
          <div className="text-green-500 text-sm mt-1">All activity appears normal</div>
        </div>
      ) : (
        <div className="space-y-3">
          {flags.map((flag, index) => (
            <div key={index} className={`border rounded-lg p-4 ${
              flag.severity === 'high' ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className={`h-4 w-4 ${
                      flag.severity === 'high' ? 'text-red-600' : 'text-yellow-600'
                    }`} />
                    <span className={`text-sm font-medium ${
                      flag.severity === 'high' ? 'text-red-800' : 'text-yellow-800'
                    }`}>
                      {flag.type.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      flag.severity === 'high' ? 'bg-red-200 text-red-800' : 'bg-yellow-200 text-yellow-800'
                    }`}>
                      {flag.severity}
                    </span>
                  </div>
                  <p className={`text-sm ${
                    flag.severity === 'high' ? 'text-red-700' : 'text-yellow-700'
                  }`}>
                    {flag.description}
                  </p>
                  {flag.count && (
                    <p className="text-xs text-gray-600 mt-1">
                      Count: {flag.count} | Last Activity: {flag.lastActivity?.toLocaleString()}
                    </p>
                  )}
                  {flag.timestamp && (
                    <p className="text-xs text-gray-600 mt-1">
                      Detected: {flag.timestamp.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Main Admin Page Component
export default async function AdminPage({
  searchParams
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const supabase = getServerSupabase()
  
  // Check admin access
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth')
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/dashboard/veteran')
  }

  const params = await searchParams
  const currentTab = params.tab || 'users'
  const tabs = [
    { id: 'users', label: 'Users', icon: Users },
    { id: 'pitches', label: 'Pitches', icon: FileText },
    { id: 'endorsements', label: 'Endorsements', icon: Heart },
    { id: 'donations', label: 'Donations', icon: TrendingUp },
    { id: 'resume-requests', label: 'Resume Requests', icon: Eye },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'suspicious', label: 'Suspicious Activity', icon: AlertTriangle }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-8 h-8 text-red-600" />
            <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          </div>
          <p className="text-gray-600">Monitor platform activity and manage data</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = currentTab === tab.id
                return (
                  <Link
                    key={tab.id}
                    href={`/admin?tab=${tab.id}`}
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      isActive
                        ? 'border-red-500 text-red-600'
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
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {currentTab === 'users' && <UsersTab />}
          {currentTab === 'pitches' && <PitchesTab />}
          {currentTab === 'endorsements' && <EndorsementsTab />}
          {currentTab === 'donations' && <DonationsTab />}
          {currentTab === 'resume-requests' && <ResumeRequestsTab />}
          {currentTab === 'activity' && <ActivityTab />}
          {currentTab === 'suspicious' && <SuspiciousActivityTab />}
        </div>
      </div>
    </div>
  )
}
