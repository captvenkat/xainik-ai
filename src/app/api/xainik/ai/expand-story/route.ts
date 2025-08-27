import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { 
      title, 
      angle, 
      outline, 
      objective, 
      targets = [], 
      coverage_facets = [], 
      source_spans = [], 
      extracted_text = '',
      style_seed = { format: 'prose', tone: 'direct' }
    } = await request.json()

    if (!title || !angle || !outline || !objective) {
      return NextResponse.json(
        { error: 'title, angle, outline, and objective are required' },
        { status: 400 }
      )
    }

    // Format targets for prompt
    const formatTargets = (targets: any[]) => {
      if (!targets || targets.length === 0) return 'General professional roles'
      return targets.map(t => `${t.type}: ${t.value}`).join(', ')
    }

    const systemPrompt = `First person. High quality like a professional magazine vignette. Problem → Action → Outcome. Final line must tie back to the targets. Vary style using style_seed. 120–180 words with ±15% variance. Plain language. No em dashes. No fluff. No generic praise. No bragging. Use numbers only if present else placeholders. No PII. Return JSON with summary and body_md only.`

    const userPrompt = `style_seed: ${JSON.stringify(style_seed)}
coverage_facets: ${coverage_facets.join(', ')}
source_spans: ${JSON.stringify(source_spans)}
Targets: ${formatTargets(targets)}
Title: ${title}
Angle: ${angle}
Outline:
${outline.join('\n')}
Resume text:
${extracted_text}`

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
      max_tokens: 800,
    }, {
      timeout: 12000, // 12 second timeout
    })

    const response = completion.choices[0]?.message?.content
    if (!response) {
      throw new Error('No response from OpenAI')
    }

    // Parse JSON response
    let story: { summary: string; body_md: string }
    try {
      story = JSON.parse(response)
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', response)
      // Fallback story
      story = {
        summary: "Demonstrated exceptional leadership and problem-solving skills in a high-pressure military environment",
        body_md: `During my military service, I faced a critical situation that tested my leadership abilities and decision-making skills. When our unit encountered unexpected challenges during a mission, I had to quickly assess the situation and adapt our approach.

I immediately gathered my team, analyzed the available resources, and developed a new strategy that leveraged our strengths while addressing the obstacles. Through clear communication and decisive action, I led the team to successfully complete our objectives while maintaining safety standards.

The outcome was not only mission success but also strengthened team cohesion and trust. This experience reinforced my ability to lead under pressure, think strategically, and deliver results in challenging environments - skills that directly translate to civilian leadership roles in operations management and team coordination.`
      }
    }

    // Validate and clean story
    if (!story.summary || !story.body_md) {
      throw new Error('Invalid story structure')
    }

    // Enforce word limits
    const wordCount = story.body_md.split(/\s+/).length
    if (wordCount > 180) {
      // Truncate at sentence boundary
      const sentences = story.body_md.split('. ')
      let truncated = ''
      let currentWords = 0
      
      for (const sentence of sentences) {
        const sentenceWords = sentence.split(/\s+/).length
        if (currentWords + sentenceWords <= 180) {
          truncated += (truncated ? '. ' : '') + sentence
          currentWords += sentenceWords
        } else {
          break
        }
      }
      
      if (truncated) {
        story.body_md = truncated + '.'
      }
    }

    return NextResponse.json(story)

  } catch (error) {
    console.error('Error in expand-story:', error)
    
    // Return friendly fallback
    return NextResponse.json({
      summary: "Demonstrated exceptional leadership and problem-solving skills in a high-pressure military environment",
      body_md: `During my military service, I faced a critical situation that tested my leadership abilities and decision-making skills. When our unit encountered unexpected challenges during a mission, I had to quickly assess the situation and adapt our approach.

I immediately gathered my team, analyzed the available resources, and developed a new strategy that leveraged our strengths while addressing the obstacles. Through clear communication and decisive action, I led the team to successfully complete our objectives while maintaining safety standards.

The outcome was not only mission success but also strengthened team cohesion and trust. This experience reinforced my ability to lead under pressure, think strategically, and deliver results in challenging environments - skills that directly translate to civilian leadership roles in operations management and team coordination.`,
      explain: error instanceof Error ? error.message : 'timeout'
    })
  }
}
