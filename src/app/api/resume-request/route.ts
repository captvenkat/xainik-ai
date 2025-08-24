import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerOnly } from '@/lib/supabaseServerOnly'
import { cookies } from 'next/headers'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { 
      pitchId, 
      message, 
      requesterId, 
      senderName, 
      senderCompany, 
      senderRole, 
      purpose 
    } = await request.json()

    if (!pitchId || !message || !requesterId || !senderName || !purpose) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const cookieStore = await cookies()
    const supabase = createSupabaseServerOnly()
    const supabaseClient = await supabase

    // Get the pitch details to find the veteran's user ID
    const { data: pitch, error: pitchError } = await supabaseClient
      .from('pitches')
      .select('user_id, title')
      .eq('id', pitchId)
      .single()

    if (pitchError || !pitch) {
      return NextResponse.json(
        { error: 'Pitch not found' },
        { status: 404 }
      )
    }

    // Get requester details
    const { data: requester, error: requesterError } = await supabaseClient
      .from('users')
      .select('name, email')
      .eq('id', requesterId)
      .single()

    if (requesterError || !requester) {
      return NextResponse.json(
        { error: 'Requester not found' },
        { status: 404 }
      )
    }

    // Get veteran details
    const { data: veteran, error: veteranError } = await supabaseClient
      .from('users')
      .select('name, email')
      .eq('id', pitch.user_id)
      .single()

    if (veteranError || !veteran) {
      return NextResponse.json(
        { error: 'Veteran not found' },
        { status: 404 }
      )
    }

    // Insert resume request into database
    const { data: resumeRequest, error: insertError } = await supabaseClient
      .from('resume_requests')
      .insert({
        pitch_id: pitchId,
        recruiter_user_id: requesterId,
        user_id: pitch.user_id,
        message: message,
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error inserting resume request:', insertError)
      return NextResponse.json(
        { error: 'Failed to create resume request' },
        { status: 500 }
      )
    }

    // Log the activity
    try {
      await supabaseClient
        .from('user_activity_log')
        .insert({
          user_id: requesterId,
          activity_type: 'resume_request_sent',
          target_user_id: pitch.user_id,
          target_pitch_id: pitchId,
          metadata: {
            message_length: message.length,
            pitch_title: pitch.title,
            sender_name: senderName,
            sender_company: senderCompany,
            sender_role: senderRole,
            purpose: purpose
          },
          created_at: new Date().toISOString()
        })
    } catch (logError) {
      console.error('Error logging activity:', logError)
      // Don't fail the request if logging fails
    }

    // Send email notification to veteran using Resend
    try {
      const emailResult = await resend.emails.send({
        from: 'Xainik (Veteran Success Foundation, Sec. 8 not for profit) <noreply@updates.xainik.com>',
        to: [veteran.email],
        subject: `Resume Request from ${senderCompany || senderName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">📄 New Resume Request</h1>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
                Hi <strong>${veteran.name}</strong>,
              </p>
              
              <p style="color: #555; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
                Great news! Someone is interested in your profile and has requested your resume.
              </p>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
                <h3 style="color: #333; margin-top: 0; font-size: 18px;">Request Details:</h3>
                <p style="margin: 8px 0;"><strong>From:</strong> ${senderName}${senderRole ? ` (${senderRole})` : ''}</p>
                ${senderCompany ? `<p style="margin: 8px 0;"><strong>Company:</strong> ${senderCompany}</p>` : ''}
                <p style="margin: 8px 0;"><strong>Purpose:</strong> ${purpose}</p>
                <p style="margin: 8px 0;"><strong>Pitch:</strong> ${pitch.title}</p>
              </div>
              
              <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196f3;">
                <h3 style="color: #333; margin-top: 0; font-size: 16px;">Message:</h3>
                <p style="color: #555; font-size: 14px; line-height: 1.6; white-space: pre-wrap; margin: 0;">${message}</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://xainik.com'}/dashboard/veteran" 
                   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
                  Review Request in Dashboard
                </a>
              </div>
              
              <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 20px;">
                <p style="color: #666; font-size: 12px; margin: 0;">
                  <strong>Request ID:</strong> ${resumeRequest.id}<br>
                  <strong>Date:</strong> ${new Date().toLocaleDateString()}<br>
                  You can approve or decline this request from your Xainik dashboard.
                </p>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
              <p>This email was sent from Xainik - Veteran Success Foundation</p>
              <p>If you have any questions, please contact our support team.</p>
            </div>
          </div>
        `
      })

      if (emailResult.error) {
        console.error('Error sending email:', emailResult.error)
        // Don't fail the request if email fails
      } else {
        console.log('Resume request email sent successfully:', emailResult.data?.id)
      }
    } catch (emailError) {
      console.error('Error sending resume request email:', emailError)
      // Don't fail the request if email fails
    }

    // Log success
    console.log('Resume request created:', {
      id: resumeRequest.id,
      requester: requester.name,
      veteran: veteran.name,
      senderName,
      senderCompany,
      purpose,
      message_preview: message.substring(0, 100) + '...'
    })

    return NextResponse.json({
      success: true,
      requestId: resumeRequest.id,
      message: 'Resume request sent successfully'
    })

  } catch (error) {
    console.error('Error in resume request API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
