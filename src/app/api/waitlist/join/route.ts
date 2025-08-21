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

    // Check if email already exists in users table
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

    if (existingUser) {
      // Check if user already has a role (means they're already registered)
      if (existingUser.role) {
        return NextResponse.json(
          { error: 'You already have an account. Please sign in instead.' },
          { status: 400 }
        )
      }
    }

    // Get current waitlist count for position
    const { count: currentCount, error: countError } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('profile_type', 'veteran')
      .eq('is_active', true)

    console.log('Waitlist count check:', { currentCount, countError: countError?.message })

    if (countError) {
      console.error('Error getting waitlist count:', countError)
      // Continue with position 1 if we can't get the count
    }

    const position = (currentCount || 0) + 1

    // Generate referral code
    const referralCode = nanoid(8).toUpperCase()

    // Prepare waitlist profile data
    const waitlistProfileData = {
      waitlist_status: 'waiting',
      waitlist_position: position,
      waitlist_joined_at: new Date().toISOString(),
      waitlist_referral_code: referralCode,
      waitlist_social_shares: 0,
      service_branch: body.service_branch,
      rank: body.rank
    }

    console.log('Preparing to save user with profile data:', waitlistProfileData)

    if (existingUser) {
      // Update existing user with role and create profile
      const { error: updateError } = await supabase
        .from('users')
        .update({
          name: body.name,
          role: 'veteran'
        })
        .eq('id', existingUser.id)

      console.log('Update existing user result:', { updateError: updateError?.message })

      if (updateError) {
        console.error('Error updating user for waitlist:', updateError)
        return NextResponse.json(
          { error: 'Failed to join waitlist' },
          { status: 500 }
        )
      }

      // Create or update user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: existingUser.id,
          profile_type: 'veteran',
          profile_data: waitlistProfileData,
          is_active: true
        })

      console.log('Create/update profile result:', { profileError: profileError?.message })

      if (profileError) {
        console.error('Error creating user profile for waitlist:', profileError)
        return NextResponse.json(
          { error: 'Failed to join waitlist' },
          { status: 500 }
        )
      }
    } else {
      // Create new user without auth dependency (for waitlist)
      const newUserId = nanoid(16) // Generate a temporary ID
      
      const newUserData = {
        id: newUserId,
        email: body.email,
        name: body.name,
        role: 'veteran' as const
      }

      console.log('Creating new user with data:', newUserData)

      const { error: insertError } = await supabase
        .from('users')
        .insert(newUserData)

      console.log('Insert new user result:', { insertError: insertError?.message })

      if (insertError) {
        console.error('Error creating user for waitlist:', insertError)
        return NextResponse.json(
          { error: 'Failed to join waitlist' },
          { status: 500 }
        )
      }

      // Create user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: newUserId,
          profile_type: 'veteran',
          profile_data: waitlistProfileData,
          is_active: true
        })

      console.log('Create profile result:', { profileError: profileError?.message })

      if (profileError) {
        console.error('Error creating user profile for waitlist:', profileError)
        return NextResponse.json(
          { error: 'Failed to join waitlist' },
          { status: 500 }
        )
      }
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
