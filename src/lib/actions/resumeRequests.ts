import { getServerSupabase } from '../supabaseClient'
import { createAdminClient } from '../supabaseAdmin'
import { first } from '@/lib/db'
import { logActivity } from '../activity'
import { createHmac } from 'crypto'

export interface ResumeRequest {
  id: string
  recruiter_id: string
  veteran_id: string
  pitch_id?: string
  job_role?: string
  status: 'PENDING' | 'APPROVED' | 'DECLINED'
  created_at: string
  responded_at?: string
}

export interface ResumeRequestWithUsers extends ResumeRequest {
  recruiter: {
    name: string
    email: string
    company_name?: string
  }
  veteran: {
    name: string
    email: string
  }
  pitch?: {
    title: string
  }
}

// Create resume request
export async function createResumeRequest(
  recruiterId: string,
  veteranId: string,
  pitchId?: string,
  jobRole?: string
): Promise<ResumeRequest> {
  const supabase = getServerSupabase()
  
  const { data, error } = await supabase
    .from('resume_requests')
    .insert({
      recruiter_id: recruiterId,
      veteran_id: veteranId,
      pitch_id: pitchId,
      job_role: jobRole
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating resume request:', error)
    throw new Error('Failed to create resume request')
  }

  // Log activity
  await logActivity('resume_request_sent', {
    recruiter_id: recruiterId,
    veteran_id: veteranId,
    pitch_id: pitchId,
    job_role: jobRole
  })

  return data
}

// Generate HMAC token for approve/decline actions (24h expiry)
export function generateResumeRequestToken(requestId: string, action: 'approve' | 'decline'): string {
  const secret = process.env.RESUME_REQUEST_SECRET || 'default-secret-change-in-production'
  const expiry = Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
  const payload = `${requestId}:${action}:${expiry}`
  
  const hmac = createHmac('sha256', secret)
  hmac.update(payload)
  
  return `${payload}:${hmac.digest('hex')}`
}

// Verify HMAC token
export function verifyResumeRequestToken(token: string): { requestId: string; action: 'approve' | 'decline'; valid: boolean } {
  try {
    const secret = process.env.RESUME_REQUEST_SECRET || 'default-secret-change-in-production'
    const parts = token.split(':')
    
    if (parts.length !== 4) {
      return { requestId: '', action: 'approve', valid: false }
    }
    
    const [requestId, action, expiryStr, signature] = parts
    const expiry = parseInt(expiryStr || '0')
    
    // Check expiry
    if (Date.now() / 1000 > expiry) {
      return { requestId: requestId || '', action: action as 'approve' | 'decline', valid: false }
    }
    
    // Verify signature
    const payload = `${requestId}:${action}:${expiryStr}`
    const hmac = createHmac('sha256', secret)
    hmac.update(payload)
    const expectedSignature = hmac.digest('hex')
    
    if (signature !== expectedSignature) {
      return { requestId: requestId || '', action: action as 'approve' | 'decline', valid: false }
    }
    
    return { 
      requestId: requestId || '', 
      action: action as 'approve' | 'decline', 
      valid: true 
    }
  } catch (error) {
    return { requestId: '', action: 'approve', valid: false }
  }
}

// Approve resume request
export async function approveResumeRequest(requestId: string): Promise<void> {
  const supabase = createAdminClient()
  
  const { error } = await supabase
    .from('resume_requests')
    .update({
      status: 'APPROVED',
      responded_at: new Date().toISOString()
    })
    .eq('id', requestId)
    .eq('status', 'PENDING')

  if (error) {
    console.error('Error approving resume request:', error)
    throw new Error('Failed to approve resume request')
  }

  // Log activity
  await logActivity('resume_request_approved', {
    request_id: requestId
  })
}

// Decline resume request
export async function declineResumeRequest(requestId: string): Promise<void> {
  const supabase = createAdminClient()
  
  const { error } = await supabase
    .from('resume_requests')
    .update({
      status: 'DECLINED',
      responded_at: new Date().toISOString()
    })
    .eq('id', requestId)
    .eq('status', 'PENDING')

  if (error) {
    console.error('Error declining resume request:', error)
    throw new Error('Failed to decline resume request')
  }

  // Log activity
  await logActivity('resume_request_declined', {
    request_id: requestId
  })
}

// Get resume requests for a veteran
export async function getVeteranResumeRequests(veteranId: string): Promise<ResumeRequestWithUsers[]> {
  const supabase = getServerSupabase()
  
  const { data, error } = await supabase
    .from('resume_requests')
    .select(`
      id,
      recruiter_id,
      veteran_id,
      pitch_id,
      job_role,
      status,
      created_at,
      responded_at,
      recruiter:users!recruiter_id(name, email),
      recruiter_profile:recruiters!recruiter_id(company_name),
      veteran:users!veteran_id(name, email),
      pitch:pitches!pitch_id(title)
    `)
    .eq('veteran_id', veteranId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error getting veteran resume requests:', error)
    throw new Error('Failed to get resume requests')
  }

  return (data || []).map(item => ({
    ...item,
    recruiter: {
      name: first(item.recruiter)?.name || 'Unknown',
      email: first(item.recruiter)?.email || 'unknown@example.com',
      company_name: first(item.recruiter_profile)?.company_name
    },
    veteran: {
      name: first(item.veteran)?.name || 'Unknown',
      email: first(item.veteran)?.email || 'unknown@example.com'
    },
    pitch: first(item.pitch) ? {
      title: first(item.pitch)?.title || 'Unknown'
    } : undefined
  })) as ResumeRequestWithUsers[]
}

// Get resume requests for a recruiter
export async function getRecruiterResumeRequests(recruiterId: string): Promise<ResumeRequestWithUsers[]> {
  const supabase = getServerSupabase()
  
  const { data, error } = await supabase
    .from('resume_requests')
    .select(`
      id,
      recruiter_id,
      veteran_id,
      pitch_id,
      job_role,
      status,
      created_at,
      responded_at,
      recruiter:users!recruiter_id(name, email),
      recruiter_profile:recruiters!recruiter_id(company_name),
      veteran:users!veteran_id(name, email),
      pitch:pitches!pitch_id(title)
    `)
    .eq('recruiter_id', recruiterId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error getting recruiter resume requests:', error)
    throw new Error('Failed to get resume requests')
  }

  return (data || []).map(item => ({
    ...item,
    recruiter: {
      name: first(item.recruiter)?.name || 'Unknown',
      email: first(item.recruiter)?.email || 'unknown@example.com',
      company_name: first(item.recruiter_profile)?.company_name
    },
    veteran: {
      name: first(item.veteran)?.name || 'Unknown',
      email: first(item.veteran)?.email || 'unknown@example.com'
    },
    pitch: first(item.pitch) ? {
      title: first(item.pitch)?.title || 'Unknown'
    } : undefined
  })) as ResumeRequestWithUsers[]
}

// Get single resume request with full details
export async function getResumeRequest(requestId: string): Promise<ResumeRequestWithUsers | null> {
  const supabase = getServerSupabase()
  
  const { data, error } = await supabase
    .from('resume_requests')
    .select(`
      id,
      recruiter_id,
      veteran_id,
      pitch_id,
      job_role,
      status,
      created_at,
      responded_at,
      recruiter:users!recruiter_id(name, email),
      recruiter_profile:recruiters!recruiter_id(company_name),
      veteran:users!veteran_id(name, email),
      pitch:pitches!pitch_id(title)
    `)
    .eq('id', requestId)
    .single()

  if (error) {
    console.error('Error getting resume request:', error)
    return null
  }

  return {
    ...data,
    recruiter: {
      name: first(data.recruiter)?.name || 'Unknown',
      email: first(data.recruiter)?.email || 'unknown@example.com',
      company_name: first(data.recruiter_profile)?.company_name
    },
    veteran: {
      name: first(data.veteran)?.name || 'Unknown',
      email: first(data.veteran)?.email || 'unknown@example.com'
    },
    pitch: first(data.pitch) ? {
      title: first(data.pitch)?.title || 'Unknown'
    } : undefined
  } as ResumeRequestWithUsers
}
