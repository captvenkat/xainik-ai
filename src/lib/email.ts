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
      from: 'Xainik <updates@xainik.com>',
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
      from: 'Xainik <updates@xainik.com>',
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
      from: 'Xainik <updates@xainik.com>',
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

// Section 80G Compliant Donation Receipt
export async function sendDonationReceipt(
  donorEmail: string,
  donorName: string,
  amount: number,
  transactionId: string
) {
  try {
    const receiptNumber = `RCP-${new Date().getFullYear()}-${transactionId.slice(-8).toUpperCase()}`
    const currentDate = new Date().toLocaleDateString('en-IN')
    const financialYear = new Date().getFullYear() + '-' + (new Date().getFullYear() + 1).toString().slice(-2)
    
    const { data, error } = await resend.emails.send({
      from: 'Xainik <updates@xainik.com>',
      to: [donorEmail],
      subject: `Section 80G Receipt - ${receiptNumber} | Xainik`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; border: 2px solid #1f2937; border-radius: 8px; padding: 20px;">
          <!-- Header -->
          <div style="text-align: center; border-bottom: 2px solid #1f2937; padding-bottom: 20px; margin-bottom: 20px;">
            <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 10px;">
              <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                  <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>
                </svg>
              </div>
              <h1 style="color: #1f2937; margin: 0; font-size: 28px;">XAINIK</h1>
            </div>
            <p style="color: #6b7280; margin: 0; font-size: 14px;">Section 8 Non-Profit Company</p>
            <p style="color: #6b7280; margin: 0; font-size: 14px;">Registration No: U85300MH2024NPL000000</p>
          </div>

          <!-- Receipt Title -->
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #1f2937; margin: 0; font-size: 24px; font-weight: bold;">DONATION RECEIPT</h2>
            <p style="color: #6b7280; margin: 5px 0 0 0; font-size: 16px;">(Under Section 80G of Income Tax Act, 1961)</p>
          </div>

          <!-- Receipt Details -->
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
              <div>
                <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 14px;"><strong>Receipt No:</strong></p>
                <p style="margin: 0; color: #1f2937; font-size: 16px; font-weight: bold;">${receiptNumber}</p>
              </div>
              <div>
                <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 14px;"><strong>Date:</strong></p>
                <p style="margin: 0; color: #1f2937; font-size: 16px;">${currentDate}</p>
              </div>
              <div>
                <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 14px;"><strong>Financial Year:</strong></p>
                <p style="margin: 0; color: #1f2937; font-size: 16px;">${financialYear}</p>
              </div>
              <div>
                <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 14px;"><strong>Transaction ID:</strong></p>
                <p style="margin: 0; color: #1f2937; font-size: 16px;">${transactionId}</p>
              </div>
            </div>
          </div>

          <!-- Donor Details -->
          <div style="margin-bottom: 20px;">
            <h3 style="color: #1f2937; margin: 0 0 10px 0; font-size: 18px;">Donor Details:</h3>
            <div style="background: #f8fafc; padding: 15px; border-radius: 6px;">
              <p style="margin: 0; color: #1f2937; font-size: 16px;"><strong>Name:</strong> ${donorName}</p>
              <p style="margin: 5px 0 0 0; color: #1f2937; font-size: 16px;"><strong>Email:</strong> ${donorEmail}</p>
            </div>
          </div>

          <!-- Donation Details -->
          <div style="margin-bottom: 20px;">
            <h3 style="color: #1f2937; margin: 0 0 10px 0; font-size: 18px;">Donation Details:</h3>
            <div style="background: #f8fafc; padding: 15px; border-radius: 6px;">
              <p style="margin: 0; color: #1f2937; font-size: 16px;"><strong>Amount:</strong> ₹${amount.toLocaleString('en-IN')}</p>
              <p style="margin: 5px 0 0 0; color: #1f2937; font-size: 16px;"><strong>Currency:</strong> Indian Rupees (INR)</p>
              <p style="margin: 5px 0 0 0; color: #1f2937; font-size: 16px;"><strong>Payment Method:</strong> Online Payment (Razorpay)</p>
            </div>
          </div>

          <!-- Section 80G Details -->
          <div style="margin-bottom: 20px;">
            <h3 style="color: #1f2937; margin: 0 0 10px 0; font-size: 18px;">Section 80G Tax Exemption:</h3>
            <div style="background: #e8f4fd; padding: 15px; border-radius: 6px; border-left: 4px solid #3b82f6;">
              <p style="margin: 0; color: #1f2937; font-size: 16px;"><strong>Organization:</strong> Xainik (Section 8 Non-Profit)</p>
              <p style="margin: 5px 0 0 0; color: #1f2937; font-size: 16px;"><strong>80G Registration:</strong> Applied for Section 80G approval</p>
              <p style="margin: 5px 0 0 0; color: #1f2937; font-size: 16px;"><strong>Tax Benefit:</strong> 50% of donation amount is tax deductible</p>
              <p style="margin: 5px 0 0 0; color: #1f2937; font-size: 16px;"><strong>Deduction Limit:</strong> Up to 10% of gross total income</p>
            </div>
          </div>

          <!-- Organization Details -->
          <div style="margin-bottom: 20px;">
            <h3 style="color: #1f2937; margin: 0 0 10px 0; font-size: 18px;">Organization Details:</h3>
            <div style="background: #f8fafc; padding: 15px; border-radius: 6px;">
              <p style="margin: 0; color: #1f2937; font-size: 16px;"><strong>Name:</strong> Xainik</p>
              <p style="margin: 5px 0 0 0; color: #1f2937; font-size: 16px;"><strong>Legal Status:</strong> Section 8 Non-Profit Company</p>
              <p style="margin: 5px 0 0 0; color: #1f2937; font-size: 16px;"><strong>Registration No:</strong> U85300MH2024NPL000000</p>
              <p style="margin: 5px 0 0 0; color: #1f2937; font-size: 16px;"><strong>Registered Office:</strong> Mumbai, Maharashtra, India</p>
              <p style="margin: 5px 0 0 0; color: #1f2937; font-size: 16px;"><strong>Email:</strong> ceo@faujnet.com</p>
              <p style="margin: 5px 0 0 0; color: #1f2937; font-size: 16px;"><strong>Website:</strong> https://xainik.com</p>
            </div>
          </div>

          <!-- Mission Statement -->
          <div style="margin-bottom: 20px;">
            <h3 style="color: #1f2937; margin: 0 0 10px 0; font-size: 18px;">Our Mission:</h3>
            <div style="background: #f0f9ff; padding: 15px; border-radius: 6px; border-left: 4px solid #0ea5e9;">
              <p style="margin: 0; color: #1f2937; font-size: 16px; line-height: 1.6;">
                To connect military veterans with meaningful civilian career opportunities through our AI-first, 
                community-supported hiring platform. Your donation helps us provide free resources and support 
                to veterans during their career transition.
              </p>
            </div>
          </div>

          <!-- Thank You Message -->
          <div style="text-align: center; background: #fef3c7; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #92400e; margin: 0 0 10px 0; font-size: 20px;">Thank You for Your Generosity!</h3>
            <p style="margin: 0; color: #92400e; font-size: 16px; line-height: 1.6;">
              Your contribution of ₹${amount.toLocaleString('en-IN')} will directly support our mission to help veterans 
              find meaningful careers. Every rupee makes a difference in a veteran's life.
            </p>
          </div>

          <!-- Footer -->
          <div style="border-top: 2px solid #1f2937; padding-top: 20px; text-align: center;">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">
              <strong>For any queries regarding this receipt, please contact:</strong><br>
              Email: ceo@faujnet.com | Phone: +91-XXXXXXXXXX<br>
              This is a computer-generated receipt and does not require a physical signature.
            </p>
            <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 12px;">
              © 2024 Xainik. All rights reserved. | Section 8 Non-Profit Company
            </p>
          </div>
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
