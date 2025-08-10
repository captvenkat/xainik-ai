import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabaseAdmin'
import { logActivity } from '@/lib/activity'

export async function POST(request: NextRequest) {
  try {
    // Verify API key for security
    const authHeader = request.headers.get('authorization')
    const expectedKey = process.env.CRON_API_KEY
    
    if (!expectedKey || authHeader !== `Bearer ${expectedKey}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()
    
    // Find expired pitches that are still active
    const { data: expiredPitches, error: fetchError } = await supabase
      .from('pitches')
      .select(`
        id,
        title,
        veteran_id,
        plan_tier,
        plan_expires_at,
        users!veteran_id(name, email)
      `)
      .eq('is_active', true)
      .lt('plan_expires_at', new Date().toISOString())

    if (fetchError) {
      console.error('Error fetching expired pitches:', fetchError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    if (!expiredPitches || expiredPitches.length === 0) {
      return NextResponse.json({ 
        message: 'No expired pitches found',
        processed: 0 
      })
    }

    // Mark expired pitches as inactive
    const pitchIds = expiredPitches.map(p => p.id)
    const { error: updateError } = await supabase
      .from('pitches')
      .update({ is_active: false })
      .in('id', pitchIds)

    if (updateError) {
      console.error('Error updating expired pitches:', updateError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    // Log activity for each expired pitch
    const activityPromises = expiredPitches.map(pitch => 
      logActivity('pitch_expired', {
        pitch_id: pitch.id,
        pitch_title: pitch.title,
        veteran_name: pitch.users?.name,
        veteran_email: pitch.users?.email,
        plan_tier: pitch.plan_tier,
        expired_at: pitch.plan_expires_at
      })
    )

    await Promise.all(activityPromises)

    // Send notifications to veterans (optional - can be implemented later)
    // await sendExpiryNotifications(expiredPitches)

    return NextResponse.json({
      message: 'Successfully processed expired pitches',
      processed: expiredPitches.length,
      expired_pitches: expiredPitches.map(p => ({
        id: p.id,
        title: p.title,
        veteran_name: p.users?.name,
        plan_tier: p.plan_tier,
        expired_at: p.plan_expires_at
      }))
    })

  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET method for manual testing (remove in production)
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const expectedKey = process.env.CRON_API_KEY
  
  if (!expectedKey || authHeader !== `Bearer ${expectedKey}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  
  // Get count of pitches expiring soon (for monitoring)
  const threeDaysFromNow = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
  
  const { data: expiringSoon, error } = await supabase
    .from('pitches')
    .select('id, title, plan_expires_at')
    .eq('is_active', true)
    .gte('plan_expires_at', new Date().toISOString())
    .lte('plan_expires_at', threeDaysFromNow)
    .order('plan_expires_at', { ascending: true })

  if (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  return NextResponse.json({
    message: 'Cron endpoint is working',
    expiring_soon_count: expiringSoon?.length || 0,
    expiring_soon: expiringSoon?.slice(0, 5) || [] // Show first 5
  })
}
