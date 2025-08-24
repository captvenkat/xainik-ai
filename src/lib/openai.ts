'use server'

import OpenAI from 'openai'
import { z } from 'zod'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// =====================================================
// AI PITCH GENERATION
// =====================================================

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

const PITCH_SYSTEM_PROMPT = `You are Xainik AI, specialized in creating ultra-concise, outcomes-first copy for military veterans transitioning to civilian careers.

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

// =====================================================
// AI CONTACT SUGGESTIONS
// =====================================================

const ContactSuggestionSchema = z.object({
  name: z.string(),
  role: z.string(),
  company: z.string(),
  connectionStrength: z.enum(['high', 'medium', 'low']),
  suggestedAction: z.enum(['email', 'call', 'linkedin', 'referral']),
  reason: z.string(),
  successProbability: z.number().min(0).max(100),
  contactInfo: z.object({
    email: z.string().email().optional(),
    phone: z.string().optional(),
    linkedin: z.string().url().optional()
  }).optional()
})

type ContactSuggestion = z.infer<typeof ContactSuggestionSchema>

const CONTACT_SUGGESTIONS_PROMPT = `You are Xainik AI, specialized in generating strategic contact suggestions for military veterans seeking civilian employment.

ANALYZE the veteran's pitch and generate 3-5 highly targeted contact suggestions.

CRITICAL REQUIREMENTS:
- Focus on roles/companies that match the veteran's skills and experience
- Prioritize high-probability connections (recruiters, hiring managers, HR directors)
- Suggest specific actions (email, call, LinkedIn, referral)
- Provide compelling reasons for each suggestion
- Include realistic success probability scores
- Focus on civilian job market relevance

FORMAT:
Return ONLY valid JSON array:
[
  {
    "name": "Full Name",
    "role": "Job Title",
    "company": "Company Name",
    "connectionStrength": "high|medium|low",
    "suggestedAction": "email|call|linkedin|referral",
    "reason": "Specific reason why this contact is valuable",
    "successProbability": 85,
    "contactInfo": {
      "email": "email@company.com",
      "phone": "+1-555-0123",
      "linkedin": "https://linkedin.com/in/username"
    }
  }
]`

// =====================================================
// AI SMART NOTIFICATIONS
// =====================================================

const SmartNotificationSchema = z.object({
  type: z.enum(['milestone', 'achievement', 'alert', 'reminder', 'insight']),
  title: z.string().max(60),
  message: z.string().max(200),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  actionUrl: z.string().optional(),
  actionText: z.string().optional(),
  icon: z.string(),
  color: z.string()
})

type SmartNotification = z.infer<typeof SmartNotificationSchema>

const SMART_NOTIFICATIONS_PROMPT = `You are Xainik AI, specialized in generating intelligent, actionable notifications for military veterans on their job search journey.

ANALYZE the user's activity data and generate 2-4 smart notifications that will motivate and guide them.

NOTIFICATION TYPES:
- milestone: Celebrate achievements (views, likes, shares)
- achievement: Recognize progress (endorsements, connections)
- alert: Important updates (resume requests, messages)
- reminder: Action items (profile updates, follow-ups)
- insight: AI-generated recommendations

CRITICAL REQUIREMENTS:
- Be encouraging and motivational
- Provide actionable next steps
- Use military-friendly language
- Focus on civilian career success
- Keep messages concise and clear

FORMAT:
Return ONLY valid JSON array:
[
  {
    "type": "milestone",
    "title": "Short Title",
    "message": "Encouraging message with next steps",
    "priority": "medium",
    "actionUrl": "/dashboard",
    "actionText": "View Details",
    "icon": "Star",
    "color": "blue"
  }
]`

// =====================================================
// AI INSIGHTS GENERATION
// =====================================================

const AIInsightSchema = z.object({
  insight: z.string().max(150),
  category: z.enum(['performance', 'engagement', 'optimization', 'networking']),
  confidence: z.number().min(0).max(100),
  actionable: z.boolean(),
  nextSteps: z.array(z.string()).max(3)
})

type AIInsight = z.infer<typeof AIInsightSchema>

const AI_INSIGHTS_PROMPT = `You are Xainik AI, specialized in analyzing veteran job search data and providing actionable insights.

ANALYZE the user's activity patterns and generate 2-3 intelligent insights.

INSIGHT CATEGORIES:
- performance: How well their pitch is performing
- engagement: How people are interacting with their profile
- optimization: Ways to improve their approach
- networking: Strategic connection opportunities

CRITICAL REQUIREMENTS:
- Provide data-driven insights
- Suggest specific, actionable next steps
- Use encouraging, mentor-like language
- Focus on civilian career success
- Keep insights concise and clear

FORMAT:
Return ONLY valid JSON array:
[
  {
    "insight": "Clear, actionable insight based on data",
    "category": "performance",
    "confidence": 85,
    "actionable": true,
    "nextSteps": [
      "Specific action step 1",
      "Specific action step 2",
      "Specific action step 3"
    ]
  }
]`

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

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

// =====================================================
// EXPORTED FUNCTIONS
// =====================================================

export async function generatePitch(input: GeneratePitchInput): Promise<PitchResult> {
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
        { role: "system", content: PITCH_SYSTEM_PROMPT },
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

export async function generateContactSuggestions(pitchData: any, userContext: any): Promise<ContactSuggestion[]> {
  const userContent = `
Veteran Pitch Data:
- Title: ${pitchData.title || 'N/A'}
- Skills: ${pitchData.skills?.join(', ') || 'N/A'}
- Job Type: ${pitchData.job_type || 'N/A'}
- Location: ${pitchData.location || 'N/A'}
- Experience: ${pitchData.years_experience || 'N/A'}

User Context:
- Role: ${userContext.role || 'Veteran'}
- Location: ${userContext.location || 'N/A'}
- Industry Focus: ${userContext.industry || 'General'}

Generate strategic contact suggestions for this veteran.
`

  return retryWithBackoff(async () => {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: CONTACT_SUGGESTIONS_PROMPT },
        { role: "user", content: userContent }
      ],
      temperature: 0.7,
      max_tokens: 800,
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
    const result = z.array(ContactSuggestionSchema).parse(parsed)
    
    return result
  })
}

export async function generateSmartNotifications(userActivity: any, pitchMetrics: any): Promise<SmartNotification[]> {
  const userContent = `
User Activity Data:
- Recent Views: ${userActivity.recentViews || 0}
- Recent Likes: ${userActivity.recentLikes || 0}
- Recent Shares: ${userActivity.recentShares || 0}
- Recent Endorsements: ${userActivity.recentEndorsements || 0}
- Profile Completion: ${userActivity.profileCompletion || 0}%

Pitch Metrics:
- Total Views: ${pitchMetrics.totalViews || 0}
- Total Likes: ${pitchMetrics.totalLikes || 0}
- Total Shares: ${pitchMetrics.totalShares || 0}
- Total Endorsements: ${pitchMetrics.totalEndorsements || 0}

Generate smart notifications to motivate and guide this veteran.
`

  return retryWithBackoff(async () => {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SMART_NOTIFICATIONS_PROMPT },
        { role: "user", content: userContent }
      ],
      temperature: 0.7,
      max_tokens: 600,
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
    const result = z.array(SmartNotificationSchema).parse(parsed)
    
    return result
  })
}

export async function generateAIInsights(userActivity: any, pitchPerformance: any): Promise<AIInsight[]> {
  const userContent = `
User Activity Analysis:
- Activity Frequency: ${userActivity.frequency || 'low'}
- Engagement Patterns: ${userActivity.engagementPatterns || 'N/A'}
- Response Rates: ${userActivity.responseRates || 'N/A'}
- Network Growth: ${userActivity.networkGrowth || 'N/A'}

Pitch Performance:
- View-to-Like Ratio: ${pitchPerformance.viewToLikeRatio || 'N/A'}
- Share Conversion: ${pitchPerformance.shareConversion || 'N/A'}
- Endorsement Quality: ${pitchPerformance.endorsementQuality || 'N/A'}
- Time-based Trends: ${pitchPerformance.timeTrends || 'N/A'}

Generate actionable insights for this veteran's job search strategy.
`

  return retryWithBackoff(async () => {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: AI_INSIGHTS_PROMPT },
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
    const result = z.array(AIInsightSchema).parse(parsed)
    
    return result
  })
}

// Fallback function for when AI fails
export async function generateFallbackPitch(input: GeneratePitchInput): Promise<PitchResult> {
  // Simple fallback logic
  const fallbackTitle = "Experienced Military Professional"
  const fallbackPitch = "Transitioning military professional with strong leadership and operational skills. Seeking civilian opportunities to apply strategic thinking and team management experience."
  const fallbackSkills = ["Leadership", "Operations", "Strategic Planning"]
  
  return {
    title: fallbackTitle,
    pitch: fallbackPitch,
    skills: fallbackSkills
  }
}

// Export types for use in components
export type { 
  GeneratePitchInput, 
  PitchResult, 
  ContactSuggestion, 
  SmartNotification, 
  AIInsight 
}
