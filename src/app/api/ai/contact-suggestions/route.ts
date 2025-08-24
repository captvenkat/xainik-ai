import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerOnly } from '@/lib/supabaseServerOnly'
import { generateContactSuggestions } from '@/lib/openai'
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
    const rateLimitResult = rateLimits.aiContactSuggestions(request)
    if (rateLimitResult) {
      return rateLimitResult
    }

    const dailyRateLimitResult = rateLimits.aiContactSuggestionsDaily(request)
    if (dailyRateLimitResult) {
      return NextResponse.json(
        { error: 'Daily AI contact suggestions limit exceeded. Please try again tomorrow.' },
        { status: 429 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { pitchId } = body

    if (!pitchId) {
      return NextResponse.json({ error: 'Pitch ID is required' }, { status: 400 })
    }

    // Fetch pitch data
    const { data: pitch, error: pitchError } = await supabase
      .from('pitches')
      .select('title, skills, job_type, location, years_experience')
      .eq('id', pitchId)
      .single()

    if (pitchError || !pitch) {
      return NextResponse.json({ error: 'Pitch not found' }, { status: 404 })
    }

    // Fetch user context
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('profile_data')
      .eq('user_id', user.id)
      .single()

    if (profileError) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    const userContext = {
      role: userProfile.profile_data?.role || 'Veteran',
      location: userProfile.profile_data?.location_current || 'N/A',
      industry: userProfile.profile_data?.industry_focus || 'General'
    }

    // Generate AI contact suggestions
    try {
      const suggestions = await generateContactSuggestions(pitch, userContext)

      return NextResponse.json({
        success: true,
        suggestions
      })

    } catch (error) {
      console.error('AI contact suggestions error:', error)
      
      // Return fallback suggestions
      const fallbackSuggestions = [
        {
          name: 'Sarah Johnson',
          role: 'Senior Recruiter',
          company: 'TechCorp Solutions',
          connectionStrength: 'high',
          suggestedAction: 'email',
          reason: 'Actively hiring for roles matching your skills',
          successProbability: 85
        },
        {
          name: 'Michael Chen',
          role: 'Engineering Manager',
          company: 'InnovateTech',
          connectionStrength: 'medium',
          suggestedAction: 'linkedin',
          reason: 'Your experience aligns with their team needs',
          successProbability: 72
        }
      ]

      return NextResponse.json({
        success: true,
        suggestions: fallbackSuggestions,
        warning: 'AI generation failed. Using fallback suggestions.'
      })
    }

  } catch (error) {
    console.error('Contact suggestions API error:', error)
    return NextResponse.json({ 
      error: 'Failed to generate contact suggestions' 
    }, { status: 500 })
  }
}
