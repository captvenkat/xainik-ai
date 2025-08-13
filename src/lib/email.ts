import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// Email templates
export interface EmailTemplate {
  to: string
  subject: string
  html: string
  from?: string
}

// Welcome email for new users
export async function sendWelcomeEmail(userEmail: string, userName: string, role: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Xainik <noreply@xainik.com>',
      to: [userEmail],
      subject: 'Welcome to Xainik - Your Veteran Career Journey Starts Here!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1f2937; text-align: center;">Welcome to Xainik!</h1>
          <p>Hi ${userName},</p>
          <p>Welcome to Xainik - the platform that connects military veterans with meaningful career opportunities!</p>
          <p>Your account has been created successfully with the role: <strong>${role}</strong></p>
          <p>Here's what you can do next:</p>
          <ul>
            <li>Complete your profile</li>
            <li>Explore the platform</li>
            <li>Connect with other veterans and recruiters</li>
          </ul>
          <p>If you have any questions, feel free to reach out to our support team.</p>
          <p>Best regards,<br>The Xainik Team</p>
        </div>
      `
    })

    if (error) {
      console.error('Error sending welcome email:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error sending welcome email:', error)
    return false
  }
}

// Resume request notification
export async function sendResumeRequestEmail(
  veteranEmail: string,
  veteranName: string,
  recruiterName: string,
  companyName: string,
  requestId: string
) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Xainik <noreply@xainik.com>',
      to: [veteranEmail],
      subject: `Resume Request from ${companyName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1f2937;">New Resume Request</h1>
          <p>Hi ${veteranName},</p>
          <p>Great news! A recruiter is interested in your profile.</p>
          <p><strong>Recruiter:</strong> ${recruiterName}</p>
          <p><strong>Company:</strong> ${companyName}</p>
          <p>You can review and respond to this request from your dashboard.</p>
          <p>Request ID: ${requestId}</p>
          <p>Best regards,<br>The Xainik Team</p>
        </div>
      `
    })

    if (error) {
      console.error('Error sending resume request email:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error sending resume request email:', error)
    return false
  }
}

// Endorsement notification
export async function sendEndorsementEmail(
  veteranEmail: string,
  veteranName: string,
  endorserName: string,
  skill: string
) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Xainik <noreply@xainik.com>',
      to: [veteranEmail],
      subject: `New Endorsement for ${skill}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1f2937;">New Skill Endorsement</h1>
          <p>Hi ${veteranName},</p>
          <p>Congratulations! You received a new endorsement.</p>
          <p><strong>Endorser:</strong> ${endorserName}</p>
          <p><strong>Skill:</strong> ${skill}</p>
          <p>This endorsement will help boost your profile visibility to recruiters.</p>
          <p>Best regards,<br>The Xainik Team</p>
        </div>
      `
    })

    if (error) {
      console.error('Error sending endorsement email:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error sending endorsement email:', error)
    return false
  }
}

// Donation receipt
export async function sendDonationReceipt(
  donorEmail: string,
  donorName: string,
  amount: number,
  transactionId: string
) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Xainik <noreply@xainik.com>',
      to: [donorEmail],
      subject: 'Thank you for your donation to Xainik',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1f2937;">Thank You for Your Support!</h1>
          <p>Hi ${donorName},</p>
          <p>Thank you for your generous donation of ₹${amount} to support our mission of helping veterans find meaningful careers.</p>
          <p><strong>Transaction ID:</strong> ${transactionId}</p>
          <p>Your contribution will help us:</p>
          <ul>
            <li>Provide free access to veterans</li>
            <li>Improve our platform features</li>
            <li>Support our community initiatives</li>
          </ul>
          <p>Best regards,<br>The Xainik Team</p>
        </div>
      `
    })

    if (error) {
      console.error('Error sending donation receipt:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error sending donation receipt:', error)
    return false
  }
}

// Password reset email
export async function sendPasswordResetEmail(userEmail: string, resetToken: string) {
  try {
    const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password?token=${resetToken}`
    
    const { data, error } = await resend.emails.send({
      from: 'Xainik <noreply@xainik.com>',
      to: [userEmail],
      subject: 'Reset your Xainik password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1f2937;">Password Reset Request</h1>
          <p>You requested to reset your password for your Xainik account.</p>
          <p>Click the link below to reset your password:</p>
          <a href="${resetUrl}" style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Reset Password</a>
          <p>If you didn't request this, please ignore this email.</p>
          <p>This link will expire in 1 hour.</p>
          <p>Best regards,<br>The Xainik Team</p>
        </div>
      `
    })

    if (error) {
      console.error('Error sending password reset email:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error sending password reset email:', error)
    return false
  }
}

// Generic email sender
export async function sendEmail(template: EmailTemplate) {
  try {
    const { data, error } = await resend.emails.send({
      from: template.from || 'Xainik <noreply@xainik.com>',
      to: [template.to],
      subject: template.subject,
      html: template.html
    })

    if (error) {
      console.error('Error sending email:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error sending email:', error)
    return false
  }
}
