import { generatePDFBuffer } from '../server/pdf'
import React from 'react'
import { createSupabaseServerOnly } from '../supabaseServerOnly'
import * as Sentry from '@sentry/nextjs'
import DonationReceiptPDF from '@/pdfs/DonationReceiptPDF'
import { getNextNumber, formatReceiptNumber, computeFY } from './numbering'
import { uploadPdf, generateStorageKey } from '../storage'
import { sendReceiptEmail } from '../emails/sendReceiptEmail'

const supabase = createSupabaseServerOnly()

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

    Sentry.addBreadcrumb({
      category: 'billing',
      message: 'Starting receipt generation',
      data: { 
        amount: params.amount,
        isAnonymous: params.isAnonymous 
      }
    });

    // 1. Get organization details
    const { data: orgData, error: orgError } = await supabase.rpc('check_billing_env')
    if (orgError) {
      Sentry.captureException(orgError, {
        tags: { component: 'receipt_org_data' }
      });
      throw new Error(`Failed to get organization data: ${orgError.message}`)
    }

    const has80G = orgData.has_80g || false
    const orgName = orgData.org_name || 'Xainik'
    const orgAddress = orgData.org_address || 'Address not configured'
    const orgPAN = orgData.org_pan || 'PAN not configured'
    const org80GNumber = orgData.org_80g_number

    Sentry.addBreadcrumb({
      category: 'billing',
      message: 'Organization data retrieved',
      data: { has80G, orgName }
    });

    // 2. Get next receipt number
    const fy = computeFY()
    const nextNumber = await getNextNumber('RCPT', fy)
    const receiptNumber = formatReceiptNumber(nextNumber, fy)

    Sentry.addBreadcrumb({
      category: 'billing',
      message: 'Receipt number generated',
      data: { receiptNumber, fy }
    });

    // 3. Generate PDF
    const pdfBuffer = await generatePDFBuffer(
      <DonationReceiptPDF
        receiptNumber={receiptNumber}
        date={new Date().toLocaleDateString('en-IN')}
        donorName={params.donorName || ''}
        donorEmail={params.donorEmail || ''}
        donorPhone={params.donorPhone || ''}
        amount={params.amount}
        isAnonymous={params.isAnonymous}
        has80G={has80G}
        orgName={orgName}
        orgAddress={orgAddress}
        orgPAN={orgPAN}
        org80GNumber={org80GNumber}
      />
    )

    Sentry.addBreadcrumb({
      category: 'pdf',
      message: 'PDF generated successfully',
      data: { size: pdfBuffer.length }
    });

    // 4. Upload to storage
    const storageKey = generateStorageKey('receipt', 'donations', receiptNumber)
    const bucket = process.env.BILLING_PDF_BUCKET || 'docs'
    
    await uploadPdf(bucket, storageKey, pdfBuffer)

    Sentry.addBreadcrumb({
      category: 'storage',
      message: 'PDF uploaded to storage',
      data: { bucket, storageKey }
    });

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
      Sentry.captureException(dbError, {
        tags: { component: 'receipt_db_insert' },
        extra: { receiptNumber, paymentEventId: params.paymentEventId }
      });
      throw new Error(`Failed to insert receipt: ${dbError.message}`)
    }

    Sentry.addBreadcrumb({
      category: 'database',
      message: 'Receipt inserted into database',
      data: { receiptId: receipt.id }
    });

    // 6. Generate signed URL
    const signedUrl = await supabase.storage
      .from(bucket)
      .createSignedUrl(storageKey, parseInt(process.env.BILLING_SIGNED_URL_TTL || '86400'))

    if (signedUrl.error) {
      Sentry.captureException(signedUrl.error, {
        tags: { component: 'receipt_signed_url' },
        extra: { storageKey, bucket }
      });
      throw new Error(`Failed to create signed URL: ${signedUrl.error.message}`)
    }

    // 7. Send email (only if donor email is provided and not anonymous)
    let messageId = ''
    if (params.donorEmail && !params.isAnonymous) {
      messageId = await sendReceiptEmail({
        receiptId: receipt.id,
        recipientEmail: params.donorEmail,
        recipientName: params.donorName || '',
        receiptNumber,
        amount: params.amount,
        downloadUrl: signedUrl.data.signedUrl,
        isAnonymous: params.isAnonymous
      })

      Sentry.addBreadcrumb({
        category: 'email',
        message: 'Receipt email sent',
        data: { messageId, recipientEmail: params.donorEmail }
      });
    } else {
      Sentry.addBreadcrumb({
        category: 'email',
        message: 'Receipt email skipped',
        data: { reason: params.isAnonymous ? 'anonymous' : 'no_email' }
      });
    }


    return {
      number: receiptNumber,
      key: storageKey,
      url: signedUrl.data.signedUrl,
      receiptId: receipt.id
    }

  } catch (error) {
    Sentry.captureException(error, {
      tags: { component: 'receipt_generation' },
      extra: { 
        paymentEventId: params.paymentEventId,
        amount: params.amount,
        isAnonymous: params.isAnonymous 
      }
    });
    throw error
  }
}
