import { SupabaseClient } from '@supabase/supabase-js'
import { createSupabaseServerOnly } from './supabaseServerOnly'

interface SearchParams {
  q?: string
  skills?: string
  city?: string
  availability?: string
  jobType?: string
  branch?: string
}

export function buildSearchQuery(
  searchParams: SearchParams,
  pageSize: number,
  offset: number
) {
  const supabase = createSupabaseServerOnly()
  
  // Base query for active pitches with explicit columns
  let query = supabase
    .from('pitches')
    .select(`
      id,
      title,
      pitch_text,
      skills,
      location,
      job_type,
      availability,
      likes_count,
      veteran_id,
      veteran:users!pitches_veteran_id_fkey (
        id,
        name,
        email,
        phone,
        veterans!veterans_user_id_fkey (
          rank,
          service_branch,
          years_experience,
          location_current
        )
      )
    `)
    .eq('is_active', true)
    .gt('plan_expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })

  // Count query for pagination
  let totalQuery = supabase
    .from('pitches')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)
    .gt('plan_expires_at', new Date().toISOString())

  // Apply search filters
  if (searchParams.q) {
    const searchTerm = searchParams.q.trim()
    query = query.or(`title.ilike.%${searchTerm}%,pitch_text.ilike.%${searchTerm}%,veteran.name.ilike.%${searchTerm}%`)
    totalQuery = totalQuery.or(`title.ilike.%${searchTerm}%,pitch_text.ilike.%${searchTerm}%`)
  }

  if (searchParams.skills) {
    const skills = searchParams.skills.split(',').map(s => s.trim()).filter(Boolean)
    if (skills.length > 0) {
      query = query.overlaps('skills', skills)
      totalQuery = totalQuery.overlaps('skills', skills)
    }
  }

  if (searchParams.city) {
    const city = searchParams.city.trim()
    query = query.ilike('location', `%${city}%`)
    totalQuery = totalQuery.ilike('location', `%${city}%`)
  }

  if (searchParams.availability) {
    const availability = searchParams.availability.trim()
    query = query.eq('availability', availability)
    totalQuery = totalQuery.eq('availability', availability)
  }

  if (searchParams.jobType) {
    const jobType = searchParams.jobType.trim()
    query = query.eq('job_type', jobType)
    totalQuery = totalQuery.eq('job_type', jobType)
  }

  if (searchParams.branch) {
    const branches = searchParams.branch.split(',').map(b => b.trim()).filter(Boolean)
    if (branches.length > 0) {
      query = query.in('veteran_profile.service_branch', branches)
      totalQuery = totalQuery.in('veteran_profile.service_branch', branches)
    }
  }

  // Apply pagination
  query = query.range(offset, offset + pageSize - 1)

  return { query, totalQuery }
}

export function createSearchUrl(params: SearchParams, page: number = 1): string {
  const searchParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value && value.trim()) {
      searchParams.set(key, value.trim())
    }
  })
  
  if (page > 1) {
    searchParams.set('page', page.toString())
  }
  
  return `/browse?${searchParams.toString()}`
}
