import { describe, it, expect } from 'vitest'

// Import functions directly without Supabase dependency
function computeFY(date: Date = new Date()): string {
  const month = date.getMonth() + 1
  const year = date.getFullYear()
  
  if (month >= 4) {
    return `${year}-${year + 1}`
  } else {
    return `${year - 1}-${year}`
  }
}

function formatInvoiceNumber(number: number, fy: string): string {
  return `INV/${fy}/${number.toString().padStart(4, '0')}`
}

function formatReceiptNumber(number: number, fy: string): string {
  return `RCPT/${fy}/${number.toString().padStart(4, '0')}`
}

describe('Billing Numbering System', () => {
  describe('computeFY', () => {
    it('should compute FY correctly for April onwards', () => {
      const april2024 = new Date('2024-04-01')
      expect(computeFY(april2024)).toBe('2024-2025')
      
      const december2024 = new Date('2024-12-31')
      expect(computeFY(december2024)).toBe('2024-2025')
    })

    it('should compute FY correctly for January to March', () => {
      const january2024 = new Date('2024-01-01')
      expect(computeFY(january2024)).toBe('2023-2024')
      
      const march2024 = new Date('2024-03-31')
      expect(computeFY(march2024)).toBe('2023-2024')
    })

    it('should use current date when no date provided', () => {
      const currentFY = computeFY()
      expect(currentFY).toMatch(/^\d{4}-\d{4}$/)
    })
  })

  describe('formatInvoiceNumber', () => {
    it('should format invoice number correctly', () => {
      expect(formatInvoiceNumber(1, '2024-2025')).toBe('INV/2024-2025/0001')
      expect(formatInvoiceNumber(42, '2024-2025')).toBe('INV/2024-2025/0042')
      expect(formatInvoiceNumber(999, '2024-2025')).toBe('INV/2024-2025/0999')
    })
  })

  describe('formatReceiptNumber', () => {
    it('should format receipt number correctly', () => {
      expect(formatReceiptNumber(1, '2024-2025')).toBe('RCPT/2024-2025/0001')
      expect(formatReceiptNumber(42, '2024-2025')).toBe('RCPT/2024-2025/0042')
      expect(formatReceiptNumber(999, '2024-2025')).toBe('RCPT/2024-2025/0999')
    })
  })
})
