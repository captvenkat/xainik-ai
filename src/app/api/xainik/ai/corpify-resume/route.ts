import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { buildSystemBase, formatTargets, Target } from '@/lib/ai/promptBuilder'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const COMPETENCIES = [
  "org_design", "talent_acquisition", "performance", "learning", 
  "employee_relations", "change", "policy_compliance", "vendor_budget", 
  "safety_bcp", "data_ops"
]

const ACTIVE_VERBS = [
  "Led", "Managed", "Developed", "Implemented", "Coordinated", "Oversaw",
  "Directed", "Established", "Created", "Designed", "Executed", "Delivered",
  "Optimized", "Streamlined", "Enhanced", "Facilitated", "Orchestrated",
  "Spearheaded", "Pioneered", "Transformed"
]

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      extracted_text, 
      targets = [], 
      count = 30, 
      military_terms_allowlist = [],
      max_mil_ratio = 0.3 
    } = body

    if (!extracted_text) {
      return NextResponse.json({ error: 'extracted_text is required' }, { status: 400 })
    }

    // Truncate text to safe token window
    const truncatedText = extracted_text.substring(0, 8000)
    
    // Build system prompt
    const targetsSentence = formatTargets(targets)
    const systemPrompt = buildSystemBase(targetsSentence) + 
      `Task: write exactly ${count} bullets tailored to targets. Each bullet starts with an active verb, states action, measurement/baseline if present else placeholders, and method. Map each to one competency in ${JSON.stringify(COMPETENCIES)}. Allow explicit military words in ≤ ${Math.round(max_mil_ratio * 100)}% bullets.`

    const userPrompt = `Resume text:\n${truncatedText}

Military terms allowlist: ${military_terms_allowlist.join(', ')}

Return JSON array of bullets:
[
  {
    "text": "bullet text starting with active verb",
    "metrics_present": true/false,
    "used_military_term": true/false,
    "competency": "competency_name"
  }
]`

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
      temperature: 0.6,
      max_tokens: 2000,
    }, {
      timeout: 12000, // 12 second timeout
    })

    const responseText = completion.choices[0]?.message?.content?.trim()
    
    if (!responseText) {
      return NextResponse.json({
        bullets: [],
        explain: "No response generated"
      })
    }

    try {
      const parsed = JSON.parse(responseText)
      if (parsed.explain) {
        return NextResponse.json(parsed)
      }
      if (Array.isArray(parsed)) {
        // Validate and clean bullets
        const validBullets = parsed
          .filter(bullet => bullet.text && bullet.competency)
          .map(bullet => ({
            text: bullet.text,
            metrics_present: Boolean(bullet.metrics_present),
            used_military_term: Boolean(bullet.used_military_term),
            competency: bullet.competency
          }))
          .slice(0, count)

        // Validate military term ratio
        const militaryCount = validBullets.filter(b => b.used_military_term).length
        const actualRatio = militaryCount / validBullets.length
        
        if (actualRatio > max_mil_ratio) {
          return NextResponse.json({
            bullets: validBullets,
            explain: `Military term ratio (${(actualRatio * 100).toFixed(1)}%) exceeds limit (${(max_mil_ratio * 100).toFixed(1)}%)`
          })
        }

        return NextResponse.json({ bullets: validBullets })
      }
    } catch (e) {
      // Not JSON, return fallback
    }

    return NextResponse.json({
      bullets: [],
      explain: "Failed to parse AI response"
    })

  } catch (error) {
    console.error('Corpify-resume API error:', error)
    
    return NextResponse.json({
      bullets: [],
      explain: "Generated fallback due to processing error"
    })
  }
}
