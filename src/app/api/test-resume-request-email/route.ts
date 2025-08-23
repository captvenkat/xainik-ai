import { NextRequest, NextResponse } from 'next/server'
import { sendResumeRequestEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email, name, recruiterName, pitchTitle, message } = await request.json()
    const recipientEmail = email || 'venky24aug@gmail.com'
    const veteranName = name || 'Venky Test'
    const recruiter = recruiterName || 'Tech Recruiter'
    const pitch = pitchTitle || 'Software Engineer Pitch'
    const msg = message || 'Interested in your profile and would like to request your resume.'
    
    await sendResumeRequestEmail(recipientEmail, veteranName, recruiter, pitch, msg)
    
    return NextResponse.json({
      success: true,
      message: 'Resume request email sent successfully',
      recipient: recipientEmail,
      veteranName,
      recruiterName: recruiter,
      pitchTitle: pitch,
      message: msg,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to send resume request email',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Resume request email test endpoint ready',
    usage: 'Send POST request with {"email": "test@example.com", "name": "Test User", "recruiterName": "Recruiter", "pitchTitle": "Pitch Title", "message": "Message"}'
  })
}
