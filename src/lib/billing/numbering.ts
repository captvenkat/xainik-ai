import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export function getInvoicePrefix() {
  return process.env.ORG_INVOICE_PREFIX?.trim() || 'XAI';
}

export function getReceiptPrefix() {
  return process.env.ORG_RECEIPT_PREFIX?.trim() || 'RCPT';
}

export function computeFY(date: Date = new Date()): string {
  const month = date.getMonth() + 1 // getMonth() returns 0-11
  const year = date.getFullYear()
  
  if (month >= 4) {
    return `${year}-${year + 1}`
  } else {
    return `${year - 1}-${year}`
  }
}

export async function getNextNumber(prefix: string, fy?: string): Promise<number> {
  const fiscalYear = fy || computeFY()
  
  try {
    const { data, error } = await supabase.rpc('lock_numbering_and_next', {
      prefix,
      fy: fiscalYear
    })
    
    if (error) {
      console.error('Error getting next number:', error)
      throw new Error(`Failed to get next number: ${error.message}`)
    }
    
    return data
  } catch (error) {
    console.error('Numbering system error:', error)
    throw error
  }
}

export function formatInvoiceNumber(number: number, fy: string): string {
  const prefix = getInvoicePrefix()
  return `${prefix}/${fy}/${number.toString().padStart(4, '0')}`
}

export function formatReceiptNumber(number: number, fy: string): string {
  const prefix = getReceiptPrefix()
  return `${prefix}/${fy}/${number.toString().padStart(4, '0')}`
}
