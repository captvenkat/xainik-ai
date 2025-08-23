import { NextRequest, NextResponse } from 'next/server'
import { sendEndorsementEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email, name, skill, endorserName } = await request.json()
    const recipientEmail = email || 'venky24aug@gmail.com'
    const veteranName = name || 'Venky Test'
    const skillName = skill || 'Leadership'
    const endorser = endorserName || 'John Doe'
    
    await sendEndorsementEmail(recipientEmail, veteranName, endorser, skillName)
    
    return NextResponse.json({
      success: true,
      message: 'Endorsement email sent successfully',
      recipient: recipientEmail,
      veteranName,
      skill: skillName,
      endorserName: endorser,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to send endorsement email',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Endorsement email test endpoint ready',
    usage: 'Send POST request with {"email": "test@example.com", "name": "Test User", "skill": "Leadership", "endorserName": "John Doe", "message": "Endorsement message"}'
  })
}
