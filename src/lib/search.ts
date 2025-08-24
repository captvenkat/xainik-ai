import { createActionClient } from '@/lib/supabase-server'
import { Database } from '@/types/live-schema'

type Pitch = Database['public']['Tables']['pitches']['Row'];

export interface SearchFilters {
  skills?: string[] | undefined
  experience_years?: number | undefined
  location?: string | undefined
  job_type?: string | undefined
}

export async function searchPitches(
  query: string, 
  filters?: SearchFilters, 
  limit: number = 50
): Promise<Pitch[]> {
  try {
    const supabaseAction = await createActionClient()

    // Use the actual pitches table with specific user data join
    let queryBuilder = supabaseAction
      .from('pitches')
      .select(`
        *,
        users!pitches_user_id_fkey(
          id,
          name,
          email,
          avatar_url,
          role
        )
      `)
      .eq('is_active', true) // Only show active pitches

    // Apply text search if query exists
    if (query && query.trim()) {
      queryBuilder = queryBuilder.or(`title.ilike.%${query}%,pitch_text.ilike.%${query}%`)
    }

    // Apply filters
    if (filters?.skills && filters.skills.length > 0) {
      queryBuilder = queryBuilder.overlaps('skills', filters.skills)
    }

    if (filters?.experience_years) {
      queryBuilder = queryBuilder.gte('experience_years', filters.experience_years)
    }

    if (filters?.location) {
      queryBuilder = queryBuilder.ilike('location', `%${filters.location}%`)
    }

    if (filters?.job_type) {
      queryBuilder = queryBuilder.eq('job_type', filters.job_type)
    }

    // Get pitches ordered by creation date
    const { data: pitches, error } = await queryBuilder
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Search failed:', error)
      return []
    }

    return pitches || []
  } catch (error) {
    console.error('Search failed:', error)
    return []
  }
}

export function buildSearchQuery(filters: SearchFilters): string {
  const conditions: string[] = []
  
  if (filters.skills && filters.skills.length > 0) {
    conditions.push(`skills.ov.{${filters.skills.join(',')}}`)
  }
  
  if (filters.experience_years) {
    conditions.push(`experience_years.gte.${filters.experience_years}`)
  }
  
  if (filters.location) {
    conditions.push(`location.ilike.%${filters.location}%`)
  }
  
  if (filters.job_type) {
    conditions.push(`job_type.eq.${filters.job_type}`)
  }
  
  return conditions.join(',')
}

export async function getSearchSuggestions(query: string): Promise<string[]> {
  try {
    const supabaseAction = await createActionClient()

    const { data, error } = await supabaseAction
      .from('pitch_cards_view')
      .select('title, skills')
      .or(`title.ilike.%${query}%`)
      .limit(10)

    if (error) {
      console.error('Failed to get search suggestions:', error)
      return []
    }

    const suggestions: string[] = []
    
    // Add title suggestions
    if (data) {
      data.forEach((pitch: any) => {
        if (pitch.title && !suggestions.includes(pitch.title)) {
          suggestions.push(pitch.title)
        }
      })
    }

    return suggestions.slice(0, 10)
  } catch (error) {
    console.error('Failed to get search suggestions:', error)
    return []
  }
}

export async function getPopularSkills(): Promise<string[]> {
  try {
    const supabaseAction = await createActionClient()

    const { data, error } = await supabaseAction
      .from('pitch_cards_view')
      .select('skills')
      .limit(100)

    if (error) {
      console.error('Failed to get popular skills:', error)
      return []
    }

    const skillCounts: { [key: string]: number } = {}
    
    data?.forEach((pitch: any) => {
      if (pitch.skills) {
        pitch.skills.forEach((skill: string) => {
          skillCounts[skill] = (skillCounts[skill] || 0) + 1
        })
      }
    })

    // Sort by frequency and return top skills
    return Object.entries(skillCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([skill]) => skill)
  } catch (error) {
    console.error('Failed to get popular skills:', error)
    return []
  }
}
