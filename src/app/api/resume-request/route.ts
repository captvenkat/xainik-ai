import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerOnly } from '@/lib/supabaseServerOnly'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { pitchId, message, requesterId } = await request.json()

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

    // Insert resume request into database
    const { data: resumeRequest, error: insertError } = await supabaseClient
      .from('resume_requests')
      .insert({
        pitch_id: pitchId,
        requester_id: requesterId,
        veteran_id: pitch.user_id,
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
    await supabaseClient
      .from('user_activity_log')
      .insert({
        user_id: requesterId,
        activity_type: 'resume_request_sent',
        target_user_id: pitch.user_id,
        target_pitch_id: pitchId,
        metadata: {
          message_length: message.length,
          pitch_title: pitch.title
        },
        created_at: new Date().toISOString()
      })

    // TODO: Send email notification to veteran
    // This would integrate with your email service (SendGrid, AWS SES, etc.)
    console.log('Resume request created:', {
      id: resumeRequest.id,
      requester: requester.name,
      veteran_id: pitch.user_id,
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
