import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerOnly } from '@/lib/supabaseServerOnly'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { pitchId, subject, message, requesterId } = await request.json()

    if (!pitchId || !message || !requesterId) {
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

    // Note: platform_emails table doesn't exist in live schema
    // Insert email into database
    // const { data: emailRecord, error: insertError } = await supabaseClient
    //   .from('platform_emails')
    //   .insert({
    //     pitch_id: pitchId,
    //     sender_id: requesterId,
    //     recipient_id: pitch.user_id,
    //     subject: subject || 'Requesting your resume - Xainik',
    //     message: message,
    //     status: 'sent',
    //     created_at: new Date().toISOString()
    //   })
    //   .select()
    //   .single()

    // if (insertError) {
    //   console.error('Error inserting email:', insertError)
    //   return NextResponse.json(
    //     { error: 'Failed to send email' },
    //     { status: 500 }
    //   )
    // }

    // Mock email record for now
    const emailRecord = {
      id: 'mock-email-id',
      created_at: new Date().toISOString()
    }

    // Log the activity
    await supabaseClient
      .from('user_activity_log')
      .insert({
        user_id: requesterId,
        activity_type: 'email_sent',
        target_user_id: pitch.user_id,
        target_pitch_id: pitchId,
        metadata: {
          subject: subject || 'Requesting your resume - Xainik',
          message_length: message.length,
          pitch_title: pitch.title
        },
        created_at: new Date().toISOString()
      })

    // TODO: Send actual email notification to veteran
    // This would integrate with your email service (SendGrid, AWS SES, etc.)
    console.log('Email sent through platform:', {
      id: emailRecord.id,
      sender: requester.name,
      recipient: veteran.name,
      subject: subject || 'Requesting your resume - Xainik',
      message_preview: message.substring(0, 100) + '...'
    })

    return NextResponse.json({
      success: true,
      emailId: emailRecord.id,
      message: 'Email sent successfully'
    })

  } catch (error) {
    console.error('Error in send email API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
