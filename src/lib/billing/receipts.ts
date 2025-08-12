import { createActionClient } from '@/lib/supabase-server'
import { generateReceiptNumber } from './numbering'

export interface CreateReceiptData {
  amount_cents: number
  user_id: string
  currency?: string
  payment_method?: string
  razorpay_payment_id?: string
  invoice_id?: string
  donor_name?: string
  is_anonymous?: boolean
  metadata?: any
}

export interface ReceiptData {
  id: string
  receipt_number: string
  amount_cents: number
  currency: string | null
  payment_date: string | null
  payment_method: string | null
  donor_name: string | null
  is_anonymous: boolean | null
  user_id: string
  created_at: string | null
  metadata: any
}

export async function generateDonationReceipt(data: CreateReceiptData): Promise<ReceiptData> {
  try {
    const supabase = await createActionClient()
    
    // Generate receipt number
    const receiptNumber = await generateReceiptNumber('receipt')
    
    const receiptData = {
      receipt_number: receiptNumber,
      amount_cents: data.amount_cents,
      currency: data.currency || 'INR',
      payment_date: new Date().toISOString(),
      payment_method: data.payment_method || 'online',
      razorpay_payment_id: data.razorpay_payment_id,
      invoice_id: data.invoice_id,
      donor_name: data.donor_name,
      is_anonymous: data.is_anonymous || false,
      metadata: data.metadata || {},
      user_id: data.user_id
    }

    const { data: receipt, error } = await supabase
      .from('receipts')
      .insert(receiptData)
      .select()
      .single()

    if (error) {
      console.error('Error generating receipt:', error)
      throw new Error('Failed to generate receipt')
    }

    return receipt
  } catch (error) {
    console.error('Error in generateDonationReceipt:', error)
    throw error
  }
}

export async function getReceipt(receiptId: string): Promise<ReceiptData | null> {
  try {
    const supabase = await createActionClient()
    
    const { data: receipt, error } = await supabase
      .from('receipts')
      .select('*')
      .eq('id', receiptId)
      .single()

    if (error) {
      console.error('Error fetching receipt:', error)
      return null
    }

    return receipt
  } catch (error) {
    console.error('Error in getReceipt:', error)
    return null
  }
}

export async function getReceiptByNumber(receiptNumber: string): Promise<ReceiptData | null> {
  try {
    const supabase = await createActionClient()
    
    const { data: receipt, error } = await supabase
      .from('receipts')
      .select('*')
      .eq('receipt_number', receiptNumber)
      .single()

    if (error) {
      console.error('Error fetching receipt by number:', error)
      return null
    }

    return receipt
  } catch (error) {
    console.error('Error in getReceiptByNumber:', error)
    return null
  }
}

export async function getUserReceipts(userId: string): Promise<ReceiptData[]> {
  try {
    const supabase = await createActionClient()
    
    const { data: receipts, error } = await supabase
      .from('receipts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching user receipts:', error)
      return []
    }

    return receipts || []
  } catch (error) {
    console.error('Error in getUserReceipts:', error)
    return []
  }
}

export async function updateReceipt(receiptId: string, updates: Partial<ReceiptData>): Promise<ReceiptData | null> {
  try {
    const supabase = await createActionClient()
    
    const { data: receipt, error } = await supabase
      .from('receipts')
      .update(updates)
      .eq('id', receiptId)
      .select()
      .single()

    if (error) {
      console.error('Error updating receipt:', error)
      return null
    }

    return receipt
  } catch (error) {
    console.error('Error in updateReceipt:', error)
    return null
  }
}

export async function getReceiptStats(userId?: string) {
  try {
    const supabase = await createActionClient()
    
    let query = supabase
      .from('receipts')
      .select('amount_cents, currency, created_at')

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data: receipts, error } = await query

    if (error) {
      console.error('Error fetching receipt stats:', error)
      return {
        total_amount: 0,
        total_receipts: 0,
        currency_breakdown: {}
      }
    }

    const totalAmount = receipts?.reduce((sum, receipt) => sum + receipt.amount_cents, 0) || 0
    const totalReceipts = receipts?.length || 0
    
    const currencyBreakdown = receipts?.reduce((acc, receipt) => {
      const currency = receipt.currency || 'INR'
      acc[currency] = (acc[currency] || 0) + receipt.amount_cents
      return acc
    }, {} as Record<string, number>) || {}

    return {
      total_amount: totalAmount,
      total_receipts: totalReceipts,
      currency_breakdown: currencyBreakdown
    }
  } catch (error) {
    console.error('Error in getReceiptStats:', error)
    return {
      total_amount: 0,
      total_receipts: 0,
      currency_breakdown: {}
    }
  }
}
