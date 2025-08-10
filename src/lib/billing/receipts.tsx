import { renderToBuffer } from '@react-pdf/renderer'
import React from 'react'
import { createClient } from '@supabase/supabase-js'
import DonationReceiptPDF from '@/pdfs/DonationReceiptPDF'
import { getNextNumber, formatReceiptNumber, computeFY } from './numbering'
import { uploadPdf, generateStorageKey } from '../storage'
import { sendReceiptEmail } from '../emails/sendReceiptEmail'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface GenerateDonationReceiptParams {
  paymentEventId: string
  amount: number
  donorName?: string
  donorEmail?: string
  donorPhone?: string
  isAnonymous: boolean
}

interface GenerateDonationReceiptResult {
  number: string
  key: string
  url: string
  receiptId: string
}

export async function generateDonationReceipt(
  params: GenerateDonationReceiptParams
): Promise<GenerateDonationReceiptResult> {
  try {
    console.log('🔄 Generating donation receipt...', params)

    // 1. Get organization details
    const { data: orgData, error: orgError } = await supabase.rpc('check_billing_env')
    if (orgError) {
      console.error('Organization data error:', orgError)
      throw new Error(`Failed to get organization data: ${orgError.message}`)
    }

    const has80G = orgData.has_80g || false
    const orgName = orgData.org_name || 'Xainik'
    const orgAddress = orgData.org_address || 'Address not configured'
    const orgPAN = orgData.org_pan || 'PAN not configured'
    const org80GNumber = orgData.org_80g_number

    // 2. Get next receipt number
    const fy = computeFY()
    const nextNumber = await getNextNumber('RCPT', fy)
    const receiptNumber = formatReceiptNumber(nextNumber, fy)

    // 3. Generate PDF
    const pdfBuffer = await renderToBuffer(
      <DonationReceiptPDF
        receiptNumber={receiptNumber}
        date={new Date().toLocaleDateString('en-IN')}
        donorName={params.donorName}
        donorEmail={params.donorEmail}
        donorPhone={params.donorPhone}
        amount={params.amount}
        isAnonymous={params.isAnonymous}
        has80G={has80G}
        orgName={orgName}
        orgAddress={orgAddress}
        orgPAN={orgPAN}
        org80GNumber={org80GNumber}
      />
    )

    // 4. Upload to storage
    const storageKey = generateStorageKey('receipt', 'donations', receiptNumber)
    const bucket = process.env.BILLING_PDF_BUCKET || 'docs'
    
    await uploadPdf(bucket, storageKey, pdfBuffer)

    // 5. Insert into database
    const { data: receipt, error: dbError } = await supabase
      .from('receipts')
      .insert({
        number: receiptNumber,
        payment_event_id: params.paymentEventId,
        amount: params.amount,
        donor_name: params.donorName,
        donor_email: params.donorEmail,
        donor_phone: params.donorPhone,
        is_anonymous: params.isAnonymous,
        storage_key: storageKey
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      throw new Error(`Failed to insert receipt: ${dbError.message}`)
    }

    // 6. Generate signed URL
    const signedUrl = await supabase.storage
      .from(bucket)
      .createSignedUrl(storageKey, parseInt(process.env.BILLING_SIGNED_URL_TTL || '86400'))

    if (signedUrl.error) {
      console.error('Signed URL error:', signedUrl.error)
      throw new Error(`Failed to create signed URL: ${signedUrl.error.message}`)
    }

    // 7. Send email (only if donor email is provided and not anonymous)
    let messageId = ''
    if (params.donorEmail && !params.isAnonymous) {
      messageId = await sendReceiptEmail({
        receiptId: receipt.id,
        recipientEmail: params.donorEmail,
        recipientName: params.donorName,
        receiptNumber,
        amount: params.amount,
        downloadUrl: signedUrl.data.signedUrl,
        isAnonymous: params.isAnonymous
      })
    }

    console.log('✅ Donation receipt generated successfully')
    console.log('Receipt Number:', receiptNumber)
    console.log('Storage Key:', storageKey)
    console.log('80G Enabled:', has80G)
    console.log('Message ID:', messageId || 'No email sent (anonymous)')

    return {
      number: receiptNumber,
      key: storageKey,
      url: signedUrl.data.signedUrl,
      receiptId: receipt.id
    }

  } catch (error) {
    console.error('❌ Donation receipt generation failed:', error)
    throw error
  }
}
