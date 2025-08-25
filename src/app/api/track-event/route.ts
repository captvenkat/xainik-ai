import { NextRequest, NextResponse } from 'next/server'
import { createActionClient } from '@/lib/supabase-server'

// Universal tracking endpoint - Central entities: user_id, pitch_id
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      eventType,
      pitchId,
      userId, // Central source of truth
      referralId,
      parentReferralId,
      platform = 'web',
      userAgent,
      ipAddress,
      metadata = {},
      sessionId,
      timestamp = new Date().toISOString()
    } = body

    const supabase = await createActionClient()

    // Validate required fields
    if (!pitchId || !userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: pitchId, userId' 
      }, { status: 400 })
    }

    // 1. ALWAYS track the event in tracking_events table
    let finalReferralId = referralId

    // If no referral ID, create or find a direct referral
    if (!finalReferralId && pitchId) {
      // Check if this is a chain referral (has parent)
      if (parentReferralId) {
        // Create new referral in the chain
        const { data: newReferral } = await supabase
          .from('referrals')
          .insert({
            user_id: userId, // Central source of truth
            pitch_id: pitchId, // Central tracking entity
            supporter_id: null, // Anonymous for now
            share_link: `chain-${pitchId}-${Date.now()}`,
            platform: platform,
            parent_referral_id: parentReferralId,
            source_type: 'chain'
          })
          .select('id')
          .single()
        
        finalReferralId = newReferral?.id
      } else {
        // Direct visit - find or create direct referral
        const { data: existingDirectReferral } = await supabase
          .from('referrals')
          .select('id')
          .eq('pitch_id', pitchId)
          .eq('user_id', userId) // Central source of truth
          .eq('source_type', 'direct')
          .single()

        if (existingDirectReferral) {
          finalReferralId = existingDirectReferral.id
        } else {
          // Create direct referral
          const { data: newDirectReferral } = await supabase
            .from('referrals')
            .insert({
              user_id: userId, // Central source of truth
              pitch_id: pitchId, // Central tracking entity
              supporter_id: null,
              share_link: `direct-${pitchId}-${Date.now()}`,
              platform: 'direct',
              source_type: 'direct'
            })
            .select('id')
            .single()

          finalReferralId = newDirectReferral?.id
        }
      }
    }

    // Record the tracking event
    const { data: event, error } = await supabase
      .from('tracking_events')
      .insert({
        user_id: userId, // Central source of truth
        pitch_id: pitchId, // Central tracking entity
        referral_id: finalReferralId,
        event_type: eventType,
        platform,
        user_agent: userAgent,
        ip_hash: ipAddress,
        session_id: sessionId,
        metadata: {
          ...metadata,
          timestamp,
          user_agent: userAgent,
          ip_address: ipAddress,
          parent_referral_id: parentReferralId
        },
        occurred_at: timestamp
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to record tracking event:', error)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to record event' 
      }, { status: 500 })
    }

    // 2. Update attribution chains if this is a chain referral
    if (parentReferralId && finalReferralId) {
      await updateAttributionChain(supabase, finalReferralId, pitchId, userId)
    }

    // 3. Update supporter performance if this is a conversion event
    if (['CALL_CLICKED', 'PHONE_CLICKED', 'EMAIL_CLICKED'].includes(eventType)) {
      await updateSupporterPerformance(supabase, finalReferralId, pitchId, userId, eventType)
    }

    return NextResponse.json({ 
      success: true, 
      tracked: true,
      eventId: event?.id,
      referralId: finalReferralId 
    })

  } catch (error) {
    console.error('Tracking error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Tracking failed' 
    }, { status: 500 })
  }
}

// Update attribution chain analytics
async function updateAttributionChain(supabase: any, referralId: string, pitchId: string, userId: string) {
  try {
    // Get referral info
    const { data: referral } = await supabase
      .from('referrals')
      .select('*')
      .eq('id', referralId)
      .single()

    if (!referral) return

    // Get original referral (first in chain)
    let originalReferralId = referralId
    let originalSupporterId = referral.supporter_id

    if (referral.parent_referral_id) {
      const { data: parentReferral } = await supabase
        .from('referrals')
        .select('*')
        .eq('id', referral.parent_referral_id)
        .single()

      if (parentReferral) {
        originalReferralId = parentReferral.id
        originalSupporterId = parentReferral.supporter_id
      }
    }

    // Insert or update attribution chain
    await supabase
      .from('attribution_chains')
      .upsert({
        user_id: userId, // Central source of truth
        pitch_id: pitchId, // Central tracking entity
        original_referral_id: originalReferralId,
        original_supporter_id: originalSupporterId,
        chain_depth: referral.attribution_depth || 0,
        last_activity_at: new Date().toISOString()
      }, {
        onConflict: 'original_referral_id'
      })

  } catch (error) {
    console.error('Error updating attribution chain:', error)
  }
}

// Update supporter performance
async function updateSupporterPerformance(supabase: any, referralId: string, pitchId: string, userId: string, eventType: string) {
  try {
    // Get referral info to find supporter
    const { data: referral } = await supabase
      .from('referrals')
      .select('supporter_id, original_supporter_id')
      .eq('id', referralId)
      .single()

    if (!referral) return

    const supporterId = referral.original_supporter_id || referral.supporter_id
    if (!supporterId) return

    // Insert or update supporter performance
    await supabase
      .from('supporter_performance')
      .upsert({
        user_id: userId, // Central source of truth (pitch owner)
        pitch_id: pitchId, // Central tracking entity
        supporter_id: supporterId,
        total_attributed_conversions: 1,
        last_activity_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,pitch_id,supporter_id'
      })

  } catch (error) {
    console.error('Error updating supporter performance:', error)
  }
}

// GET endpoint for pixel tracking (1x1 transparent GIF)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  try {
    const eventType = searchParams.get('event') || 'PITCH_VIEWED'
    const pitchId = searchParams.get('pitch')
    const userId = searchParams.get('user') // Central source of truth
    const referralId = searchParams.get('ref')
    const parentReferralId = searchParams.get('parent')
    const platform = searchParams.get('platform') || 'web'
    const sessionId = searchParams.get('session')
    const metadata = searchParams.get('meta')
    
    if (pitchId && userId) {
      const supabase = await createActionClient()
      
      // Track the event with attribution
      let finalReferralId = referralId
      
      if (!finalReferralId) {
        // Check if this is a chain referral
        if (parentReferralId) {
          // Create new referral in the chain
          const { data: newReferral } = await supabase
            .from('referrals')
            .insert({
              user_id: userId, // Central source of truth
              pitch_id: pitchId, // Central tracking entity
              supporter_id: null,
              share_link: `chain-${pitchId}-${Date.now()}`,
              platform: platform,
              parent_referral_id: parentReferralId,
              source_type: 'chain'
            })
            .select('id')
            .single()
          
          finalReferralId = newReferral?.id
        } else {
          // Direct visit
          const { data: existingDirectReferral } = await supabase
            .from('referrals')
            .select('id')
            .eq('pitch_id', pitchId)
            .eq('user_id', userId) // Central source of truth
            .eq('source_type', 'direct')
            .single()

          if (existingDirectReferral) {
            finalReferralId = existingDirectReferral.id
          } else {
            const { data: newDirectReferral } = await supabase
              .from('referrals')
              .insert({
                user_id: userId, // Central source of truth
                pitch_id: pitchId, // Central tracking entity
                supporter_id: null,
                share_link: `direct-${pitchId}-${Date.now()}`,
                platform: 'direct',
                source_type: 'direct'
              })
              .select('id')
              .single()

            finalReferralId = newDirectReferral?.id
          }
        }
      }

      if (finalReferralId) {
        // Record the tracking event
        await supabase
          .from('tracking_events')
          .insert({
            user_id: userId, // Central source of truth
            pitch_id: pitchId, // Central tracking entity
            referral_id: finalReferralId,
            event_type: eventType,
            platform,
            user_agent: request.headers.get('user-agent') || 'pixel',
            ip_hash: request.headers.get('x-forwarded-for') || 'pixel',
            session_id: sessionId,
            metadata: {
              tracked_via: 'pixel',
              parent_referral_id: parentReferralId,
              ...(metadata && { meta: JSON.parse(metadata) })
            },
            occurred_at: new Date().toISOString()
          })

        // Update attribution chains if needed
        if (parentReferralId) {
          await updateAttributionChain(supabase, finalReferralId, pitchId, userId)
        }

        // Update supporter performance if conversion
        if (['CALL_CLICKED', 'PHONE_CLICKED', 'EMAIL_CLICKED'].includes(eventType)) {
          await updateSupporterPerformance(supabase, finalReferralId, pitchId, userId, eventType)
        }
      }
    }
  } catch (error) {
    console.error('Pixel tracking error:', error)
  }

  // Return 1x1 transparent GIF
  const gifBuffer = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64')
  
  return new NextResponse(gifBuffer, {
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  })
}
