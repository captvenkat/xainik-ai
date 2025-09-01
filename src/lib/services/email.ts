import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export interface EmailData {
  to: string
  subject: string
  html: string
  from?: string
  replyTo?: string
}

export interface ContactFormData {
  name: string
  email: string
  message: string
}

export interface DonationReceiptData {
  donorName: string
  donorEmail: string
  amount: number
  transactionId: string
  date: string
  isAnonymous: boolean
  displayName?: string
}

export interface WelcomeEmailData {
  email: string
  name?: string
  role: 'veteran' | 'supporter' | 'recruiter'
}

export interface NewsletterData {
  email: string
  name?: string
}

export class EmailService {
  private static defaultFrom = 'Xainik <noreply@xainik.com>'
  private static supportEmail = 'support@xainik.com'

  /**
   * Send a generic email
   */
  static async sendEmail(emailData: EmailData) {
    try {
      const result = await resend.emails.send({
        from: emailData.from || this.defaultFrom,
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        replyTo: emailData.replyTo || this.supportEmail,
      })
      
      console.log('Email sent successfully:', result)
      return { success: true, data: result }
    } catch (error) {
      console.error('Failed to send email:', error)
      return { success: false, error }
    }
  }

  /**
   * Send contact form email to CEO
   */
  static async sendContactForm(data: ContactFormData) {
    const subject = `New Contact Form Submission from ${data.name}`
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Contact Form Submission</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 30px; border-radius: 10px; border-left: 5px solid #D4AF37;">
            <h1 style="color: #D4AF37; margin: 0 0 20px 0; font-size: 24px;">New Contact Form Submission</h1>
            
            <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #fff; margin: 0 0 15px 0; font-size: 18px;">Contact Details</h2>
              <p style="color: #ccc; margin: 5px 0;"><strong>Name:</strong> ${data.name}</p>
              <p style="color: #ccc; margin: 5px 0;"><strong>Email:</strong> ${data.email}</p>
              <p style="color: #ccc; margin: 5px 0;"><strong>Date:</strong> ${new Date().toLocaleString('en-IN')}</p>
            </div>
            
            <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #fff; margin: 0 0 15px 0; font-size: 18px;">Message</h2>
              <p style="color: #ccc; margin: 0; white-space: pre-wrap;">${data.message}</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="mailto:${data.email}" style="background: #D4AF37; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reply to ${data.name}</a>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); text-align: center;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                This email was sent from the Xainik contact form at xainik.com
              </p>
            </div>
          </div>
        </body>
      </html>
    `

    return this.sendEmail({
      to: 'ceo@faujnet.com',
      subject,
      html,
      replyTo: data.email,
    })
  }

  /**
   * Send donation receipt email
   */
  static async sendDonationReceipt(data: DonationReceiptData) {
    const subject = `Thank you for your donation to Xainik Veterans`
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Donation Receipt - Xainik Veterans</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 30px; border-radius: 10px; border-left: 5px solid #D4AF37;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #D4AF37; margin: 0; font-size: 28px;">🎖️ Thank You!</h1>
              <p style="color: #fff; font-size: 18px; margin: 10px 0;">Your donation will help veterans succeed</p>
            </div>
            
            <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #fff; margin: 0 0 15px 0; font-size: 20px;">Donation Details</h2>
              <p style="color: #ccc; margin: 5px 0;"><strong>Donor:</strong> ${data.isAnonymous ? (data.displayName || 'Anonymous Hero') : data.donorName}</p>
              <p style="color: #ccc; margin: 5px 0;"><strong>Amount:</strong> ₹${data.amount.toLocaleString('en-IN')}</p>
              <p style="color: #ccc; margin: 5px 0;"><strong>Transaction ID:</strong> ${data.transactionId}</p>
              <p style="color: #ccc; margin: 5px 0;"><strong>Date:</strong> ${data.date}</p>
            </div>
            
            <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #fff; margin: 0 0 15px 0; font-size: 20px;">How Your Donation Helps</h2>
              <ul style="color: #ccc; margin: 0; padding-left: 20px;">
                <li>Veteran career transition programs</li>
                <li>AI-powered skill translation</li>
                <li>Industry outreach and partnerships</li>
                <li>Technology platform development</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://xainik.com" style="background: #D4AF37; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Visit Xainik</a>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); text-align: center;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                This is an official receipt from Veteran Success Foundation (Sec-8 Nonprofit, Regn. No: 138784)
              </p>
            </div>
          </div>
        </body>
      </html>
    `

    return this.sendEmail({
      to: data.donorEmail,
      subject,
      html,
    })
  }

  /**
   * Send welcome email to new users
   */
  static async sendWelcomeEmail(data: WelcomeEmailData) {
    const roleDisplay = {
      veteran: 'Veteran',
      supporter: 'Supporter',
      recruiter: 'Recruiter'
    }[data.role]

    const subject = `Welcome to Xainik, ${data.name || roleDisplay}!`
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Xainik</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 30px; border-radius: 10px; border-left: 5px solid #D4AF37;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #D4AF37; margin: 0; font-size: 28px;">🎖️ Welcome to Xainik!</h1>
              <p style="color: #fff; font-size: 18px; margin: 10px 0;">Building the future for Indian veterans</p>
            </div>
            
            <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #fff; margin: 0 0 15px 0; font-size: 20px;">Welcome, ${data.name || roleDisplay}!</h2>
              <p style="color: #ccc; margin: 0;">
                Thank you for joining Xainik. You're now part of a movement that's transforming how Indian veterans transition to civilian careers.
              </p>
            </div>
            
            <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #fff; margin: 0 0 15px 0; font-size: 20px;">What's Next?</h2>
              <ul style="color: #ccc; margin: 0; padding-left: 20px;">
                <li>Complete your profile</li>
                <li>Explore our AI-powered tools</li>
                <li>Connect with the veteran community</li>
                <li>Start your journey to success</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://xainik.com/dashboard" style="background: #D4AF37; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Go to Dashboard</a>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); text-align: center;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                Questions? Contact us at support@xainik.com
              </p>
            </div>
          </div>
        </body>
      </html>
    `

    return this.sendEmail({
      to: data.email,
      subject,
      html,
    })
  }

  /**
   * Send newsletter subscription confirmation
   */
  static async sendNewsletterConfirmation(data: NewsletterData) {
    const subject = `Welcome to Xainik Veterans Newsletter`
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Newsletter Subscription Confirmed</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 30px; border-radius: 10px; border-left: 5px solid #D4AF37;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #D4AF37; margin: 0; font-size: 28px;">📧 Newsletter Confirmed!</h1>
              <p style="color: #fff; font-size: 18px; margin: 10px 0;">Stay updated with veteran success stories</p>
            </div>
            
            <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #fff; margin: 0 0 15px 0; font-size: 20px;">Welcome to the Xainik Community!</h2>
              <p style="color: #ccc; margin: 0;">
                Hi ${data.name || 'there'}, you're now subscribed to receive updates about veteran success stories, platform developments, and how your support is making a difference.
              </p>
            </div>
            
            <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #fff; margin: 0 0 15px 0; font-size: 20px;">What You'll Receive</h2>
              <ul style="color: #ccc; margin: 0; padding-left: 20px;">
                <li>Veteran success stories</li>
                <li>Platform updates and features</li>
                <li>Impact reports and transparency</li>
                <li>Ways to get involved</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://xainik.com" style="background: #D4AF37; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Visit Xainik</a>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); text-align: center;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                You can unsubscribe anytime by replying with "UNSUBSCRIBE"
              </p>
            </div>
          </div>
        </body>
      </html>
    `

    return this.sendEmail({
      to: data.email,
      subject,
      html,
    })
  }

  /**
   * Send password reset email
   */
  static async sendPasswordReset(email: string, resetToken: string) {
    const subject = `Reset Your Xainik Password`
    const resetUrl = `https://xainik.com/auth/reset-password?token=${resetToken}`
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset - Xainik</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 30px; border-radius: 10px; border-left: 5px solid #D4AF37;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #D4AF37; margin: 0; font-size: 28px;">🔐 Password Reset</h1>
              <p style="color: #fff; font-size: 18px; margin: 10px 0;">Secure your Xainik account</p>
            </div>
            
            <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #ccc; margin: 0;">
                We received a request to reset your password. Click the button below to create a new password:
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background: #D4AF37; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
            </div>
            
            <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #ccc; margin: 0; font-size: 14px;">
                <strong>Security Note:</strong> This link will expire in 1 hour. If you didn't request this reset, please ignore this email.
              </p>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); text-align: center;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                Questions? Contact support@xainik.com
              </p>
            </div>
          </div>
        </body>
      </html>
    `

    return this.sendEmail({
      to: email,
      subject,
      html,
    })
  }
}

export default EmailService
