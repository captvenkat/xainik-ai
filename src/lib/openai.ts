import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface AIPitchContext {
  job_type: string
  location_current: string
  availability: string
}

interface AIPitchRequest {
  method: 'linkedin' | 'resume' | 'manual'
  linkedinUrl?: string
  resumeFile?: File
  summary?: string
  context: AIPitchContext
}

interface AIPitchResult {
  title: string
  pitch: string
  skills: string[]
}

const SYSTEM_PROMPT = `You are Xainik AI. Write ultra-concise, outcomes-first copy for military veterans transitioning to civilian careers. 

CRITICAL CONSTRAINTS:
- Title: MAX 80 characters, no clichés
- Pitch: MAX 300 characters, focus on achievements and transferable skills
- Skills: EXACTLY 3 skills, relevant to civilian job market
- No military jargon unless highly relevant
- Include job-type/availability/location only if useful
- Outcomes and metrics first, avoid generic statements

FORMAT:
Return ONLY valid JSON:
{
  "title": "string (≤80 chars)",
  "pitch": "string (≤300 chars)", 
  "skills": ["skill1", "skill2", "skill3"]
}`

export async function generateAIPitch(request: AIPitchRequest): Promise<AIPitchResult> {
  let userContent = ''

  switch (request.method) {
    case 'linkedin':
      userContent = `LinkedIn URL: ${request.linkedinUrl}\nContext: ${JSON.stringify(request.context)}`
      break
    case 'resume':
      // For resume, we'd need to extract text first
      // For now, we'll use a placeholder approach
      userContent = `Resume content: [Resume analysis would go here]\nContext: ${JSON.stringify(request.context)}`
      break
    case 'manual':
      userContent = `Manual summary: ${request.summary}\nContext: ${JSON.stringify(request.context)}`
      break
  }

  try {
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

    // Validate and enforce constraints
    const result: AIPitchResult = {
      title: enforceTitleLimit(parsed.title || ''),
      pitch: enforcePitchLimit(parsed.pitch || ''),
      skills: enforceSkillsLimit(parsed.skills || [])
    }

    return result
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      if (error.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a moment.')
      }
      throw new Error(`OpenAI API error: ${error.message}`)
    }
    throw error
  }
}

function enforceTitleLimit(title: string): string {
  if (title.length > 80) {
    return title.substring(0, 77) + '...'
  }
  return title
}

function enforcePitchLimit(pitch: string): string {
  if (pitch.length > 300) {
    return pitch.substring(0, 297) + '...'
  }
  return pitch
}

function enforceSkillsLimit(skills: string[]): string[] {
  // Ensure exactly 3 skills
  const validSkills = skills.filter(skill => skill && skill.trim().length > 0)
  if (validSkills.length >= 3) {
    return validSkills.slice(0, 3)
  }
  
  // If we don't have 3 skills, add some defaults
  const defaultSkills = ['Leadership', 'Project Management', 'Strategic Planning']
  return [...validSkills, ...defaultSkills].slice(0, 3)
}
