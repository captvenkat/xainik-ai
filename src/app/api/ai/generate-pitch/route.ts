import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerOnly } from '@/lib/supabaseServerOnly'
import { generatePitch, generateFallbackPitch } from '@/lib/openai'
import { rateLimits } from '@/middleware/rateLimit'

export async function POST(request: NextRequest) {
  try {
    // Get current user
    const supabase = createSupabaseServerOnly()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Apply rate limiting
    const rateLimitResult = rateLimits.aiPitchGeneration(request)
    if (rateLimitResult) {
      return rateLimitResult
    }

    const dailyRateLimitResult = rateLimits.aiPitchGenerationDaily(request)
    if (dailyRateLimitResult) {
      return NextResponse.json(
        { error: 'Daily AI generation limit exceeded. Please try again tomorrow.' },
        { status: 429 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { inputType, text, linkedinUrl, resumeKey } = body

    // Validate required fields
    if (!inputType || !['linkedin', 'resume', 'manual'].includes(inputType)) {
      return NextResponse.json({ error: 'Invalid input type' }, { status: 400 })
    }

    // Validate input based on type
    if (inputType === 'linkedin' && !linkedinUrl) {
      return NextResponse.json({ error: 'LinkedIn URL is required' }, { status: 400 })
    }
    
    if (inputType === 'resume' && !resumeKey) {
      return NextResponse.json({ error: 'Resume key is required' }, { status: 400 })
    }
    
    if (inputType === 'manual' && !text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    // Generate pitch
    try {
      const result = await generatePitch({
        inputType,
        text,
        linkedinUrl,
        resumeKey
      })

      return NextResponse.json({
        success: true,
        pitch: result
      })

    } catch (error) {
      console.error('AI generation failed:', error)
      
      // Use fallback
      const fallback = generateFallbackPitch({
        inputType,
        text,
        linkedinUrl,
        resumeKey
      })

      return NextResponse.json({
        success: true,
        pitch: fallback,
        warning: 'AI generation failed. Using fallback pitch.'
      })
    }

  } catch (error) {
    console.error('Pitch generation error:', error)
    return NextResponse.json({ 
      error: 'Failed to generate pitch' 
    }, { status: 500 })
  }
}
