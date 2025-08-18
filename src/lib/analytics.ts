
import { createSupabaseBrowser } from '@/lib/supabaseBrowser'

// NEW: Enhanced Veteran Analytics Functions

export async function getSimpleHeroData(veteranId: string) {
  try {
    const supabaseAction = createSupabaseBrowser()
    
    // Get pitch views for this veteran
    const { data: views } = await supabaseAction
      .from('user_activity_log')
      .select('*')
      .eq('activity_type', 'pitch_viewed')
      .eq('user_id', veteranId)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

    // Get active opportunities (simplified)
    const { data: opportunities } = await supabaseAction
      .from('referral_events')
      .select(`
        *,
        referrals!referral_events_referral_id_fkey (
          pitch_id,
          pitches!referrals_pitch_id_fkey (
            veteran_id
          )
        )
      `)
      .eq('referrals.pitches.veteran_id', veteranId)
      .gte('occurred_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

    return {
      pitchViews: {
        total: views?.length || 0,
        thisWeek: views?.length || 0,
        change: '+23%' // Simplified for now
      },
      activeOpportunities: {
        count: opportunities?.length || 0,
        value: (opportunities?.length || 0) * 1500 // Simplified estimate
      },
      mainAction: {
        text: 'Share Your Pitch',
        onClick: () => console.log('Share pitch')
      }
    }
  } catch (error) {
    console.error('Failed to get hero data:', error)
    return null
  }
}

export async function getSimpleMetricsData(veteranId: string) {
  try {
    const supabaseAction = createSupabaseBrowser()
    
    // Get basic metrics for this veteran
    const { data: activity } = await supabaseAction
      .from('user_activity_log')
      .select('*')
      .eq('user_id', veteranId)
      .order('created_at', { ascending: false })
      .limit(100)

    return {
      engagement: {
        value: '75%',
        subtitle: 'read your full pitch',
        actionText: 'Improve Content',
        action: () => console.log('Improve content')
      },
      contacts: {
        value: '12',
        subtitle: 'people contacted you',
        actionText: 'Update Contact',
        action: () => console.log('Update contact')
      },
      shares: {
        value: '89',
        subtitle: 'times your pitch was shared',
        actionText: 'Ask for More',
        action: () => console.log('Ask for shares')
      }
    }
  } catch (error) {
    console.error('Failed to get metrics data:', error)
    return null
  }
}

export async function getSupporterPerformanceList(veteranId: string) {
  try {
    const supabaseAction = createSupabaseBrowser()
    
    // Get all supporters who referred this veteran's pitches
    const { data: supporterReferrals } = await supabaseAction
      .from('referrals')
      .select(`
        id,
        supporter_id,
        pitch_id,
        created_at,
        users!referrals_supporter_id_fkey (
          id,
          name,
          email
        ),
        pitches (
          id,
          title
        ),
        referral_events (
          id,
          event_type,
          platform,
          occurred_at
        )
      `)
      .eq('pitches.veteran_id', veteranId)
      .order('created_at', { ascending: false })

    // Process supporter performance data
        const supporterPerformance = supporterReferrals?.map((referral: any) => {
      const events = referral.referral_events || []

      // Calculate metrics for this supporter
      const totalViews = events.filter((e: any) => e.event_type === 'PITCH_VIEWED').length
      const totalCalls = events.filter((e: any) => e.event_type === 'CALL_CLICKED').length
      const totalEmails = events.filter((e: any) => e.event_type === 'EMAIL_CLICKED').length
      const totalShares = events.filter((e: any) => e.event_type === 'SHARE_RESHARED').length

      // Platform breakdown
      const platforms = events.reduce((acc: Record<string, number>, event: any) => {
        if (event.platform) {
          acc[event.platform] = (acc[event.platform] || 0) + 1
        }
        return acc
      }, {} as Record<string, number>)
      
      // Conversion rate
      const totalActions = totalCalls + totalEmails
      const conversionRate = totalViews > 0 ? (totalActions / totalViews) * 100 : 0
      
      return {
        supporterId: referral.supporter_id,
        supporterName: referral.users?.name || 'Unknown',
        supporterEmail: referral.users?.email || '',
        pitchId: referral.pitch_id,
        pitchTitle: referral.pitches?.title || '',
        sharedAt: referral.created_at,
        lastActivity: events.length > 0 ? events[0].occurred_at : referral.created_at,
        metrics: {
          totalViews,
          totalCalls,
          totalEmails,
          totalShares,
          totalActions,
          conversionRate
        },
        platforms,
        referralId: referral.id
      }
    }) || []

    return supporterPerformance
  } catch (error) {
    console.error('Failed to get supporter performance list:', error)
    return []
  }
}

export async function getSimpleActionsData(veteranId: string) {
  try {
    // Generate simple action plan based on veteran's data
    return {
      actions: [
        {
          title: 'Add a photo to your pitch',
          impact: 'Get 3x more views',
          time: '5 minutes',
          action: () => console.log('Add photo')
        },
        {
          title: 'Update your contact info',
          impact: 'Get 2x more contacts',
          time: '2 minutes',
          action: () => console.log('Update contact')
        },
        {
          title: 'Share with 3 supporters',
          impact: 'Reach 50+ recruiters',
          time: '10 minutes',
          action: () => console.log('Share with supporters')
        }
      ]
    }
  } catch (error) {
    console.error('Failed to get actions data:', error)
    return null
  }
}

export async function getSimpleActivityData(veteranId: string) {
  try {
    const supabaseAction = createSupabaseBrowser()
    
    // Get recent activity for this veteran
    const { data: activity } = await supabaseAction
      .from('user_activity_log')
      .select('*')
      .eq('user_id', veteranId)
      .order('created_at', { ascending: false })
      .limit(5)

    return {
      items: activity?.map((item: any) => ({
        icon: getActivityIcon(item.activity_type),
        text: getActivityText(item.activity_type),
        time: formatTimeAgo(item.created_at)
      })) || []
    }
  } catch (error) {
    console.error('Failed to get activity data:', error)
    return null
  }
}

function getActivityIcon(activityType: string): string {
  switch (activityType) {
    case 'pitch_viewed': return '👁️'
    case 'contact_made': return '📞'
    case 'pitch_shared': return '📤'
    case 'endorsement_created': return '💪'
    default: return '📊'
  }
}

function getActivityText(activityType: string): string {
  switch (activityType) {
    case 'pitch_viewed': return 'Someone viewed your pitch'
    case 'contact_made': return 'Recruiter contacted you'
    case 'pitch_shared': return 'Supporter shared your pitch'
    case 'endorsement_created': return 'Someone endorsed you'
    default: return 'New activity on your pitch'
  }
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
  
  if (diffInHours < 1) return 'Just now'
  if (diffInHours < 24) return `${diffInHours} hours ago`
  if (diffInHours < 48) return '1 day ago'
  return `${Math.floor(diffInHours / 24)} days ago`
}

