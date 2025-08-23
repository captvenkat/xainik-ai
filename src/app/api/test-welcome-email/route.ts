import { NextRequest, NextResponse } from 'next/server'
import { sendWelcomeEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email, name, role } = await request.json()
    const recipientEmail = email || 'venky24aug@gmail.com'
    const userName = name || 'Venky Test'
    const userRole = role || 'veteran'
    
    await sendWelcomeEmail(recipientEmail, userName, userRole)
    
    return NextResponse.json({
      success: true,
      message: 'Welcome email sent successfully',
      recipient: recipientEmail,
      userName,
      userRole,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to send welcome email',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Welcome email test endpoint ready',
    usage: 'Send POST request with {"email": "test@example.com", "name": "Test User", "role": "veteran"}'
  })
}
