import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { 
  seedVeteranWithPitch, 
  seedReferral, 
  recordEvent, 
  cleanupTestData 
} from '../factories'

// Test server URL
const TEST_SERVER_URL = process.env.TEST_SERVER_URL || 'http://localhost:3000'

describe('Metrics API Endpoints', () => {
  let veteranId: string
  let pitchId: string
  let referralId: string

  beforeAll(async () => {
    // Seed test data
    const veteranData = await seedVeteranWithPitch()
    veteranId = veteranData.veteranId
    pitchId = veteranData.pitchId
    
    const referralData = await seedReferral({ pitchId })
    referralId = referralData.referralId
  })

  afterAll(async () => {
    await cleanupTestData()
  })

  beforeEach(async () => {
    // Clear any existing events
    const { createClient } = require('@supabase/supabase-js')
    const supabase = createClient(
      process.env.TEST_SUPABASE_URL!,
      process.env.TEST_SUPABASE_SERVICE_ROLE_KEY!
    )
    await supabase.from('referral_events').delete().eq('referral_id', referralId)
  })

  describe('GET /api/metrics/trendline', () => {
    it('should return correctly shaped JSON with 3 series and 30 points each', async () => {
      // Arrange: Create test events
      const baseDate = new Date()
      baseDate.setDate(baseDate.getDate() - 30)
      
      // Create events over 30 days
      for (let day = 0; day < 30; day += 3) {
        const eventDate = new Date(baseDate)
        eventDate.setDate(eventDate.getDate() + day)
        
        await recordEvent({
          referralId,
          type: 'PITCH_VIEWED',
          occurredAt: eventDate,
          platform: 'whatsapp'
        })
      }
      
      // Act
      const response = await fetch(
        `${TEST_SERVER_URL}/api/metrics/trendline?window=30&veteranId=${veteranId}`
      )
      
      // Assert
      expect(response.status).toBe(200)
      expect(response.headers.get('content-type')).toContain('application/json')
      
      const data = await response.json()
      
      // Verify response structure
      expect(Array.isArray(data)).toBe(true)
      expect(data).toHaveLength(3)
      
      // Verify each series
      const seriesMap = new Map(data.map((s: any) => [s.label, s]))
      
      // Check pitch_viewed series
      const pitchViewedSeries = seriesMap.get('pitch_viewed') as any
      expect(pitchViewedSeries).toBeDefined()
      expect(pitchViewedSeries.points).toHaveLength(30)
      expect(pitchViewedSeries.window).toBe(30)
      
      // Check recruiter_called series
      const recruiterCalledSeries = seriesMap.get('recruiter_called') as any
      expect(recruiterCalledSeries).toBeDefined()
      expect(recruiterCalledSeries.points).toHaveLength(30)
      expect(recruiterCalledSeries.window).toBe(30)
      
      // Check recruiter_emailed series
      const recruiterEmailedSeries = seriesMap.get('recruiter_emailed') as any
      expect(recruiterEmailedSeries).toBeDefined()
      expect(recruiterEmailedSeries.points).toHaveLength(30)
      expect(recruiterEmailedSeries.window).toBe(30)
      
      // Verify point structure
      for (const series of data) {
        for (const point of series.points) {
          expect(point).toHaveProperty('date')
          expect(point).toHaveProperty('value')
          expect(typeof point.date).toBe('string')
          expect(typeof point.value).toBe('number')
          expect(point.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
        }
      }
    })

    it('should handle missing veteranId parameter', async () => {
      // Act
      const response = await fetch(
        `${TEST_SERVER_URL}/api/metrics/trendline?window=30`
      )
      
      // Assert
      expect(response.status).toBe(200) // Should still work for global metrics
      
      const data = await response.json()
      expect(Array.isArray(data)).toBe(true)
      expect(data).toHaveLength(3)
    })

    it('should handle invalid window parameter', async () => {
      // Act
      const response = await fetch(
        `${TEST_SERVER_URL}/api/metrics/trendline?window=invalid&veteranId=${veteranId}`
      )
      
      // Assert
      expect(response.status).toBe(400) // Should return bad request
    })

    it('should support 90-day window', async () => {
      // Arrange: Create events over 90 days
      const baseDate = new Date()
      baseDate.setDate(baseDate.getDate() - 90)
      
      for (let day = 0; day < 90; day += 7) {
        const eventDate = new Date(baseDate)
        eventDate.setDate(eventDate.getDate() + day)
        
        await recordEvent({
          referralId,
          type: 'PITCH_VIEWED',
          occurredAt: eventDate,
          platform: 'whatsapp'
        })
      }
      
      // Act
      const response = await fetch(
        `${TEST_SERVER_URL}/api/metrics/trendline?window=90&veteranId=${veteranId}`
      )
      
      // Assert
      expect(response.status).toBe(200)
      
      const data = await response.json()
      expect(data).toHaveLength(3)
      
      for (const series of data) {
        expect(series.points).toHaveLength(90)
        expect(series.window).toBe(90)
      }
    })
  })

  describe('GET /api/metrics/cohorts', () => {
    it('should return correctly shaped JSON with source breakdown', async () => {
      // Arrange: Create referrals across different sources
      const sources = ['whatsapp', 'linkedin', 'email'] as const
      const baseDate = new Date()
      baseDate.setDate(baseDate.getDate() - 30)
      
      for (const source of sources) {
        const referralData = await seedReferral({ pitchId, platform: source })
        
        const eventDate = new Date(baseDate)
        eventDate.setDate(eventDate.getDate() + Math.floor(Math.random() * 30))
        
        await recordEvent({
          referralId: referralData.referralId,
          type: 'PITCH_VIEWED',
          occurredAt: eventDate,
          platform: source
        })
        
        if (source === 'whatsapp') {
          await recordEvent({
            referralId: referralData.referralId,
            type: 'CALL_CLICKED',
            occurredAt: eventDate,
            platform: source
          })
        }
      }
      
      // Act
      const response = await fetch(
        `${TEST_SERVER_URL}/api/metrics/cohorts?window=30&veteranId=${veteranId}`
      )
      
      // Assert
      expect(response.status).toBe(200)
      expect(response.headers.get('content-type')).toContain('application/json')
      
      const data = await response.json()
      
      // Verify response structure
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBeGreaterThan(0)
      
      // Verify each row structure
      for (const row of data) {
        expect(row).toHaveProperty('source')
        expect(row).toHaveProperty('referrals')
        expect(row).toHaveProperty('opens')
        expect(row).toHaveProperty('views')
        expect(row).toHaveProperty('calls')
        expect(row).toHaveProperty('emails')
        expect(row).toHaveProperty('conv_view_to_call')
        expect(row).toHaveProperty('conv_view_to_email')
        
        expect(typeof row.source).toBe('string')
        expect(typeof row.referrals).toBe('number')
        expect(typeof row.opens).toBe('number')
        expect(typeof row.views).toBe('number')
        expect(typeof row.calls).toBe('number')
        expect(typeof row.emails).toBe('number')
        expect(typeof row.conv_view_to_call).toBe('number')
        expect(typeof row.conv_view_to_email).toBe('number')
        
        // Verify source is one of the expected values
        expect(['whatsapp', 'linkedin', 'email', 'copy', 'other']).toContain(row.source)
        
        // Verify conversion rates are between 0 and 1
        expect(row.conv_view_to_call).toBeGreaterThanOrEqual(0)
        expect(row.conv_view_to_call).toBeLessThanOrEqual(1)
        expect(row.conv_view_to_email).toBeGreaterThanOrEqual(0)
        expect(row.conv_view_to_email).toBeLessThanOrEqual(1)
      }
      
      // Cleanup additional referrals
      const { createClient } = require('@supabase/supabase-js')
      const supabase = createClient(
        process.env.TEST_SUPABASE_URL!,
        process.env.TEST_SUPABASE_SERVICE_ROLE_KEY!
      )
      for (const source of sources) {
        const referralData = await seedReferral({ pitchId, platform: source })
        await supabase.from('referral_events').delete().eq('referral_id', referralData.referralId)
        await supabase.from('referrals').delete().eq('id', referralData.referralId)
      }
    })

    it('should handle empty data gracefully', async () => {
      // Act: No events seeded
      const response = await fetch(
        `${TEST_SERVER_URL}/api/metrics/cohorts?window=30&veteranId=${veteranId}`
      )
      
      // Assert
      expect(response.status).toBe(200)
      
      const data = await response.json()
      expect(Array.isArray(data)).toBe(true)
      expect(data).toHaveLength(0) // No sources with data
    })
  })

  describe('GET /api/metrics/avg-time', () => {
    it('should return correctly shaped JSON with hours and samples', async () => {
      // Arrange: Create pitches with first contact
      const baseDate = new Date()
      baseDate.setDate(baseDate.getDate() - 30)
      
      // Create 3 pitches with different contact times
      for (let i = 0; i < 3; i++) {
        const referralData = await seedReferral({ pitchId, platform: 'whatsapp' })
        
        const pitchCreated = new Date(baseDate.getTime() + i * 24 * 60 * 60 * 1000)
        const firstContact = new Date(pitchCreated.getTime() + (i + 1) * 2 * 60 * 60 * 1000) // +2, +4, +6 hours
        
        await recordEvent({
          referralId: referralData.referralId,
          type: 'PITCH_VIEWED',
          occurredAt: pitchCreated,
          platform: 'whatsapp'
        })
        
        await recordEvent({
          referralId: referralData.referralId,
          type: 'CALL_CLICKED',
          occurredAt: firstContact,
          platform: 'whatsapp'
        })
      }
      
      // Act
      const response = await fetch(
        `${TEST_SERVER_URL}/api/metrics/avg-time?window=30&veteranId=${veteranId}`
      )
      
      // Assert
      expect(response.status).toBe(200)
      expect(response.headers.get('content-type')).toContain('application/json')
      
      const data = await response.json()
      
      // Verify response structure
      expect(data).toHaveProperty('hours')
      expect(data).toHaveProperty('samples')
      expect(typeof data.hours).toBe('number')
      expect(typeof data.samples).toBe('number')
      
      // Verify values
      expect(data.samples).toBe(3)
      expect(data.hours).toBeGreaterThan(0)
      expect(data.hours).toBeLessThan(10) // Should be around 4 hours average
      
      // Cleanup additional referrals
      const { createClient } = require('@supabase/supabase-js')
      const supabase = createClient(
        process.env.TEST_SUPABASE_URL!,
        process.env.TEST_SUPABASE_SERVICE_ROLE_KEY!
      )
      for (let i = 0; i < 3; i++) {
        const referralData = await seedReferral({ pitchId, platform: 'whatsapp' })
        await supabase.from('referral_events').delete().eq('referral_id', referralData.referralId)
        await supabase.from('referrals').delete().eq('id', referralData.referralId)
      }
    })

    it('should handle no first contact data', async () => {
      // Act: No contact events seeded
      const response = await fetch(
        `${TEST_SERVER_URL}/api/metrics/avg-time?window=30&veteranId=${veteranId}`
      )
      
      // Assert
      expect(response.status).toBe(200)
      
      const data = await response.json()
      expect(data.samples).toBe(0)
      expect(data.hours).toBe(0)
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid veteran ID', async () => {
      // Act
      const response = await fetch(
        `${TEST_SERVER_URL}/api/metrics/trendline?window=30&veteranId=invalid-uuid`
      )
      
      // Assert
      expect(response.status).toBe(400) // Should return bad request for invalid UUID
    })

    it('should handle missing required parameters', async () => {
      // Act
      const response = await fetch(
        `${TEST_SERVER_URL}/api/metrics/trendline`
      )
      
      // Assert
      expect(response.status).toBe(400) // Should return bad request for missing window
    })

    it('should handle unsupported window values', async () => {
      // Act
      const response = await fetch(
        `${TEST_SERVER_URL}/api/metrics/trendline?window=60&veteranId=${veteranId}`
      )
      
      // Assert
      expect(response.status).toBe(400) // Should return bad request for unsupported window
    })
  })

  describe('CORS and Headers', () => {
    it('should include proper CORS headers', async () => {
      // Act
      const response = await fetch(
        `${TEST_SERVER_URL}/api/metrics/trendline?window=30&veteranId=${veteranId}`
      )
      
      // Assert
      expect(response.status).toBe(200)
      expect(response.headers.get('access-control-allow-origin')).toBeDefined()
      expect(response.headers.get('content-type')).toContain('application/json')
    })
  })
})
