import { NextRequest, NextResponse } from 'next/server'
import { 
  sendWelcomeEmail, 
  sendResumeRequestEmail, 
  sendEndorsementEmail, 
 
  sendPasswordResetEmail,
  sendEmail 
} from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    const recipientEmail = email || 'venky24aug@gmail.com'
    
    const results = []
    
    // 1. Test Welcome Email
    try {
      await sendWelcomeEmail(recipientEmail, 'Venky Test', 'veteran')
      results.push({ type: 'Welcome Email', status: '✅ Sent', details: 'Veteran welcome email' })
    } catch (error) {
      results.push({ type: 'Welcome Email', status: '❌ Failed', details: error instanceof Error ? error.message : 'Unknown error' })
    }
    
    // 2. Test Resume Request Email
    try {
      await sendResumeRequestEmail(recipientEmail, 'Venky Test', 'Tech Recruiter', 'Software Engineer Pitch', 'Interested in your profile')
      results.push({ type: 'Resume Request Email', status: '✅ Sent', details: 'Resume request notification' })
    } catch (error) {
      results.push({ type: 'Resume Request Email', status: '❌ Failed', details: error instanceof Error ? error.message : 'Unknown error' })
    }
    
    // 3. Test Endorsement Email
    try {
      await sendEndorsementEmail(recipientEmail, 'Venky Test', 'John Doe', 'Leadership')
      results.push({ type: 'Endorsement Email', status: '✅ Sent', details: 'New endorsement notification' })
    } catch (error) {
      results.push({ type: 'Endorsement Email', status: '❌ Failed', details: error instanceof Error ? error.message : 'Unknown error' })
    }
    
    // 4. Test Password Reset Email
    try {
      await sendPasswordResetEmail(recipientEmail, 'test-reset-token-123')
      results.push({ type: 'Password Reset Email', status: '✅ Sent', details: 'Password reset link' })
    } catch (error) {
      results.push({ type: 'Password Reset Email', status: '❌ Failed', details: error instanceof Error ? error.message : 'Unknown error' })
    }
    
    // 5. Test Generic Email Template
    try {
      await sendEmail({
        to: recipientEmail,
        subject: 'Test Generic Email Template',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>🧪 Test Generic Email Template</h2>
            <p>This is a test of the generic email template system.</p>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3>Template Features:</h3>
              <ul>
                <li>Customizable subject and content</li>
                <li>HTML formatting support</li>
                <li>Consistent styling</li>
                <li>Professional appearance</li>
              </ul>
            </div>
            <p>If you received this email, the generic template system is working! 🎉</p>
          </div>
        `
      })
      results.push({ type: 'Generic Email Template', status: '✅ Sent', details: 'Custom template email' })
    } catch (error) {
      results.push({ type: 'Generic Email Template', status: '❌ Failed', details: error instanceof Error ? error.message : 'Unknown error' })
    }
    
    // 6. Test Contact Form Email
    try {
      // Import and use the contact form logic directly instead of making HTTP request
      const { Resend } = await import('resend')
      const resend = new Resend(process.env.RESEND_API_KEY)
      
      const supportEmail = process.env.SUPPORT_EMAIL || 'ceo@faujnet.com'
      const timestamp = new Date().toISOString()
      
      const { data, error } = await resend.emails.send({
        from: 'Xainik (Veteran Success Foundation, Sec. 8 not for profit) <noreply@updates.xainik.com>',
        to: [supportEmail],
        replyTo: recipientEmail,
        subject: 'Test Contact Form',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>📧 Test Contact Form Email</h2>
            
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Contact Details:</h3>
              <p><strong>Name:</strong> Venky Test</p>
              <p><strong>Email:</strong> ${recipientEmail}</p>
              <p><strong>Subject:</strong> Test Contact Form</p>
              <p><strong>Timestamp:</strong> ${timestamp}</p>
            </div>
            
            <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Message:</h3>
              <p style="white-space: pre-wrap;">This is a test message from the contact form to verify email functionality.</p>
            </div>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">
              This is a test email from the Xainik contact form testing system.
            </p>
          </div>
        `
      })
      
      if (error) {
        results.push({ type: 'Contact Form Email', status: '❌ Failed', details: error.message || 'Contact form failed' })
      } else {
        results.push({ type: 'Contact Form Email', status: '✅ Sent', details: 'Contact form submission' })
      }
    } catch (error) {
      results.push({ type: 'Contact Form Email', status: '❌ Failed', details: error instanceof Error ? error.message : 'Unknown error' })
    }
    
    // 7. Test Donation Receipt Email (requires receipt data)
    try {
      // This would normally require actual receipt data from the database
      // For testing, we'll simulate with mock data
      results.push({ type: 'Donation Receipt Email', status: '⚠️ Skipped', details: 'Requires actual receipt data from database' })
    } catch (error) {
      results.push({ type: 'Donation Receipt Email', status: '❌ Failed', details: error instanceof Error ? error.message : 'Unknown error' })
    }
    
    const successCount = results.filter(r => r.status === '✅ Sent').length
    const totalCount = results.length
    
    return NextResponse.json({
      success: true,
      message: `Email testing completed: ${successCount}/${totalCount} successful`,
      recipient: recipientEmail,
      timestamp: new Date().toISOString(),
      results: results,
      summary: {
        total: totalCount,
        successful: successCount,
        failed: results.filter(r => r.status === '❌ Failed').length,
        skipped: results.filter(r => r.status === '⚠️ Skipped').length
      }
    })
    
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to test emails',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET endpoint for testing
export async function GET() {
  return NextResponse.json({
    message: 'Comprehensive email testing endpoint ready',
    emailTypes: [
      'Welcome Email',
      'Resume Request Email', 
      'Endorsement Email',
      'Password Reset Email',
      'Generic Email Template',
      'Contact Form Email',
      'Donation Receipt Email'
    ],
    usage: 'Send POST request with {"email": "test@example.com"} to test all email types'
  })
}
