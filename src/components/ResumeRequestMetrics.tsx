'use client'

import { useState, useEffect } from 'react'
import { FileText, TrendingUp, Clock, CheckCircle, XCircle, Eye, Calendar, Users, Building } from 'lucide-react'
import { createSupabaseBrowser } from '@/lib/supabaseBrowser'
import type { Database } from '@/types/live-schema'

interface ResumeRequestMetricsProps {
  userId: string
  userRole: 'veteran' | 'recruiter' | 'supporter'
  showDetails?: boolean
  className?: string
}

type ResumeRequestData = Database['public']['Tables']['resume_requests']['Row'] & {
  recruiter_name?: string
  company_name?: string
  veteran_name?: string
  pitch_title?: string
  job_role?: string | null
}

export default function ResumeRequestMetrics({ 
  userId, 
  userRole, 
  showDetails = false,
  className = '' 
}: ResumeRequestMetricsProps) {
  const [metrics, setMetrics] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    declined: 0,
    responseRate: 0,
    successRate: 0,
    recentRequests: [] as ResumeRequestData[]
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchResumeRequestMetrics()
  }, [userId, userRole])

  async function fetchResumeRequestMetrics() {
    try {
      const supabase = createSupabaseBrowser()
      
      let query = supabase
        .from('resume_requests')
        .select(`
                  id,
        status,
        created_at,
        responded_at,
        job_role,
        recruiter_user_id,
        user_id,
        pitch_id
        `)

      if (userRole === 'veteran') {
        query = query.eq('user_id', userId)
      } else if (userRole === 'recruiter') {
        query = query.eq('recruiter_user_id', userId)
      }

      const { data: requests, error } = await query.order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching resume requests:', error)
        return
      }

      const total = requests?.length || 0
      const pending = requests?.filter(r => r.status === 'PENDING').length || 0
      const approved = requests?.filter(r => r.status === 'APPROVED').length || 0
      const declined = requests?.filter(r => r.status === 'DECLINED').length || 0

      const responseRate = total > 0 ? Math.round(((approved + declined) / total) * 100) : 0
      const successRate = total > 0 ? Math.round((approved / total) * 100) : 0

      const recentRequests = requests?.slice(0, 5).map(request => ({
        id: request.id,
        recruiter_user_id: request.recruiter_user_id,
        user_id: request.user_id,
        pitch_id: request.pitch_id,
        status: request.status,
        job_role: request.job_role,
        message: null, // Will be populated separately if needed
        created_at: request.created_at,
        responded_at: request.responded_at
      })) || []

      setMetrics({
        total,
        pending,
        approved,
        declined,
        responseRate,
        successRate,
        recentRequests
      })
    } catch (error) {
      console.error('Error in fetchResumeRequestMetrics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-xl p-6 shadow-sm border ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'APPROVED':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'DECLINED':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-50'
      case 'APPROVED':
        return 'text-green-600 bg-green-50'
      case 'DECLINED':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className={`bg-white rounded-xl p-6 shadow-sm border ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Resume Requests
            </h3>
            <p className="text-sm text-gray-600">
              {userRole === 'veteran' ? 'Requests received' : 
               userRole === 'recruiter' ? 'Requests sent' : 'Platform activity'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">{metrics.total}</div>
          <div className="text-xs text-gray-500">Total</div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-lg font-semibold text-yellow-600">{metrics.pending}</div>
          <div className="text-xs text-gray-500">Pending</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-green-600">{metrics.approved}</div>
          <div className="text-xs text-gray-500">Approved</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-red-600">{metrics.declined}</div>
          <div className="text-xs text-gray-500">Declined</div>
        </div>
      </div>

      {/* Success Rates */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Response Rate</span>
          </div>
          <div className="text-xl font-bold text-blue-600">{metrics.responseRate}%</div>
        </div>
        <div className="bg-green-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-900">Success Rate</span>
          </div>
          <div className="text-xl font-bold text-green-600">{metrics.successRate}%</div>
        </div>
      </div>

      {/* Recent Requests */}
      {showDetails && metrics.recentRequests.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Recent Activity</h4>
          <div className="space-y-3">
            {metrics.recentRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(request.status)}
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {userRole === 'veteran' ? request.recruiter_name : request.veteran_name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {userRole === 'veteran' ? request.company_name : request.pitch_title}
                    </div>
                    {request.job_role && (
                      <div className="text-xs text-gray-400">{request.job_role}</div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-xs px-2 py-1 rounded-full ${getStatusColor(request.status)}`}>
                    {request.status}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {request.created_at ? new Date(request.created_at).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Call to Action */}
      {metrics.pending > 0 && userRole === 'veteran' && (
        <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-900">
              {metrics.pending} pending request{metrics.pending > 1 ? 's' : ''} to review
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
