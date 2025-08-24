import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerOnly } from '@/lib/supabaseServerOnly'
import { generateAIInsights } from '@/lib/openai'
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
    const rateLimitResult = rateLimits.aiInsights(request)
    if (rateLimitResult) {
      return rateLimitResult
    }

    const dailyRateLimitResult = rateLimits.aiInsightsDaily(request)
    if (dailyRateLimitResult) {
      return NextResponse.json(
        { error: 'Daily AI insights limit exceeded. Please try again tomorrow.' },
        { status: 429 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { pitchId } = body

    if (!pitchId) {
      return NextResponse.json({ error: 'Pitch ID is required' }, { status: 400 })
    }

    // For testing, create mock activity and performance data
    const mockActivityData = {
      recentViews: 15,
      recentLikes: 8,
      recentShares: 3,
      recentEndorsements: 2,
      profileCompletion: 85,
      lastActivity: '2 days ago'
    }

    const mockPitchPerformance = {
      totalViews: 45,
      totalLikes: 23,
      totalShares: 7,
      totalEndorsements: 5,
      conversionRate: 12.5,
      engagementScore: 78
    }

    // Generate AI insights
    try {
      const insights = await generateAIInsights(mockActivityData, mockPitchPerformance)

      return NextResponse.json({
        success: true,
        insights
      })

    } catch (error) {
      console.error('AI insights error:', error)
      
      // Return fallback insights
      const fallbackInsights = [
        {
          category: 'Engagement',
          title: 'High Engagement Rate',
          description: 'Your pitch is performing above average with a 78% engagement score.',
          confidence: 85,
          actionableSteps: ['Continue sharing on LinkedIn', 'Engage with commenters', 'Update content weekly'],
          impact: 'high'
        },
        {
          category: 'Optimization',
          title: 'Profile Completion Opportunity',
          description: 'Completing your profile could increase visibility by 15-20%.',
          confidence: 92,
          actionableSteps: ['Add missing skills', 'Upload professional photo', 'Complete bio section'],
          impact: 'medium'
        }
      ]

      return NextResponse.json({
        success: true,
        insights: fallbackInsights,
        warning: 'AI generation failed. Using fallback insights.'
      })
    }

  } catch (error) {
    console.error('AI insights API error:', error)
    return NextResponse.json({ 
      error: 'Failed to generate AI insights' 
    }, { status: 500 })
  }
}
