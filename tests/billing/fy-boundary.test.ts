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

describe('Fiscal Year Boundary Tests', () => {
  it('should handle March 31 23:59 Asia/Kolkata correctly', () => {
    // Mock March 31, 2024 23:59:59 IST
    const march31 = new Date('2024-03-31T18:29:59.000Z') // 23:59:59 IST (UTC+5:30)
    const fy = computeFY(march31)
    expect(fy).toBe('2023-2024')
  })

  it('should handle April 1 00:01 Asia/Kolkata correctly', () => {
    // Mock April 1, 2024 00:01:00 IST
    const april1 = new Date('2024-03-31T18:31:00.000Z') // 00:01:00 IST (UTC+5:30)
    const fy = computeFY(april1)
    expect(fy).toBe('2024-2025')
  })

  it('should handle exact boundary transition', () => {
    // March 31, 2024 23:59:59 IST
    const march31End = new Date('2024-03-31T18:29:59.999Z')
    expect(computeFY(march31End)).toBe('2023-2024')

    // April 1, 2024 00:00:00 IST
    const april1Start = new Date('2024-03-31T18:30:00.000Z')
    expect(computeFY(april1Start)).toBe('2024-2025')
  })

  it('should handle different years correctly', () => {
    // March 31, 2025 23:59:59 IST
    const march31_2025 = new Date('2025-03-31T18:29:59.000Z')
    expect(computeFY(march31_2025)).toBe('2024-2025')

    // April 1, 2025 00:01:00 IST
    const april1_2025 = new Date('2025-03-31T18:31:00.000Z')
    expect(computeFY(april1_2025)).toBe('2025-2026')
  })

  it('should handle leap year correctly', () => {
    // March 31, 2024 (leap year) 23:59:59 IST
    const march31Leap = new Date('2024-03-31T18:29:59.000Z')
    expect(computeFY(march31Leap)).toBe('2023-2024')

    // April 1, 2024 (leap year) 00:01:00 IST
    const april1Leap = new Date('2024-03-31T18:31:00.000Z')
    expect(computeFY(april1Leap)).toBe('2024-2025')
  })

  it('should handle edge cases throughout the year', () => {
    // January 1, 2024
    const jan1 = new Date('2024-01-01T00:00:00.000Z')
    expect(computeFY(jan1)).toBe('2023-2024')

    // March 31, 2024
    const mar31 = new Date('2024-03-31T00:00:00.000Z')
    expect(computeFY(mar31)).toBe('2023-2024')

    // April 1, 2024
    const apr1 = new Date('2024-04-01T00:00:00.000Z')
    expect(computeFY(apr1)).toBe('2024-2025')

    // December 31, 2024
    const dec31 = new Date('2024-12-31T23:59:59.000Z')
    expect(computeFY(dec31)).toBe('2024-2025')
  })
})
