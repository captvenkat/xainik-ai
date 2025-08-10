import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

const resend = new Resend(process.env.RESEND_API_KEY)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface ReceiptEmailData {
  receiptId: string
  recipientEmail: string
  recipientName?: string
  receiptNumber: string
  amount: number
  downloadUrl: string
  isAnonymous: boolean
}

export async function sendReceiptEmail(data: ReceiptEmailData): Promise<string> {
  try {
    const displayName = data.isAnonymous ? 'Anonymous Donor' : (data.recipientName || 'Donor')
    
    const { data: emailData, error } = await resend.emails.send({
      from: 'Xainik <donations@xainik.com>',
      to: [data.recipientEmail],
      subject: `Donation Receipt ${data.receiptNumber} - Xainik`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">Xainik</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Donation Receipt</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333; margin-bottom: 20px;">Dear ${displayName},</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Thank you for your generous donation to support our mission of connecting veterans with civilian opportunities.
            </p>
            
            <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #28a745;">
              <h3 style="margin: 0 0 10px 0; color: #333;">Donation Details</h3>
              <p style="margin: 5px 0; color: #666;"><strong>Receipt Number:</strong> ${data.receiptNumber}</p>
              <p style="margin: 5px 0; color: #666;"><strong>Amount:</strong> ₹${(data.amount / 100).toFixed(2)}</p>
              <p style="margin: 5px 0; color: #666;"><strong>Date:</strong> ${new Date().toLocaleDateString('en-IN')}</p>
              <p style="margin: 5px 0; color: #666;"><strong>Type:</strong> ${data.isAnonymous ? 'Anonymous Donation' : 'Named Donation'}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.downloadUrl}" 
                 style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
                Download Receipt
              </a>
            </div>
            
            <div style="background: #e8f5e8; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #28a745;">
              <h4 style="margin: 0 0 10px 0; color: #155724;">Tax Benefits</h4>
              <p style="margin: 0; color: #155724; font-size: 14px; line-height: 1.5;">
                Your donation is eligible for tax deduction under Section 80G of the Income Tax Act, 1961. 
                Please consult your tax advisor for specific benefits applicable to your situation.
              </p>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              This link will expire in 24 hours. Please keep this receipt for your tax records.
            </p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px; text-align: center;">
              Xainik - Empowering Veterans Through Technology<br>
              This is an automated message, please do not reply directly.
            </p>
          </div>
        </div>
      `
    })

    if (error) {
      console.error('Resend error:', error)
      throw new Error(`Failed to send receipt email: ${error.message}`)
    }

    // Log the email
    await supabase.from('email_logs').insert({
      document_type: 'receipt',
      document_id: data.receiptId,
      recipient_email: data.recipientEmail,
      message_id: emailData?.id
    })

    console.log('✅ Receipt email sent successfully')
    console.log('Message ID:', emailData?.id)
    console.log('To:', data.recipientEmail)

    return emailData?.id || ''

  } catch (error) {
    console.error('Receipt email error:', error)
    throw error
  }
}
