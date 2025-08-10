import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    const adminEmail = process.env.ADMIN_EMAIL || email || 'admin@xainik.com'
    
    const buildHash = process.env.VERCEL_GIT_COMMIT_SHA || 'dev-build'
    const envName = process.env.NODE_ENV || 'development'
    const timestamp = new Date().toISOString()

    const { data, error } = await resend.emails.send({
      from: 'Xainik <noreply@xainik.com>',
      to: [adminEmail],
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

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }

    console.log('✅ Test email sent successfully')
    console.log('Message ID:', data?.id)
    console.log('To:', adminEmail)

    return NextResponse.json({ 
      success: true, 
      messageId: data?.id,
      to: adminEmail,
      environment: envName,
      buildHash,
      timestamp
    })

  } catch (error) {
    console.error('Test email error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
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
