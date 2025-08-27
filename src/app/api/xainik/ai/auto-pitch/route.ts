import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { buildSystemBase, formatTargets, Target } from '@/lib/ai/promptBuilder'
import { enforceBand } from '@/lib/ai/unique'
import { logRegenAttempt, simpleHash } from '@/lib/ai/regenLogger'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { objective, extracted_text, targets = [], regen_token, pitch_id } = body

    if (!extracted_text) {
      return NextResponse.json({ error: 'extracted_text is required' }, { status: 400 })
    }

    // Map legacy objective to targets if provided
    const mappedTargets = targets.length > 0 ? targets : 
      (objective ? [{ type: 'role' as const, value: objective }] : [])

    // Truncate text to safe token window
    const truncatedText = extracted_text.substring(0, 8000)
    
    // Build system prompt
    const targetsSentence = formatTargets(mappedTargets)
    const systemPrompt = buildSystemBase(targetsSentence) + 
      'Task: YC-style elevator pitch. Problem → action → outcome. Title ≤80. Summary 180–300 chars with natural variance. Resume only. No assumptions.'

    // Add regeneration context if provided
    let userPrompt = `Resume text:\n${truncatedText}`
    if (regen_token) {
      userPrompt += '\n\nAvoid generic content. Be specific and unique.'
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      temperature: 0.4,
      max_tokens: 500,
    }, {
      timeout: 12000, // 12 second timeout
    })

    const responseText = completion.choices[0]?.message?.content?.trim()
    
    // Log regeneration attempt if token provided
    if (regen_token && pitch_id) {
      await logRegenAttempt({
        pitch_id,
        route: 'auto-pitch',
        regen_token,
        inputs_hash: simpleHash(JSON.stringify({ objective, extracted_text: truncatedText, targets })),
        outputs_hash: simpleHash(responseText || '')
      })
    }
    
    if (!responseText) {
      return NextResponse.json({
        title: "Experienced Military Professional",
        summary: "Led teams in high-pressure environments. Demonstrated exceptional problem-solving and adaptability. Ready to transition military leadership skills to civilian success.",
        explain: "No response generated"
      })
    }

    try {
      const parsed = JSON.parse(responseText)
      if (parsed.explain) {
        return NextResponse.json(parsed)
      }
      if (parsed.title && parsed.summary) {
        const enforcedTitle = enforceBand(parsed.title, 1, 80)
        const enforcedSummary = enforceBand(parsed.summary, 180, 300)
        return NextResponse.json({ 
          title: enforcedTitle, 
          summary: enforcedSummary 
        })
      }
    } catch (e) {
      // Not JSON, return fallback
    }

    return NextResponse.json({
      title: "Experienced Military Professional",
      summary: "Led teams in high-pressure environments. Demonstrated exceptional problem-solving and adaptability. Ready to transition military leadership skills to civilian success.",
      explain: "Failed to parse AI response"
    })

  } catch (error) {
    console.error('Error in auto-pitch:', error)
    
    // Return friendly fallback
    return NextResponse.json({
      title: "Experienced Military Leader Seeking Civilian Career Opportunity",
      summary: "Dedicated military professional with proven leadership, strategic planning, and team management skills. Seeking to leverage operational experience and strong work ethic in a civilian role that values discipline, adaptability, and results-driven performance.",
      explain: error instanceof Error ? error.message : 'timeout'
    })
  }
}
