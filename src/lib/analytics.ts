
import { createSupabaseBrowser } from '@/lib/supabaseBrowser'
import type { Database } from '@/types/live-schema'

// NEW: Enhanced Veteran Analytics Functions

export async function getSimpleHeroData(veteranId: string) {
  try {
    const supabaseAction = createSupabaseBrowser()
    
    // Get pitch views for this veteran from referral_events
    const { data: views } = await supabaseAction
      .from('referral_events')
      .select(`
        *,
        referrals!referral_events_referral_id_fkey (
          pitch_id,
          pitches!referrals_pitch_id_fkey (
            user_id
          )
        )
      `)
      .eq('referrals.pitches.user_id', veteranId)
      .eq('event_type', 'PITCH_VIEWED')
      .gte('occurred_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

    // Get total views (all time)
    const { data: totalViews } = await supabaseAction
      .from('referral_events')
      .select(`
        *,
        referrals!referral_events_referral_id_fkey (
          pitch_id,
          pitches!referrals_pitch_id_fkey (
            user_id
          )
        )
      `)
      .eq('referrals.pitches.user_id', veteranId)
      .eq('event_type', 'PITCH_VIEWED')

    // Get active opportunities (referral events)
    const { data: opportunities } = await supabaseAction
      .from('referral_events')
      .select(`
        *,
        referrals!referral_events_referral_id_fkey (
          pitch_id,
          pitches!referrals_pitch_id_fkey (
            user_id
          )
        )
      `)
      .eq('referrals.pitches.user_id', veteranId)
      .gte('occurred_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

    // Check if veteran has any real data
    const hasRealData = totalViews && totalViews.length > 0
    const thisWeekViews = views?.length || 0
    const totalViewsCount = totalViews?.length || 0
    
    // Calculate change percentage (mock for now, could be enhanced)
    const change = hasRealData ? (thisWeekViews > 0 ? '+15%' : '0%') : 'Mock Data'
    
    return {
      pitchViews: {
        total: totalViewsCount,
        thisWeek: thisWeekViews,
        change: change,
        isMockData: !hasRealData
      },
      networkReach: {
        count: totalViewsCount,
        potential: hasRealData ? Math.max(totalViewsCount * 5, 50) : 50,
        description: 'people have seen your pitch',
        isMockData: !hasRealData
      },
      potentialOpportunities: {
        count: hasRealData ? Math.max(totalViewsCount * 2, 10) : 10,
        quality: hasRealData ? (totalViewsCount > 100 ? 'High' : totalViewsCount > 50 ? 'Medium' : 'Growing') : 'Mock Data',
        description: 'potential job opportunities',
        isMockData: !hasRealData
      },
      mainAction: {
        text: hasRealData ? 'Smart Share' : 'Create Your First Pitch',
        onClick: () => {
          if (hasRealData) {
            console.log('Smart share clicked - modal should open')
          } else {
            console.log('Redirect to pitch creation')
          }
        }
      },
      isMockData: !hasRealData
    }
  } catch (error) {
    console.error('Failed to get hero data:', error)
    return null
  }
}

export async function getSimpleMetricsData(veteranId: string) {
  try {
    const supabaseAction = createSupabaseBrowser()
    
    // Get real activity data from referral_events
    const { data: activity } = await supabaseAction
      .from('referral_events')
      .select(`
        *,
        referrals!referral_events_referral_id_fkey (
          pitch_id,
          pitches!referrals_pitch_id_fkey (
            user_id
          )
        )
      `)
      .eq('referrals.pitches.user_id', veteranId)
      .order('occurred_at', { ascending: false })
      .limit(100)

    // Get resume request metrics
    let resumeRequests: any[] = []
    try {
      const { data: resumeRequestsData } = await supabaseAction
        .from('resume_requests')
        .select('id, status, created_at')
        .eq('user_id', veteranId)
      
      resumeRequests = resumeRequestsData || []
    } catch (error) {
      console.log('Resume requests query failed, using empty data:', error)
      resumeRequests = []
    }

    // Calculate real metrics from referral events
    const totalViews = activity?.filter(e => e.event_type === 'PITCH_VIEWED').length || 0
    const totalCalls = activity?.filter(e => e.event_type === 'CALL_CLICKED').length || 0
    const totalEmails = activity?.filter(e => e.event_type === 'EMAIL_CLICKED').length || 0
    const totalShares = activity?.filter(e => e.event_type === 'SHARE_RESHARED').length || 0
    
    // Calculate engagement rate (views that led to actions)
    const totalActions = totalCalls + totalEmails
    const engagementRate = totalViews > 0 ? Math.round((totalActions / totalViews) * 100) : 0

    const totalResumeRequests = resumeRequests?.length || 0
    const pendingRequests = resumeRequests?.filter(r => r.status === 'PENDING').length || 0
    const approvedRequests = resumeRequests?.filter(r => r.status === 'APPROVED').length || 0
    const responseRate = totalResumeRequests > 0 ? Math.round(((approvedRequests + (resumeRequests?.filter(r => r.status === 'DECLINED').length || 0)) / totalResumeRequests) * 100) : 0

    // Check if veteran has any real data
    const hasRealData = totalViews > 0 || totalResumeRequests > 0
    
    return {
      engagement: {
        value: hasRealData ? `${engagementRate}%` : 'Mock Data',
        subtitle: hasRealData ? `${totalActions} people took action` : 'Create pitch to see real data',
        actionText: hasRealData ? 'Improve Content' : 'Create Pitch',
        action: () => console.log(hasRealData ? 'Improve content' : 'Create pitch'),
        isMockData: !hasRealData
      },
      contacts: {
        value: hasRealData ? totalActions.toString() : 'Mock Data',
        subtitle: hasRealData ? 'people contacted you' : 'Share pitch to get contacts',
        actionText: hasRealData ? 'Update Contact' : 'Share Pitch',
        action: () => hasRealData ? 'Update contact' : 'Share pitch',
        isMockData: !hasRealData
      },
      shares: {
        value: hasRealData ? totalShares.toString() : 'Mock Data',
        subtitle: hasRealData ? 'times your pitch was shared' : 'Start sharing to see real stats',
        actionText: hasRealData ? 'Ask for More' : 'Share Now',
        action: () => hasRealData ? 'Ask for shares' : 'Share pitch',
        isMockData: !hasRealData
      },
      resumeRequests: {
        value: totalResumeRequests > 0 ? totalResumeRequests.toString() : 'Mock Data',
        subtitle: totalResumeRequests > 0 ? `resume requests (${responseRate}% response rate)` : 'Create pitch to get requests',
        actionText: totalResumeRequests > 0 ? (pendingRequests > 0 ? `${pendingRequests} pending` : 'View All') : 'Create Pitch',
        action: () => console.log(totalResumeRequests > 0 ? 'View resume requests' : 'Create pitch'),
        isMockData: totalResumeRequests === 0
      },
      isMockData: !hasRealData
    }
  } catch (error) {
    console.error('Failed to get metrics data:', error)
    return null
  }
}

export async function getVeteranOutreachData(veteranId: string) {
  try {
    const supabaseAction = createSupabaseBrowser()
    
    // Get veteran's own outreach activities
    // Commented out due to user_activity_log table not existing in live schema
    // const { data: veteranActivities } = await supabaseAction
    //   .from('user_activity_log')
    //   .select('*')
    //   .eq('user_id', veteranId)
    //   .in('activity_type', ['pitch_shared', 'direct_outreach', 'network_contact'])
    //   .order('created_at', { ascending: false })
    //   .limit(50)
    const veteranActivities: any[] = []

    // Mock data to show what veteran outreach tracking looks like
    const mockVeteranOutreach = [
      {
        id: 'mock-1',
        activity_type: 'pitch_shared',
        platform: 'LinkedIn',
        target: 'Tech Recruiters Group',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        result: '12 views, 3 connections'
      },
      {
        id: 'mock-2',
        activity_type: 'direct_outreach',
        platform: 'Email',
        target: 'Sarah Johnson (TechCorp)',
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        result: 'Replied, scheduled call'
      },
      {
        id: 'mock-3',
        activity_type: 'network_contact',
        platform: 'WhatsApp',
        target: 'Mike Chen (Startup.io)',
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        result: 'Shared pitch, 8 views'
      },
      {
        id: 'mock-4',
        activity_type: 'pitch_shared',
        platform: 'Slack',
        target: 'Veterans Network',
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        result: '15 views, 2 referrals'
      }
    ]

    const displayData = (veteranActivities?.length || 0) > 0 ? veteranActivities : mockVeteranOutreach
    const isMockData = (veteranActivities?.length || 0) === 0

    return {
      activities: displayData || [],
      isMockData,
      summary: {
        totalOutreach: displayData?.length || 0,
        platforms: (displayData || []).reduce((acc: Record<string, number>, activity: any) => {
          const platform = activity.platform || 'Unknown'
          acc[platform] = (acc[platform] || 0) + 1
          return acc
        }, {}),
        recentActivity: (displayData?.length || 0) > 0 ? displayData?.[0]?.created_at : null
      }
    }
  } catch (error) {
    console.error('Failed to get veteran outreach data:', error)
    return {
      activities: [],
      isMockData: true,
      summary: { totalOutreach: 0, platforms: {}, recentActivity: null }
    }
  }
}

export async function getSupporterPerformanceList(veteranId: string) {
  try {
    const supabaseAction = createSupabaseBrowser()
    
    // Get all supporters who referred this veteran's pitches (with error handling)
    let supporterReferrals: any[] = []
    try {
      const { data: supporterReferralsData } = await supabaseAction
        .from('referrals')
        .select(`
          id,
          user_id,
          pitch_id,
          created_at,
          users!referrals_user_id_fkey (
            id,
            name,
            email
          ),
          pitches!referrals_pitch_id_fkey (
            id,
            title,
            user_id
          ),
          referral_events (
            id,
            event_type,
            platform,
            occurred_at
          )
        `)
        .eq('pitches.user_id', veteranId)
        .order('created_at', { ascending: false })
      
      supporterReferrals = supporterReferralsData || []
    } catch (error) {
      console.log('Supporter referrals query failed, using empty data:', error)
      supporterReferrals = []
    }

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
        supporterId: referral.user_id,
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
    const supabaseAction = createSupabaseBrowser()
    
    // Get real activity data from referral_events
    const { data: activity } = await supabaseAction
      .from('referral_events')
      .select(`
        *,
        referrals!referral_events_referral_id_fkey (
          pitch_id,
          pitches!referrals_pitch_id_fkey (
            user_id
          )
        )
      `)
      .eq('referrals.pitches.user_id', veteranId)
      .order('occurred_at', { ascending: false })
      .limit(100)

    // Get veteran's pitch data
    const { data: pitchData } = await supabaseAction
      .from('pitches')
      .select('*')
      .eq('user_id', veteranId)
      .eq('is_active', true)
      .single()

    // Calculate real metrics
    const totalViews = activity?.filter(e => e.event_type === 'PITCH_VIEWED').length || 0
    const totalCalls = activity?.filter(e => e.event_type === 'CALL_CLICKED').length || 0
    const totalEmails = activity?.filter(e => e.event_type === 'EMAIL_CLICKED').length || 0
    const totalShares = activity?.filter(e => e.event_type === 'SHARE_RESHARED').length || 0
    
    // Get resume requests count
    let resumeRequestsCount = 0
    try {
      const { count } = await supabaseAction
        .from('resume_requests')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', veteranId)
      resumeRequestsCount = count || 0
    } catch (error) {
      console.log('Resume requests count failed:', error)
    }

    // Determine actions based on real data
    const actions = []
    
    if (!pitchData) {
      actions.push({
        title: 'Create Your First Pitch',
        impact: 'Get discovered by recruiters',
        time: '5 minutes',
        priority: 'critical' as const,
        reason: 'You need a pitch to get started. This is your chance to showcase your military experience.',
        action: () => console.log('Create pitch')
      })
    } else if (totalViews === 0) {
      actions.push({
        title: 'Share Your Pitch',
        impact: 'Get your first views',
        time: '2 minutes',
        priority: 'critical' as const,
        reason: 'Your pitch is ready but no one has seen it yet. Start sharing to get discovered.',
        action: () => console.log('Share pitch')
      })
    } else if (totalViews > 0 && totalCalls === 0 && totalEmails === 0) {
      actions.push({
        title: 'Optimize Contact Information',
        impact: 'Convert views to contacts',
        time: '3 minutes',
        priority: 'high' as const,
        reason: 'People are viewing your pitch but not contacting you. Make sure your phone and email are prominent.',
        action: () => console.log('Optimize contact info')
      })
    } else if (totalViews > 10 && totalShares === 0) {
      actions.push({
        title: 'Ask for Shares',
        impact: 'Expand your network reach',
        time: '5 minutes',
        priority: 'high' as const,
        reason: 'You have good visibility. Now ask supporters to share your pitch with their networks.',
        action: () => console.log('Ask for shares')
      })
    } else if (totalViews > 50 && resumeRequestsCount === 0) {
      actions.push({
        title: 'Add Professional Photo',
        impact: 'Increase trust and engagement',
        time: '10 minutes',
        priority: 'medium' as const,
        reason: 'High visibility but low engagement. A professional photo can significantly improve your conversion rate.',
        action: () => console.log('Add photo')
      })
    } else {
      actions.push({
        title: 'Maintain Momentum',
        impact: 'Keep growing your network',
        time: 'Daily',
        priority: 'medium' as const,
        reason: 'You\'re doing great! Keep sharing regularly and engaging with your network to maintain growth.',
        action: () => console.log('Maintain momentum')
      })
    }

    // Add more specific actions based on data
    if (totalViews > 0 && totalViews < 10) {
      actions.push({
        title: 'Share on LinkedIn',
        impact: 'Reach professional network',
        time: '5 minutes',
        priority: 'high' as const,
        reason: 'LinkedIn is perfect for reaching recruiters and HR professionals. Share your pitch there for maximum impact.',
        action: () => console.log('Share on LinkedIn')
      })
    }

    if (totalCalls > totalEmails) {
      actions.push({
        title: 'Highlight Phone Number',
        impact: 'Leverage your strength',
        time: '2 minutes',
        priority: 'medium' as const,
        reason: 'Phone calls are your strongest conversion method. Make your number more prominent on your pitch.',
        action: () => console.log('Highlight phone')
      })
    }

    if (totalEmails > totalCalls) {
      actions.push({
        title: 'Add Detailed Contact Info',
        impact: 'Support email preference',
        time: '3 minutes',
        priority: 'medium' as const,
        reason: 'People prefer emailing you. Add more detailed contact information and professional email signature.',
        action: () => console.log('Add email details')
      })
    }

    // Limit to 3 most important actions
    const prioritizedActions = actions
      .sort((a, b) => {
        const priorityOrder = { critical: 3, high: 2, medium: 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      })
      .slice(0, 3)

    return {
      actions: prioritizedActions,
      summary: {
        totalViews,
        conversionRate: totalViews > 0 ? `${Math.round(((totalCalls + totalEmails) / totalViews) * 100)}%` : '0%',
        supporterCount: totalShares,
        endorsementCount: 0, // Could be enhanced with endorsements table
        hasPhoto: pitchData?.photo_url ? true : false,
        hasRecentActivity: activity && activity.length > 0 && new Date(activity[0].occurred_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
      }
    }
  } catch (error) {
    console.error('Failed to get actions data:', error)
    return null
  }
}

export async function getSimpleActivityData(veteranId: string) {
  try {
    const supabaseAction = createSupabaseBrowser()
    
    // Get real activity data from referral_events
    const { data: activity } = await supabaseAction
      .from('referral_events')
      .select(`
        *,
        referrals!referral_events_referral_id_fkey (
          pitch_id,
          pitches!referrals_pitch_id_fkey (
            user_id
          )
        )
      `)
      .eq('referrals.pitches.user_id', veteranId)
      .order('occurred_at', { ascending: false })
      .limit(10)

    if (!activity || activity.length === 0) {
      return {
        items: [
          {
            icon: '📝',
            text: 'Create your first pitch to start tracking activity',
            time: 'Just now'
          }
        ]
      }
    }

    // Convert real events to display format
    const items = activity.map(event => {
      const eventTime = new Date(event.occurred_at)
      const now = new Date()
      const timeDiff = now.getTime() - eventTime.getTime()
      
      let timeText = 'Just now'
      if (timeDiff > 24 * 60 * 60 * 1000) {
        const days = Math.floor(timeDiff / (24 * 60 * 60 * 1000))
        timeText = `${days} day${days > 1 ? 's' : ''} ago`
      } else if (timeDiff > 60 * 60 * 1000) {
        const hours = Math.floor(timeDiff / (60 * 60 * 1000))
        timeText = `${hours} hour${hours > 1 ? 's' : ''} ago`
      } else if (timeDiff > 60 * 1000) {
        const minutes = Math.floor(timeDiff / (60 * 1000))
        timeText = `${minutes} minute${minutes > 1 ? 's' : ''} ago`
      }

      let icon = '👁️'
      let text = 'Someone viewed your pitch'

      switch (event.event_type) {
        case 'PITCH_VIEWED':
          icon = '👁️'
          text = 'Someone viewed your pitch'
          break
        case 'CALL_CLICKED':
          icon = '📞'
          text = 'Someone clicked your phone number'
          break
        case 'EMAIL_CLICKED':
          icon = '📧'
          text = 'Someone clicked your email'
          break
        case 'SHARE_RESHARED':
          icon = '🔄'
          text = 'Your pitch was shared again'
          break
        case 'LINK_OPENED':
          icon = '🔗'
          text = 'Someone opened your referral link'
          break
        default:
          icon = '📊'
          text = `Activity: ${event.event_type}`
      }

      // Add platform info if available
      if (event.platform) {
        text += ` via ${event.platform}`
      }

      return {
        icon,
        text,
        time: timeText
      }
    })

    return { items }
  } catch (error) {
    console.error('Failed to get activity data:', error)
    return {
      items: [
        {
          icon: '❌',
          text: 'Unable to load activity data',
          time: 'Just now'
        }
      ]
    }
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

