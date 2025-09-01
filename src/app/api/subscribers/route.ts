import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseClient'
import EmailService from '@/lib/services/email'

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      )
    }

    // Insert subscriber
    const { error } = await supabaseAdmin
      .from('subscribers')
      .insert({
        email: email.toLowerCase().trim(),
        source: 'stay_connected',
        name: name?.trim() || null
      })

    if (error) {
      console.error('Error inserting subscriber:', error)
      
      // Check if it's a duplicate email error
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'This email is already subscribed' },
          { status: 409 }
        )
      }
      
      return NextResponse.json(
        { error: 'Failed to subscribe' },
        { status: 500 }
      )
    }

    // Send welcome email using Resend
    try {
      await EmailService.sendNewsletterConfirmation({
        email: email.toLowerCase().trim(),
        name: name?.trim()
      })
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError)
      // Don't fail the subscription if email fails
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Subscribers API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
