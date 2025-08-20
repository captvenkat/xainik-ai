import { createSupabaseBrowser } from '@/lib/supabaseBrowser'
import { nanoid } from 'nanoid'

export interface PitchConnectionData {
  supporter_id: string
  pitch_id: string
  connection_source: 'registration' | 'manual' | 'referral'
  source_url?: string
  user_agent?: string
  ip_hash?: string
}

export interface ConnectionAnalytics {
  total_connections: number
  active_connections: number
  recent_activity: any[]
  conversion_rate: number
  top_supporters: any[]
  fomo_events: any[]
}

/**
 * Connect a supporter directly to a pitch
 * This happens when someone registers as a supporter from a pitch page
 */
export async function connectSupporterToPitch(data: PitchConnectionData) {
  try {
    const supabase = createSupabaseBrowser()
    
    // Check if connection already exists
    const { data: existingConnection } = await supabase
      .from('referrals')
      .select('*')
      .eq('supporter_id', data.supporter_id)
      .eq('pitch_id', data.pitch_id)
      .single()

    if (existingConnection) {
      // Update connection with new activity
      await supabase
        .from('referral_events')
        .insert({
          referral_id: existingConnection.id,
          event_type: 'CONNECTION_REFRESHED',
          platform: data.connection_source,
          user_agent: data.user_agent,
          ip_hash: data.ip_hash,
          occurred_at: new Date().toISOString()
        })

      return { success: true, data: existingConnection, action: 'refreshed' }
    }

    // Create new connection
    const shareLink = `${process.env.NEXT_PUBLIC_SITE_URL}/refer/opened/${nanoid(12)}`
    
    const { data: newConnection, error } = await supabase
      .from('referrals')
      .insert({
        supporter_id: data.supporter_id,
        pitch_id: data.pitch_id,
        share_link: shareLink
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating pitch connection:', error)
      throw new Error('Failed to create pitch connection')
    }

    // Log the connection event
    await supabase
      .from('referral_events')
      .insert({
        referral_id: newConnection.id,
        event_type: 'SUPPORTER_CONNECTED',
        platform: data.connection_source,
        user_agent: data.user_agent,
        ip_hash: data.ip_hash,
        occurred_at: new Date().toISOString()
      })

    // Note: activity_log table doesn't exist in live schema
    // Log to activity log for FOMO
    // await supabase
    //   .from('activity_log')
    //   .insert({
    //     event: 'supporter_connected_to_pitch',
    //     meta: {
    //       supporter_id: data.supporter_id,
    //       pitch_id: data.pitch_id,
    //       connection_source: data.connection_source,
    //       share_link: shareLink
    //     }
    //   })

    return { success: true, data: newConnection, action: 'created' }
  } catch (error) {
    console.error('Error in connectSupporterToPitch:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * Get all pitches a supporter is connected to
 */
export async function getSupporterConnections(supporterId: string) {
  try {
    const supabase = createSupabaseBrowser()
    
    const { data: connections, error } = await supabase
      .from('referrals')
      .select(`
        id,
        pitch_id,
        share_link,
        created_at,
        pitches (
          id,
          title,
          user_id,
          users (
            id,
            name,
            avatar_url
          )
        )
      `)
      .eq('supporter_id', supporterId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching supporter connections:', error)
      throw new Error('Failed to fetch connections')
    }

    // Calculate activity metrics for each connection
    const connectionsWithMetrics = connections?.map(connection => {
      // Note: referral_events table doesn't exist in live schema
      // For now, use mock metrics
      const clicks = 0
      const shares = 0
      const calls = 0
      const emails = 0
      
      return {
        ...connection,
        metrics: {
          clicks,
          shares,
          calls,
          emails,
          total_activity: 0
        }
      }
    }) || []

    return { success: true, data: connectionsWithMetrics }
  } catch (error) {
    console.error('Error in getSupporterConnections:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * Get all supporters connected to a veteran's pitch
 */
export async function getPitchSupporters(pitchId: string) {
  try {
    const supabase = createSupabaseBrowser()
    
    const { data: supporters, error } = await supabase
      .from('referrals')
      .select(`
        id,
        supporter_id,
        share_link,
        created_at,
        users!referrals_supporter_id_fkey (
          id,
          name,
          avatar_url,
          email
        )
      `)
      .eq('pitch_id', pitchId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching pitch supporters:', error)
      throw new Error('Failed to fetch supporters')
    }

    // Calculate supporter activity metrics
    const supportersWithMetrics = supporters?.map(supporter => {
      // Note: referral_events table doesn't exist in live schema
      // For now, use mock metrics
      const clicks = 0
      const shares = 0
      const calls = 0
      const emails = 0
      
      return {
        ...supporter,
        metrics: {
          clicks,
          shares,
          calls,
          emails,
          total_activity: 0,
          last_activity: null
        }
      }
    }) || []

    return { success: true, data: supportersWithMetrics }
  } catch (error) {
    console.error('Error in getPitchSupporters:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * Get connection analytics for dashboards
 */
export async function getConnectionAnalytics(userId: string, userRole: 'supporter' | 'veteran') {
  try {
    const supabase = createSupabaseBrowser()
    
    let analytics: ConnectionAnalytics = {
      total_connections: 0,
      active_connections: 0,
      recent_activity: [],
      conversion_rate: 0,
      top_supporters: [],
      fomo_events: []
    }

    if (userRole === 'supporter') {
      // Get supporter's connections
      const { data: connections } = await supabase
        .from('referrals')
        .select('*')
        .eq('supporter_id', userId)

      analytics.total_connections = connections?.length || 0
      
      // Get recent activity
      const { data: recentActivity } = await supabase
        .from('referral_events')
        .select(`
          event_type,
          occurred_at,
          referrals (
            pitch_id,
            pitches (
              title,
              users (
                name
              )
            )
          )
        `)
        .eq('referrals.supporter_id', userId)
        .order('occurred_at', { ascending: false })
        .limit(10)

      analytics.recent_activity = recentActivity || []
    } else if (userRole === 'veteran') {
      // Get veteran's pitch supporters
      const { data: supporters } = await supabase
        .from('referrals')
        .select(`
          supporter_id,
          created_at,
          users!referrals_supporter_id_fkey (
            name,
            avatar_url
          )
        `)
        .eq('pitches.user_id', userId)

      analytics.total_connections = supporters?.length || 0
      
      // Get top supporters by activity
      const { data: topSupporters } = await supabase
        .from('referral_events')
        .select(`
          referrals (
            supporter_id,
            users!referrals_supporter_id_fkey (
              name,
              avatar_url
            )
          ),
          event_type
        `)
        .eq('referrals.pitches.user_id', userId)
        .order('occurred_at', { ascending: false })

      // Group by supporter and count activities
      const supporterActivity = topSupporters?.reduce((acc: any, event: any) => {
        const supporterId = event.referrals?.supporter_id
        if (!acc[supporterId]) {
          acc[supporterId] = {
            supporter: event.referrals?.users,
            activity_count: 0
          }
        }
        acc[supporterId].activity_count++
        return acc
      }, {})

      analytics.top_supporters = Object.values(supporterActivity || {}).sort((a: any, b: any) => b.activity_count - a.activity_count).slice(0, 5)
    }

    // Note: activity_log table doesn't exist in live schema
    // Get FOMO events
    // const { data: fomoEvents } = await supabase
    //   .from('activity_log')
    //   .select('*')
    //   .order('created_at', { ascending: false })
    //   .limit(20)

    analytics.fomo_events = [] // Empty array since activity_log doesn't exist

    return { success: true, data: analytics }
  } catch (error) {
    console.error('Error in getConnectionAnalytics:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * Track supporter activity on a pitch
 */
export async function trackSupporterActivity(data: {
  supporter_id: string
  pitch_id: string
  activity_type: 'view' | 'share' | 'call' | 'email' | 'endorse'
  platform?: string
  user_agent?: string
  ip_hash?: string
}) {
  try {
    const supabase = createSupabaseBrowser()
    
    // Get the referral connection
    const { data: referral } = await supabase
      .from('referrals')
      .select('id')
      .eq('supporter_id', data.supporter_id)
      .eq('pitch_id', data.pitch_id)
      .single()

    if (!referral) {
      throw new Error('No connection found between supporter and pitch')
    }

    // Map activity type to event type
    const eventTypeMap = {
      view: 'PITCH_VIEWED',
      share: 'SHARE_RESHARED',
      call: 'CALL_CLICKED',
      email: 'EMAIL_CLICKED',
      endorse: 'ENDORSEMENT_GIVEN'
    }

    // Log the activity
    await supabase
      .from('referral_events')
      .insert({
        referral_id: referral.id,
        event_type: eventTypeMap[data.activity_type],
        platform: data.platform,
        user_agent: data.user_agent,
        ip_hash: data.ip_hash,
        occurred_at: new Date().toISOString()
      })

    // Note: activity_log table doesn't exist in live schema
    // Log to activity log for FOMO
    // await supabase
    //   .from('activity_log')
    //   .insert({
    //     event: `supporter_${data.activity_type}`,
    //     meta: {
    //       supporter_id: data.supporter_id,
    //       pitch_id: data.pitch_id,
    //       activity_type: data.activity_type,
    //       platform: data.platform
    //     }
    //   })

    return { success: true }
  } catch (error) {
    console.error('Error in trackSupporterActivity:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
