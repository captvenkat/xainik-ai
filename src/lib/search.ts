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

    let queryBuilder = supabaseAction
      .from('pitches')
      .select(`
        *,
        users!pitches_user_id_fkey (id, name, email),
        endorsements (*),
        user_subscriptions!user_subscriptions_user_id_fkey (status, end_date)
      `)
      .or(`title.ilike.%${query}%,pitch_text.ilike.%${query}%`)

    // Apply filters
    if (filters?.skills && filters.skills.length > 0) {
      queryBuilder = queryBuilder.overlaps('skills', filters.skills)
    }

    if (filters?.experience_years) {
      queryBuilder = queryBuilder.gte('experience_years', filters.experience_years)
    }

    // Filter to only show pitches from users with active subscriptions
    const { data: pitches, error } = await queryBuilder
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Search failed:', error)
      return []
    }

    // Filter to only show pitches from users with active subscriptions
    const activePitches = (pitches || []).filter(pitch => {
      const subscriptions = pitch.user_subscriptions as any
      const subscription = subscriptions?.[0]
      return subscription && 
             subscription.status === 'active' &&
             new Date(subscription.end_date) > new Date()
    })

    return activePitches
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
      .from('pitches')
      .select('title, skills')
      .or(`title.ilike.%${query}%`)
      .limit(10)

    if (error) {
      console.error('Failed to get search suggestions:', error)
      return []
    }

    const suggestions: string[] = []
    
    // Add titles
    data?.forEach(pitch => {
      if (pitch.title) {
        suggestions.push(pitch.title)
      }
    })

    // Add skills
    data?.forEach(pitch => {
      if (pitch.skills) {
        suggestions.push(...pitch.skills)
      }
    })

    // Remove duplicates and limit
    return [...new Set(suggestions)].slice(0, 10)
  } catch (error) {
    console.error('Failed to get search suggestions:', error)
    return []
  }
}
