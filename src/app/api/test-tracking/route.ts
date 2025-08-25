import { NextRequest, NextResponse } from 'next/server'
import { createActionClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createActionClient()
    
    // Test 1: Check if tracking_events table exists
    const { data: tableCheck, error: tableError } = await supabase
      .from('tracking_events')
      .select('count')
      .limit(1)
    
    if (tableError) {
      return NextResponse.json({ 
        success: false, 
        error: 'tracking_events table not found',
        details: tableError.message 
      })
    }
    
    // Test 2: Check if referrals table exists
    const { data: referralsCheck, error: referralsError } = await supabase
      .from('referrals')
      .select('count')
      .limit(1)
    
    if (referralsError) {
      return NextResponse.json({ 
        success: false, 
        error: 'referrals table not found',
        details: referralsError.message 
      })
    }
    
    // Test 3: Check if pitches table exists and has data
    const { data: pitches, error: pitchesError } = await supabase
      .from('pitches')
      .select('id, user_id, title')
      .limit(1)
    
    if (pitchesError) {
      return NextResponse.json({ 
        success: false, 
        error: 'pitches table not found',
        details: pitchesError.message 
      })
    }
    
    // Test 4: Try to insert a test tracking event
    if (pitches && pitches.length > 0) {
      const testPitch = pitches[0]
      
      if (!testPitch) {
        return NextResponse.json({ 
          success: false, 
          error: 'No valid pitch found for testing' 
        })
      }
      
      const { data: testEvent, error: insertError } = await supabase
        .from('tracking_events')
        .insert({
          user_id: testPitch.user_id,
          pitch_id: testPitch.id,
          event_type: 'PITCH_VIEWED',
          platform: 'test',
          user_agent: 'test-agent',
          ip_hash: 'test-ip',
          session_id: 'test-session',
          metadata: { test: true },
          occurred_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (insertError) {
        return NextResponse.json({ 
          success: false, 
          error: 'Failed to insert test tracking event',
          details: insertError.message 
        })
      }
      
      // Clean up test event
      await supabase
        .from('tracking_events')
        .delete()
        .eq('id', testEvent.id)
      
      return NextResponse.json({ 
        success: true, 
        message: 'Tracking system is working correctly',
        testPitch: {
          id: testPitch.id,
          title: testPitch.title,
          user_id: testPitch.user_id
        }
      })
    }
    
    return NextResponse.json({ 
      success: false, 
      error: 'No pitches found in database' 
    })
    
  } catch (error) {
    console.error('Test tracking error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
