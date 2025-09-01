import { NextResponse } from 'next/server'
import EmailService from '@/lib/services/email'

export async function POST(request: Request) {
  try {
    const { email, name, role } = await request.json()

    // Validate input
    if (!email || !role) {
      return NextResponse.json(
        { error: 'Email and role are required' },
        { status: 400 }
      )
    }

    if (!email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      )
    }

    if (!['veteran', 'supporter', 'recruiter'].includes(role)) {
      return NextResponse.json(
        { error: 'Valid role is required (veteran, supporter, or recruiter)' },
        { status: 400 }
      )
    }

    // Send welcome email using Resend
    const result = await EmailService.sendWelcomeEmail({
      email: email.toLowerCase().trim(),
      name: name?.trim(),
      role: role as 'veteran' | 'supporter' | 'recruiter'
    })

    if (!result.success) {
      console.error('Failed to send welcome email:', result.error)
      return NextResponse.json(
        { error: 'Failed to send welcome email. Please try again later.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Welcome email sent successfully!' 
    })

  } catch (error) {
    console.error('Welcome email API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
