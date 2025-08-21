import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function POST(request: NextRequest) {
  try {
    const resendApiKey = process.env.RESEND_API_KEY
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@xainik.com'
    
    // Check if API key exists
    if (!resendApiKey) {
      return NextResponse.json({ 
        error: 'RESEND_API_KEY not found in environment variables',
        status: 'missing_api_key'
      }, { status: 500 })
    }

    // Initialize Resend
    const resend = new Resend(resendApiKey)
    
    // Test with a simple email
    const { data, error } = await resend.emails.send({
      from: 'Xainik <noreply@xainik.com>',
      to: [adminEmail],
      subject: 'Resend Debug Test',
      html: '<p>This is a debug test email from Resend integration.</p>'
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ 
        error: 'Resend API error',
        details: error,
        status: 'resend_error'
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      messageId: data?.id,
      to: adminEmail,
      status: 'email_sent'
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ 
      error: 'Unexpected error',
      details: error instanceof Error ? error.message : 'Unknown error',
      status: 'unexpected_error'
    }, { status: 500 })
  }
}

export async function GET() {
  const resendApiKey = process.env.RESEND_API_KEY
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@xainik.com'
  
  return NextResponse.json({
    message: 'Resend debug endpoint',
    hasApiKey: !!resendApiKey,
    apiKeyLength: resendApiKey ? resendApiKey.length : 0,
    adminEmail,
    environment: process.env.NODE_ENV || 'development'
  })
}
