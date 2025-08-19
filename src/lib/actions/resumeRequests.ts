'use server'

import { createActionClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export interface CreateResumeRequestData {
  pitch_id: string
  recruiter_user_id: string
  user_id: string
  job_role?: string | null
  message?: string | null
}

export async function createResumeRequest(data: CreateResumeRequestData) {
  try {
    const supabase = await createActionClient()
    
    const { data: resumeRequest, error } = await supabase
      .from('resume_requests')
      .insert({
        pitch_id: data.pitch_id,
        recruiter_user_id: data.recruiter_user_id,
        user_id: data.user_id,
        job_role: data.job_role || null,
        message: data.message || null,
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating resume request:', error)
      throw new Error('Failed to create resume request')
    }

    // Log activity
    await logResumeRequestActivity('resume_request_created', {
      resume_request_id: resumeRequest.id,
      pitch_id: data.pitch_id,
      recruiter_user_id: data.recruiter_user_id,
      user_id: data.user_id
    })

    revalidatePath('/dashboard/recruiter')
    revalidatePath('/dashboard/veteran')
    
    return { success: true, data: resumeRequest }
  } catch (error) {
    console.error('Error in createResumeRequest:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function approveResumeRequest(requestId: string, veteranUserId: string) {
  try {
    const supabase = await createActionClient()
    
    const { data: resumeRequest, error } = await supabase
      .from('resume_requests')
      .update({
        status: 'approved',
        responded_at: new Date().toISOString()
      })
      .eq('id', requestId)
      .eq('user_id', veteranUserId)
      .select()
      .single()

    if (error) {
      console.error('Error approving resume request:', error)
      throw new Error('Failed to approve resume request')
    }

    // Log activity
    await logResumeRequestActivity('resume_request_approved', {
      resume_request_id: requestId,
      pitch_id: resumeRequest.pitch_id,
      recruiter_user_id: resumeRequest.recruiter_user_id,
      user_id: veteranUserId
    })

    revalidatePath('/dashboard/recruiter')
    revalidatePath('/dashboard/veteran')
    
    return { success: true, data: resumeRequest }
  } catch (error) {
    console.error('Error in approveResumeRequest:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function declineResumeRequest(requestId: string, veteranUserId: string) {
  try {
    const supabase = await createActionClient()
    
    const { data: resumeRequest, error } = await supabase
      .from('resume_requests')
      .update({
        status: 'declined',
        responded_at: new Date().toISOString()
      })
      .eq('id', requestId)
      .eq('user_id', veteranUserId)
      .select()
      .single()

    if (error) {
      console.error('Error declining resume request:', error)
      throw new Error('Failed to decline resume request')
    }

    // Log activity
    await logResumeRequestActivity('resume_request_declined', {
      resume_request_id: requestId,
      pitch_id: resumeRequest.pitch_id,
      recruiter_user_id: resumeRequest.recruiter_user_id,
      user_id: veteranUserId
    })

    revalidatePath('/dashboard/recruiter')
    revalidatePath('/dashboard/veteran')
    
    return { success: true, data: resumeRequest }
  } catch (error) {
    console.error('Error in declineResumeRequest:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function getResumeRequests(userId: string, role: string) {
  try {
    const supabase = await createActionClient()
    
    let query = supabase
      .from('resume_requests')
      .select(`
        *,
        pitches (
          id,
          title,
          pitch_text,
          user_id
        ),
        users!resume_requests_recruiter_user_id_fkey (
          id,
          name,
          email
        )
      `)

    if (role === 'recruiter') {
      query = query.eq('recruiter_user_id', userId)
    } else if (role === 'veteran') {
      query = query.eq('user_id', userId)
    }

    const { data: resumeRequests, error } = await query
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching resume requests:', error)
      throw new Error('Failed to fetch resume requests')
    }

    return { success: true, data: resumeRequests }
  } catch (error) {
    console.error('Error in getResumeRequests:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

async function logResumeRequestActivity(activityType: string, metadata: any) {
  try {
    // Commented out due to user_activity_log table not existing in live schema
    // const supabase = await createActionClient()
    // 
    // await supabase
    //   .from('user_activity_log')
    //   .insert({
    //     activity_type: activityType,
    //     activity_data: metadata,
    //     user_id: metadata.user_id
    //   })
  } catch (error) {
    console.error('Error logging resume request activity:', error)
  }
}
