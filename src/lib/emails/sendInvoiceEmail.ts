import { Resend } from 'resend'
import { createSupabaseServerOnly } from '../supabaseServerOnly'

const resend = new Resend(process.env.RESEND_API_KEY)
const supabase = createSupabaseServerOnly()

interface InvoiceEmailData {
  invoiceId: string
  recipientEmail: string
  recipientName: string
  invoiceNumber: string
  amount: number
  downloadUrl: string
}

export async function sendInvoiceEmail(data: InvoiceEmailData): Promise<string> {
  try {
    const { data: emailData, error } = await resend.emails.send({
      from: 'Xainik <billing@xainik.com>',
      to: [data.recipientEmail],
      subject: `Invoice ${data.invoiceNumber} - Xainik`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">Xainik</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Invoice</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333; margin-bottom: 20px;">Dear ${data.recipientName},</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Thank you for your purchase. Your invoice is ready for download.
            </p>
            
            <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #667eea;">
              <h3 style="margin: 0 0 10px 0; color: #333;">Invoice Details</h3>
              <p style="margin: 5px 0; color: #666;"><strong>Invoice Number:</strong> ${data.invoiceNumber}</p>
              <p style="margin: 5px 0; color: #666;"><strong>Amount:</strong> ₹${(data.amount / 100).toFixed(2)}</p>
              <p style="margin: 5px 0; color: #666;"><strong>Date:</strong> ${new Date().toLocaleDateString('en-IN')}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.downloadUrl}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
                Download Invoice
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              This link will expire in 24 hours. If you have any questions, please contact our support team.
            </p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px; text-align: center;">
              Xainik - Connecting Veterans with Opportunities<br>
              This is an automated message, please do not reply directly.
            </p>
          </div>
        </div>
      `
    })

    if (error) {
      throw new Error(`Failed to send invoice email: ${error.message}`)
    }

    // Log the email
    await supabase.from('email_logs').insert({
      document_type: 'invoice',
      document_id: data.invoiceId,
      recipient_email: data.recipientEmail,
      message_id: emailData?.id
    })


    return emailData?.id || ''

  } catch (error) {
    throw error
  }
}
