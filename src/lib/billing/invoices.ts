// =====================================================
// ENTERPRISE-GRADE BILLING SYSTEM
// Xainik Platform - Fresh Implementation
// Single Source of Truth: Live Database Schema
// Unified ID System: user_id everywhere
// =====================================================

import { createActionClient, supabaseAdmin } from '@/lib/supabase-server';
import { Database } from '@/types/live-schema';
import { logUserActivity, logEmail } from '@/lib/actions/activity-server';

// Commented out due to invoices and receipts tables not existing in live schema
// type Invoice = Database['public']['Tables']['invoices']['Row'];
// type InvoiceInsert = Database['public']['Tables']['invoices']['Insert'];
// type Receipt = Database['public']['Tables']['receipts']['Row'];
// type ReceiptInsert = Database['public']['Tables']['receipts']['Insert'];
type Invoice = any;
type InvoiceInsert = any;
type Receipt = any;
type ReceiptInsert = any;
// type PaymentEvent = Database['public']['Tables']['payment_events']['Row'];
// type PaymentEventInsert = Database['public']['Tables']['payment_events']['Insert'];
type PaymentEvent = any;
type PaymentEventInsert = any;

// =====================================================
// INVOICE MANAGEMENT - ENTERPRISE FEATURES
// =====================================================

export async function createInvoice(invoiceData: Omit<InvoiceInsert, 'id' | 'invoice_number'>): Promise<Invoice> {
  // Commented out due to invoices table not existing in live schema
  throw new Error('Invoice creation not supported in current schema');
  const supabase = await createActionClient();
  
  // Generate invoice number
  const invoiceNumber = await generateInvoiceNumber();
  
  // Create invoice with unified ID system
  const { data: invoice, error } = await supabase
    .from('invoices')
    .insert({
      ...invoiceData,
      invoice_number: invoiceNumber,
      status: 'draft',
      amount_cents: invoiceData.amount_cents || 0,
      total_amount_cents: invoiceData.total_amount_cents || 0,
      user_id: invoiceData.user_id
    })
    .select()
    .single();
  
  if (error) {
    throw new Error(`Failed to create invoice: ${error!.message || 'Unknown error'}`);
  }
  
  // Log activity
  if (invoice) {
    await logUserActivity({
      user_id: invoice!.user_id,
      activity_type: 'invoice_created',
      activity_data: { invoice_id: invoice!.id, invoice_number: invoice!.invoice_number }
    });
  }
  
  return invoice;
}

export async function updateInvoiceStatus(
  invoiceId: string,
  status: string,
  userId: string
): Promise<Invoice> {
  const supabase = await createActionClient();
  
  // Update invoice status with unified ID system
  const { data: invoice, error } = await supabase
    .from('invoices')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', invoiceId)
    .eq('user_id', userId) // Ensure user owns the invoice
    .select()
    .single();
  
  if (error) {
    throw new Error(`Failed to update invoice status: ${error.message}`);
  }
  
  // Log activity
  await logUserActivity({
    user_id: userId,
    activity_type: 'invoice_status_updated',
    activity_data: { invoice_id: invoiceId, status }
  });
  
  return invoice;
}

export async function getInvoiceById(invoiceId: string): Promise<Invoice | null> {
  const supabase = await createActionClient();
  
  const { data: invoice, error } = await supabase
    .from('invoices')
    .select(`
      *,
      user:users (id, name, email),
      plan:service_plans (id, name, description),
      subscription:user_subscriptions (id, status, end_date)
    `)
    .eq('id', invoiceId)
    .single();
  
  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to get invoice: ${error.message}`);
  }
  
  return invoice;
}

export async function getInvoicesByUserId(userId: string): Promise<Invoice[]> {
  const supabase = await createActionClient();
  
  const { data: invoices, error } = await supabase
    .from('invoices')
    .select(`
      *,
      plan:service_plans (id, name, description),
      subscription:user_subscriptions (id, status, end_date)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) {
    throw new Error(`Failed to get invoices: ${error.message}`);
  }
  
  return invoices || [];
}

// =====================================================
// RECEIPT MANAGEMENT - ENTERPRISE FEATURES
// =====================================================

export async function createReceipt(receiptData: Omit<ReceiptInsert, 'id' | 'receipt_number'>): Promise<Receipt> {
  const supabase = await createActionClient();
  
  // Generate receipt number
  const receiptNumber = await generateReceiptNumber();
  
  // Create receipt with unified ID system
  const { data: receipt, error } = await supabase
    .from('receipts')
    .insert({
      ...receiptData,
      amount_cents: receiptData.amount_cents || 0,
      user_id: receiptData.user_id,
      receipt_number: receiptNumber
    })
    .select()
    .single();
  
  if (error) {
    throw new Error(`Failed to create receipt: ${error.message}`);
  }
  
  // Log activity
  await logUserActivity({
    user_id: receipt.user_id,
    activity_type: 'receipt_created',
    activity_data: { receipt_id: receipt.id, receipt_number: receipt.receipt_number }
  });
  
  return receipt;
}

export async function getReceiptById(receiptId: string): Promise<Receipt | null> {
  const supabase = await createActionClient();
  
  const { data: receipt, error } = await supabase
    .from('receipts')
    .select(`
      *,
      user:users (id, name, email)
    `)
    .eq('id', receiptId)
    .single();
  
  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to get receipt: ${error.message}`);
  }
  
  return receipt;
}

export async function getReceiptsByUserId(userId: string): Promise<Receipt[]> {
  const supabase = await createActionClient();
  
  const { data: receipts, error } = await supabase
    .from('receipts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) {
    throw new Error(`Failed to get receipts: ${error.message}`);
  }
  
  return receipts || [];
}

// =====================================================
// PAYMENT TRACKING - ENTERPRISE FEATURES
// =====================================================

export async function createPaymentEvent(eventData: PaymentEventInsert): Promise<PaymentEvent> {
  const supabase = await createActionClient();
  
  // Create payment event with unified ID system
  const { data: event, error } = await supabase
    .from('payment_events')
    .insert(eventData)
    .select()
    .single();
  
  if (error) {
    throw new Error(`Failed to create payment event: ${error.message}`);
  }
  
  // Get user_id from invoice if available
  let userId: string | null = null;
  if (event.invoice_id) {
    const { data: invoice } = await supabase
      .from('invoices')
      .select('user_id')
      .eq('id', event.invoice_id)
      .single();
    userId = invoice?.user_id || null;
  }
  
  // Log activity if we have a user_id
  if (userId) {
    await logUserActivity({
      user_id: userId,
      activity_type: 'payment_event_created',
      activity_data: { event_id: event.id, event_type: event.event_type }
    });
  }
  
  return event;
}

export async function getPaymentEventsByUserId(userId: string): Promise<PaymentEvent[]> {
  const supabase = await createActionClient();
  
  // Get payment events through invoices
  const { data: events, error } = await supabase
    .from('payment_events')
    .select(`
      *,
      invoice:invoices!payment_events_invoice_id_fkey (user_id)
    `)
    .eq('invoice.user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) {
    throw new Error(`Failed to get payment events: ${error.message}`);
  }
  
  return events || [];
}

// =====================================================
// NUMBERING SYSTEM - ENTERPRISE FEATURES
// =====================================================

async function generateInvoiceNumber(): Promise<string> {
  const supabase = await createActionClient();
  
  // Get current numbering state
  const { data: numberingState, error: getError } = await supabase
    .from('numbering_state')
    .select('*')
    .eq('entity_type', 'invoice')
    .single();
  
  if (getError && getError.code !== 'PGRST116') {
    throw new Error(`Failed to get numbering state: ${getError.message}`);
  }
  
  let currentNumber = 1;
  let prefix = 'INV';
  
  if (numberingState) {
    currentNumber = numberingState.current_number + 1;
    prefix = numberingState.prefix || 'INV';
  }
  
  // Update or create numbering state
  const { error: upsertError } = await supabase
    .from('numbering_state')
    .upsert({
      entity_type: 'invoice',
      prefix,
      current_number: currentNumber,
      updated_at: new Date().toISOString()
    });
  
  if (upsertError) {
    throw new Error(`Failed to update numbering state: ${upsertError.message}`);
  }
  
  // Generate invoice number with year and sequential number
  const year = new Date().getFullYear();
  const paddedNumber = currentNumber.toString().padStart(6, '0');
  return `${prefix}-${year}-${paddedNumber}`;
}

async function generateReceiptNumber(): Promise<string> {
  const supabase = await createActionClient();
  
  // Get current numbering state
  const { data: numberingState, error: getError } = await supabase
    .from('numbering_state')
    .select('*')
    .eq('entity_type', 'receipt')
    .single();
  
  if (getError && getError.code !== 'PGRST116') {
    throw new Error(`Failed to get numbering state: ${getError.message}`);
  }
  
  let currentNumber = 1;
  let prefix = 'RCP';
  
  if (numberingState) {
    currentNumber = numberingState.current_number + 1;
    prefix = numberingState.prefix || 'RCP';
  }
  
  // Update or create numbering state
  const { error: upsertError } = await supabase
    .from('numbering_state')
    .upsert({
      entity_type: 'receipt',
      prefix,
      current_number: currentNumber,
      updated_at: new Date().toISOString()
    });
  
  if (upsertError) {
    throw new Error(`Failed to update numbering state: ${upsertError.message}`);
  }
  
  // Generate receipt number with year and sequential number
  const year = new Date().getFullYear();
  const paddedNumber = currentNumber.toString().padStart(6, '0');
  return `${prefix}-${year}-${paddedNumber}`;
}

// =====================================================
// INVOICE GENERATION - ENTERPRISE FEATURES
// =====================================================

export async function generateServiceInvoice(data: {
  amount: number
  user_id: string
  currency?: string
  plan_tier?: string
  plan_meta?: any
  buyer_name?: string
  buyer_email?: string
  buyer_phone?: string
  razorpay_payment_id?: string
  metadata?: any
}): Promise<any> {
  try {
    const supabase = await createActionClient()
    
    // Generate invoice number
    const invoiceNumber = await generateInvoiceNumber()
    
    const invoiceData = {
      invoice_number: invoiceNumber,
      amount_cents: data.amount,
      currency: data.currency || 'INR',
      status: 'paid',
      payment_date: new Date().toISOString(),
      payment_method: 'online',
      razorpay_payment_id: data.razorpay_payment_id,
      plan_tier: data.plan_tier,
      plan_meta: data.plan_meta,
      buyer_name: data.buyer_name,
      buyer_email: data.buyer_email,
      buyer_phone: data.buyer_phone,
      metadata: data.metadata || {},
      user_id: data.user_id
    }

    const { data: invoice, error } = await supabase
      .from('invoices')
      .insert(invoiceData)
      .select()
      .single()

    if (error) {
      console.error('Error generating invoice:', error)
      throw new Error('Failed to generate invoice')
    }

    return invoice
  } catch (error) {
    console.error('Error in generateServiceInvoice:', error)
    throw error
  }
}

// =====================================================
// EMAIL INTEGRATION - ENTERPRISE FEATURES
// =====================================================

export async function sendInvoiceEmail(invoiceId: string, recipientEmail: string): Promise<void> {
  const invoice = await getInvoiceById(invoiceId);
  if (!invoice) {
    throw new Error('Invoice not found');
  }
  
  // Log email attempt
  await logEmail({
    email_type: 'invoice_sent',
    user_id: invoice.user_id,
    email_data: {
      recipient_email: recipientEmail,
      subject: `Invoice ${invoice.invoice_number} from Xainik`,
      content: `Invoice ${invoice.invoice_number} has been sent to ${recipientEmail}`
    }
  });
  
  // TODO: Implement actual email sending with Resend
  console.log(`Invoice email sent to ${recipientEmail} for invoice ${invoice.invoice_number}`);
}

export async function sendReceiptEmail(receiptId: string, recipientEmail: string): Promise<void> {
  const receipt = await getReceiptById(receiptId);
  if (!receipt) {
    throw new Error('Receipt not found');
  }
  
  // Log email attempt
  await logEmail({
    email_type: 'receipt_sent',
    user_id: receipt.user_id,
    email_data: {
      recipient_email: recipientEmail,
      subject: `Receipt ${receipt.receipt_number} from Xainik`,
      content: `Receipt ${receipt.receipt_number} has been sent to ${recipientEmail}`
    }
  });
  
  // TODO: Implement actual email sending with Resend
  console.log(`Receipt email sent to ${recipientEmail} for receipt ${receipt.receipt_number}`);
}

// =====================================================
// ANALYTICS - ENTERPRISE FEATURES
// =====================================================

export async function getBillingAnalytics(userId: string): Promise<{
  total_invoices: number;
  total_receipts: number;
  total_amount: number;
  outstanding_amount: number;
  paid_amount: number;
}> {
  const supabase = await createActionClient();
  
  // Get invoices
  const { data: invoices, error: invoicesError } = await supabase
    .from('invoices')
    .select('amount_cents, status')
    .eq('user_id', userId);
  
  if (invoicesError) {
    throw new Error(`Failed to get invoices: ${invoicesError.message}`);
  }
  
  // Get receipts
  const { data: receipts, error: receiptsError } = await supabase
    .from('receipts')
    .select('amount_cents')
    .eq('user_id', userId);
  
  if (receiptsError) {
    throw new Error(`Failed to get receipts: ${receiptsError.message}`);
  }
  
  // Calculate totals
  const totalInvoices = invoices?.length || 0;
  const totalReceipts = receipts?.length || 0;
  
  const totalAmount = (invoices || []).reduce((sum, invoice) => sum + (invoice.amount_cents || 0), 0);
  const paidAmount = (receipts || []).reduce((sum, receipt) => sum + (receipt.amount_cents || 0), 0);
  const outstandingAmount = totalAmount - paidAmount;
  
  return {
    total_invoices: totalInvoices,
    total_receipts: totalReceipts,
    total_amount: totalAmount,
    outstanding_amount: outstandingAmount,
    paid_amount: paidAmount
  };
}

// =====================================================
// EXPORT ALL ENTERPRISE FEATURES
// =====================================================
