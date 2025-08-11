import { createSupabaseServerOnly } from '@/lib/supabaseServerOnly'
import { redirect } from 'next/navigation'
import { Briefcase, Users, Phone, Mail, FileText, TrendingUp, Eye, Calendar, Plus, Download, Filter, BarChart3, Save } from 'lucide-react'
import { getRecruiterMetrics, getRecruiterAnalytics } from '@/lib/metrics'
import BarChart from '@/components/charts/BarChart'
import PieChart from '@/components/charts/PieChart'
import LineChart from '@/components/charts/LineChart'
import SavedFiltersClient from '@/components/SavedFiltersClient'

export default async function RecruiterDashboard() {
  const supabase = createSupabaseServerOnly()
  
  // Check authentication and role
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/auth?redirect=/dashboard/recruiter')
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'recruiter') {
    redirect('/dashboard')
  }

  // Fetch recruiter metrics, analytics, and saved filters
  const [metrics, analytics, savedFilters] = await Promise.all([
    getRecruiterMetrics(user.id),
    getRecruiterAnalytics(user.id),
    // Fetch saved filters
    (async () => {
      const { data: filters, error } = await supabase
        .from('recruiter_saved_filters')
        .select('id, name, filters, created_at')
        .eq('recruiter_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching saved filters:', error);
        return [];
      }
      return filters || [];
    })()
  ])

  // Calculate summary stats
  const totalShortlisted = metrics.shortlisted.length
  const totalContacted = metrics.contacted.length
  const pendingResumeRequests = metrics.resumeRequests.filter(r => r.status === 'pending').length
  const totalNotes = metrics.notes.length

  // Prepare chart data
  const contactTypeData = [
    { label: 'Calls', value: metrics.contacted.filter(c => c.type === 'call').length, color: '#10B981' },
    { label: 'Emails', value: metrics.contacted.filter(c => c.type === 'email').length, color: '#3B82F6' }
  ]

  const resumeRequestStatusData = [
    { label: 'Pending', value: metrics.resumeRequests.filter(r => r.status === 'pending').length, color: '#F59E0B' },
    { label: 'Approved', value: metrics.resumeRequests.filter(r => r.status === 'approved').length, color: '#10B981' },
    { label: 'Declined', value: metrics.resumeRequests.filter(r => r.status === 'declined').length, color: '#EF4444' }
  ]



  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Briefcase className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Recruiter Dashboard</h1>
          </div>
          <p className="text-gray-600">Track your candidate pipeline and manage connections</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Shortlisted</p>
                <p className="text-2xl font-bold text-gray-900">{totalShortlisted}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Phone className="w-5 h-5 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Contacted</p>
                <p className="text-2xl font-bold text-gray-900">{totalContacted}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                <p className="text-2xl font-bold text-gray-900">{pendingResumeRequests}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Notes</p>
                <p className="text-2xl font-bold text-gray-900">{totalNotes}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Saved Filters & CSV Download */}
        <SavedFiltersClient initialFilters={savedFilters} />

        {/* Quick Actions & Reports */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <a
            href="/browse"
            className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Eye className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">Browse Veterans</div>
              <div className="text-sm text-gray-600">Find new candidates</div>
            </div>
          </a>

          <a
            href="/shortlist"
            className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">View Shortlist</div>
              <div className="text-sm text-gray-600">Manage candidates</div>
            </div>
          </a>

          <a
            href="/api/admin/export/pitches.csv"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Download className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">Export Pitches</div>
              <div className="text-sm text-gray-600">Download CSV</div>
            </div>
          </a>

          <a
            href="/api/admin/export/activity.csv"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">Activity Report</div>
              <div className="text-sm text-gray-600">Download CSV</div>
            </div>
          </a>
        </div>

        {/* Performance Trends */}
        {analytics.activityTrend && analytics.activityTrend.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Activity Trends (Last 30 Days)</h2>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-gray-600">Daily Activity</span>
              </div>
            </div>
            <LineChart
              data={analytics.activityTrend.map(item => ({
                label: item.label,
                value: item.value
              }))}
              height={300}
              color="#3B82F6"
            />
          </div>
        )}

        {/* Dashboard Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Contact Type Distribution */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Type Distribution</h3>
            <PieChart
              data={contactTypeData}
              size={300}
            />
          </div>

          {/* Resume Request Status */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Resume Request Status</h3>
            <BarChart
              data={resumeRequestStatusData.map(item => ({
                label: item.label,
                value: item.value
              }))}
              height={300}
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Contacts */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Contacts</h3>
            {metrics.contacted.length > 0 ? (
              <div className="space-y-4">
                {metrics.contacted.slice(0, 5).map((contact) => (
                  <div key={contact.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{contact.veteran_name}</p>
                      <p className="text-sm text-gray-600">{contact.pitch_title}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        contact.type === 'call' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {contact.type}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(contact.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No recent contacts</p>
            )}
          </div>

          {/* Recent Notes */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Notes</h3>
            {metrics.notes.length > 0 ? (
              <div className="space-y-4">
                {metrics.notes.slice(0, 5).map((note) => (
                  <div key={note.id} className="border-l-4 border-blue-500 pl-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-900">{note.veteran_name}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(note.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{note.text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No notes yet</p>
            )}
          </div>
        </div>

        {/* Shortlisted Candidates */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Shortlisted Candidates</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Candidate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pitch Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Skills
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {metrics.shortlisted.length > 0 ? (
                  metrics.shortlisted.map((candidate) => (
                    <tr key={candidate.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{candidate.veteran_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{candidate.title}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {candidate.skills.slice(0, 3).map((skill, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {skill}
                            </span>
                          ))}
                          {candidate.skills.length > 3 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              +{candidate.skills.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div>{candidate.phone}</div>
                          <div className="text-gray-500">{candidate.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <a
                            href={`tel:${candidate.phone}`}
                            className="text-green-600 hover:text-green-900"
                          >
                            <Phone className="w-4 h-4" />
                          </a>
                          <a
                            href={`mailto:${candidate.email}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Mail className="w-4 h-4" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                      No shortlisted candidates yet
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