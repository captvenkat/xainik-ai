'use server'

import { createActionClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { sendResumeRequestEmail } from '@/lib/email'
import { headers } from 'next/headers'
import { applyRateLimit } from '@/middleware/rateLimit'

export interface CreateResumeRequestData {
  pitch_id: string
  recruiter_user_id: string
  user_id: string
  job_role?: string | null
  message?: string | null
}

export async function createResumeRequest(data: CreateResumeRequestData) {
  try {
    // Apply rate limiting to prevent abuse
    const headersList = await headers()
    const forwardedFor = headersList.get('x-forwarded-for')
    const realIp = headersList.get('x-real-ip')
    
    // Create a mock request object for rate limiting
    const mockRequest = {
      headers: {
        get: (name: string) => {
          if (name === 'x-forwarded-for') return forwardedFor
          if (name === 'x-real-ip') return realIp
          return null
        }
      },
      nextUrl: { pathname: '/api/resume/request' }
    } as any
    
    const rateLimitResult = applyRateLimit(mockRequest, 'resumeRequest')
    if (rateLimitResult) {
      return { success: false, error: 'Rate limit exceeded. Please try again later.' }
    }
    
    const supabase = await createActionClient()
    
    const { data: resumeRequest, error } = await supabase
      .from('resume_requests')
      .insert({
        pitch_id: data.pitch_id,
        recruiter_user_id: data.recruiter_user_id, // Using user_id as common identifier 
        user_id: data.user_id, // Using user_id as common identifier
        job_role: data.job_role || null,
        message: data.message || null, // Add message field
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating resume request:', error)
      throw new Error('Failed to create resume request')
    }

    // Log activity for FOMO ticker
    await logResumeRequestActivity('resume_request_created', {
      resume_request_id: resumeRequest.id,
      pitch_id: data.pitch_id,
      recruiter_user_id: data.recruiter_user_id,
      user_id: data.user_id
    })

    // Send email notification to veteran (non-blocking)
    try {
      // Get veteran and recruiter details for the email
      const [veteranData, recruiterData, pitchData, recruiterProfile] = await Promise.all([
        supabase.from('users').select('name, email').eq('id', data.user_id).single(),
        supabase.from('users').select('name').eq('id', data.recruiter_user_id).single(),
        supabase.from('pitches').select('title').eq('id', data.pitch_id).single(),
        supabase.from('recruiters').select('company_name').eq('user_id', data.recruiter_user_id).single()
      ])

      if (veteranData.data && recruiterData.data) {
        await sendResumeRequestEmail(
          veteranData.data.email,
          veteranData.data.name,
          recruiterData.data.name,
          recruiterProfile.data?.company_name || 'Company',
          resumeRequest.id
        )
      }
    } catch (emailError) {
      console.error('Failed to send resume request email:', emailError)
      // Don't fail the request if email fails
    }

    // Also log to activity_log for dashboard display
    try {
      const { data: pitchData } = await supabase
        .from('pitches')
        .select('title, user_id')
        .eq('id', data.pitch_id)
        .single()

      const { data: veteranData } = await supabase
        .from('users')
        .select('name')
        .eq('id', pitchData?.user_id || '')
        .single()

      const { data: recruiterData } = await supabase
        .from('users')
        .select('name')
        .eq('id', data.recruiter_user_id)
        .single()

      const { data: recruiterProfile } = await supabase
        .from('recruiters')
        .select('company_name')
        .eq('user_id', data.recruiter_user_id)
        .single()

      // Note: activity_log table doesn't exist in live database
      // await supabase
      //   .from('activity_log')
      //   .insert({
      //     event: 'resume_request_received',
      //     meta: {
      //       veteran_name: veteranData?.name || 'Unknown Veteran',
      //       recruiter_name: recruiterData?.name || 'Unknown Recruiter',
      //       company_name: recruiterProfile?.company_name,
      //       pitch_title: pitchData?.title || 'Unknown Pitch',
      //       job_role: data.job_role
      //     }
      //   })
    } catch (error) {
      console.error('Error logging to activity_log:', error)
    }

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
      .eq('user_id', veteranUserId) // Using user_id as common identifier
      .select()
      .single()

    if (error) {
      console.error('Error approving resume request:', error)
      throw new Error('Failed to approve resume request')
    }

    // Log activity for FOMO ticker
    await logResumeRequestActivity('resume_request_approved', {
      resume_request_id: requestId,
      pitch_id: resumeRequest.pitch_id,
      recruiter_user_id: resumeRequest.recruiter_user_id, // Map recruiter_user_id back to recruiter_user_id
      user_id: veteranUserId
    })

    // Also log to activity_log for dashboard display
    try {
      const { data: pitchData } = await supabase
        .from('pitches')
        .select('title, user_id')
        .eq('id', resumeRequest.pitch_id || '')
        .single()

      const { data: veteranData } = await supabase
        .from('users')
        .select('name')
        .eq('id', pitchData?.user_id || '')
        .single()

      const { data: recruiterData } = await supabase
        .from('users')
        .select('name')
        .eq('id', resumeRequest.recruiter_user_id)
        .single()

      const { data: recruiterProfile } = await supabase
        .from('recruiters')
        .select('company_name')
        .eq('user_id', resumeRequest.recruiter_user_id)
        .single()

      // Note: activity_log table doesn't exist in live database
      // await supabase
      //   .from('activity_log')
      //   .insert({
      //     event: 'resume_request_approved',
      //     meta: {
      //       veteran_name: veteranData?.name || 'Unknown Veteran',
      //       recruiter_name: recruiterData?.name || 'Unknown Recruiter',
      //       company_name: recruiterProfile?.company_name,
      //       pitch_title: pitchData?.title || 'Unknown Pitch'
      //     }
      //   })
    } catch (error) {
      console.error('Error logging to activity_log:', error)
    }

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

    // Log activity for FOMO ticker
    await logResumeRequestActivity('resume_request_declined', {
      resume_request_id: requestId,
      pitch_id: resumeRequest.pitch_id,
      recruiter_user_id: resumeRequest.recruiter_user_id,
      user_id: veteranUserId
    })

    // Also log to activity_log for dashboard display
    try {
      const { data: pitchData } = await supabase
        .from('pitches')
        .select('title, user_id')
        .eq('id', resumeRequest.pitch_id || '')
        .single()

      const { data: veteranData } = await supabase
        .from('users')
        .select('name')
        .eq('id', pitchData?.user_id || '')
        .single()

      const { data: recruiterData } = await supabase
        .from('users')
        .select('name')
        .eq('id', resumeRequest.recruiter_user_id)
        .single()

      const { data: recruiterProfile } = await supabase
        .from('recruiters')
        .select('company_name')
        .eq('user_id', resumeRequest.recruiter_user_id)
        .single()

      // Note: activity_log table doesn't exist in live database
      // await supabase
      //   .from('activity_log')
      //   .insert({
      //     event: 'resume_request_declined',
      //     meta: {
      //       veteran_name: veteranData?.name || 'Unknown Veteran',
      //       recruiter_name: recruiterData?.name || 'Unknown Recruiter',
      //       company_name: recruiterProfile?.company_name,
      //       pitch_title: pitchData?.title || 'Unknown Pitch'
      //     }
      //   })
    } catch (error) {
      console.error('Error logging to activity_log:', error)
    }

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
      query = query.eq('recruiter_user_id', userId) // Using user_id as common identifier
    } else if (role === 'veteran') {
      query = query.eq('user_id', userId) // Using user_id as common identifier
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
    const supabase = await createActionClient()
    
    // Note: user_activity_log table doesn't exist in live database
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
