import { describe, it, expect } from 'vitest'
import { seedVeteranWithPitch, seedReferral, recordEvent } from '../factories'

describe('Basic Test Setup', () => {
  it('should create test data without database connection', async () => {
    // This test verifies that our factory functions work in mock mode
    const veteranData = await seedVeteranWithPitch()
    expect(veteranData).toHaveProperty('veteranId')
    expect(veteranData).toHaveProperty('pitchId')
    expect(typeof veteranData.veteranId).toBe('string')
    expect(typeof veteranData.pitchId).toBe('string')
  })

  it('should create referral data', async () => {
    const veteranData = await seedVeteranWithPitch()
    const referralData = await seedReferral({ pitchId: veteranData.pitchId })
    expect(referralData).toHaveProperty('referralId')
    expect(typeof referralData.referralId).toBe('string')
  })

  it('should record events', async () => {
    const veteranData = await seedVeteranWithPitch()
    const referralData = await seedReferral({ pitchId: veteranData.pitchId })
    const eventData = await recordEvent({
      referralId: referralData.referralId,
      type: 'PITCH_VIEWED',
      occurredAt: new Date()
    })
    expect(eventData).toHaveProperty('eventId')
    expect(typeof eventData.eventId).toBe('string')
  })
})
