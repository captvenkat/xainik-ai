import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    // Use the provided email, fallback to admin email if not provided
    const recipientEmail = email || process.env.ADMIN_EMAIL || 'admin@xainik.com'
    
    const buildHash = process.env.VERCEL_GIT_COMMIT_SHA || 'dev-build'
    const envName = process.env.NODE_ENV || 'development'
    const timestamp = new Date().toISOString()

    const emailResult = await resend.emails.send({
      from: 'Xainik <updates@xainik.com>',
      to: [recipientEmail],
      subject: `Test Email - ${envName} Environment`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>🧪 Test Email from Xainik</h2>
          <p>This is a test email to verify Resend integration.</p>
          
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Environment Details:</h3>
            <ul>
              <li><strong>Environment:</strong> ${envName}</li>
              <li><strong>Build Hash:</strong> ${buildHash}</li>
              <li><strong>Timestamp:</strong> ${timestamp}</li>
              <li><strong>Domain:</strong> ${process.env.NEXT_PUBLIC_SITE_URL || 'localhost'}</li>
            </ul>
          </div>
          
          <p>If you received this email, Resend is working correctly! 🎉</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            This is an automated test email. Please ignore if not expected.
          </p>
        </div>
      `
    })

    if (emailResult.error) {
      console.error('Resend error:', emailResult.error)
      return NextResponse.json({ error: 'Failed to send email', details: emailResult.error }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      messageId: emailResult.data?.id,
      to: recipientEmail,
      environment: envName,
      buildHash,
      timestamp
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}

// Also support GET for manual testing
export async function GET() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@xainik.com'
  
  return NextResponse.json({
    message: 'Test email endpoint ready',
    adminEmail,
    environment: process.env.NODE_ENV || 'development',
    buildHash: process.env.VERCEL_GIT_COMMIT_SHA || 'dev-build'
  })
}
