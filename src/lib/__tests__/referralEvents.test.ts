import { recordEvent } from '../referralEvents'
import { createSupabaseServerOnly } from '../supabaseServerOnly'

// Mock Supabase client
jest.mock('../supabaseServerOnly', () => ({
  createSupabaseServerOnly: jest.fn()
}))

describe('Referral Events Debounce', () => {
  const mockSupabase = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    single: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(createSupabaseServerOnly as jest.Mock).mockReturnValue(mockSupabase)
  })

  it('should not log duplicate events within 10 minutes', async () => {
    // Mock existing event found
    mockSupabase.single.mockResolvedValueOnce({ data: { id: 'existing-event' } })

    const eventData = {
      referralId: 'test-referral',
      type: 'PITCH_VIEWED' as const,
      platform: 'web'
    }

    // First call should check for existing event
    await recordEvent(eventData)

    expect(mockSupabase.from).toHaveBeenCalledWith('referral_events')
    expect(mockSupabase.select).toHaveBeenCalledWith('id')
    expect(mockSupabase.eq).toHaveBeenCalledWith('referral_id', 'test-referral')
    expect(mockSupabase.eq).toHaveBeenCalledWith('event_type', 'PITCH_VIEWED')
    
    // Should not insert new event since existing was found
    expect(mockSupabase.insert).not.toHaveBeenCalled()
  })

  it('should log new event when no existing event found', async () => {
    // Mock no existing event found
    mockSupabase.single.mockResolvedValueOnce({ data: null })

    const eventData = {
      referralId: 'test-referral',
      type: 'CALL_CLICKED' as const,
      platform: 'web'
    }

    await recordEvent(eventData)

    expect(mockSupabase.insert).toHaveBeenCalledWith({
      referral_id: 'test-referral',
      event_type: 'CALL_CLICKED',
      platform: 'web',
      user_agent: null,
      ip_hash: null,
      debounce_key: expect.any(String),
      created_at: expect.any(String)
    })
  })
})
