import { renderToBuffer } from '@react-pdf/renderer'
import React from 'react'
import { createClient } from '@supabase/supabase-js'
import InvoicePDF from '@/pdfs/InvoicePDF'
import { getNextNumber, formatInvoiceNumber, computeFY } from './numbering'
import { uploadPdf, generateStorageKey } from '../storage'
import { sendInvoiceEmail } from '../emails/sendInvoiceEmail'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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
    console.log('🔄 Generating service invoice...', params)

    // 1. Get next invoice number
    const fy = computeFY()
    const nextNumber = await getNextNumber('INV', fy)
    const invoiceNumber = formatInvoiceNumber(nextNumber, fy)

    // 2. Generate PDF
    const pdfBuffer = await renderToBuffer(
      <InvoicePDF
        invoiceNumber={invoiceNumber}
        date={new Date().toLocaleDateString('en-IN')}
        buyerName={params.buyerName}
        buyerEmail={params.buyerEmail}
        buyerPhone={params.buyerPhone}
        amount={params.amount}
        planTier={params.planTier}
        planMeta={params.planMeta}
      />
    )

    // 3. Upload to storage
    const storageKey = generateStorageKey('invoice', params.userId, invoiceNumber)
    const bucket = process.env.BILLING_PDF_BUCKET || 'docs'
    
    await uploadPdf(bucket, storageKey, pdfBuffer)

    // 4. Insert into database
    const { data: invoice, error: dbError } = await supabase
      .from('invoices')
      .insert({
        number: invoiceNumber,
        user_id: params.userId || null, // Make user_id optional
        payment_event_id: params.paymentEventId,
        amount: params.amount,
        plan_tier: params.planTier,
        plan_meta: params.planMeta,
        buyer_name: params.buyerName,
        buyer_email: params.buyerEmail,
        buyer_phone: params.buyerPhone,
        storage_key: storageKey
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      throw new Error(`Failed to insert invoice: ${dbError.message}`)
    }

    // 5. Generate signed URL
    const signedUrl = await supabase.storage
      .from(bucket)
      .createSignedUrl(storageKey, parseInt(process.env.BILLING_SIGNED_URL_TTL || '86400'))

    if (signedUrl.error) {
      console.error('Signed URL error:', signedUrl.error)
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

    console.log('✅ Service invoice generated successfully')
    console.log('Invoice Number:', invoiceNumber)
    console.log('Storage Key:', storageKey)
    console.log('Message ID:', messageId)

    return {
      number: invoiceNumber,
      key: storageKey,
      url: signedUrl.data.signedUrl,
      invoiceId: invoice.id
    }

  } catch (error) {
    console.error('❌ Service invoice generation failed:', error)
    throw error
  }
}
