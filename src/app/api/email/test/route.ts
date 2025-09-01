import { NextResponse } from 'next/server'
import EmailService from '@/lib/services/email'

export async function POST(request: Request) {
  try {
    const { testEmail } = await request.json()

    if (!testEmail || !testEmail.includes('@')) {
      return NextResponse.json(
        { error: 'Valid test email is required' },
        { status: 400 }
      )
    }

    // Send a test email
    const result = await EmailService.sendEmail({
      to: testEmail,
      subject: 'Resend Test - Xainik Veterans',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Resend Test - Xainik</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 30px; border-radius: 10px; border-left: 5px solid #D4AF37;">
              <h1 style="color: #D4AF37; margin: 0 0 20px 0; font-size: 24px;">🎖️ Resend Test Successful!</h1>
              
              <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h2 style="color: #fff; margin: 0 0 15px 0; font-size: 18px;">Email Service Status</h2>
                <p style="color: #ccc; margin: 5px 0;"><strong>Status:</strong> ✅ Working</p>
                <p style="color: #ccc; margin: 5px 0;"><strong>Service:</strong> Resend</p>
                <p style="color: #ccc; margin: 5px 0;"><strong>Time:</strong> ${new Date().toLocaleString('en-IN')}</p>
              </div>
              
              <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h2 style="color: #fff; margin: 0 0 15px 0; font-size: 18px;">What This Means</h2>
                <p style="color: #ccc; margin: 0;">
                  Your Resend integration is working perfectly! All email functions including contact forms, donation receipts, welcome emails, and password resets are now operational.
                </p>
              </div>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); text-align: center;">
                <p style="color: #999; font-size: 12px; margin: 0;">
                  This is a test email from the Xainik Veterans platform
                </p>
              </div>
            </div>
          </body>
        </html>
      `
    })

    if (!result.success) {
      console.error('Failed to send test email:', result.error)
      return NextResponse.json(
        { error: 'Failed to send test email. Please check your Resend configuration.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Test email sent successfully! Check your inbox.',
      data: result.data
    })

  } catch (error) {
    console.error('Test email API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
