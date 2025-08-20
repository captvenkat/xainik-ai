import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerOnly } from '@/lib/supabaseServerOnly'
import { nanoid } from 'nanoid'

interface WaitlistSignupData {
  name: string
  email: string
  service_branch: string
  rank: string
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerOnly()
    const body: WaitlistSignupData = await request.json()

    // Validate required fields
    if (!body.name || !body.email || !body.service_branch || !body.rank) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Check if email already exists in waitlist
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, metadata')
      .eq('email', body.email)
      .single()

    if (existingUser) {
      // Check if user is already on waitlist
      const waitlistStatus = existingUser.metadata?.waitlist_status
      if (waitlistStatus && waitlistStatus !== 'expired') {
        return NextResponse.json(
          { error: 'You are already on the waitlist' },
          { status: 400 }
        )
      }
    }

    // Get current waitlist count for position
    const { count: currentCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .not('metadata->waitlist_status', 'is', null)

    const position = (currentCount || 0) + 1

    // Generate referral code
    const referralCode = nanoid(8).toUpperCase()

    // Prepare waitlist metadata
    const waitlistMetadata = {
      waitlist_status: 'waiting',
      waitlist_position: position,
      waitlist_joined_at: new Date().toISOString(),
      waitlist_referral_code: referralCode,
      waitlist_social_shares: 0,
      service_branch: body.service_branch,
      rank: body.rank
    }

    if (existingUser) {
      // Update existing user with waitlist metadata
      const { error: updateError } = await supabase
        .from('users')
        .update({
          name: body.name,
          metadata: {
            ...existingUser.metadata,
            ...waitlistMetadata
          }
        })
        .eq('id', existingUser.id)

      if (updateError) {
        console.error('Error updating user for waitlist:', updateError)
        return NextResponse.json(
          { error: 'Failed to join waitlist' },
          { status: 500 }
        )
      }
    } else {
      // Create new user for waitlist
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          email: body.email,
          name: body.name,
          role: 'veteran',
          metadata: waitlistMetadata
        })

      if (insertError) {
        console.error('Error creating user for waitlist:', insertError)
        return NextResponse.json(
          { error: 'Failed to join waitlist' },
          { status: 500 }
        )
      }
    }

    // Send confirmation email
    try {
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: body.email,
          subject: `You're #${position} in line! 🎯 Join the exclusive veteran waitlist`,
          template: 'waitlist-confirmation',
          data: {
            name: body.name,
            position: position,
            referralCode: referralCode,
            totalSignups: position
          }
        })
      })
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError)
      // Don't fail the request if email fails
    }

    // Log activity for FOMO ticker
    try {
      await supabase
        .from('activity_log')
        .insert({
          event: 'veteran_joined_waitlist',
          meta: {
            veteran_name: body.name,
            position: position,
            service_branch: body.service_branch,
            rank: body.rank
          }
        })
    } catch (logError) {
      console.error('Failed to log activity:', logError)
      // Don't fail the request if logging fails
    }

    return NextResponse.json({
      success: true,
      position: position,
      referralCode: referralCode,
      message: 'Successfully joined waitlist'
    })

  } catch (error) {
    console.error('Waitlist join error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
