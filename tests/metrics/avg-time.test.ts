import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { getAvgTimeToFirstContact, type AvgTime } from '@/lib/metrics'
import { 
  seedVeteranWithPitch, 
  seedReferral, 
  recordEvent, 
  cleanupTestData 
} from '../factories'

describe('Average Time to First Contact Metrics', () => {
  let veteranId: string
  let pitchId: string
  let referralIds: string[] = []

  beforeAll(async () => {
    // Seed test data
    const veteranData = await seedVeteranWithPitch()
    veteranId = veteranData.veteranId
    pitchId = veteranData.pitchId
  })

  afterAll(async () => {
    await cleanupTestData()
  })

  beforeEach(async () => {
    // Clear any existing referrals and events
    const { createClient } = require('@supabase/supabase-js')
    const supabase = createClient(
      process.env.TEST_SUPABASE_URL!,
      process.env.TEST_SUPABASE_SERVICE_ROLE_KEY!
    )
    
    // Clean up previous test data
    for (const referralId of referralIds) {
      await supabase.from('referral_events').delete().eq('referral_id', referralId)
      await supabase.from('referrals').delete().eq('id', referralId)
    }
    referralIds = []
  })

  it('should calculate average time to first contact correctly', async () => {
    // Arrange: Create pitches with different first contact times
    const baseDate = new Date()
    baseDate.setDate(baseDate.getDate() - 30)
    
    // Pitch 1: First contact at T0+6h
    const referral1 = await seedReferral({ pitchId, platform: 'whatsapp' })
    referralIds.push(referral1.referralId)
    
    const pitchCreated1 = new Date(baseDate)
    const firstContact1 = new Date(pitchCreated1.getTime() + 6 * 60 * 60 * 1000) // +6 hours
    
    await recordEvent({
      referralId: referral1.referralId,
      type: 'PITCH_VIEWED',
      occurredAt: pitchCreated1,
      platform: 'whatsapp'
    })
    
    await recordEvent({
      referralId: referral1.referralId,
      type: 'CALL_CLICKED',
      occurredAt: firstContact1,
      platform: 'whatsapp'
    })
    
    // Pitch 2: First contact at T0+0h (immediate)
    const referral2 = await seedReferral({ pitchId, platform: 'linkedin' })
    referralIds.push(referral2.referralId)
    
    const pitchCreated2 = new Date(baseDate.getTime() + 24 * 60 * 60 * 1000) // +1 day
    const firstContact2 = new Date(pitchCreated2.getTime()) // Same time
    
    await recordEvent({
      referralId: referral2.referralId,
      type: 'PITCH_VIEWED',
      occurredAt: pitchCreated2,
      platform: 'linkedin'
    })
    
    await recordEvent({
      referralId: referral2.referralId,
      type: 'EMAIL_CLICKED',
      occurredAt: firstContact2,
      platform: 'linkedin'
    })
    
    // Pitch 3: First contact at T0+12h
    const referral3 = await seedReferral({ pitchId, platform: 'email' })
    referralIds.push(referral3.referralId)
    
    const pitchCreated3 = new Date(baseDate.getTime() + 2 * 24 * 60 * 60 * 1000) // +2 days
    const firstContact3 = new Date(pitchCreated3.getTime() + 12 * 60 * 60 * 1000) // +12 hours
    
    await recordEvent({
      referralId: referral3.referralId,
      type: 'PITCH_VIEWED',
      occurredAt: pitchCreated3,
      platform: 'email'
    })
    
    await recordEvent({
      referralId: referral3.referralId,
      type: 'CALL_CLICKED',
      occurredAt: firstContact3,
      platform: 'email'
    })
    
    // Act
    const result = await getAvgTimeToFirstContact({ window: 30, veteranId })
    
    // Assert
    expect(result).toHaveProperty('hours')
    expect(result).toHaveProperty('samples')
    expect(typeof result.hours).toBe('number')
    expect(typeof result.samples).toBe('number')
    
    // Expected average: (6 + 0 + 12) / 3 = 6 hours
    const expectedAvgHours = 6
    expect(result.hours).toBeCloseTo(expectedAvgHours, 1)
    expect(result.samples).toBe(3)
  })

  it('should handle pitches with no first contact', async () => {
    // Arrange: Create pitch with only PITCH_VIEWED, no contact events
    const referral = await seedReferral({ pitchId, platform: 'whatsapp' })
    referralIds.push(referral.referralId)
    
    const baseDate = new Date()
    baseDate.setDate(baseDate.getDate() - 30)
    
    await recordEvent({
      referralId: referral.referralId,
      type: 'PITCH_VIEWED',
      occurredAt: baseDate,
      platform: 'whatsapp'
    })
    
    // Act
    const result = await getAvgTimeToFirstContact({ window: 30, veteranId })
    
    // Assert
    expect(result.samples).toBe(0) // No pitches with first contact
    expect(result.hours).toBe(0) // Default value when no samples
  })

  it('should count samples correctly', async () => {
    // Arrange: Create multiple pitches with first contact
    const baseDate = new Date()
    baseDate.setDate(baseDate.getDate() - 30)
    
    // Create 5 pitches with first contact
    for (let i = 0; i < 5; i++) {
      const referral = await seedReferral({ pitchId, platform: 'whatsapp' })
      referralIds.push(referral.referralId)
      
      const pitchCreated = new Date(baseDate.getTime() + i * 24 * 60 * 60 * 1000)
      const firstContact = new Date(pitchCreated.getTime() + 2 * 60 * 60 * 1000) // +2 hours
      
      await recordEvent({
        referralId: referral.referralId,
        type: 'PITCH_VIEWED',
        occurredAt: pitchCreated,
        platform: 'whatsapp'
      })
      
      await recordEvent({
        referralId: referral.referralId,
        type: 'CALL_CLICKED',
        occurredAt: firstContact,
        platform: 'whatsapp'
      })
    }
    
    // Create 2 pitches without first contact
    for (let i = 0; i < 2; i++) {
      const referral = await seedReferral({ pitchId, platform: 'linkedin' })
      referralIds.push(referral.referralId)
      
      const pitchCreated = new Date(baseDate.getTime() + (i + 10) * 24 * 60 * 60 * 1000)
      
      await recordEvent({
        referralId: referral.referralId,
        type: 'PITCH_VIEWED',
        occurredAt: pitchCreated,
        platform: 'linkedin'
      })
      // No contact events
    }
    
    // Act
    const result = await getAvgTimeToFirstContact({ window: 30, veteranId })
    
    // Assert
    expect(result.samples).toBe(5) // Only pitches with first contact
    expect(result.hours).toBeCloseTo(2, 1) // All had 2-hour delay
  })

  it('should handle both CALL_CLICKED and EMAIL_CLICKED as first contact', async () => {
    // Arrange: Create pitches with different contact types
    const baseDate = new Date()
    baseDate.setDate(baseDate.getDate() - 30)
    
    // Pitch 1: CALL_CLICKED as first contact
    const referral1 = await seedReferral({ pitchId, platform: 'whatsapp' })
    referralIds.push(referral1.referralId)
    
    const pitchCreated1 = new Date(baseDate)
    const callContact1 = new Date(pitchCreated1.getTime() + 4 * 60 * 60 * 1000) // +4 hours
    
    await recordEvent({
      referralId: referral1.referralId,
      type: 'PITCH_VIEWED',
      occurredAt: pitchCreated1,
      platform: 'whatsapp'
    })
    
    await recordEvent({
      referralId: referral1.referralId,
      type: 'CALL_CLICKED',
      occurredAt: callContact1,
      platform: 'whatsapp'
    })
    
    // Pitch 2: EMAIL_CLICKED as first contact
    const referral2 = await seedReferral({ pitchId, platform: 'email' })
    referralIds.push(referral2.referralId)
    
    const pitchCreated2 = new Date(baseDate.getTime() + 24 * 60 * 60 * 1000)
    const emailContact2 = new Date(pitchCreated2.getTime() + 8 * 60 * 60 * 1000) // +8 hours
    
    await recordEvent({
      referralId: referral2.referralId,
      type: 'PITCH_VIEWED',
      occurredAt: pitchCreated2,
      platform: 'email'
    })
    
    await recordEvent({
      referralId: referral2.referralId,
      type: 'EMAIL_CLICKED',
      occurredAt: emailContact2,
      platform: 'email'
    })
    
    // Act
    const result = await getAvgTimeToFirstContact({ window: 30, veteranId })
    
    // Assert
    expect(result.samples).toBe(2)
    expect(result.hours).toBeCloseTo(6, 1) // (4 + 8) / 2 = 6 hours
  })

  it('should use earliest contact event when multiple exist', async () => {
    // Arrange: Create pitch with multiple contact events
    const referral = await seedReferral({ pitchId, platform: 'whatsapp' })
    referralIds.push(referral.referralId)
    
    const baseDate = new Date()
    baseDate.setDate(baseDate.getDate() - 30)
    
    const pitchCreated = new Date(baseDate)
    const firstContact = new Date(pitchCreated.getTime() + 2 * 60 * 60 * 1000) // +2 hours (earliest)
    const laterContact = new Date(pitchCreated.getTime() + 6 * 60 * 60 * 1000) // +6 hours
    
    await recordEvent({
      referralId: referral.referralId,
      type: 'PITCH_VIEWED',
      occurredAt: pitchCreated,
      platform: 'whatsapp'
    })
    
    // Record later contact first
    await recordEvent({
      referralId: referral.referralId,
      type: 'EMAIL_CLICKED',
      occurredAt: laterContact,
      platform: 'whatsapp'
    })
    
    // Record earlier contact second
    await recordEvent({
      referralId: referral.referralId,
      type: 'CALL_CLICKED',
      occurredAt: firstContact,
      platform: 'whatsapp'
    })
    
    // Act
    const result = await getAvgTimeToFirstContact({ window: 30, veteranId })
    
    // Assert: Should use the earliest contact (2 hours)
    expect(result.samples).toBe(1)
    expect(result.hours).toBeCloseTo(2, 1)
  })

  it('should filter by veteran ID correctly', async () => {
    // Arrange: Create another veteran with pitch
    const otherVeteranData = await seedVeteranWithPitch()
    const otherReferralData = await seedReferral({ 
      pitchId: otherVeteranData.pitchId, 
      platform: 'whatsapp' 
    })
    
    const baseDate = new Date()
    baseDate.setDate(baseDate.getDate() - 30)
    
    // Create contact for original veteran
    const originalReferral = await seedReferral({ pitchId, platform: 'linkedin' })
    referralIds.push(originalReferral.referralId)
    
    const pitchCreated1 = new Date(baseDate)
    const firstContact1 = new Date(pitchCreated1.getTime() + 4 * 60 * 60 * 1000)
    
    await recordEvent({
      referralId: originalReferral.referralId,
      type: 'PITCH_VIEWED',
      occurredAt: pitchCreated1,
      platform: 'linkedin'
    })
    
    await recordEvent({
      referralId: originalReferral.referralId,
      type: 'CALL_CLICKED',
      occurredAt: firstContact1,
      platform: 'linkedin'
    })
    
    // Create contact for other veteran
    const pitchCreated2 = new Date(baseDate.getTime() + 24 * 60 * 60 * 1000)
    const firstContact2 = new Date(pitchCreated2.getTime() + 8 * 60 * 60 * 1000)
    
    await recordEvent({
      referralId: otherReferralData.referralId,
      type: 'PITCH_VIEWED',
      occurredAt: pitchCreated2,
      platform: 'whatsapp'
    })
    
    await recordEvent({
      referralId: otherReferralData.referralId,
      type: 'CALL_CLICKED',
      occurredAt: firstContact2,
      platform: 'whatsapp'
    })
    
    // Act: Query for original veteran only
    const result = await getAvgTimeToFirstContact({ window: 30, veteranId })
    
    // Assert: Should only include data for the specified veteran
    expect(result.samples).toBe(1)
    expect(result.hours).toBeCloseTo(4, 1) // Only the 4-hour contact
    
    // Cleanup other veteran data
    const { createClient } = require('@supabase/supabase-js')
    const supabase = createClient(
      process.env.TEST_SUPABASE_URL!,
      process.env.TEST_SUPABASE_SERVICE_ROLE_KEY!
    )
    await supabase.from('referral_events').delete().eq('referral_id', otherReferralData.referralId)
    await supabase.from('referrals').delete().eq('id', otherReferralData.referralId)
    await supabase.from('pitches').delete().eq('id', otherVeteranData.pitchId)
    await supabase.from('veterans').delete().eq('user_id', otherVeteranData.veteranId)
    await supabase.from('users').delete().eq('id', otherVeteranData.veteranId)
  })

  it('should handle empty data gracefully', async () => {
    // Act: No events seeded
    const result = await getAvgTimeToFirstContact({ window: 30, veteranId })
    
    // Assert
    expect(result.samples).toBe(0)
    expect(result.hours).toBe(0)
  })

  it('should support 90-day window', async () => {
    // Arrange: Create events over 90 days
    const baseDate = new Date()
    baseDate.setDate(baseDate.getDate() - 90)
    
    const referral = await seedReferral({ pitchId, platform: 'email' })
    referralIds.push(referral.referralId)
    
    const pitchCreated = new Date(baseDate)
    const firstContact = new Date(pitchCreated.getTime() + 12 * 60 * 60 * 1000) // +12 hours
    
    await recordEvent({
      referralId: referral.referralId,
      type: 'PITCH_VIEWED',
      occurredAt: pitchCreated,
      platform: 'email'
    })
    
    await recordEvent({
      referralId: referral.referralId,
      type: 'EMAIL_CLICKED',
      occurredAt: firstContact,
      platform: 'email'
    })
    
    // Act
    const result = await getAvgTimeToFirstContact({ window: 90, veteranId })
    
    // Assert
    expect(result.samples).toBe(1)
    expect(result.hours).toBeCloseTo(12, 1)
  })

  it('should handle sub-hour time differences', async () => {
    // Arrange: Create pitch with contact within 1 hour
    const referral = await seedReferral({ pitchId, platform: 'whatsapp' })
    referralIds.push(referral.referralId)
    
    const baseDate = new Date()
    baseDate.setDate(baseDate.getDate() - 30)
    
    const pitchCreated = new Date(baseDate)
    const firstContact = new Date(pitchCreated.getTime() + 30 * 60 * 1000) // +30 minutes
    
    await recordEvent({
      referralId: referral.referralId,
      type: 'PITCH_VIEWED',
      occurredAt: pitchCreated,
      platform: 'whatsapp'
    })
    
    await recordEvent({
      referralId: referral.referralId,
      type: 'CALL_CLICKED',
      occurredAt: firstContact,
      platform: 'whatsapp'
    })
    
    // Act
    const result = await getAvgTimeToFirstContact({ window: 30, veteranId })
    
    // Assert
    expect(result.samples).toBe(1)
    expect(result.hours).toBeCloseTo(0.5, 2) // 30 minutes = 0.5 hours
  })
})
