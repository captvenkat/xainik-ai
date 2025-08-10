import { getServerSupabase } from '@/lib/supabaseClient'
import { redirect } from 'next/navigation'
import { Briefcase, Users, Phone, Mail, FileText, TrendingUp, Eye, Calendar, Plus } from 'lucide-react'
import { getRecruiterMetrics } from '@/lib/metrics'
import BarChart from '@/components/charts/BarChart'
import PieChart from '@/components/charts/PieChart'
import LineChart from '@/components/charts/LineChart'

export default async function RecruiterDashboard() {
  const supabase = getServerSupabase()
  
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

  // Fetch recruiter metrics
  const metrics = await getRecruiterMetrics(user.id)

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
                <Eye className="w-5 h-5 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Notes</p>
                <p className="text-2xl font-bold text-gray-900">{totalNotes}</p>
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
              <Plus className="w-5 h-5 text-blue-600" />
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
              <div className="text-sm text-gray-600">Manage saved candidates</div>
            </div>
          </a>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Contact Type Distribution */}
          <PieChart
            title="Contact Type (Last 30 Days)"
            data={contactTypeData}
            size={200}
          />

          {/* Resume Request Status */}
          <BarChart
            title="Resume Request Status"
            data={resumeRequestStatusData}
            height={250}
          />
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
                      {contact.type === 'call' ? (
                        <Phone className="w-4 h-4 text-green-600" />
                      ) : (
                        <Mail className="w-4 h-4 text-blue-600" />
                      )}
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
                  <div key={note.id} className="border-l-4 border-purple-500 pl-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-900">{note.veteran_name}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(note.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{note.pitch_title}</p>
                    <p className="text-sm text-gray-700">{note.text}</p>
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
                    Veteran
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {candidate.skills.slice(0, 2).map((skill, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {skill}
                            </span>
                          ))}
                          {candidate.skills.length > 2 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              +{candidate.skills.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          {candidate.phone && (
                            <a
                              href={`tel:${candidate.phone}`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Phone className="w-4 h-4" />
                            </a>
                          )}
                          {candidate.email && (
                            <a
                              href={`mailto:${candidate.email}`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Mail className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <a
                          href={`/pitch/${candidate.id}`}
                          className="text-blue-600 hover:text-blue-900 font-medium"
                        >
                          View Pitch
                        </a>
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
