import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerOnly } from '@/lib/supabaseServerOnly'
import { generateSmartNotifications } from '@/lib/openai'
import { rateLimits } from '@/middleware/rateLimit'

export async function POST(request: NextRequest) {
  try {
    // Get current user
    const supabase = await createSupabaseServerOnly()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Apply rate limiting
    const rateLimitResult = rateLimits.aiSmartNotifications(request)
    if (rateLimitResult) {
      return rateLimitResult
    }

    const dailyRateLimitResult = rateLimits.aiSmartNotificationsDaily(request)
    if (dailyRateLimitResult) {
      return NextResponse.json(
        { error: 'Daily AI smart notifications limit exceeded. Please try again tomorrow.' },
        { status: 429 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { pitchId } = body

    if (!pitchId) {
      return NextResponse.json({ error: 'Pitch ID is required' }, { status: 400 })
    }

    // Fetch user activity data
    const { data: userActivity, error: activityError } = await supabase
      .from('user_activity_log')
      .select('event, meta, created_at')
      .eq('user_id', user.id)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Last 7 days
      .order('created_at', { ascending: false })

    if (activityError) {
      return NextResponse.json({ error: 'Failed to fetch user activity' }, { status: 500 })
    }

    // Calculate recent activity metrics
    const recentViews = userActivity.filter(a => a.event === 'pitch_viewed').length
    const recentLikes = userActivity.filter(a => a.event === 'pitch_liked').length
    const recentShares = userActivity.filter(a => a.event === 'pitch_shared').length
    const recentEndorsements = userActivity.filter(a => a.event === 'endorsement_added').length

    // Fetch pitch metrics
    const { data: pitch, error: pitchError } = await supabase
      .from('pitches')
      .select('views_count, likes_count, shares_count, endorsements_count')
      .eq('id', pitchId)
      .single()

    if (pitchError || !pitch) {
      return NextResponse.json({ error: 'Pitch not found' }, { status: 404 })
    }

    // Calculate profile completion percentage (mock data for now)
    const profileCompletion = 85 // This would be calculated based on actual profile fields

    const activityData = {
      recentViews,
      recentLikes,
      recentShares,
      recentEndorsements,
      profileCompletion
    }

    const pitchMetrics = {
      totalViews: pitch.views_count || 0,
      totalLikes: pitch.likes_count || 0,
      totalShares: pitch.shares_count || 0,
      totalEndorsements: pitch.endorsements_count || 0
    }

    // Generate AI smart notifications
    try {
      const notifications = await generateSmartNotifications(activityData, pitchMetrics)

      return NextResponse.json({
        success: true,
        notifications
      })

    } catch (error) {
      console.error('AI smart notifications error:', error)
      
      // Return fallback notifications
      const fallbackNotifications = [
        {
          type: 'milestone',
          title: '🎉 Great Progress!',
          message: 'Your pitch is gaining visibility. Keep sharing to reach more people.',
          priority: 'medium',
          actionUrl: '/dashboard',
          actionText: 'View Analytics',
          icon: 'Star',
          color: 'blue'
        },
        {
          type: 'reminder',
          title: '📝 Profile Update',
          message: 'Consider updating your skills to attract more opportunities.',
          priority: 'low',
          actionUrl: '/settings/profile',
          actionText: 'Update Profile',
          icon: 'Edit',
          color: 'green'
        }
      ]

      return NextResponse.json({
        success: true,
        notifications: fallbackNotifications,
        warning: 'AI generation failed. Using fallback notifications.'
      })
    }

  } catch (error) {
    console.error('Smart notifications API error:', error)
    return NextResponse.json({ 
      error: 'Failed to generate smart notifications' 
    }, { status: 500 })
  }
}
