'use server'

import { getServerSupabase } from '@/lib/supabaseClient'
import { Resend } from 'resend'
import { generateToken } from '@/lib/tokens'
import { mustOne } from '@/lib/db'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function requestResume(pitchId: string, recruiterMessage?: string) {
  const supabase = getServerSupabase()
  
  // Get current user (must be recruiter)
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Authentication required')
  }

  // Verify user is a recruiter
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'recruiter') {
    throw new Error('Only recruiters can request resumes')
  }

  // Get pitch and veteran details
  const { data, error } = await supabase
    .from('pitches')
    .select(`
      id,
      title,
      profiles!inner(
        id,
        full_name,
        email,
        phone,
        resume_url,
        resume_share_enabled
      )
    `)
    .eq('id', pitchId)
    .eq('status', 'active')

  if (error) throw error
  if (!data || data.length === 0) {
    throw new Error('Pitch not found or not active')
  }
  
  const pitch = data[0]!

  // Create resume request record
  const { data: request, error: requestError } = await supabase
    .from('resume_requests')
    .insert({
      pitch_id: pitchId,
      recruiter_id: user.id,
      veteran_id: pitch.profiles?.[0]?.id || '',
      message: recruiterMessage || null,
      status: 'pending'
    })
    .select()
    .single()

  if (requestError) {
    throw new Error('Failed to create resume request')
  }

  // Send email to veteran using React Email template
  try {
    const { render } = await import('@react-email/components')
    const ResumeRequestEmail = (await import('@/emails/resume_request_to_veteran')).default
    
    // Generate HMAC tokens for approve/decline links
    const approveToken = generateToken({
      requestId: request.id,
      veteranId: pitch.profiles?.[0]?.id || '',
      purpose: 'resume_approve'
    })
    
    const declineToken = generateToken({
      requestId: request.id,
      veteranId: pitch.profiles?.[0]?.id || '',
      purpose: 'resume_decline'
    })

    const emailHtml = await render(ResumeRequestEmail({
      veteranName: pitch.profiles?.[0]?.full_name || 'Unknown',
      pitchTitle: pitch.title,
      recruiterMessage: recruiterMessage || '',
      approveUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/resume/approve/${request.id}?token=${approveToken}`,
      declineUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/resume/decline/${request.id}?token=${declineToken}`
    }))

    await resend.emails.send({
      from: 'Xainik <noreply@xainik.com>',
      to: pitch.profiles?.[0]?.email || '',
      subject: `Resume Request: ${pitch.title}`,
      html: emailHtml
    })
  } catch (emailError) {
    console.error('Failed to send email:', emailError)
    // Don't fail the request if email fails
  }

  return { success: true, requestId: request.id }
}
