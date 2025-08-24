'use server'

import { createActionClient } from '@/lib/supabase-server'
import type { Database } from '@/types/live-schema'

// =====================================================
// RESUME REQUEST METRICS - CRITICAL SUCCESS INDICATORS
// =====================================================

export interface ResumeRequestMetrics {
  total_requests: number
  pending_requests: number
  approved_requests: number
  declined_requests: number
  approval_rate: number
  recent_requests: number // Last 7 days
  trending_requests: number // Last 30 days
  top_requested_pitches: Array<{
    pitch_id: string
    pitch_title: string
    veteran_name: string
    request_count: number
  }>
  top_recruiters: Array<{
    recruiter_id: string
    recruiter_name: string
    company_name?: string
    request_count: number
  }>
  daily_requests: Array<{
    date: string
    count: number
  }>
}

export interface VeteranResumeMetrics {
  total_requests_received: number
  pending_requests: number
  approved_requests: number
  declined_requests: number
  response_rate: number
  average_response_time_hours: number
  recent_requests: Array<{
    id: string
    recruiter_name: string
    company_name?: string
    job_role?: string
    status: string
    created_at: string
    responded_at?: string
  }>
}

export interface RecruiterResumeMetrics {
  total_requests_sent: number
  pending_requests: number
  approved_requests: number
  declined_requests: number
  success_rate: number
  recent_requests: Array<{
    id: string
    veteran_name: string
    pitch_title: string
    job_role?: string
    status: string
    created_at: string
    responded_at?: string
  }>
}

// =====================================================
// GLOBAL RESUME REQUEST METRICS
// =====================================================

export async function getGlobalResumeRequestMetrics(): Promise<ResumeRequestMetrics> {
  try {
    const supabase = await createActionClient()
    
    // Get total counts
    const { data: totalRequests, error: totalError } = await supabase
      .from('resume_requests')
      .select('id, status, created_at, pitch_id, recruiter_user_id, user_id')
    
    if (totalError) {
      console.error('Error fetching resume requests:', totalError)
      throw new Error('Failed to fetch resume request metrics')
    }

    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const total = totalRequests?.length || 0
    const pending = totalRequests?.filter(r => r.status === 'PENDING').length || 0
    const approved = totalRequests?.filter(r => r.status === 'APPROVED').length || 0
    const declined = totalRequests?.filter(r => r.status === 'DECLINED').length || 0
    const recent = totalRequests?.filter(r => new Date(r.created_at) >= sevenDaysAgo).length || 0
    const trending = totalRequests?.filter(r => new Date(r.created_at) >= thirtyDaysAgo).length || 0

    // Get top requested pitches
    const pitchRequestCounts = totalRequests?.reduce((acc, request) => {
      if (request.pitch_id) {
        acc[request.pitch_id] = (acc[request.pitch_id] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>) || {}

    const topPitchIds = Object.entries(pitchRequestCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([pitchId]) => pitchId)

    const { data: topPitches, error: pitchesError } = await supabase
      .from('pitches')
      .select(`
        id,
        title
      `)
      .in('id', topPitchIds)

    if (pitchesError) {
      console.error('Error fetching top pitches:', pitchesError)
    }

    // Get top recruiters
    const recruiterRequestCounts = totalRequests?.reduce((acc, request) => {
      acc[request.recruiter_user_id] = (acc[request.recruiter_user_id] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    const topRecruiterIds = Object.entries(recruiterRequestCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([recruiterId]) => recruiterId)

    const { data: topRecruiters, error: recruitersError } = await supabase
      .from('users')
      .select(`
        id,
        name
      `)
      .in('id', topRecruiterIds)

    if (recruitersError) {
      console.error('Error fetching top recruiters:', recruitersError)
    }

    // Get daily requests for last 30 days
    const dailyRequests: Array<{ date: string; count: number }> = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split('T')[0] || ''
      const count = totalRequests?.filter(r => 
        r.created_at.startsWith(dateStr)
      ).length || 0
      dailyRequests.push({ date: dateStr, count })
    }

    return {
      total_requests: total,
      pending_requests: pending,
      approved_requests: approved,
      declined_requests: declined,
      approval_rate: total > 0 ? Math.round((approved / total) * 100) : 0,
      recent_requests: recent,
      trending_requests: trending,
      top_requested_pitches: topPitches?.map(pitch => ({
        pitch_id: pitch.id,
        pitch_title: pitch.title,
        veteran_name: 'Veteran', // Will be populated separately if needed
        request_count: pitchRequestCounts[pitch.id] || 0
      })) || [],
      top_recruiters: topRecruiters?.map(recruiter => ({
        recruiter_id: recruiter.id,
        recruiter_name: 'Recruiter', // Will be populated separately if needed
        company_name: 'Company', // Will be populated separately if needed
        request_count: recruiterRequestCounts[recruiter.id] || 0
      })) || [],
      daily_requests: dailyRequests || []
    }
  } catch (error) {
    console.error('Error in getGlobalResumeRequestMetrics:', error)
    throw error
  }
}

// =====================================================
// VETERAN-SPECIFIC RESUME REQUEST METRICS
// =====================================================

export async function getVeteranResumeMetrics(veteranId: string): Promise<VeteranResumeMetrics> {
  try {
    const supabase = await createActionClient()
    
    const { data: requests, error } = await supabase
      .from('resume_requests')
      .select(`
        id,
        status,
        created_at,
        responded_at,
        job_role,
        recruiter_user_id
      `)
      .eq('user_id', veteranId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching veteran resume requests:', error)
      throw new Error('Failed to fetch veteran resume metrics')
    }

    const total = requests?.length || 0
    const pending = requests?.filter(r => r.status === 'PENDING').length || 0
    const approved = requests?.filter(r => r.status === 'APPROVED').length || 0
    const declined = requests?.filter(r => r.status === 'DECLINED').length || 0

    // Calculate average response time
    const respondedRequests = requests?.filter(r => r.responded_at) || []
    const totalResponseTime = respondedRequests.reduce((total, request) => {
      const created = new Date(request.created_at)
      const responded = new Date(request.responded_at!)
      return total + (responded.getTime() - created.getTime())
    }, 0)
    
    const averageResponseTimeHours = respondedRequests.length > 0 
      ? Math.round(totalResponseTime / (respondedRequests.length * 60 * 60 * 1000))
      : 0

    return {
      total_requests_received: total,
      pending_requests: pending,
      approved_requests: approved,
      declined_requests: declined,
      response_rate: total > 0 ? Math.round(((approved + declined) / total) * 100) : 0,
      average_response_time_hours: averageResponseTimeHours,
      recent_requests: requests?.slice(0, 10).map(request => ({
        id: request.id,
        recruiter_name: 'Unknown',
        company_name: 'Unknown',
        job_role: request.job_role || undefined,
        status: request.status,
        created_at: request.created_at,
        responded_at: request.responded_at || undefined
      })) || []
    }
  } catch (error) {
    console.error('Error in getVeteranResumeMetrics:', error)
    throw error
  }
}

// =====================================================
// RECRUITER-SPECIFIC RESUME REQUEST METRICS
// =====================================================

export async function getRecruiterResumeMetrics(recruiterId: string): Promise<RecruiterResumeMetrics> {
  try {
    const supabase = await createActionClient()
    
    const { data: requests, error } = await supabase
      .from('resume_requests')
      .select(`
        id,
        status,
        created_at,
        responded_at,
        job_role,
        pitch_id
      `)
      .eq('recruiter_user_id', recruiterId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching recruiter resume requests:', error)
      throw new Error('Failed to fetch recruiter resume metrics')
    }

    const total = requests?.length || 0
    const pending = requests?.filter(r => r.status === 'PENDING').length || 0
    const approved = requests?.filter(r => r.status === 'APPROVED').length || 0
    const declined = requests?.filter(r => r.status === 'DECLINED').length || 0

    return {
      total_requests_sent: total,
      pending_requests: pending,
      approved_requests: approved,
      declined_requests: declined,
      success_rate: total > 0 ? Math.round((approved / total) * 100) : 0,
      recent_requests: requests?.slice(0, 10).map(request => ({
        id: request.id,
        veteran_name: 'Unknown',
        pitch_title: 'Unknown',
        job_role: request.job_role || undefined,
        status: request.status,
        created_at: request.created_at,
        responded_at: request.responded_at || undefined
      })) || []
    }
  } catch (error) {
    console.error('Error in getRecruiterResumeMetrics:', error)
    throw error
  }
}

// =====================================================
// ACTIVITY LOGGING FOR FOMO TICKER
// =====================================================

export async function logResumeRequestActivity(event: string, metadata: any) {
  try {
    // Commented out due to activity_log table not existing in live schema
    // const supabase = await createActionClient()
    // 
    // await supabase
    //   .from('activity_log')
    //   .insert({
    //     event,
    //     meta: metadata
    //   })
  } catch (error) {
    console.error('Error logging resume request activity:', error)
  }
}
