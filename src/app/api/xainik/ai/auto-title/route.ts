import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { buildSystemBase, formatTargets, Target } from '@/lib/ai/promptBuilder'
import { enforceBand } from '@/lib/ai/unique'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { extracted_text, targets = [], regen_token } = body

    if (!extracted_text) {
      return NextResponse.json({ error: 'extracted_text is required' }, { status: 400 })
    }

    // Truncate text to safe token window
    const truncatedText = extracted_text.substring(0, 8000)
    
    // Build system prompt
    const targetsSentence = formatTargets(targets)
    const systemPrompt = buildSystemBase(targetsSentence) + 
      'Task: create a recruiter-friendly title. ≤80 chars. YC style. Resume only. No assumptions.'

    // Add regeneration context if provided
    let userPrompt = `Resume text:\n${truncatedText}`
    if (regen_token) {
      userPrompt += '\n\nAvoid generic titles. Be specific to the experience shown.'
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
      max_tokens: 200,
    }, {
      timeout: 12000, // 12 second timeout
    })

    const responseText = completion.choices[0]?.message?.content?.trim()
    
    if (!responseText) {
      return NextResponse.json({ 
        title: "",
        explain: "No response generated"
      })
    }

    // Try to parse JSON response
    try {
      const parsed = JSON.parse(responseText)
      if (parsed.explain) {
        return NextResponse.json(parsed)
      }
      if (parsed.title) {
        const enforcedTitle = enforceBand(parsed.title, 1, 80)
        return NextResponse.json({ title: enforcedTitle })
      }
    } catch (e) {
      // Not JSON, treat as plain text
    }

    // Treat as plain text title
    const title = responseText.replace(/^["']|["']$/g, '') // Remove quotes
    const enforcedTitle = enforceBand(title, 1, 80)
    
    return NextResponse.json({ title: enforcedTitle })

  } catch (error) {
    console.error('Auto-title API error:', error)
    
    // Return fallback title
    return NextResponse.json({
      title: "Experienced Military Professional",
      explain: "Generated fallback title due to processing error"
    })
  }
}
