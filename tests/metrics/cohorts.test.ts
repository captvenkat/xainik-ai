import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { getCohortsBySource, type CohortRow } from '@/lib/metrics'
import { 
  seedVeteranWithPitch, 
  seedReferral, 
  recordEvent, 
  cleanupTestData 
} from '../factories'

describe('Cohort Metrics', () => {
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

  it('should return one row per source with correct conversion rates', async () => {
    // Arrange: Create referrals across different sources
    const sources = ['whatsapp', 'linkedin', 'email', 'copy', 'unknown'] as const
    const sourceConfigs = [
      { source: 'whatsapp', platform: 'whatsapp' },
      { source: 'linkedin', platform: 'linkedin' },
      { source: 'email', platform: 'email' },
      { source: 'copy', platform: 'copy' },
      { source: 'unknown', platform: undefined }
    ] as const
    const baseDate = new Date()
    baseDate.setDate(baseDate.getDate() - 30)
    
    for (const config of sourceConfigs) {
      const referralData = await seedReferral({ 
        pitchId, 
        ...(config.platform ? { platform: config.platform } : {})
      })
      referralIds.push(referralData.referralId)
      
      // Create events for each referral
      const eventDate = new Date(baseDate)
      eventDate.setDate(eventDate.getDate() + Math.floor(Math.random() * 30))
      
      // Always create a LINK_OPENED event
      await recordEvent({
        referralId: referralData.referralId,
        type: 'LINK_OPENED',
        occurredAt: eventDate,
        ...(config.platform ? { platform: config.platform } : {})
      })
      
      // Create PITCH_VIEWED for most referrals
      if (config.source !== 'copy') {
        await recordEvent({
          referralId: referralData.referralId,
          type: 'PITCH_VIEWED',
          occurredAt: eventDate,
          ...(config.platform ? { platform: config.platform } : {})
        })
      }
      
      // Create CALL_CLICKED for some referrals
      if (['whatsapp', 'linkedin'].includes(config.source)) {
        await recordEvent({
          referralId: referralData.referralId,
          type: 'CALL_CLICKED',
          occurredAt: eventDate,
          ...(config.platform ? { platform: config.platform } : {})
        })
      }
      
      // Create EMAIL_CLICKED for email source
      if (config.source === 'email') {
        await recordEvent({
          referralId: referralData.referralId,
          type: 'EMAIL_CLICKED',
          occurredAt: eventDate,
          ...(config.platform ? { platform: config.platform } : {})
        })
      }
    }
    
    // Act
    const result = await getCohortsBySource({ window: 30, veteranId })
    
    // Assert
    expect(result).toHaveLength(5) // One row per source
    
    // Verify each source has correct data
    const resultMap = new Map(result.map(r => [r.source, r]))
    
    // WhatsApp: 1 referral, 1 view, 1 call, 0 emails
    const whatsapp = resultMap.get('whatsapp')
    expect(whatsapp).toBeDefined()
    expect(whatsapp!.referrals).toBe(1)
    expect(whatsapp!.opens).toBe(1)
    expect(whatsapp!.views).toBe(1)
    expect(whatsapp!.calls).toBe(1)
    expect(whatsapp!.emails).toBe(0)
    expect(whatsapp!.conv_view_to_call).toBe(1.0) // 1/1 = 1.0
    expect(whatsapp!.conv_view_to_email).toBe(0.0) // 0/1 = 0.0
    
    // LinkedIn: 1 referral, 1 view, 1 call, 0 emails
    const linkedin = resultMap.get('linkedin')
    expect(linkedin).toBeDefined()
    expect(linkedin!.referrals).toBe(1)
    expect(linkedin!.views).toBe(1)
    expect(linkedin!.calls).toBe(1)
    expect(linkedin!.emails).toBe(0)
    expect(linkedin!.conv_view_to_call).toBe(1.0)
    expect(linkedin!.conv_view_to_email).toBe(0.0)
    
    // Email: 1 referral, 1 view, 0 calls, 1 email
    const email = resultMap.get('email')
    expect(email).toBeDefined()
    expect(email!.referrals).toBe(1)
    expect(email!.views).toBe(1)
    expect(email!.calls).toBe(0)
    expect(email!.emails).toBe(1)
    expect(email!.conv_view_to_call).toBe(0.0) // 0/1 = 0.0
    expect(email!.conv_view_to_email).toBe(1.0) // 1/1 = 1.0
    
    // Copy: 1 referral, 0 views, 0 calls, 0 emails
    const copy = resultMap.get('copy')
    expect(copy).toBeDefined()
    expect(copy!.referrals).toBe(1)
    expect(copy!.views).toBe(0)
    expect(copy!.calls).toBe(0)
    expect(copy!.emails).toBe(0)
    expect(copy!.conv_view_to_call).toBe(0.0) // 0/0 = 0.0 (guard divide-by-zero)
    expect(copy!.conv_view_to_email).toBe(0.0) // 0/0 = 0.0 (guard divide-by-zero)
    
    // Other (unknown): 1 referral, 1 view, 0 calls, 0 emails
    const other = resultMap.get('other')
    expect(other).toBeDefined()
    expect(other!.referrals).toBe(1)
    expect(other!.views).toBe(1)
    expect(other!.calls).toBe(0)
    expect(other!.emails).toBe(0)
    expect(other!.conv_view_to_call).toBe(0.0) // 0/1 = 0.0
    expect(other!.conv_view_to_email).toBe(0.0) // 0/1 = 0.0
  })

  it('should handle divide-by-zero in conversion calculations', async () => {
    // Arrange: Create referral with no views
    const referralData = await seedReferral({ pitchId, platform: 'whatsapp' })
    referralIds.push(referralData.referralId)
    
    // Only create LINK_OPENED, no PITCH_VIEWED
    const baseDate = new Date()
    baseDate.setDate(baseDate.getDate() - 30)
    
    await recordEvent({
      referralId: referralData.referralId,
      type: 'LINK_OPENED',
      occurredAt: baseDate,
      platform: 'whatsapp'
    })
    
    // Act
    const result = await getCohortsBySource({ window: 30, veteranId })
    
    // Assert
    const whatsapp = result.find(r => r.source === 'whatsapp')
    expect(whatsapp).toBeDefined()
    expect(whatsapp!.views).toBe(0)
    expect(whatsapp!.conv_view_to_call).toBe(0.0) // Should handle divide-by-zero
    expect(whatsapp!.conv_view_to_email).toBe(0.0) // Should handle divide-by-zero
  })

  it('should aggregate multiple referrals from same source', async () => {
    // Arrange: Create multiple referrals from same source
    const baseDate = new Date()
    baseDate.setDate(baseDate.getDate() - 30)
    
    // Create 3 referrals from LinkedIn
    for (let i = 0; i < 3; i++) {
      const referralData = await seedReferral({ pitchId, platform: 'linkedin' })
      referralIds.push(referralData.referralId)
      
      const eventDate = new Date(baseDate)
      eventDate.setDate(eventDate.getDate() + i)
      
      // All referrals get opened and viewed
      await recordEvent({
        referralId: referralData.referralId,
        type: 'LINK_OPENED',
        occurredAt: eventDate,
        platform: 'linkedin'
      })
      
      await recordEvent({
        referralId: referralData.referralId,
        type: 'PITCH_VIEWED',
        occurredAt: eventDate,
        platform: 'linkedin'
      })
      
      // Only first 2 get calls
      if (i < 2) {
        await recordEvent({
          referralId: referralData.referralId,
          type: 'CALL_CLICKED',
          occurredAt: eventDate,
          platform: 'linkedin'
        })
      }
    }
    
    // Act
    const result = await getCohortsBySource({ window: 30, veteranId })
    
    // Assert
    const linkedin = result.find(r => r.source === 'linkedin')
    expect(linkedin).toBeDefined()
    expect(linkedin!.referrals).toBe(3)
    expect(linkedin!.opens).toBe(3)
    expect(linkedin!.views).toBe(3)
    expect(linkedin!.calls).toBe(2)
    expect(linkedin!.emails).toBe(0)
    expect(linkedin!.conv_view_to_call).toBeCloseTo(2/3, 2) // 2/3 ≈ 0.67
    expect(linkedin!.conv_view_to_email).toBe(0.0)
  })

  it('should filter by veteran ID correctly', async () => {
    // Arrange: Create another veteran with referrals
    const otherVeteranData = await seedVeteranWithPitch()
    const otherReferralData = await seedReferral({ 
      pitchId: otherVeteranData.pitchId, 
      platform: 'whatsapp' 
    })
    
    // Create events for both veterans
    const baseDate = new Date()
    baseDate.setDate(baseDate.getDate() - 30)
    
    // Event for original veteran
    const originalReferralData = await seedReferral({ pitchId, platform: 'linkedin' })
    referralIds.push(originalReferralData.referralId)
    
    await recordEvent({
      referralId: originalReferralData.referralId,
      type: 'PITCH_VIEWED',
      occurredAt: baseDate,
      platform: 'linkedin'
    })
    
    // Event for other veteran
    await recordEvent({
      referralId: otherReferralData.referralId,
      type: 'PITCH_VIEWED',
      occurredAt: baseDate,
      platform: 'whatsapp'
    })
    
    // Act: Query for original veteran only
    const result = await getCohortsBySource({ window: 30, veteranId })
    
    // Assert: Should only include data for the specified veteran
    const linkedin = result.find(r => r.source === 'linkedin')
    expect(linkedin).toBeDefined()
    expect(linkedin!.views).toBe(1)
    
    const whatsapp = result.find(r => r.source === 'whatsapp')
    expect(whatsapp).toBeUndefined() // Should not include other veteran's data
    
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
    // Act: No referrals or events seeded
    const result = await getCohortsBySource({ window: 30, veteranId })
    
    // Assert
    expect(result).toHaveLength(0) // No sources with data
  })

  it('should support 90-day window', async () => {
    // Arrange: Create events over 90 days
    const baseDate = new Date()
    baseDate.setDate(baseDate.getDate() - 90)
    
    const referralData = await seedReferral({ pitchId, platform: 'email' })
    referralIds.push(referralData.referralId)
    
    // Create events spread over 90 days
    for (let day = 0; day < 90; day += 15) {
      const eventDate = new Date(baseDate)
      eventDate.setDate(eventDate.getDate() + day)
      
      await recordEvent({
        referralId: referralData.referralId,
        type: 'PITCH_VIEWED',
        occurredAt: eventDate,
        platform: 'email'
      })
    }
    
    // Act
    const result = await getCohortsBySource({ window: 90, veteranId })
    
    // Assert
    const email = result.find(r => r.source === 'email')
    expect(email).toBeDefined()
    expect(email!.views).toBe(6) // 90/15 = 6 events
  })

  it('should normalize unknown platforms to "other"', async () => {
    // Arrange: Create referral with unknown platform
    const referralData = await seedReferral({ pitchId, platform: 'unknown' })
    referralIds.push(referralData.referralId)
    
    const baseDate = new Date()
    baseDate.setDate(baseDate.getDate() - 30)
    
    await recordEvent({
      referralId: referralData.referralId,
      type: 'PITCH_VIEWED',
      occurredAt: baseDate,
      platform: 'unknown'
    })
    
    // Act
    const result = await getCohortsBySource({ window: 30, veteranId })
    
    // Assert
    const other = result.find(r => r.source === 'other')
    expect(other).toBeDefined()
    expect(other!.views).toBe(1)
    
    // Should not have an "unknown" source
    const unknown = result.find(r => r.source === 'unknown' as any)
    expect(unknown).toBeUndefined()
  })
})
