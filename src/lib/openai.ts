'use server'

import OpenAI from 'openai'
import { z } from 'zod'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Input validation schema
const GeneratePitchInputSchema = z.object({
  inputType: z.enum(['linkedin', 'resume', 'manual']),
  text: z.string().optional(),
  linkedinUrl: z.string().url().optional(),
  resumeKey: z.string().optional(),
})

// Output validation schema
const PitchResultSchema = z.object({
  title: z.string().max(80, 'Title must be 80 characters or less'),
  pitch: z.string().max(300, 'Pitch must be 300 characters or less'),
  skills: z.array(z.string()).length(3, 'Must have exactly 3 skills'),
})

type GeneratePitchInput = z.infer<typeof GeneratePitchInputSchema>
type PitchResult = z.infer<typeof PitchResultSchema>

const SYSTEM_PROMPT = `You are Xainik AI, specialized in creating ultra-concise, outcomes-first copy for military veterans transitioning to civilian careers.

CRITICAL CONSTRAINTS:
- Title: MAX 80 characters, no clichés, focus on role/achievement
- Pitch: MAX 300 characters, focus on achievements, transferable skills, and outcomes
- Skills: EXACTLY 3 skills, relevant to civilian job market
- No military jargon unless highly relevant
- Include job-type/availability/location only if useful
- Outcomes and metrics first, avoid generic statements
- No fluff or clichés

FORMAT:
Return ONLY valid JSON:
{
  "title": "string (≤80 chars)",
  "pitch": "string (≤300 chars)", 
  "skills": ["skill1", "skill2", "skill3"]
}

EXAMPLES:
Input: "Led 500+ personnel across complex logistics ops in 3 regions"
Output: {
  "title": "Operations Lead — 22 yrs, Indian Army",
  "pitch": "Led 500+ personnel across complex logistics ops in 3 regions. Immediate joiner; excels in crisis mgmt, vendor ops, cross-functional delivery. Ready to drive outcomes now.",
  "skills": ["Logistics", "Operations", "Leadership"]
}`

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      
      if (attempt === maxRetries) {
        throw lastError
      }
      
      // Don't retry on validation errors
      if (error instanceof z.ZodError) {
        throw error
      }
      
      // Don't retry on rate limits
      if (error instanceof OpenAI.APIError && error.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a moment.')
      }
      
      // Exponential backoff
      const delay = baseDelay * Math.pow(2, attempt)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError!
}

export async function generatePitch(input: GeneratePitchInput): Promise<PitchResult> {
  // Validate input
  const validatedInput = GeneratePitchInputSchema.parse(input)
  
  let userContent = ''
  
  switch (validatedInput.inputType) {
    case 'linkedin':
      if (!validatedInput.linkedinUrl) {
        throw new Error('LinkedIn URL is required for linkedin input type')
      }
      userContent = `LinkedIn URL: ${validatedInput.linkedinUrl}\n\nPlease analyze this LinkedIn profile and generate a pitch for a military veteran transitioning to civilian work.`
      break
      
    case 'resume':
      if (!validatedInput.resumeKey) {
        throw new Error('Resume key is required for resume input type')
      }
      userContent = `Resume content: [Resume analysis would go here - key: ${validatedInput.resumeKey}]\n\nPlease analyze this resume and generate a pitch for a military veteran transitioning to civilian work.`
      break
      
    case 'manual':
      if (!validatedInput.text) {
        throw new Error('Text is required for manual input type')
      }
      userContent = `Manual summary: ${validatedInput.text}\n\nPlease generate a pitch based on this manual input for a military veteran transitioning to civilian work.`
      break
  }

  return retryWithBackoff(async () => {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userContent }
      ],
      temperature: 0.7,
      max_tokens: 500,
    })

    const response = completion.choices[0]?.message?.content
    if (!response) {
      throw new Error('No response from OpenAI')
    }

    // Parse JSON response
    let parsed: any
    try {
      parsed = JSON.parse(response)
    } catch {
      throw new Error('Invalid JSON response from AI')
    }

    // Validate output with Zod
    const result = PitchResultSchema.parse(parsed)
    
    return result
  })
}

// Fallback function for when AI fails
export async function generateFallbackPitch(input: GeneratePitchInput): Promise<PitchResult> {
  const baseText = input.text || 'Military veteran with leadership experience'
  
  return {
    title: baseText.length > 80 ? baseText.substring(0, 77) + '...' : baseText,
    pitch: baseText.length > 300 ? baseText.substring(0, 297) + '...' : baseText,
    skills: ['Leadership', 'Project Management', 'Strategic Planning']
  }
}
