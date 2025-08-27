import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { 
      objective, 
      extracted_text, 
      regen_token, 
      targets = [], 
      avoid_list = [], 
      used_facets = [], 
      available_facets = [] 
    } = await request.json()

    if (!objective || !extracted_text) {
      return NextResponse.json(
        { error: 'objective and extracted_text are required' },
        { status: 400 }
      )
    }

    // Truncate text to safe token window
    const truncatedText = extracted_text.slice(0, 8000)

    // Log regeneration if provided
    if (regen_token) {
      console.log(`Regenerating story suggestions for token: ${regen_token}`)
    }

    // Validate source spans are within resume length
    const validateSourceSpans = (spans: Array<{ start: number; end: number }>, textLength: number) => {
      return spans.every(span => 
        span.start >= 0 && 
        span.end <= textLength && 
        span.start < span.end
      )
    }

    // Check for near-duplicates
    const isNearDuplicate = (story1: any, story2: any) => {
      const titleSimilarity = story1.title.toLowerCase() === story2.title.toLowerCase()
      const angleSimilarity = story1.angle.toLowerCase() === story2.angle.toLowerCase()
      const firstBulletSimilarity = story1.outline[0]?.toLowerCase() === story2.outline[0]?.toLowerCase()
      return titleSimilarity || (angleSimilarity && firstBulletSimilarity)
    }

    // Format targets for prompt
    const formatTargets = (targets: any[]) => {
      if (!targets || targets.length === 0) return 'General professional roles'
      return targets.map(t => `${t.type}: ${t.value}`).join(', ')
    }

    const systemPrompt = `Write in first person. Plain language. No em dashes. No fluff. No generic praise. No bragging. Translate Indian military jargon to corporate language. Use only facts in the resume. Vary style across outputs. Generate exactly 3 distinct story ideas that use different resume facets not used before. Return JSON only per the required shape.`

    const userPrompt = `Targets: ${formatTargets(targets)}
Avoid titles: ${avoid_list.join(', ')}
Used facets: ${used_facets.join(', ')}
Available facets: ${available_facets.join(', ')}
Resume text:
${truncatedText}`

    // Regeneration loop - try up to 3 times
    let stories: Array<{
      title: string
      angle: string
      outline: string[]
      coverage_facets: string[]
      source_spans: Array<{ start: number; end: number }>
    }> = []
    
    let attempts = 0
    const maxAttempts = 3

    while (stories.length < 3 && attempts < maxAttempts) {
      attempts++
      
      try {
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
          max_tokens: 1000,
        }, {
          timeout: 12000, // 12 second timeout
        })

        const response = completion.choices[0]?.message?.content
        if (!response) {
          throw new Error('No response from OpenAI')
        }

        // Parse JSON response
        try {
          const parsedStories = JSON.parse(response)
          
          // Validate and clean stories
          const validStories = parsedStories
            .filter((story: any) => 
              story.title && 
              story.angle && 
              Array.isArray(story.outline) &&
              Array.isArray(story.coverage_facets) &&
              Array.isArray(story.source_spans) &&
              validateSourceSpans(story.source_spans, truncatedText.length)
            )
            .slice(0, 3)
            .map((story: any) => ({
              title: story.title.slice(0, 60),
              angle: story.angle,
              outline: story.outline.slice(0, 5),
              coverage_facets: story.coverage_facets || [],
              source_spans: story.source_spans.slice(0, 3)
            }))

          // Remove near-duplicates
          const uniqueStories: Array<{
            title: string
            angle: string
            outline: string[]
            coverage_facets: string[]
            source_spans: Array<{ start: number; end: number }>
          }> = []
          for (const story of validStories) {
            const isDuplicate = uniqueStories.some(existing => isNearDuplicate(story, existing))
            if (!isDuplicate) {
              uniqueStories.push(story)
            }
          }
          
          stories = uniqueStories.slice(0, 3)
          
        } catch (parseError) {
          console.error('Failed to parse OpenAI response:', response)
          continue
        }
        
      } catch (error) {
        console.error(`Attempt ${attempts} failed:`, error)
        if (attempts === maxAttempts) {
          throw error
        }
        continue
      }
    }

    // If we don't have enough valid stories after all attempts, use fallback
    if (stories.length < 3) {
      stories = [
        {
          title: "Leading Under Pressure",
          angle: "How military leadership prepared me for high-stakes civilian management",
          outline: [
            "Faced critical decision-making scenarios",
            "Led diverse teams to achieve objectives",
            "Applied strategic thinking to operational challenges"
          ],
          coverage_facets: ["leadership", "decision_making"],
          source_spans: [{ start: 0, end: 1000 }]
        },
        {
          title: "Adapting to Change",
          angle: "Military experience taught me to thrive in dynamic environments",
          outline: [
            "Rapidly adapted to new technologies and procedures",
            "Managed resources efficiently under constraints",
            "Maintained performance standards during transitions"
          ],
          coverage_facets: ["adaptability", "resource_management"],
          source_spans: [{ start: 1000, end: 2000 }]
        },
        {
          title: "Building Strong Teams",
          angle: "Creating cohesive units that deliver exceptional results",
          outline: [
            "Developed training programs for team members",
            "Fostered collaboration across different backgrounds",
            "Achieved mission success through teamwork"
          ],
          coverage_facets: ["team_building", "training"],
          source_spans: [{ start: 2000, end: 3000 }]
        }
      ].slice(0, stories.length + 1)
    }

    return NextResponse.json({ stories })

  } catch (error) {
    console.error('Error in suggest-stories:', error)
    
    // Return friendly fallback
    return NextResponse.json({
      stories: [
        {
          title: "Leading Under Pressure",
          angle: "How military leadership prepared me for high-stakes civilian management",
          outline: [
            "Faced critical decision-making scenarios",
            "Led diverse teams to achieve objectives",
            "Applied strategic thinking to operational challenges"
          ],
          coverage_facets: ["leadership", "decision_making"],
          source_spans: [{ start: 0, end: 1000 }]
        },
        {
          title: "Adapting to Change",
          angle: "Military experience taught me to thrive in dynamic environments",
          outline: [
            "Rapidly adapted to new technologies and procedures",
            "Managed resources efficiently under constraints",
            "Maintained performance standards during transitions"
          ],
          coverage_facets: ["adaptability", "resource_management"],
          source_spans: [{ start: 1000, end: 2000 }]
        },
        {
          title: "Building Strong Teams",
          angle: "Creating cohesive units that deliver exceptional results",
          outline: [
            "Developed training programs for team members",
            "Fostered collaboration across different backgrounds",
            "Achieved mission success through teamwork"
          ],
          coverage_facets: ["team_building", "training"],
          source_spans: [{ start: 2000, end: 3000 }]
        }
      ],
      explain: error instanceof Error ? error.message : 'timeout'
    })
  }
}
