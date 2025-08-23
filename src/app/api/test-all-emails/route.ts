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
      await sendEndorsementEmail(recipientEmail, 'Venky Test', 'Leadership', 'John Doe', 'Great leadership skills!')
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
      const contactResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Venky Test',
          email: recipientEmail,
          subject: 'Test Contact Form',
          message: 'This is a test message from the contact form to verify email functionality.'
        })
      })
      
      if (contactResponse.ok) {
        results.push({ type: 'Contact Form Email', status: '✅ Sent', details: 'Contact form submission' })
      } else {
        const errorData = await contactResponse.json()
        results.push({ type: 'Contact Form Email', status: '❌ Failed', details: errorData.error || 'Contact form failed' })
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
