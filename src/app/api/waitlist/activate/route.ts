import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerOnly } from '@/lib/supabaseServerOnly'

interface ActivationData {
  email: string
  invitationCode: string
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerOnly()
    const body: ActivationData = await request.json()

    if (!body.email || !body.invitationCode) {
      return NextResponse.json(
        { error: 'Email and invitation code are required' },
        { status: 400 }
      )
    }

    // Find user by email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, metadata')
      .eq('email', body.email)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user is on waitlist and position <= 50
    const waitlistStatus = user.metadata?.waitlist_status
    const position = user.metadata?.waitlist_position

    if (waitlistStatus !== 'waiting' || !position || position > 50) {
      return NextResponse.json(
        { error: 'You are not eligible for activation' },
        { status: 403 }
      )
    }

    // Update user to activated status with trial plan
    const trialExpiresAt = new Date()
    trialExpiresAt.setDate(trialExpiresAt.getDate() + 30) // 30-day trial

    const { error: updateError } = await supabase
      .from('users')
      .update({
        metadata: {
          ...user.metadata,
          waitlist_status: 'activated',
          waitlist_activated_at: new Date().toISOString(),
          current_plan: 'introductory_trial',
          plan_activated_at: new Date().toISOString(),
          plan_expires_at: trialExpiresAt.toISOString(),
          plan_duration_days: 30
        }
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error activating user:', updateError)
      return NextResponse.json(
        { error: 'Failed to activate account' },
        { status: 500 }
      )
    }

    // Log activation event
    await supabase
      .from('activity_log')
      .insert({
        event: 'waitlist_activated',
        meta: {
          veteran_email: body.email,
          position: position,
          trial_expires_at: trialExpiresAt.toISOString()
        }
      })

    return NextResponse.json({
      success: true,
      message: 'Account activated successfully',
      trialExpiresAt: trialExpiresAt.toISOString()
    })

  } catch (error) {
    console.error('Waitlist activation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
