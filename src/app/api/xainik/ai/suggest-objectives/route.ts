import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { extracted_text, regen_token } = await request.json()

    if (!extracted_text) {
      return NextResponse.json(
        { error: 'extracted_text is required' },
        { status: 400 }
      )
    }

    // Truncate text to safe token window
    const truncatedText = extracted_text.slice(0, 8000)

    // Log regeneration if provided
    if (regen_token) {
      console.log(`Regenerating objectives for token: ${regen_token}`)
    }

    const prompt = `You are an AI career advisor specializing in helping military veterans transition to civilian careers.

Based on the following resume text, suggest 6-8 career objectives that would be relevant for this veteran's transition. Focus on common veteran career paths like:

- Operations Management
- Supply Chain & Logistics  
- Security & Risk Management
- IT Infrastructure & SRE
- Project Management
- Quality Assurance
- B2B Sales
- Administrative & HR

Guidelines:
- Each objective should be ≤ 80 characters
- Focus on civilian roles that leverage military experience
- Avoid PII (phone numbers, emails, specific names)
- Sort by relevance to the veteran's background
- Make objectives specific and actionable

Resume text:
${truncatedText}

${regen_token ? 'Avoid these previous objectives if they exist in the system.' : ''}

Return only a JSON array of strings, no additional text:
["Objective 1", "Objective 2", ...]`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a professional career advisor helping veterans transition to civilian careers. Provide clear, actionable career objectives based on military experience."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.4,
      max_tokens: 500,
    }, {
      timeout: 12000, // 12 second timeout
    })

    const response = completion.choices[0]?.message?.content
    if (!response) {
      throw new Error('No response from OpenAI')
    }

    // Parse JSON response
    let objectives: string[]
    try {
      objectives = JSON.parse(response)
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', response)
      // Fallback objectives
      objectives = [
        "Operations Management",
        "Supply Chain & Logistics",
        "Security & Risk Management", 
        "IT Infrastructure & SRE",
        "Project Management",
        "Quality Assurance",
        "B2B Sales",
        "Administrative & HR"
      ]
    }

    // Validate and clean objectives
    objectives = objectives
      .filter((obj: any) => typeof obj === 'string' && obj.length <= 80)
      .slice(0, 8)

    return NextResponse.json({ objectives })

  } catch (error) {
    console.error('Error in suggest-objectives:', error)
    
    // Return friendly fallback
    return NextResponse.json({
      objectives: [
        "Operations Management",
        "Supply Chain & Logistics", 
        "Security & Risk Management",
        "IT Infrastructure & SRE",
        "Project Management",
        "Quality Assurance"
      ],
      explain: error instanceof Error ? error.message : 'timeout'
    })
  }
}
