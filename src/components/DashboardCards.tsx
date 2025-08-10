'use client'

import { useState } from 'react'
import { VeteranMetrics, RecruiterMetrics, SupporterMetrics } from '@/lib/metrics'
import { Calendar, Users, Eye, Phone, Mail, FileText, Star, TrendingUp, Share2 } from 'lucide-react'

interface DashboardCardsProps {
  metrics: VeteranMetrics | RecruiterMetrics | SupporterMetrics
  role?: 'veteran' | 'recruiter' | 'supporter'
}

export default function DashboardCards({ metrics, role = 'veteran' }: DashboardCardsProps) {
  const [activeTab, setActiveTab] = useState('7d')

  if (role === 'veteran') {
    const veteranMetrics = metrics as VeteranMetrics
    return <VeteranDashboardCards metrics={veteranMetrics} />
  } else if (role === 'recruiter') {
    const recruiterMetrics = metrics as RecruiterMetrics
    return <RecruiterDashboardCards metrics={recruiterMetrics} />
  } else if (role === 'supporter') {
    const supporterMetrics = metrics as SupporterMetrics
    return <SupporterDashboardCards metrics={supporterMetrics} />
  }

  return null
}

function VeteranDashboardCards({ metrics }: { metrics: VeteranMetrics }) {
  const daysUntilExpiry = metrics.pitch?.plan_expires_at 
    ? Math.ceil((new Date(metrics.pitch.plan_expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Pitch Status */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">My Pitch Status</h3>
        </div>
        
        {metrics.pitch ? (
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-600">Title</div>
              <div className="font-medium text-gray-900">{metrics.pitch.title}</div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">Plan</div>
                <div className="font-medium text-gray-900">{metrics.pitch.plan_tier}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Status</div>
                <div className={`font-medium ${metrics.pitch.is_active ? 'text-green-600' : 'text-red-600'}`}>
                  {metrics.pitch.is_active ? 'Active' : 'Inactive'}
                </div>
              </div>
            </div>
            
            <div>
              <div className="text-sm text-gray-600">Expires in</div>
              <div className={`font-medium ${daysUntilExpiry <= 7 ? 'text-red-600' : daysUntilExpiry <= 30 ? 'text-yellow-600' : 'text-green-600'}`}>
                {daysUntilExpiry} days
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No pitch found</p>
            <a href="/pitch/new" className="text-blue-600 hover:underline">Create your first pitch</a>
          </div>
        )}
      </div>

      {/* Endorsements */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Star className="w-5 h-5 text-yellow-600" />
          <h3 className="text-lg font-semibold text-gray-900">Endorsements</h3>
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
            {metrics.endorsements.total}
          </span>
        </div>
        
        {metrics.endorsements.recent.length > 0 ? (
          <div className="space-y-3">
            {metrics.endorsements.recent.map((endorsement) => (
              <div key={endorsement.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{endorsement.endorser_name}</div>
                    <div className="text-sm text-gray-600 mt-1">{endorsement.message}</div>
                  </div>
                  <div className="text-xs text-gray-500 ml-2">
                    {new Date(endorsement.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No endorsements yet</p>
          </div>
        )}
      </div>

      {/* Referrals */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Share2 className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Referral Activity</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('7d')}
              className={`px-3 py-1 rounded-lg text-sm font-medium ${
                activeTab === '7d' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setActiveTab('30d')}
              className={`px-3 py-1 rounded-lg text-sm font-medium ${
                activeTab === '30d' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
              }`}
            >
              30 Days
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <Eye className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-900">
                {activeTab === '7d' ? metrics.referrals.last7d.views : metrics.referrals.last30d.views}
              </div>
              <div className="text-sm text-blue-700">Views</div>
            </div>
            
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <Phone className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-900">
                {activeTab === '7d' ? metrics.referrals.last7d.calls : metrics.referrals.last30d.calls}
              </div>
              <div className="text-sm text-green-700">Calls</div>
            </div>
            
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <Mail className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-900">
                {activeTab === '7d' ? metrics.referrals.last7d.emails : metrics.referrals.last30d.emails}
              </div>
              <div className="text-sm text-purple-700">Emails</div>
            </div>
            
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-900">
                {metrics.referrals.topPlatforms.length > 0 ? metrics.referrals.topPlatforms[0].platform : 'N/A'}
              </div>
              <div className="text-sm text-orange-700">Top Platform</div>
            </div>
          </div>
        </div>
      </div>

      {/* Resume Requests */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Resume Requests</h3>
        </div>
        
        {metrics.resumeRequests.length > 0 ? (
          <div className="space-y-3">
            {metrics.resumeRequests.map((request) => (
              <div key={request.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{request.recruiter_name}</div>
                    <div className={`text-sm ${getStatusColor(request.status)}`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </div>
                    {request.message && (
                      <div className="text-sm text-gray-600 mt-1">{request.message}</div>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 ml-2">
                    {new Date(request.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No resume requests yet</p>
          </div>
        )}
      </div>
    </div>
  )
}

function RecruiterDashboardCards({ metrics }: { metrics: RecruiterMetrics }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Shortlisted */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Star className="w-5 h-5 text-yellow-600" />
          <h3 className="text-lg font-semibold text-gray-900">Shortlisted Veterans</h3>
        </div>
        
        {metrics.shortlisted.length > 0 ? (
          <div className="space-y-3">
            {metrics.shortlisted.map((pitch) => (
              <div key={pitch.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium text-gray-900">{pitch.title}</div>
                <div className="text-sm text-gray-600">{pitch.veteran_name}</div>
                <div className="flex gap-2 mt-2">
                  <a
                    href={`tel:${pitch.phone}`}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                  >
                    <Phone className="w-3 h-3" />
                    Call
                  </a>
                  <a
                    href={`mailto:${pitch.email}`}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                  >
                    <Mail className="w-3 h-3" />
                    Email
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No shortlisted veterans</p>
          </div>
        )}
      </div>

      {/* Recent Contacts */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Phone className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Recent Contacts</h3>
        </div>
        
        {metrics.contacted.length > 0 ? (
          <div className="space-y-3">
            {metrics.contacted.map((contact) => (
              <div key={contact.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{contact.veteran_name}</div>
                    <div className="text-sm text-gray-600">{contact.pitch_title}</div>
                    <div className={`text-sm ${contact.type === 'call' ? 'text-green-600' : 'text-blue-600'}`}>
                      {contact.type === 'call' ? 'Called' : 'Emailed'}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 ml-2">
                    {new Date(contact.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Phone className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No recent contacts</p>
          </div>
        )}
      </div>

      {/* Resume Requests */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Resume Requests</h3>
        </div>
        
        {metrics.resumeRequests.length > 0 ? (
          <div className="space-y-3">
            {metrics.resumeRequests.map((request) => (
              <div key={request.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{request.veteran_name}</div>
                    <div className="text-sm text-gray-600">{request.pitch_title}</div>
                    <div className={`text-sm ${getStatusColor(request.status)}`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 ml-2">
                    {new Date(request.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No resume requests</p>
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-orange-600" />
          <h3 className="text-lg font-semibold text-gray-900">Notes</h3>
        </div>
        
        {metrics.notes.length > 0 ? (
          <div className="space-y-3">
            {metrics.notes.map((note) => (
              <div key={note.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{note.veteran_name}</div>
                    <div className="text-sm text-gray-600">{note.pitch_title}</div>
                    <div className="text-sm text-gray-700 mt-1">{note.text}</div>
                  </div>
                  <div className="text-xs text-gray-500 ml-2">
                    {new Date(note.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No notes yet</p>
          </div>
        )}
      </div>
    </div>
  )
}

function SupporterDashboardCards({ metrics }: { metrics: SupporterMetrics }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Referred Pitches */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Share2 className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Referred Pitches</h3>
        </div>
        
        {metrics.referredPitches.length > 0 ? (
          <div className="space-y-3">
            {metrics.referredPitches.map((pitch) => (
              <div key={pitch.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{pitch.title}</div>
                    <div className="text-sm text-gray-600">{pitch.veteran_name}</div>
                    <div className="text-sm text-blue-600">{pitch.click_count} clicks</div>
                  </div>
                  <div className="text-xs text-gray-500 ml-2">
                    {new Date(pitch.last_activity).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Share2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No referred pitches yet</p>
          </div>
        )}
      </div>

      {/* Conversions */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Conversions (30d)</h3>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <Eye className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-900">{metrics.conversions.views}</div>
              <div className="text-sm text-blue-700">Views</div>
            </div>
            
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <Phone className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-900">{metrics.conversions.calls}</div>
              <div className="text-sm text-green-700">Calls</div>
            </div>
            
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <Mail className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-900">{metrics.conversions.emails}</div>
              <div className="text-sm text-purple-700">Emails</div>
            </div>
          </div>
          
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-900">
              {metrics.conversions.conversionRate.toFixed(1)}%
            </div>
            <div className="text-sm text-orange-700">Conversion Rate</div>
          </div>
        </div>
      </div>

      {/* Endorsements Made */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Star className="w-5 h-5 text-yellow-600" />
          <h3 className="text-lg font-semibold text-gray-900">Endorsements Made</h3>
        </div>
        
        {metrics.endorsements.length > 0 ? (
          <div className="space-y-3">
            {metrics.endorsements.map((endorsement) => (
              <div key={endorsement.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{endorsement.veteran_name}</div>
                    <div className="text-sm text-gray-600">{endorsement.pitch_title}</div>
                  </div>
                  <div className="text-xs text-gray-500 ml-2">
                    {new Date(endorsement.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No endorsements made yet</p>
          </div>
        )}
      </div>
    </div>
  )
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'pending':
      return 'text-yellow-600'
    case 'approved':
      return 'text-green-600'
    case 'declined':
      return 'text-red-600'
    default:
      return 'text-gray-600'
  }
}
