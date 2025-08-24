import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerOnly } from '@/lib/supabaseServerOnly'
import { generateSmartNotifications } from '@/lib/openai'
import { rateLimits } from '@/middleware/rateLimit'

export async function POST(request: NextRequest) {
  try {
    // TEMPORARILY DISABLED AUTH FOR TESTING
    // TODO: Re-enable authentication after testing
    /*
    // Get current user
    const supabase = await createSupabaseServerOnly()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    */

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

    // For testing, create mock activity data
    const mockActivityData = {
      recentViews: 15,
      recentLikes: 8,
      recentShares: 3,
      recentEndorsements: 2,
      profileCompletion: 85
    }

    const mockPitchMetrics = {
      totalViews: 45,
      totalLikes: 23,
      totalShares: 7,
      totalEndorsements: 5
    }

    // Generate AI smart notifications
    try {
      const notifications = await generateSmartNotifications(mockActivityData, mockPitchMetrics)

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
