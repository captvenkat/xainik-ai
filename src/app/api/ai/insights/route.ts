import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerOnly } from '@/lib/supabaseServerOnly'
import { generateAIInsights } from '@/lib/openai'
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

    // Fetch user activity data for analysis
    const { data: userActivity, error: activityError } = await supabase
      .from('user_activity_log')
      .select('event, meta, created_at')
      .eq('user_id', user.id)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days
      .order('created_at', { ascending: false })

    if (activityError) {
      return NextResponse.json({ error: 'Failed to fetch user activity' }, { status: 500 })
    }

    // Analyze activity patterns
    const totalActivities = userActivity.length
    const frequency = totalActivities > 20 ? 'high' : totalActivities > 10 ? 'medium' : 'low'
    
    const engagementPatterns = userActivity
      .filter(a => ['pitch_viewed', 'pitch_liked', 'pitch_shared', 'endorsement_added'].includes(a.event))
      .length > totalActivities * 0.6 ? 'high' : 'medium'
    
    const responseRates = userActivity
      .filter(a => ['resume_requested', 'message_sent'].includes(a.event))
      .length > 0 ? 'good' : 'needs_improvement'
    
    const networkGrowth = userActivity
      .filter(a => ['connection_made', 'referral_sent'].includes(a.event))
      .length > 0 ? 'expanding' : 'stable'

    // Fetch pitch performance data
    const { data: pitch, error: pitchError } = await supabase
      .from('pitches')
      .select('views_count, likes_count, shares_count, endorsements_count, created_at')
      .eq('id', pitchId)
      .single()

    if (pitchError || !pitch) {
      return NextResponse.json({ error: 'Pitch not found' }, { status: 404 })
    }

    // Calculate performance metrics
    const viewToLikeRatio = pitch.views_count > 0 ? (pitch.likes_count / pitch.views_count * 100).toFixed(1) : '0'
    const shareConversion = pitch.views_count > 0 ? (pitch.shares_count / pitch.views_count * 100).toFixed(1) : '0'
    const endorsementQuality = pitch.endorsements_count > 0 ? 'high' : 'developing'
    
    // Calculate time-based trends (days since creation)
    const daysSinceCreation = Math.floor((Date.now() - new Date(pitch.created_at).getTime()) / (1000 * 60 * 60 * 24))
    const timeTrends = daysSinceCreation < 7 ? 'new' : daysSinceCreation < 30 ? 'growing' : 'established'

    const activityData = {
      frequency,
      engagementPatterns,
      responseRates,
      networkGrowth
    }

    const pitchPerformance = {
      viewToLikeRatio,
      shareConversion,
      endorsementQuality,
      timeTrends
    }

    // Generate AI insights
    try {
      const insights = await generateAIInsights(activityData, pitchPerformance)

      return NextResponse.json({
        success: true,
        insights
      })

    } catch (error) {
      console.error('AI insights error:', error)
      
      // Return fallback insights
      const fallbackInsights = [
        {
          insight: 'Your pitch is gaining visibility. Focus on converting views to connections.',
          category: 'performance',
          confidence: 75,
          actionable: true,
          nextSteps: [
            'Add a clear call-to-action to your pitch',
            'Follow up with people who view your profile',
            'Share your pitch on professional networks'
          ]
        },
        {
          insight: 'Consider expanding your network through strategic connections.',
          category: 'networking',
          confidence: 80,
          actionable: true,
          nextSteps: [
            'Connect with industry professionals',
            'Join relevant LinkedIn groups',
            'Attend virtual networking events'
          ]
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
