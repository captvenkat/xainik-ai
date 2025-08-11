import { generatePDFBuffer } from '../server/pdf'
import React from 'react'
import { createSupabaseServerOnly } from '../supabaseServerOnly'
import * as Sentry from '@sentry/nextjs'
import InvoicePDF from '@/pdfs/InvoicePDF'
import { getNextNumber, formatInvoiceNumber, computeFY } from './numbering'
import { uploadPdf, generateStorageKey } from '../storage'
import { sendInvoiceEmail } from '../emails/sendInvoiceEmail'

const supabase = createSupabaseServerOnly()

interface GenerateServiceInvoiceParams {
  userId?: string
  paymentEventId: string
  amount: number
  planTier: string
  planMeta?: any
  buyerName: string
  buyerEmail: string
  buyerPhone?: string
}

interface GenerateServiceInvoiceResult {
  number: string
  key: string
  url: string
  invoiceId: string
}

export async function generateServiceInvoice(
  params: GenerateServiceInvoiceParams
): Promise<GenerateServiceInvoiceResult> {
  try {

    Sentry.addBreadcrumb({
      category: 'billing',
      message: 'Starting invoice generation',
      data: { 
        userId: params.userId,
        amount: params.amount,
        planTier: params.planTier 
      }
    });

    // 1. Get next invoice number
    const fy = computeFY()
    const nextNumber = await getNextNumber('INV', fy)
    const invoiceNumber = formatInvoiceNumber(nextNumber, fy)

    Sentry.addBreadcrumb({
      category: 'billing',
      message: 'Invoice number generated',
      data: { invoiceNumber, fy }
    });

    // 2. Generate PDF
    const pdfBuffer = await generatePDFBuffer(
      <InvoicePDF
        invoiceNumber={invoiceNumber}
        date={new Date().toLocaleDateString('en-IN')}
        buyerName={params.buyerName}
        buyerEmail={params.buyerEmail}
        buyerPhone={params.buyerPhone || ''}
        amount={params.amount}
        planTier={params.planTier}
        planMeta={params.planMeta}
      />
    )

    Sentry.addBreadcrumb({
      category: 'pdf',
      message: 'PDF generated successfully',
      data: { size: pdfBuffer.length }
    });

    // 3. Upload to storage
    const storageKey = generateStorageKey('invoice', params.userId || 'unknown', invoiceNumber)
    const bucket = process.env.BILLING_PDF_BUCKET || 'docs'
    
    await uploadPdf(bucket, storageKey, pdfBuffer)

    Sentry.addBreadcrumb({
      category: 'storage',
      message: 'PDF uploaded to storage',
      data: { bucket, storageKey }
    });

    // 4. Insert into database
    const { data: invoice, error: dbError } = await supabase
      .from('invoices')
      .insert({
        number: invoiceNumber,
        user_id: params.userId || null,
        payment_event_id: params.paymentEventId,
        amount: params.amount,
        plan_tier: params.planTier,
        plan_meta: params.planMeta,
        buyer_name: params.buyerName,
        buyer_email: params.buyerEmail,
        buyer_phone: params.buyerPhone || null,
        storage_key: storageKey
      })
      .select()
      .single()

    if (dbError) {
      Sentry.captureException(dbError, {
        tags: { component: 'invoice_db_insert' },
        extra: { invoiceNumber, paymentEventId: params.paymentEventId }
      });
      throw new Error(`Failed to insert invoice: ${dbError.message}`)
    }

    Sentry.addBreadcrumb({
      category: 'database',
      message: 'Invoice inserted into database',
      data: { invoiceId: invoice.id }
    });

    // 5. Generate signed URL
    const signedUrl = await supabase.storage
      .from(bucket)
      .createSignedUrl(storageKey, parseInt(process.env.BILLING_SIGNED_URL_TTL || '86400'))

    if (signedUrl.error) {
      Sentry.captureException(signedUrl.error, {
        tags: { component: 'invoice_signed_url' },
        extra: { storageKey, bucket }
      });
      throw new Error(`Failed to create signed URL: ${signedUrl.error.message}`)
    }

    // 6. Send email
    const messageId = await sendInvoiceEmail({
      invoiceId: invoice.id,
      recipientEmail: params.buyerEmail,
      recipientName: params.buyerName,
      invoiceNumber,
      amount: params.amount,
      downloadUrl: signedUrl.data.signedUrl
    })

    Sentry.addBreadcrumb({
      category: 'email',
      message: 'Invoice email sent',
      data: { messageId, recipientEmail: params.buyerEmail }
    });


    return {
      number: invoiceNumber,
      key: storageKey,
      url: signedUrl.data.signedUrl,
      invoiceId: invoice.id
    }

  } catch (error) {
    Sentry.captureException(error, {
      tags: { component: 'invoice_generation' },
      extra: { 
        userId: params.userId,
        paymentEventId: params.paymentEventId,
        amount: params.amount 
      }
    });
    throw error
  }
}
