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

    console.log('Waitlist join request received:', { email: body.email, name: body.name })

    // Validate required fields
    if (!body.name || !body.email || !body.service_branch || !body.rank) {
      console.log('Validation failed:', { name: !!body.name, email: !!body.email, service_branch: !!body.service_branch, rank: !!body.rank })
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Check if email already exists in users table (authenticated users)
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('id, role')
      .eq('email', body.email)
      .single()

    console.log('Existing user check:', { existingUser: !!existingUser, userError: userError?.message })

    if (userError && userError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking existing user:', userError)
      return NextResponse.json(
        { error: 'Database error while checking existing user' },
        { status: 500 }
      )
    }

    if (existingUser && existingUser.role) {
      return NextResponse.json(
        { error: 'You already have an account. Please sign in instead.' },
        { status: 400 }
      )
    }

    // Check if email already exists in activity_log as a waitlist signup
    const { data: existingWaitlist, error: waitlistError } = await supabase
      .from('activity_log')
      .select('id, meta')
      .eq('event', 'veteran_joined_waitlist')
      .contains('meta', { veteran_email: body.email })
      .single()

    console.log('Existing waitlist check:', { existingWaitlist: !!existingWaitlist, waitlistError: waitlistError?.message })

    if (waitlistError && waitlistError.code !== 'PGRST116') {
      console.error('Error checking existing waitlist entry:', waitlistError)
      return NextResponse.json(
        { error: 'Database error while checking waitlist' },
        { status: 500 }
      )
    }

    if (existingWaitlist) {
      return NextResponse.json(
        { error: 'Email already on waitlist' },
        { status: 400 }
      )
    }

    // Get current waitlist count for position
    const { data: waitlistEntries, error: countError } = await supabase
      .from('activity_log')
      .select('id')
      .eq('event', 'veteran_joined_waitlist')

    console.log('Waitlist count check:', { count: waitlistEntries?.length || 0, countError: countError?.message })

    const position = (waitlistEntries?.length || 0) + 1

    // Generate referral code
    const referralCode = nanoid(8).toUpperCase()

    // Create waitlist entry in activity_log
    const waitlistData = {
      event: 'veteran_joined_waitlist',
      meta: {
        veteran_name: body.name,
        veteran_email: body.email,
        position: position,
        service_branch: body.service_branch,
        rank: body.rank,
        referral_code: referralCode,
        joined_at: new Date().toISOString()
      }
    }

    console.log('Creating waitlist entry:', waitlistData)

    const { error: insertError } = await supabase
      .from('activity_log')
      .insert(waitlistData)

    console.log('Insert waitlist entry result:', { insertError: insertError?.message })

    if (insertError) {
      console.error('Error creating waitlist entry:', insertError)
      return NextResponse.json(
        { error: 'Failed to join waitlist' },
        { status: 500 }
      )
    }

    // Send confirmation email (non-blocking)
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

    // Log activity for FOMO ticker (non-blocking, with table existence check)
    try {
      // First check if activity_log table exists
      const { data: tableCheck, error: tableError } = await supabase
        .from('activity_log')
        .select('id')
        .limit(1)

      if (!tableError && tableCheck !== null) {
        // Table exists, proceed with logging
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
      } else {
        console.log('Activity log table not available, skipping activity logging')
      }
    } catch (logError) {
      console.error('Failed to log activity:', logError)
      // Don't fail the request if logging fails
    }

    console.log('Waitlist join successful:', { position, referralCode })

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
