'use server'

import { createActionClient } from '@/lib/supabase-server'

export interface ContactSuggestion {
  id: string
  name: string
  role: string
  company: string
  connectionStrength: 'high' | 'medium' | 'low'
  suggestedAction: 'email' | 'call' | 'linkedin' | 'referral'
  reason: string
  successProbability: number
}

export async function getRealContactSuggestions(pitchId: string): Promise<ContactSuggestion[]> {
  const supabase = await createActionClient()
  
  try {
    // 1. Get the veteran's pitch data for context
    const { data: pitch } = await supabase
      .from('pitches')
      .select('title, skills, job_type, location, user_id')
      .eq('id', pitchId)
      .single()

    if (!pitch) {
      console.log('No pitch found for contact suggestions')
      return []
    }

    // 2. Get real recruiters from the database
    const { data: recruiters, error: recruiterError } = await supabase
      .from('recruiters')
      .select(`
        user_id,
        company_name,
        industry,
        users!inner (
          name,
          email,
          role
        )
      `)
      .eq('users.role', 'recruiter')

    if (recruiterError) {
      console.error('Error fetching recruiters:', recruiterError)
      return []
    }

    // 3. Get supporters who could make referrals
    const { data: supporters, error: supporterError } = await supabase
      .from('users')
      .select('id, name, email, role')
      .eq('role', 'supporter')
      .limit(5)

    if (supporterError) {
      console.error('Error fetching supporters:', supporterError)
    }

    // 4. Generate intelligent suggestions based on real data
    const suggestions: ContactSuggestion[] = []

    // Add recruiter suggestions
    if (recruiters && recruiters.length > 0) {
      recruiters.forEach((recruiter, index) => {
        const skillMatch = calculateSkillMatch(pitch.skills, recruiter.industry)
        const locationMatch = calculateLocationMatch(pitch.location, recruiter.company_name)
        
        suggestions.push({
          id: `recruiter-${recruiter.user_id}`,
          name: recruiter.users[0]?.name || 'Unknown Recruiter',
          role: 'Recruiter',
          company: recruiter.company_name || 'Unknown Company',
          connectionStrength: skillMatch > 0.7 ? 'high' : skillMatch > 0.4 ? 'medium' : 'low',
          suggestedAction: skillMatch > 0.7 ? 'email' : 'linkedin',
          reason: generateReason(pitch.skills, recruiter.industry, skillMatch),
          successProbability: Math.round(skillMatch * 100)
        })
      })
    }

    // Add supporter suggestions for referrals
    if (supporters && supporters.length > 0) {
      supporters.forEach((supporter, index) => {
        suggestions.push({
          id: `supporter-${supporter.id}`,
          name: supporter.name || 'Unknown Supporter',
          role: 'Network Contact',
          company: 'Professional Network',
          connectionStrength: 'medium',
          suggestedAction: 'referral',
          reason: 'Could introduce you to relevant contacts in their network',
          successProbability: 60 + (index * 5) // Vary probability
        })
      })
    }

    // 5. Sort by success probability and return top suggestions
    return suggestions
      .sort((a, b) => b.successProbability - a.successProbability)
      .slice(0, 6) // Return top 6 suggestions

  } catch (error) {
    console.error('Error in getRealContactSuggestions:', error)
    return []
  }
}

// Helper function to calculate skill match
function calculateSkillMatch(pitchSkills: string[], recruiterIndustry: string): number {
  if (!pitchSkills || !recruiterIndustry) return 0.5
  
  const industryKeywords = {
    'Technology': ['software', 'tech', 'engineering', 'development', 'programming'],
    'Finance': ['finance', 'banking', 'investment', 'accounting', 'risk'],
    'Healthcare': ['healthcare', 'medical', 'nursing', 'pharmaceutical', 'clinical'],
    'Manufacturing': ['manufacturing', 'production', 'operations', 'logistics', 'supply chain']
  }
  
  const relevantKeywords = industryKeywords[recruiterIndustry as keyof typeof industryKeywords] || []
  const matchingSkills = pitchSkills.filter(skill => 
    relevantKeywords.some(keyword => 
      skill.toLowerCase().includes(keyword.toLowerCase())
    )
  )
  
  return matchingSkills.length / pitchSkills.length
}

// Helper function to calculate location match
function calculateLocationMatch(pitchLocation: string, companyName: string): number {
  if (!pitchLocation || !companyName) return 0.5
  
  const locationKeywords = ['delhi', 'mumbai', 'bangalore', 'chennai', 'pune', 'hyderabad']
  const pitchLocationLower = pitchLocation.toLowerCase()
  const companyNameLower = companyName.toLowerCase()
  
  const pitchHasLocation = locationKeywords.some(keyword => pitchLocationLower.includes(keyword))
  const companyHasLocation = locationKeywords.some(keyword => companyNameLower.includes(keyword))
  
  if (pitchHasLocation && companyHasLocation) return 0.9
  if (pitchHasLocation || companyHasLocation) return 0.6
  return 0.3
}

// Helper function to generate personalized reasons
function generateReason(pitchSkills: string[], industry: string, skillMatch: number): string {
  if (skillMatch > 0.7) {
    return `Strong skill match with ${industry} industry - actively hiring for your expertise`
  } else if (skillMatch > 0.4) {
    return `Your experience could be valuable in ${industry} - worth exploring opportunities`
  } else {
    return `Network connection in ${industry} - could provide valuable insights`
  }
}
