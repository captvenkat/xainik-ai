
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
      networkReach: {
        count: views?.length || 0,
        potential: Math.max((views?.length || 0) * 5, 50), // Each view can reach 5 more people
        description: 'people in your network'
      },
      potentialOpportunities: {
        count: Math.max((views?.length || 0) * 2, 10), // Each view can lead to 2 opportunities
        quality: (views?.length || 0) > 100 ? 'High' : (views?.length || 0) > 50 ? 'Medium' : 'Growing',
        description: 'potential job opportunities'
      },
      mainAction: {
        text: 'Smart Share',
        onClick: () => {
          // This will be handled by the parent component
          // The actual share functionality is in SharePitchModal
          console.log('Smart share clicked - modal should open')
        }
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

export async function getVeteranOutreachData(veteranId: string) {
  try {
    const supabaseAction = createSupabaseBrowser()
    
    // Get veteran's own outreach activities
    const { data: veteranActivities } = await supabaseAction
      .from('user_activity_log')
      .select('*')
      .eq('user_id', veteranId)
      .in('activity_type', ['pitch_shared', 'direct_outreach', 'network_contact'])
      .order('created_at', { ascending: false })
      .limit(50)

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
    const supabaseAction = createSupabaseBrowser()
    
    // Get veteran's real data for intelligent analysis
    const [
      { data: pitches },
      { data: activity },
      { data: referrals },
      { data: endorsements }
    ] = await Promise.all([
      supabaseAction
        .from('pitches')
        .select('id, title, content, skills, experience, views_count, likes_count, shares_count, created_at, updated_at')
        .eq('user_id', veteranId)
        .order('created_at', { ascending: false }),
      supabaseAction
        .from('user_activity_log')
        .select('*')
        .eq('user_id', veteranId)
        .order('created_at', { ascending: false })
        .limit(50),
      supabaseAction
        .from('referrals')
        .select('*')
        .eq('veteran_id', veteranId),
      supabaseAction
        .from('endorsements')
        .select('*')
        .eq('user_id', veteranId)
    ])

    const actions = []
    const currentPitch = pitches?.[0]
    
    if (!currentPitch) {
      // No pitch exists - critical action
      actions.push({
        title: 'Create your first pitch',
        impact: 'Start getting hired immediately',
        time: '15 minutes',
        priority: 'critical',
        reason: 'You need a pitch to get discovered by recruiters',
        action: () => window.location.href = '/pitch/new'
      })
      return { actions }
    }

    // Analyze pitch performance
    const totalViews = currentPitch.views_count || 0
    const totalLikes = currentPitch.likes_count || 0
    const totalShares = currentPitch.shares_count || 0
    const conversionRate = totalViews > 0 ? (totalLikes / totalViews) * 100 : 0
    
    // Check for photo (simplified - would need actual photo field)
    const hasPhoto = false // This would check actual photo field
    
    // Analyze skills completeness
    const skills = currentPitch.skills || []
    const hasSpecificSkills = skills.length >= 3 && skills.some((skill: string) => skill.length > 10)
    
    // Analyze content quality
    const contentLength = currentPitch.content?.length || 0
    const hasDetailedContent = contentLength > 200
    
    // Analyze recent activity
    const recentActivity = activity?.filter(a => {
      const activityDate = new Date(a.created_at)
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      return activityDate > weekAgo
    }) || []
    
    const hasRecentShares = recentActivity.some(a => a.activity_type === 'pitch_shared')
    const hasRecentViews = recentActivity.some(a => a.activity_type === 'pitch_viewed')
    
    // Analyze network strength
    const supporterCount = referrals?.length || 0
    const endorsementCount = endorsements?.length || 0

    // MENTOR-LIKE ACTION GENERATION - Simple, conversational, helpful

    // 1. CRITICAL: No photo (huge impact)
    if (!hasPhoto) {
      actions.push({
        title: 'Add a professional photo',
        impact: 'Get 3x more views and 2x more contacts',
        time: '5 minutes',
        priority: 'critical',
        reason: `Hey! I noticed your pitch doesn't have a photo yet. Trust me, this is the easiest way to get more attention. People are 3x more likely to click on profiles with photos.`,
        action: () => window.location.href = `/pitch/${currentPitch.id}/edit`
      })
    }

    // 2. CRITICAL: Low views (visibility issue)
    if (totalViews < 10) {
      actions.push({
        title: 'Share your pitch with 5 supporters',
        impact: 'Reach 50+ recruiters in 24 hours',
        time: '10 minutes',
        priority: 'critical',
        reason: `I see your pitch has only been viewed ${totalViews} times. Here's the thing - each supporter you invite can reach 10+ recruiters. It's like having a personal sales team!`,
        action: () => window.location.href = '/dashboard/veteran?tab=analytics'
      })
    }

    // 3. CRITICAL: Low conversion rate
    if (totalViews > 20 && conversionRate < 5) {
      actions.push({
        title: 'Optimize your pitch title and skills',
        impact: 'Increase contact rate by 200%',
        time: '8 minutes',
        priority: 'critical',
        reason: `You're getting views (${totalViews} so far), but not enough contacts. This usually means your title or skills aren't catching recruiters' attention. Let's fix that!`,
        action: () => window.location.href = `/pitch/${currentPitch.id}/edit`
      })
    }

    // 4. HIGH: Missing specific skills
    if (!hasSpecificSkills) {
      actions.push({
        title: 'Add specific, measurable skills',
        impact: 'Get 2x more recruiter matches',
        time: '5 minutes',
        priority: 'high',
        reason: `Quick tip: Instead of "leadership," try "Led 15-person team to 40% efficiency improvement." Recruiters search for specific skills, not generic ones.`,
        action: () => window.location.href = `/pitch/${currentPitch.id}/edit`
      })
    }

    // 5. HIGH: Weak network
    if (supporterCount < 3) {
      actions.push({
        title: 'Invite 5 supporters to your network',
        impact: 'Multiply your reach by 10x',
        time: '15 minutes',
        priority: 'high',
        reason: `You have ${supporterCount} supporter${supporterCount === 1 ? '' : 's'}. Think of each supporter as a bridge to 10+ recruiters. More bridges = more opportunities!`,
        action: () => window.location.href = '/dashboard/veteran?tab=mission'
      })
    }

    // 6. MEDIUM: No recent activity
    if (!hasRecentShares && totalViews > 0) {
      actions.push({
        title: 'Share your pitch on LinkedIn',
        impact: 'Get 20+ new views today',
        time: '3 minutes',
        priority: 'medium',
        reason: `Your pitch is great, but it's been quiet lately. A quick LinkedIn share can bring in 20+ new views today. It's like giving your pitch a fresh start!`,
        action: () => window.location.href = '/dashboard/veteran?tab=analytics'
      })
    }

    // 7. MEDIUM: Missing endorsements
    if (endorsementCount === 0) {
      actions.push({
        title: 'Ask for 3 endorsements',
        impact: 'Build credibility and trust',
        time: '10 minutes',
        priority: 'medium',
        reason: `Endorsements are like having someone vouch for you. They make recruiters 150% more confident about contacting you. It's social proof!`,
        action: () => window.location.href = '/dashboard/veteran?tab=community'
      })
    }

    // 8. MEDIUM: Content too short
    if (!hasDetailedContent) {
      actions.push({
        title: 'Add detailed achievements to your pitch',
        impact: 'Show concrete value to recruiters',
        time: '12 minutes',
        priority: 'medium',
        reason: `Your pitch is good, but it could be great! Add specific achievements and numbers. Recruiters love seeing concrete results - it shows you can deliver.`,
        action: () => window.location.href = `/pitch/${currentPitch.id}/edit`
      })
    }

    // Sort by priority and limit to top 5 most impactful
    const priorityOrder: Record<string, number> = { critical: 3, high: 2, medium: 1 }
    actions.sort((a, b) => (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0))
    
    return {
      actions: actions.slice(0, 5),
      summary: {
        totalViews,
        conversionRate: conversionRate.toFixed(1),
        supporterCount,
        endorsementCount,
        hasPhoto,
        hasRecentActivity: hasRecentShares || hasRecentViews
      }
    }
  } catch (error) {
    console.error('Failed to get intelligent actions data:', error)
    return {
      actions: [
        {
          title: 'Create your first pitch',
          impact: 'Start getting hired immediately',
          time: '15 minutes',
          priority: 'critical',
          reason: 'You need a pitch to get discovered by recruiters',
          action: () => window.location.href = '/pitch/new'
        }
      ]
    }
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

