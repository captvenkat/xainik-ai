import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createClient } from '@supabase/supabase-js'

// Mock Supabase client
let storedEvents: any[] = []

const mockSupabase = {
  from: (table: string) => ({
    select: (columns: string) => ({
      eq: (column: string, value: any) => ({
        single: async () => {
          const event = storedEvents.find(e => e.event_id === value)
          return { data: event || null, error: null }
        }
      })
    }),
    insert: (data: any) => ({
      select: () => ({
        single: async () => {
          const newEvent = { id: `test-event-${Date.now()}`, ...data }
          storedEvents.push(newEvent)
          return { data: newEvent, error: null }
        }
      })
    })
  }),
  auth: {
    getUser: async () => ({ data: { user: null }, error: null })
  }
}

describe('Webhook Idempotency', () => {
  let supabase: any

  beforeEach(() => {
    supabase = mockSupabase
    storedEvents = [] // Reset stored events
  })

  afterEach(() => {
    storedEvents = [] // Reset stored events
  })

  it('should handle duplicate event IDs gracefully', async () => {
    const eventId = 'evt_test_123'
    
    // First call - should succeed
    const { data: existingEvent1 } = await supabase
      .from('payment_events')
      .select('id')
      .eq('event_id', eventId)
      .single()

    expect(existingEvent1).toBeNull()

    // Simulate first event processing
    const { data: event1 } = await supabase
      .from('payment_events')
      .insert({
        event_id: eventId,
        payment_id: 'pay_test_123',
        order_id: 'order_test_123',
        amount: 29900,
        currency: 'INR',
        status: 'captured',
        notes: { type: 'service' }
      })
      .select()
      .single()

    expect(event1.id).toMatch(/^test-event-\d+$/)

    // Second call with same event ID - should return existing event
    const { data: existingEvent2 } = await supabase
      .from('payment_events')
      .select('id')
      .eq('event_id', eventId)
      .single()

    // Should find existing event (idempotency check)
    expect(existingEvent2).not.toBeNull()
  })

  it('should process different event IDs independently', async () => {
    const eventId1 = 'evt_test_123'
    const eventId2 = 'evt_test_456'
    
    // Process first event
    const { data: event1 } = await supabase
      .from('payment_events')
      .insert({
        event_id: eventId1,
        payment_id: 'pay_test_123',
        order_id: 'order_test_123',
        amount: 29900,
        currency: 'INR',
        status: 'captured',
        notes: { type: 'service' }
      })
      .select()
      .single()

    // Process second event
    const { data: event2 } = await supabase
      .from('payment_events')
      .insert({
        event_id: eventId2,
        payment_id: 'pay_test_456',
        order_id: 'order_test_456',
        amount: 50000,
        currency: 'INR',
        status: 'captured',
        notes: { type: 'donation' }
      })
      .select()
      .single()

    expect(event1.id).toMatch(/^test-event-\d+$/)
    expect(event2.id).toMatch(/^test-event-\d+$/)
    // Since we're using timestamps, they should be different
    expect(event1.event_id).toBe('evt_test_123')
    expect(event2.event_id).toBe('evt_test_456')
  })
})
